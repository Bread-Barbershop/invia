'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DeleteInvitationResponse,
  InvitationVisibilityResult,
  InviteListItem,
  LoadInvitationResponse,
} from '@/app/dashboard/types';
import { resolveCardActionFailureMessage } from '@/app/dashboard/utils/cardActionMessage';
import type { DashboardPendingInvitation } from '@/shared/constants/dashboardPendingInvitation';
import { useToast } from '@/shared/hooks/useToast';
import {
  loadShareData,
  shareInvitationWithKakao,
} from '@/shared/utils/kakaoInvitationShare';

import {
  createInitialInvitationResults,
  createPendingTimeoutResult,
  isAbortError,
  mergeGuestReadinessResult,
  mergePendingInvite,
  normalizeInvite,
  normalizeInvites,
  PENDING_INVITATION_MAX_ATTEMPTS,
  PENDING_INVITATION_POLL_DELAYS_MS,
  readPendingInvitationFromSession,
  READINESS_POLL_DELAYS_MS,
  resolveGuestUrl,
  resolvePendingTransition,
  resolveVisibilityReadiness,
  sleep,
} from './dashboardInvitationState';
import { useDashboardInvitationTransientState } from './useDashboardInvitationTransientState';

type LoadInvitationErrorPayload = { message?: string };
type CloneInvitationResponse =
  | { success: true; invite: InviteListItem }
  | { success: false; message?: string };
type UseDashboardInvitationsOptions = {
  loadOnMount?: boolean;
};

const CLONE_ERROR_MESSAGE = '초대장 복사에 실패했습니다.';

function shouldRedirectToHome(status: number, message: string | null) {
  return (
    status === 401 ||
    message === '재로그인이 필요합니다.' ||
    message === '유효한 요청이 아닙니다.'
  );
}

function getPayloadMessage(
  payload: LoadInvitationResponse | LoadInvitationErrorPayload | null
) {
  return payload && 'message' in payload && typeof payload.message === 'string'
    ? payload.message
    : null;
}

