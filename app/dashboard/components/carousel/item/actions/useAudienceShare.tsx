import { ChevronRight } from 'lucide-react';
import {
  type MouseEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { InviteListItem } from '@/app/dashboard/types';
import { groupQrDownloadNames } from '@/components/molecules/link-share/qrDownloadName';
import {
  buildAudienceGuestUrl,
  type AudienceGroup,
} from '@/features/invitation/audiences/model';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';

import type {
  ShareAudienceLink,
  ShareAudienceWithKakao,
  ShareOption,
} from '../../carouselTypes';

type ShareChannel = 'link' | 'kakao';
type ShareGroup = Omit<ShareOption, 'downloadName'>;
const LOAD_ERROR = '공유할 하객 그룹을 불러오지 못했어요.';
const statusLabels = {
  public: '공개',
  private: '비공개',
  pending: '설정 확인 중',
} as const;

async function loadShareOptions(
  folderId: string,
  signal: AbortSignal
): Promise<ShareGroup[]> {
  const params = new URLSearchParams({ folderId, view: 'share-options' });
  const response = await fetch(`/api/drive/invitationAudiences?${params}`, {
    cache: 'no-store',
    signal,
  });
  const list = await response.json();
  if (!response.ok) throw new Error(list?.message ?? LOAD_ERROR);
  const { groups, rootGuestUrl } = list as {
    groups: (AudienceGroup & Pick<ShareOption, 'visibility'>)[];
    rootGuestUrl: string;
  };
  if (
    !rootGuestUrl ||
    !Array.isArray(groups) ||
    !groups.some(group => group.folderId === folderId && group.slug === '')
  ) {
    throw new Error(LOAD_ERROR);
  }
  return groups.map(group => ({
    folderId: group.folderId,
    visibility: statusLabels[group.visibility] ? group.visibility : 'pending',
    name: group.slug ? group.name : '기본 초대장',
    url: new URL(
      buildAudienceGuestUrl(rootGuestUrl, group.slug),
      window.location.origin
    ).href,
  }));
}

export function useAudienceShare({
  invite,
  guestUrl,
  active,
  onOpenLinkShare,
  onKakao,
  isSharing,
}: {
  invite?: InviteListItem;
  guestUrl: string | null;
  active: boolean;
  onOpenLinkShare?: ShareAudienceLink;
  onKakao?: ShareAudienceWithKakao;
  isSharing: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const folderId = invite?.folderId;
  const published = invite?.published;
  const scope = invite?.audienceVisibility;
  const request = useMemo(
    () => ({ folderId, guestUrl, active, attempt, published, scope }),
    [folderId, guestUrl, active, attempt, published, scope]
  );
  const [result, setResult] = useState<{
    request: typeof request;
    options?: ShareGroup[];
    error?: string;
  } | null>(null);
  const groups = result?.request === request ? result.options : undefined;
  const eventTitle = invite?.displayTitle || invite?.name || '초대장';
  const options = useMemo(() => {
    if (!groups) return;
    const names = groupQrDownloadNames(
      eventTitle,
      groups.map(group => group.name)
    );
    return groups.map((group, index) => ({
      ...group,
      downloadName: names[index],
    }));
  }, [groups, eventTitle]);
  const error = result?.request === request ? result.error : undefined;
  const dialog = useRef<HTMLDialogElement>(null);
  const [channel, setChannel] = useState<ShareChannel | null>(null);
  const pendingKakao = useRef<AbortController | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const eventId = useId();
  const linkEnabled = Boolean(active && guestUrl && onOpenLinkShare);
  const canLookUpKakao = Boolean(
    active &&
    onKakao &&
    (guestUrl || invite?.hasKakaoShareData || invite?.dataJsonFileId)
  );
  const enabled = linkEnabled || canLookUpKakao;
  const kakaoEnabled =
    canLookUpKakao &&
    Boolean(error || invite?.hasKakaoShareData || (options?.length ?? 0) > 1);

  useEffect(() => {
    if (!enabled || !request.folderId) return;
    const controller = new AbortController();
    loadShareOptions(request.folderId, controller.signal).then(
      next => {
        if (!controller.signal.aborted) setResult({ request, options: next });
      },
      err => {
        if (!controller.signal.aborted)
          setResult({
            request,
            error: (err instanceof Error && err.message) || LOAD_ERROR,
          });
      }
    );
    return () => {
      controller.abort();
      pendingKakao.current?.abort();
      pendingKakao.current = null;
    };
  }, [enabled, request]);

  function closePicker() {
    setChannel(null);
    dialog.current?.close();
    trigger.current?.focus({ preventScroll: true });
  }
  const backdrop = useBackdropDismiss<HTMLDialogElement>(
    closePicker,
    'outside-dialog'
  );
  const loading = enabled && !error && !options;

  function share(option: ShareOption, via: ShareChannel) {
    if (!invite) return;
    if (via === 'link') {
      onOpenLinkShare?.(invite.folderId, option);
      return;
    }
    if (!onKakao || pendingKakao.current) return;
    const controller = new AbortController();
    pendingKakao.current = controller;
    void onKakao(invite.folderId, option, controller.signal).finally(() => {
      if (pendingKakao.current === controller) pendingKakao.current = null;
    });
  }

  function buttonProps(via: ShareChannel, available: boolean) {
    return {
      disabled: !available || loading || isSharing,
      'aria-busy':
        (loading && (via === 'link' ? linkEnabled : canLookUpKakao)) ||
        (isSharing && via === 'kakao' && available),
      'aria-haspopup':
        options && (via === 'link' || options.length > 1)
          ? ('dialog' as const)
          : undefined,
      title: error,
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        if (error) {
          setAttempt(previous => previous + 1);
          return;
        }
        if (!options?.length || !invite) return;
        trigger.current = event.currentTarget;
        trigger.current.focus();
        if (options.length === 1) {
          share(options[0], via);
        } else {
          setChannel(via);
          dialog.current?.showModal();
        }
      },
    };
  }
  return {
    linkButtonProps: buttonProps('link', linkEnabled),
    kakaoButtonProps: buttonProps('kakao', kakaoEnabled),
    kakaoLabel:
      error && canLookUpKakao
        ? '카카오톡 공유 다시 준비하기'
        : isSharing && kakaoEnabled
          ? '카카오톡 여는 중…'
          : loading && canLookUpKakao
            ? '카카오톡 준비 중…'
            : '카카오톡 공유하기',
    linkLabel:
      error && linkEnabled
        ? '공유 다시 준비하기'
        : loading && linkEnabled
          ? '공유 준비 중…'
          : '링크·QR 공유하기',
    statusLabel: loading
      ? '공유 정보를 확인하고 있어요.'
      : isSharing
        ? '카카오톡 공유를 준비하고 있어요.'
        : '',
    picker: invite && options && options.length > 1 && (
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        aria-describedby={eventId}
        {...backdrop}
        onClick={event => {
          event.stopPropagation();
          backdrop.onClick(event);
        }}
        onCancel={event => {
          event.preventDefault();
          closePicker();
        }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-32px)] w-[min(400px,calc(100vw-32px))] overflow-y-auto rounded-2xl bg-white p-6 text-left text-text-plain shadow-xl backdrop:bg-black/50 motion-safe:open:animate-[fade-in_180ms_ease-out]"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          누구에게 보낼 초대장인가요?
        </h2>
        <p
          id={eventId}
          className="mt-1 break-words text-sm text-text-secondary"
        >
          {invite.displayTitle ?? invite.name}
        </p>
        <ul className="mt-5 grid gap-2">
          {options.map(option => (
            <li key={option.url}>
              <button
                type="button"
                aria-label={option.name}
                aria-describedby={`${eventId}-${option.folderId}`}
                disabled={
                  channel === 'kakao' &&
                  option.folderId === folderId &&
                  !invite.hasKakaoShareData
                }
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-neutral-200 px-4 py-3 text-left text-sm font-semibold hover:bg-neutral-50 focus-visible:outline-2 disabled:opacity-50"
                onClick={() => {
                  closePicker();
                  if (channel) share(option, channel);
                }}
              >
                <span className="min-w-0 break-words">{option.name}</span>
                <span
                  id={`${eventId}-${option.folderId}`}
                  className="ml-auto shrink-0 text-xs font-medium text-text-secondary"
                >
                  {statusLabels[option.visibility]}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  size={16}
                  className="shrink-0 text-neutral-500"
                />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={closePicker}
          className="mt-3 min-h-10 w-full rounded-lg text-sm text-gray-600 hover:bg-neutral-50"
        >
          닫기
        </button>
      </dialog>
    ),
  };
}
