import { useCallback, useEffect, useId, useRef, useState } from 'react';

import type { InviteListItem } from '@/app/dashboard/types';
import Confirm from '@/components/molecules/confirm/Confirm';

type AudienceRow = { folderId: string; name: string };
type Scope = 'loading' | 'unknown' | AudienceRow[];
type Mode = 'loading' | 'choose' | 'full' | 'group';

type Props = {
  invite: InviteListItem;
  onClose: () => void;
  onDeleteAll: () => Promise<boolean>;
  onDeleteAudience: (groupFolderId: string) => Promise<boolean>;
  onScopeChanged: () => void;
};

const FIELD_BUTTON =
  'inline-flex min-h-10 items-center justify-center rounded-lg border border-[#deddd6] bg-white px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55715d] disabled:cursor-not-allowed disabled:opacity-50';

function getFullDeletePrompt(title: string, scope: Scope) {
  if (scope === 'loading')
    return {
      message: `‘${title}’ 삭제 범위 확인`,
      description: '함께 삭제될 하객 그룹을 확인하고 있어요.',
      confirmText: '확인 중…',
    };

  const linkNotice = '이미 보낸 링크로도 초대장을 열 수 없어요.';
  if (Array.isArray(scope) && scope.length === 0)
    return {
      message: `‘${title}’ 초대장을 삭제할까요?`,
      description: linkNotice,
      confirmText: '초대장 삭제',
    };

  const groupsNotice =
    scope === 'unknown'
      ? '하객 그룹 목록을 불러오지 못했어요. 삭제하면 이 행사의 기본 초대장과 모든 하객 그룹이 함께 삭제돼요.'
      : `기본 초대장과 하객 그룹 ${scope.length}개(${scope.map(group => group.name).join('·')})가 함께 삭제돼요.`;
  return {
    message: `‘${title}’ 전체를 삭제할까요?`,
    description: `${groupsNotice} ${linkNotice}`,
    confirmText: '초대장 전체 삭제',
  };
}