function useDashboardInvitations(
  initialInvites: InviteListItem[] = [],
  options: UseDashboardInvitationsOptions = {}
) {
  const router = useRouter();
  const { success: successToast, error: errorToast } = useToast();
  const loadOnMount = options.loadOnMount ?? initialInvites.length === 0;
  const normalizedInitialInvites = normalizeInvites(initialInvites);

  const [loading, setLoading] = useState(loadOnMount);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<InviteListItem[]>(
    normalizedInitialInvites
  );
  const clonedFolderIdsRef = useRef(new Set<string>());
  const listVersionsRef = useRef({
    requested: 0,
    applied: 0,
    folderIds: new Set<string>(),
  });
  const {
    deleteBusy,
    setDeleteBusy,
    deleteErrors,
    setDeleteErrors,
    readinessPolling,
    setReadinessPolling,
    shareBusy,
    setShareBusy,
    visibilityBusy,
    setVisibilityBusy,
    visibilityErrors,
    setVisibilityErrors,
    invitationResults,
    setInvitationResults,
    readinessAbortControllersRef,
    pendingInvitationRef,
    pendingInvitationAbortControllerRef,
    hasAppliedPendingInvitationRef,
    abortReadinessPolling,
    abortAllReadinessPolling,
    abortPendingInvitationPolling,
    resetInvitationResultState,
    clearInvitationTransientState,
  } = useDashboardInvitationTransientState(
    createInitialInvitationResults(normalizedInitialInvites)
  );

  const patchInvite = useCallback(
    (folderId: string, patch: Partial<InviteListItem>) => {
      setInvites(prev =>
        normalizeInvites(
          prev.map(invite =>
            invite.folderId === folderId ? { ...invite, ...patch } : invite
          )
        )
      );
    },
    []
  );

  const replaceInvites = useCallback(
    (loadedInvites: InviteListItem[], version: number) => {
      const versions = listVersionsRef.current;
      if (version < versions.applied) return false;
      versions.applied = version;
      versions.folderIds = new Set(
        loadedInvites.map(invite => invite.folderId)
      );

      const clonedFolderIds = clonedFolderIdsRef.current;
      for (const folderId of clonedFolderIds) {
        if (versions.folderIds.has(folderId)) clonedFolderIds.delete(folderId);
      }

      // Drive 목록에 등장하기 전까지만 화면에 추가한 복사본을 보존한다.
      const unconfirmedClones = new Set(clonedFolderIds);
      setInvites(prev => [
        ...prev.filter(invite => unconfirmedClones.has(invite.folderId)),
        ...loadedInvites,
      ]);
      return true;
    },
    []
  );

  const loadInvitations = useCallback(async () => {
    const version = ++listVersionsRef.current.requested;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/drive/loadInvitation', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = (await res.json().catch(() => null)) as
        | LoadInvitationResponse
        | LoadInvitationErrorPayload
        | null;
      const payloadMessage = getPayloadMessage(payload);

      if (version < listVersionsRef.current.applied) return;

      if (shouldRedirectToHome(res.status, payloadMessage)) {
        setInvites([]);
        setError(null);
        setDeleteBusy({});
        setDeleteErrors({});
        resetInvitationResultState();
        router.replace('/');
        router.refresh();
        return;
      }

      if (!res.ok) {
        throw new Error(payloadMessage ?? '초대장 목록을 불러오지 못했습니다.');
      }

      const loadedInvites = normalizeInvites(
        (payload as LoadInvitationResponse).invites ?? []
      );
      const activePendingInvitation = pendingInvitationRef.current;
      const nextInvites = activePendingInvitation
        ? mergePendingInvite(loadedInvites, activePendingInvitation)
        : loadedInvites;

      replaceInvites(nextInvites, version);
      setDeleteBusy({});
      setDeleteErrors({});
      setVisibilityBusy({});
      setVisibilityErrors({});
      abortAllReadinessPolling();
      setReadinessPolling({});
      setInvitationResults(createInitialInvitationResults(nextInvites));
    } catch (err) {
      if (version < listVersionsRef.current.applied) return;
      console.error(err);
      setInvites([]);
      setDeleteBusy({});
      setDeleteErrors({});
      resetInvitationResultState();
      setVisibilityBusy({});
      setVisibilityErrors({});
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    abortAllReadinessPolling,
    replaceInvites,
    resetInvitationResultState,
    router,
  ]);

  const pollPendingInvitation = useCallback(
    async (pendingInvitation: DashboardPendingInvitation) => {
      // 저장 직후 handoff 카드는 Drive 목록/meta 전파 지연을 흡수한다.
      // 공개로 시작한 카드만 여기서 guest readiness까지 함께 확인한다.
      abortPendingInvitationPolling();

      const controller = new AbortController();
      pendingInvitationAbortControllerRef.current = controller;
      const { signal } = controller;
      const folderId = pendingInvitation.invitationFolderId;
      const pendingStartsPublic = pendingInvitation.published === true;

      let attempt = 0;

      try {
        while (!signal.aborted && attempt < PENDING_INVITATION_MAX_ATTEMPTS) {
          if (attempt > 0) {
            const delayMs =
              PENDING_INVITATION_POLL_DELAYS_MS[
                Math.min(
                  attempt - 1,
                  PENDING_INVITATION_POLL_DELAYS_MS.length - 1
                )
              ];
            await sleep(delayMs, signal);
          }

          const version = ++listVersionsRef.current.requested;
          const res = await fetch('/api/drive/loadInvitation', {
            method: 'GET',
            cache: 'no-store',
            signal,
          });

          const payload = (await res.json().catch(() => null)) as
            | LoadInvitationResponse
            | LoadInvitationErrorPayload
            | null;
          const payloadMessage = getPayloadMessage(payload);

          if (version < listVersionsRef.current.applied) {
            attempt += 1;
            continue;
          }

          if (shouldRedirectToHome(res.status, payloadMessage)) {
            pendingInvitationRef.current = null;
            setInvites([]);
            setError(null);
            router.replace('/');
            router.refresh();
            return;
          }

          if (!res.ok) {
            attempt += 1;
            continue;
          }

          const loadedInvites = normalizeInvites(
            (payload as LoadInvitationResponse).invites ?? []
          );
          const loadedPendingInvite = loadedInvites.find(
            invite => invite.folderId === folderId
          );

          if (!loadedPendingInvite) {
            replaceInvites(
              mergePendingInvite(loadedInvites, pendingInvitation, {
                readiness: 'pending',
                isPending: true,
              }),
              version
            );
            attempt += 1;
            continue;
          }

          const dataJsonFileId =
            loadedPendingInvite.dataJsonFileId ??
            pendingInvitation.dataJsonFileId;
          let readinessPayload: InvitationVisibilityResult | null = null;
          let isGuestReady =
            pendingStartsPublic && pendingInvitation.ready === true;

          if (
            loadedPendingInvite.dataJsonFileId &&
            loadedPendingInvite.guestUrl &&
            pendingStartsPublic &&
            !isGuestReady
          ) {
            const readinessRes = await fetch(
              `/api/drive/guestReadiness?dataJsonFileId=${encodeURIComponent(
                dataJsonFileId
              )}`,
              { method: 'GET', cache: 'no-store', signal }
            );
            readinessPayload = (await readinessRes
              .json()
              .catch(() => ({}))) as InvitationVisibilityResult;
            isGuestReady = readinessRes.ok && readinessPayload.ready === true;
          }

          const pendingTransition = resolvePendingTransition({
            pending: pendingInvitation,
            loadedPendingInvite,
            readinessPayload,
            isGuestReady,
          });

          const applied = replaceInvites(
            mergePendingInvite(
              loadedInvites,
              pendingInvitation,
              pendingTransition.patch
            ),
            version
          );

          if (!applied) {
            attempt += 1;
            continue;
          }

          setInvitationResults(prev => ({
            ...prev,
            [folderId]: pendingTransition.result,
          }));

          if (pendingTransition.isComplete) {
            pendingInvitationRef.current = null;
            break;
          }

          attempt += 1;
        }

        if (!signal.aborted && pendingInvitationRef.current) {
          setInvites(prev =>
            normalizeInvites(
              prev.map(invite =>
                invite.folderId === folderId
                  ? {
                      ...invite,
                      readiness: 'failed',
                      isPending: false,
                    }
                  : invite
              )
            )
          );
          setInvitationResults(prev => ({
            ...prev,
            [folderId]: createPendingTimeoutResult(pendingInvitation),
          }));
          pendingInvitationRef.current = null;
        }
      } catch (err) {
        if (!isAbortError(err)) {
          console.error('Pending invitation polling failed:', err);
        }
      } finally {
        if (pendingInvitationAbortControllerRef.current === controller) {
          pendingInvitationAbortControllerRef.current = null;
        }

        if (!signal.aborted) {
          setReadinessPolling(prev => ({ ...prev, [folderId]: false }));
        }
      }
    },
    [abortPendingInvitationPolling, replaceInvites, router]
  );

  useEffect(() => {
    return () => {
      abortAllReadinessPolling();
      abortPendingInvitationPolling();
    };
  }, [abortAllReadinessPolling, abortPendingInvitationPolling]);

  useEffect(() => {
    const pendingInvitation =
      pendingInvitationRef.current ?? readPendingInvitationFromSession();

    if (!pendingInvitation) {
      return;
    }

    pendingInvitationRef.current = pendingInvitation;

    if (!hasAppliedPendingInvitationRef.current) {
      hasAppliedPendingInvitationRef.current = true;
      setInvites(prev => mergePendingInvite(prev, pendingInvitation));
      setInvitationResults(prev => ({
        ...prev,
        [pendingInvitation.invitationFolderId]: {
          ok: true,
          published: pendingInvitation.published ?? false,
          ready:
            pendingInvitation.published === true
              ? (pendingInvitation.ready ?? false)
              : undefined,
          guestUrl: pendingInvitation.guestUrl,
          dataJsonFileId: pendingInvitation.dataJsonFileId,
        },
      }));
    }

    if (!pendingInvitationAbortControllerRef.current) {
      void pollPendingInvitation(pendingInvitation);
    }
  }, [pollPendingInvitation]);

  useEffect(() => {
    if (!loadOnMount) {
      return;
    }

    void loadInvitations();
  }, [loadInvitations, loadOnMount]);

  const pollGuestReadiness = useCallback(
    async (folderId: string, initialResult: InvitationVisibilityResult) => {
      // 공개 전환 직후 Drive public URL이 늦게 열릴 수 있어 해당 카드만 재확인한다.
      const dataJsonFileId = initialResult.dataJsonFileId;
      if (!dataJsonFileId) return;

      abortReadinessPolling(folderId);
      const controller = new AbortController();
      readinessAbortControllersRef.current.set(folderId, controller);
      const { signal } = controller;

      setReadinessPolling(prev => ({ ...prev, [folderId]: true }));

      let latestResult = initialResult;

      try {
        for (const delayMs of READINESS_POLL_DELAYS_MS) {
          await sleep(delayMs, signal);
          if (signal.aborted) break;

          const res = await fetch(
            `/api/drive/guestReadiness?dataJsonFileId=${encodeURIComponent(
              dataJsonFileId
            )}`,
            { method: 'GET', cache: 'no-store', signal }
          );
          if (signal.aborted) break;

          const json = (await res
            .json()
            .catch(() => ({}))) as InvitationVisibilityResult;
          latestResult = mergeGuestReadinessResult(
            latestResult,
            json,
            dataJsonFileId
          );

          setInvitationResults(prev => ({ ...prev, [folderId]: latestResult }));
          patchInvite(folderId, {
            guestUrl: latestResult.guestUrl ?? null,
            dataJsonFileId: latestResult.dataJsonFileId,
            published: latestResult.published ?? true,
            readiness: json.ready === true ? 'ready' : 'checking',
          });

          if (res.ok && json.ready === true) {
            break;
          }
        }
      } catch (err) {
        if (!isAbortError(err)) {
          console.error('Guest readiness polling failed:', err);
        }
      } finally {
        if (readinessAbortControllersRef.current.get(folderId) === controller) {
          readinessAbortControllersRef.current.delete(folderId);
        }

        if (!signal.aborted) {
          setReadinessPolling(prev => ({ ...prev, [folderId]: false }));
        }
      }
    },
    [abortReadinessPolling, patchInvite]
  );

  const handleToggleVisibility = useCallback(
    async (invitationFolderId: string, nextVisible: boolean) => {
      if (!invitationFolderId) return;
      if (visibilityBusy[invitationFolderId]) return;

      setVisibilityErrors(prev => ({ ...prev, [invitationFolderId]: null }));
      setVisibilityBusy(prev => ({ ...prev, [invitationFolderId]: true }));
      abortReadinessPolling(invitationFolderId);
      setReadinessPolling(prev => ({
        ...prev,
        [invitationFolderId]: false,
      }));

      try {
        const res = await fetch('/api/drive/invitationVisibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invitationFolderId,
            visible: nextVisible,
          }),
        });

        const json = (await res
          .json()
          .catch(() => ({}))) as InvitationVisibilityResult;

        if (!res.ok || json.ok === false) {
          const failure = resolveCardActionFailureMessage(
            'visibility',
            json.error?.trim() || String(res.status)
          );
          setInvitationResults(prev => ({
            ...prev,
            [invitationFolderId]: json,
          }));
          setVisibilityErrors(prev => ({
            ...prev,
            [invitationFolderId]: failure,
          }));
          return;
        }

        const guestUrl = json.guestUrl ?? null;
        const dataJsonFileId = json.dataJsonFileId;
        const isReady = json.ready === true;

        setInvitationResults(prev => ({
          ...prev,
          [invitationFolderId]: json,
        }));
        patchInvite(invitationFolderId, {
          published: json.published ?? nextVisible,
          guestUrl,
          dataJsonFileId,
          readiness: resolveVisibilityReadiness(nextVisible, isReady),
          isPending: nextVisible && !isReady,
        });

        successToast(
          nextVisible
            ? '초대장을 공개로 변경했습니다.'
            : '초대장을 비공개로 변경했습니다.'
        );

        if (nextVisible && json.ready === false) {
          void pollGuestReadiness(invitationFolderId, json);
        }
      } catch (err) {
        const failure = resolveCardActionFailureMessage(
          'visibility',
          (err instanceof Error && err.message.trim()) ||
            'Visibility update request failed.'
        );
        setVisibilityErrors(prev => ({
          ...prev,
          [invitationFolderId]: failure,
        }));
      } finally {
        setVisibilityBusy(prev => ({
          ...prev,
          [invitationFolderId]: false,
        }));
      }
    },
    [
      abortReadinessPolling,
      patchInvite,
      pollGuestReadiness,
      successToast,
      visibilityBusy,
    ]
  );

  const handleClone = useCallback(
    async (folderId: string, requestId: string) => {
      const res = await fetch('/api/drive/cloneInvitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId, requestId }),
      }).catch(() => null);
      const payload = (await res?.json().catch(() => null)) as
        | CloneInvitationResponse
        | null
        | undefined;

      if (
        !res?.ok ||
        payload?.success !== true ||
        !payload.invite?.folderId ||
        payload.invite.folderId === folderId
      ) {
        throw new Error(
          (payload?.success === false && payload.message) || CLONE_ERROR_MESSAGE
        );
      }

      const invite = normalizeInvite(payload.invite);
      if (!listVersionsRef.current.folderIds.has(invite.folderId)) {
        clonedFolderIdsRef.current.add(invite.folderId);
      }
      setInvites(prev => [
        invite,
        ...prev.filter(item => item.folderId !== invite.folderId),
      ]);
      setInvitationResults(prev => ({
        ...prev,
        ...createInitialInvitationResults([invite]),
      }));
      successToast('초대장이 복사되었습니다.');
      return invite.folderId;
    },
    [setInvitationResults, successToast]
  );

  const handleDelete = useCallback(
    async (folderId: string) => {
      if (!folderId) return;

      let isDeleted = false;
      setDeleteErrors(prev => ({ ...prev, [folderId]: null }));
      setDeleteBusy(prev => ({ ...prev, [folderId]: true }));

      try {
        const res = await fetch('/api/drive/deleteInvitation', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId }),
        });

        const payload = (await res
          .json()
          .catch(() => null)) as DeleteInvitationResponse | null;

        if (!res.ok || payload?.success === false) {
          throw new Error(payload?.message ?? '초대장 삭제에 실패했습니다.');
        }

        clonedFolderIdsRef.current.delete(folderId);
        setInvites(prev => prev.filter(invite => invite.folderId !== folderId));
        isDeleted = true;
        clearInvitationTransientState(folderId);
        successToast('초대장이 삭제되었습니다.');
      } catch (err) {
        console.error(err);
        setDeleteErrors(prev => ({
          ...prev,
          [folderId]:
            err instanceof Error ? err.message : '초대장 삭제에 실패했습니다.',
        }));
        errorToast(
          err instanceof Error ? err.message : '초대장 삭제에 실패했습니다.'
        );
      } finally {
        setDeleteBusy(prev => {
          if (!isDeleted) {
            return { ...prev, [folderId]: false };
          }

          const next = { ...prev };
          delete next[folderId];
          return next;
        });
      }
    },
    [
      clearInvitationTransientState,
      errorToast,
      setDeleteBusy,
      setDeleteErrors,
      successToast,
    ]
  );

  const handleUpdate = useCallback(
    (folderId: string, uuid?: string) => {
      if (!uuid) {
        console.warn('invitationUuid is missing');
        return;
      }

      router.push(`/editor/${folderId}?uuid=${uuid}`);
    },
    [router]
  );

  const handleShare = useCallback(
    async (
      folderId: string,
      audienceFolderId: string,
      signal: AbortSignal
    ): Promise<'private' | 'pending' | void> => {
      if (!folderId) return;
      if (shareBusy[folderId]) return;

      setShareBusy(prev => ({ ...prev, [folderId]: true }));
      try {
        const shareData = await loadShareData(audienceFolderId, signal);
        if (signal.aborted) return;
        if (typeof shareData === 'string') return shareData;
        await shareInvitationWithKakao(shareData);
      } catch (err) {
        if (signal.aborted) return;
        console.error(err);
        errorToast(
          err instanceof Error
            ? err.message
            : '카카오톡 공유 중 오류가 발생했습니다.'
        );
      } finally {
        setShareBusy(prev => ({ ...prev, [folderId]: false }));
      }
    },
    [shareBusy, setShareBusy, errorToast]
  );

  const getGuestUrl = useCallback(
    (folderId: string) => resolveGuestUrl(invitationResults[folderId] ?? null),
    [invitationResults]
  );

  const isGuestReadinessPolling = useCallback(
    (folderId: string) => Boolean(readinessPolling[folderId]),
    [readinessPolling]
  );

  const isGuestReadinessPending = useCallback(
    (folderId: string) => {
      const result = invitationResults[folderId];
      return (
        !visibilityErrors[folderId] &&
        result?.published === true &&
        result.ready === false
      );
    },
    [visibilityErrors, invitationResults]
  );

  const isSharing = useCallback(
    (folderId: string) => Boolean(shareBusy[folderId]),
    [shareBusy]
  );

  const isVisibilityUpdating = useCallback(
    (folderId: string) => Boolean(visibilityBusy[folderId]),
    [visibilityBusy]
  );

  const isDeleting = useCallback(
    (folderId: string) => Boolean(deleteBusy[folderId]),
    [deleteBusy]
  );

  const getDeleteError = useCallback(
    (folderId: string) => deleteErrors[folderId] ?? null,
    [deleteErrors]
  );

  const getVisibilityError = useCallback(
    (folderId: string) => visibilityErrors[folderId] ?? null,
    [visibilityErrors]
  );

  return {
    invites,
    loading,
    error,
    loadInvitations,
    handleClone,
    handleDelete,
    handleToggleVisibility,
    handleUpdate,
    handleShare,
    loadShareData,
    getGuestUrl,
    isDeleting,
    isSharing,
    isVisibilityUpdating,
    isGuestReadinessPolling,
    isGuestReadinessPending,
    getDeleteError,
    getVisibilityError,
  };
}

export default useDashboardInvitations;
