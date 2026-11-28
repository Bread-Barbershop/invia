import React, { useCallback, useRef, useState } from 'react';

import DrivePermissionRequiredModal from '@/features/session/components/DrivePermissionRequiredModal';
import LoginModal from '@/features/session/components/LoginModal';
import PrivacyNoticeModal from '@/features/session/components/PrivacyNoticeModal';
import { useAuthGate } from '@/features/session/hooks/useAuthGate';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { useFabricViewContext } from '@/widgets/mainPoster/context/FabricContext';

import { SAVE_SHORTCUT_ARIA_KEYS, useSaveShortcut } from '../hooks/useSaveShortcut';

import { getPosterExampleText } from './posterExampleText';
import { SaveModal } from './SaveModal';

import type { useInvitationUpload } from '../hooks/useInvitationUpload';

function UploadButton({
  upload,
}: {
  upload: ReturnType<typeof useInvitationUpload>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const {
    handleUpload,
    isLoading,
    isFail,
    isAuthRequired,
    isDraftPersisted,
    isCleaningUp,
    pendingInvitation,
    loadingMessage,
    photoProgress,
  } = upload;
  const { confirm } = useConfirm();
  const { canvas } = useFabricViewContext();
  const auth = useAuthGate();

  const handleClose = () => {
    if (!isLoading) {
      setIsModalOpen(false);
    }
  };

  const handleGoogleLogin = () => {
    auth.runAfterReauth(async () => {
      await handleUpload();
    });
  };

  const authDialogOpen =
    auth.isLoginOpen ||
    auth.isPrivacyNoticeOpen ||
    auth.isDrivePermissionRequiredOpen;

  // 버튼 클릭과 Ctrl+S / ⌘+S 가 완전히 같은 경로로 저장을 시작하도록 한곳에 모은다.
  const requestSave = useCallback(async () => {
    const examples = getPosterExampleText(canvas?.getObjects() ?? []);
    const shown = examples.slice(0, 3).map(text => `“${text}”`);
    if (examples.length > shown.length) {
      shown.push(`외 ${examples.length - shown.length}개`);
    }
    const isConfirm = await confirm({
      ...(examples.length
        ? {
            message: [
              '표지에 예시 문구가 남아 있어요.',
              ...shown,
              '본문을 바꿔도 표지 문구는 그대로 발행돼요. 이대로 저장할까요?',
            ].join('\n'),
            confirmText: '그대로 저장',
            cancelText: '돌아가기',
          }
        : {
            message: '저장하시겠습니까?\n다소 시간이 소요될 수 있습니다.',
          }),
      variant: 'white',
      xPosition: 'center',
      yPosition: 'center',
    });
    if (!isConfirm) {
      return;
    }

    void handleUpload();
    setIsModalOpen(true);
  }, [canvas, confirm, handleUpload]);

  // 저장 중이거나, 정리 중이거나, 저장/로그인 안내 창이 떠 있으면 단축키로 또 저장하지 않는다.
  useSaveShortcut({
    onSave: () => void requestSave(),
    enabled: !isLoading && !isCleaningUp && !isModalOpen && !authDialogOpen,
  });

  return (
    <div ref={tabRef}>
      <button
        type="button"
        disabled={isLoading || isCleaningUp}
        aria-keyshortcuts={SAVE_SHORTCUT_ARIA_KEYS}
        title="모두 저장하기 (Ctrl+S / ⌘+S)"
        className="w-full h-11 bg-white rounded-lg shadow-edit flex-center flex-col gap-0.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => void requestSave()}
      >
        <span>모두 저장하기</span>
        <kbd
          aria-hidden="true"
          className="text-[10px] font-medium leading-none tracking-wide text-text-secondary"
        >
          Ctrl+S
        </kbd>
      </button>
      {isModalOpen && (
        <SaveModal
          ref={modalRef}
          isLoading={isLoading}
          isFail={isFail}
          authRequired={isAuthRequired}
          isDraftPersisted={isDraftPersisted}
          onGoogleLogin={handleGoogleLogin}
          escapeDisabled={authDialogOpen}
          pendingInvitation={pendingInvitation}
          skipDashboardHandoff={Boolean(pendingInvitation?.audienceSlug)}
          loadingMessage={loadingMessage}
          photoProgress={photoProgress}
          retry={() => void handleUpload()}
          onClose={handleClose}
        />
      )}
      <LoginModal
        open={auth.isLoginOpen}
        isLoading={auth.isLoginPending}
        onClose={auth.closeLogin}
        onGoogleLogin={auth.loginWithGoogle}
      />
      <PrivacyNoticeModal
        open={auth.isPrivacyNoticeOpen}
        onClose={auth.closePrivacyNotice}
        onConfirm={auth.confirmPrivacyNotice}
      />
      <DrivePermissionRequiredModal
        open={auth.isDrivePermissionRequiredOpen}
        isLoading={auth.isLoginPending}
        onClose={auth.closeDrivePermissionRequired}
        onRetry={auth.retryDrivePermission}
      />
    </div>
  );
}

export default UploadButton;