export default function DeleteInvitationDialog({
  invite,
  onClose,
  onDeleteAll,
  onDeleteAudience,
  onScopeChanged,
}: Props) {
  const [scope, setScope] = useState<Scope>('loading');
  const [mode, setMode] = useState<Mode>('loading');
  const [selectedGroup, setSelectedGroup] = useState<AudienceRow | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const busyRef = useRef(busy);
  const returnToChooserFromFullRef = useRef(false);
  const chooserRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const { folderId } = invite;

  useEffect(() => {
    const controller = new AbortController();

    async function loadScope() {
      const params = new URLSearchParams({
        folderId,
        view: 'editor-options',
      });
      try {
        const response = await fetch(
          `/api/drive/invitationAudiences?${params}`,
          { cache: 'no-store', signal: controller.signal }
        );
        const data = await response.json();
        if (controller.signal.aborted) return;
        const audiences: unknown = data?.audiences;
        if (
          !response.ok ||
          !Array.isArray(audiences) ||
          !audiences.every(
            group =>
              typeof group?.folderId === 'string' &&
              typeof group?.name === 'string' &&
              group.name.trim()
          )
        ) {
          setScope('unknown');
          returnToChooserFromFullRef.current = false;
          setMode('full');
          return;
        }
        const groups = audiences.map(group => ({
          folderId: group.folderId as string,
          name: group.name as string,
        }));
        setScope(groups);
        returnToChooserFromFullRef.current = false;
        setMode(groups.length ? 'choose' : 'full');
      } catch {
        if (!controller.signal.aborted) {
          setScope('unknown');
          returnToChooserFromFullRef.current = false;
          setMode('full');
        }
      }
    }

    void loadScope();
    return () => controller.abort();
  }, [folderId, loadAttempt]);

  useEffect(() => {
    const dialog = chooserRef.current;
    if (mode !== 'choose' || !dialog) return;
    dialog.showModal();
    titleRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [mode]);

  const title = invite.displayTitle ?? invite.name;
  const prompt = getFullDeletePrompt(title, scope);

  const backToChooser = useCallback(() => {
    if (busyRef.current) return;
    setErrorMessage(null);
    setSelectedGroup(null);
    setMode('choose');
  }, []);

  const cancelFullDelete = useCallback(() => {
    if (busyRef.current) return;
    if (returnToChooserFromFullRef.current) {
      setErrorMessage(null);
      setMode('choose');
      return;
    }
    onClose();
  }, [onClose]);

  function retryScopeLoad() {
    setScope('loading');
    setMode('loading');
    setErrorMessage(null);
    setLoadAttempt(attempt => attempt + 1);
  }

  async function confirmFullDelete() {
    if (busy || scope === 'loading') return;
    busyRef.current = true;
    setBusy(true);
    setErrorMessage(null);
    try {
      if (await onDeleteAll()) onClose();
      else setErrorMessage('초대장 삭제에 실패했어요. 다시 시도해 주세요.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '초대장 삭제에 실패했어요. 다시 시도해 주세요.'
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function confirmGroupDelete() {
    if (!selectedGroup || busy) return;
    busyRef.current = true;
    setBusy(true);
    setErrorMessage(null);
    try {
      if (!(await onDeleteAudience(selectedGroup.folderId))) {
        setErrorMessage('하객 그룹 삭제에 실패했어요. 다시 시도해 주세요.');
        return;
      }
      setScope(previous =>
        Array.isArray(previous)
          ? previous.filter(group => group.folderId !== selectedGroup.folderId)
          : previous
      );
      setSelectedGroup(null);
      setMode('choose');
      onScopeChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '하객 그룹 삭제에 실패했어요. 다시 시도해 주세요.'
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  if (mode === 'choose' && Array.isArray(scope)) {
    return (
      <dialog
        ref={chooserRef}
        aria-labelledby={titleId}
        onCancel={event => {
          event.preventDefault();
          onClose();
        }}
        onClick={event => {
          if (event.target === event.currentTarget) onClose();
        }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[min(480px,calc(100vw-32px))] overflow-y-auto rounded-2xl border border-[#deddd6] bg-white p-0 text-text-primary shadow-edit backdrop:bg-black/50"
      >
        <section className="grid gap-4 p-5 sm:p-6">
          <header className="grid gap-1">
            <h2
              id={titleId}
              ref={titleRef}
              tabIndex={-1}
              className="text-lg font-semibold focus:outline-none"
            >
              ‘{title}’ 삭제 범위 선택
            </h2>
            <p className="text-sm leading-6 text-neutral-700">
              삭제할 초대장 범위를 선택해 주세요.
            </p>
          </header>
          <ul className="grid max-h-[45dvh] gap-2 overflow-y-auto">
            <li className="grid gap-1 rounded-lg border border-[#deddd6] bg-[#f7f6f3] px-3 py-2.5">
              <span className="text-sm font-semibold">기본 초대장</span>
              <span className="text-xs text-neutral-600">
                기본 초대장은 전체 삭제에서만 삭제할 수 있어요.
              </span>
            </li>
            {scope.map(group => (
              <li
                key={group.folderId}
                className="flex items-center gap-3 rounded-lg border border-[#deddd6] px-3 py-2"
              >
                <span className="min-w-0 flex-1 break-words text-sm font-semibold">
                  {group.name}
                </span>
                <button
                  type="button"
                  aria-label={`${group.name} 삭제`}
                  className={`${FIELD_BUTTON} border-[#e1b7b8] text-[#a3212d]`}
                  onClick={() => {
                    setSelectedGroup(group);
                    setErrorMessage(null);
                    setMode('group');
                  }}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={FIELD_BUTTON} onClick={onClose}>
              취소
            </button>
            <button
              type="button"
              className={`${FIELD_BUTTON} border-[#e1b7b8] text-[#a3212d]`}
              onClick={() => {
                setErrorMessage(null);
                returnToChooserFromFullRef.current = true;
                setMode('full');
              }}
            >
              초대장 전체 삭제
            </button>
          </div>
        </section>
      </dialog>
    );
  }

  if (mode === 'group' && selectedGroup) {
    return (
      <Confirm
        ref={confirmRef}
        message={`‘${selectedGroup.name}’ 하객 그룹을 삭제할까요?`}
        description={`이미 보낸 ‘${selectedGroup.name}’ 링크로는 초대장을 열 수 없어요.`}
        confirmText="그룹 삭제"
        cancelText="뒤로"
        onConfirm={() => void confirmGroupDelete()}
        onCancel={backToChooser}
        onClose={backToChooser}
        initialFocus="cancel"
        variant="white"
        yPosition="center"
        isBusy={busy}
        errorMessage={errorMessage}
        confirmDisabled={busy}
      />
    );
  }

  return (
    <Confirm
      ref={confirmRef}
      {...prompt}
      confirmDisabled={scope === 'loading' || busy}
      cancelText="취소"
      onConfirm={() => void confirmFullDelete()}
      onCancel={cancelFullDelete}
      onClose={cancelFullDelete}
      initialFocus="cancel"
      variant="white"
      yPosition="center"
      actionButtonClassName="w-auto min-w-[66px] whitespace-nowrap px-3"
      isBusy={busy}
      errorMessage={errorMessage}
      footer={
        scope === 'unknown' ? (
          <button
            type="button"
            disabled={busy}
            className={`${FIELD_BUTTON} mx-auto`}
            onClick={retryScopeLoad}
          >
            다시 불러오기
          </button>
        ) : null
      }
    />
  );
}
