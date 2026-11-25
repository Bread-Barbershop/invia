import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { forwardRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { LinkShareModal } from '@/components/molecules/link-share/LinkShareModal';
import type { PhotoUploadProgress } from '@/features/invitation/save/saveInvitationFlow';
import {
  DASHBOARD_PENDING_INVITATION_KEY,
  type DashboardPendingInvitation,
} from '@/shared/constants/dashboardPendingInvitation';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';

import { SaveLottie } from './SaveLottie';

interface Props {
  isLoading: boolean;
  isFail: boolean;
  authRequired?: boolean;
  onGoogleLogin?: () => void;
  escapeDisabled?: boolean;
  pendingInvitation:
    | (DashboardPendingInvitation & { qrDownloadName?: string })
    | null;
  skipDashboardHandoff?: boolean;
  loadingMessage: string;
  photoProgress?: PhotoUploadProgress;
  loadingAnimation?: SaveLoadingMessageAnimation;
  retry: () => void;
  onClose: () => void;
}

export type SaveLoadingMessageAnimation =
  | 'slide'
  | 'blur'
  | 'scale'
  | 'stagger';

const MESSAGE_EASE = [0.4, 0, 0.2, 1] as const;

const MESSAGE_ANIMATION = {
  slide: {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.32, ease: MESSAGE_EASE },
    },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(6px)' },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.38, ease: MESSAGE_EASE },
    },
  },
  scale: {
    initial: { opacity: 0, scale: 1.06 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: MESSAGE_EASE },
    },
  },
} as const;

export const SaveLoadingMessage = ({
  message,
  animation = 'slide',
  className = 'min-h-6 text-base font-semibold text-[#202020]',
}: {
  message?: string;
  animation?: SaveLoadingMessageAnimation;
  className?: string;
}) => {
  if (animation === 'stagger') {
    return (
      <motion.p
        key={message}
        className={className}
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.016,
            },
          },
        }}
      >
        {Array.from(message ?? '').map((char, index) => (
          <motion.span
            key={`${message}-${index}`}
            className="inline-block"
            variants={{
              initial: { opacity: 0, y: 6 },
              animate: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.28,
                  ease: MESSAGE_EASE,
                },
              },
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.p>
    );
  }

  return (
    <motion.p
      key={message}
      {...MESSAGE_ANIMATION[animation]}
      className={className}
      style={animation === 'blur' ? { willChange: 'filter' } : undefined}
    >
      {message}
    </motion.p>
  );
};

const ModalFrame = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    isLoading?: boolean;
    loadingMessage?: string;
    photoProgress?: PhotoUploadProgress;
    loadingAnimation?: SaveLoadingMessageAnimation;
    escapeDisabled?: boolean;
    onClose: () => void;
  }
>((props, ref) => {
  const {
    children,
    isLoading,
    loadingMessage,
    photoProgress,
    loadingAnimation,
    escapeDisabled = false,
    onClose,
  } = props;
  const photoCount = photoProgress
    ? `${photoProgress.total}장 중 ${photoProgress.completed}장 완료`
    : undefined;
  const backdropDismiss = useBackdropDismiss<HTMLDivElement>(
    isLoading ? undefined : onClose
  );

  // 저장 중에는 닫지 않고, ESC로도 언제든 빠져나올 수 있게 한다.
  useEffect(() => {
    if (isLoading || escapeDisabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [escapeDisabled, isLoading, onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-[rgb(0_0_0_/_8%)]"
        {...backdropDismiss}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={isLoading ? '초대장 저장' : undefined}
        aria-labelledby={isLoading ? undefined : 'save-modal-title'}
        tabIndex={-1}
        className={`fixed top-1/2 left-1/2 z-[101] flex min-h-[249px] max-h-[calc(100dvh-32px)] w-[335px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 overflow-y-auto rounded-xl bg-white p-5 shadow-[0_24px_60px_-20px_rgb(0_0_0_/_12%),0_8px_24px_-8px_rgb(0_0_0_/_18%)] ${isLoading ? 'justify-center' : ''}`}
      >
        {!isLoading && (
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute top-3 right-3 grid size-8 cursor-pointer place-items-center rounded-lg text-neutral-500 transition-colors hover:bg-[#F5F5F5] hover:text-[#202020] focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
        {isLoading ? (
          <div className="-mt-2 flex w-full flex-col items-center gap-3 text-center">
            <SaveLottie variant="loading" loop />
            <div className="-mt-8 grid w-full justify-items-center gap-2">
              <div role="status" aria-atomic="true">
                <SaveLoadingMessage
                  message={loadingMessage}
                  animation={loadingAnimation}
                />
                {photoCount && (
                  <p className="mt-1 text-sm text-neutral-600 tabular-nums">
                    {photoCount}
                  </p>
                )}
              </div>
              {photoProgress && (
                <progress
                  aria-label="사진 업로드"
                  aria-valuetext={photoCount}
                  value={photoProgress.completed}
                  max={photoProgress.total}
                  className="h-2 w-[229px] max-w-full accent-[#476247]"
                />
              )}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
});

ModalFrame.displayName = 'ModalFrame';

const SaveAuthRequiredView = ({
  onGoogleLogin,
  onClose,
}: {
  onGoogleLogin?: () => void;
  onClose: () => void;
}) => (
  <>
    <div className="mt-5 grid w-full justify-items-center gap-2 px-4 text-center">
      <p
        id="save-modal-title"
        className="text-base font-semibold text-[#202020]"
      >
        저장을 위해 Google 로그인이 필요해요
      </p>
      <p className="text-sm leading-6 text-neutral-600">
        지금까지 작업한 내용은 이 브라우저에 임시로 보관했어요.
        <br />
        로그인하면 그대로 이어서 저장할 수 있어요.
      </p>
    </div>
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={!onGoogleLogin}
        className="relative flex h-11 w-full cursor-pointer items-center justify-center rounded-[8px] bg-white px-2 py-1.5 text-[15px] font-medium text-[#111827] ring-1 ring-[#EBEBEB] ring-inset transition-colors enabled:hover:bg-[#FAFAFB] enabled:active:bg-[#F5F8FF] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Image
          src="/assets/icons/google-icon.svg"
          alt="Google"
          width={32}
          height={32}
          className="absolute left-2"
        />
        Google로 계속하기
      </button>
      <button
        type="button"
        onClick={onClose}
        className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[8px] bg-transparent text-sm font-semibold text-neutral-500 transition-colors hover:bg-[#F7F7F7] hover:text-[#202020]"
      >
        나중에 할게요
      </button>
    </div>
  </>
);

const SaveStepView = ({
  isFail,
  publicationPending,
  onShare,
  onRetry,
  onClose,
  onExit,
}: {
  isFail: boolean;
  publicationPending: boolean;
  onShare?: () => void;
  onRetry: () => void;
  onClose: () => void;
  onExit: () => void;
}) => (
  <>
    <div>
      <p id="save-modal-title" className="text-sm font-semibold">
        {isFail
          ? '파일 저장에 실패했습니다.'
          : publicationPending
            ? '저장 완료 · 공개 준비 중이에요.'
            : '성공적으로 저장되었습니다!'}
      </p>
    </div>
    <div>
      <SaveLottie variant={isFail ? 'fail' : 'success'} />
    </div>
    <div className="flex w-full flex-col gap-2">
      {isFail ? (
        <button
          type="button"
          className="font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center h-[44px] w-full"
          onClick={onRetry}
        >
          다시 저장하기
        </button>
      ) : (
        <>
          {onShare && (
            <button
              type="button"
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-black text-sm font-semibold text-white hover:bg-[#202020]"
              onClick={onShare}
            >
              링크 공유하기
            </button>
          )}
          <div className="flex w-full items-center gap-2">
            <button
              type="button"
              className="font-semibold text-sm rounded-[8px] bg-white text-black flex-center h-[44px] flex-1 cursor-pointer transition-colors hover:bg-[#F9F9F9] active:bg-[#EFEFEF]"
              onClick={onClose}
            >
              다시 수정하기
            </button>
            <button
              type="button"
              className="font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center h-[44px] flex-1 cursor-pointer transition-colors hover:bg-[#202020] active:bg-[#0D0D0D]"
              onClick={onExit}
            >
              여기서 나가기
            </button>
          </div>
        </>
      )}
    </div>
  </>
);

export const SaveModal = forwardRef<HTMLDivElement, Props>(
  (
    {
      isLoading,
      isFail,
      authRequired = false,
      onGoogleLogin,
      escapeDisabled,
      pendingInvitation,
      skipDashboardHandoff,
      loadingMessage,
      photoProgress,
      loadingAnimation,
      retry,
      onClose,
    }: Props,
    ref
  ) => {
    const router = useRouter();
    const [isSharing, setIsSharing] = useState(false);

    const handleExit = () => {
      if (
        typeof window !== 'undefined' &&
        pendingInvitation &&
        !skipDashboardHandoff
      ) {
        sessionStorage.setItem(
          DASHBOARD_PENDING_INVITATION_KEY,
          JSON.stringify(pendingInvitation)
        );
      }
      router.replace('/dashboard');
    };

    if (isSharing && !isLoading && !isFail && pendingInvitation?.guestUrl) {
      return (
        <LinkShareModal
          url={pendingInvitation.guestUrl}
          downloadName={pendingInvitation.qrDownloadName}
          shareFolderId={pendingInvitation.invitationFolderId}
          visibility={
            pendingInvitation.published === false
              ? 'private'
              : pendingInvitation.ready === false
                ? 'pending'
                : 'public'
          }
          pendingNotice="초대장 공개를 준비 중이에요. 준비가 끝나면 링크와 QR로 접속할 수 있어요."
          onClose={() => setIsSharing(false)}
        />
      );
    }

    return createPortal(
      <ModalFrame
        ref={ref}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        photoProgress={photoProgress}
        loadingAnimation={loadingAnimation}
        escapeDisabled={escapeDisabled}
        onClose={onClose}
      >
        {authRequired ? (
          <SaveAuthRequiredView
            onGoogleLogin={onGoogleLogin}
            onClose={onClose}
          />
        ) : (
          <SaveStepView
            isFail={isFail}
            publicationPending={
              pendingInvitation?.published === true &&
              pendingInvitation.ready === false
            }
            onShare={
              pendingInvitation?.guestUrl ? () => setIsSharing(true) : undefined
            }
            onRetry={retry}
            onClose={onClose}
            onExit={handleExit}
          />
        )}
      </ModalFrame>,
      document.body
    );
  }
);

SaveModal.displayName = 'SaveModal';
