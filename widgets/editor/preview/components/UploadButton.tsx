import React, { useCallback, useRef, useState } from 'react';

import DrivePermissionRequiredModal from '@/features/session/components/DrivePermissionRequiredModal';
import LoginModal from '@/features/session/components/LoginModal';
import PrivacyNoticeModal from '@/features/session/components/PrivacyNoticeModal';
import { useAuthGate } from '@/features/session/hooks/useAuthGate';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { titleFromSavedInvitation } from '@/shared/utils/invitationTitle';
import { useFabricViewContext } from '@/widgets/mainPoster/context/FabricContext';

import { SAVE_SHORTCUT_ARIA_KEYS, useSaveShortcut } from '../hooks/useSaveShortcut';
import {
  buildPublishChecklist,
  type PublishChecklistItem,
  type PublishChecklistResult,
} from '../publishChecklist';

import { getPosterExampleText } from './posterExampleText';
import { PublishChecklistModal } from './PublishChecklistModal';
import { SaveModal } from './SaveModal';

import type { useInvitationUpload } from '../hooks/useInvitationUpload';

function UploadButton({
  upload,
}: {
  upload: ReturnType<typeof useInvitationUpload>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checklist, setChecklist] = useState<PublishChecklistResult | null>(null);
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

  // 저장 전에 초대장 상태를 한 번 점검해, 빠뜨린 정보를 체크리스트로 먼저 보여 준다.
  const requestSave = useCallback(() => {
    const { block, shareUrl } = useEditorStore.getState();
    const posterObjects = canvas?.getObjects() ?? [];

    setChecklist(
      buildPublishChecklist({
        blocks: block,
        title: titleFromSavedInvitation({ shareUrl, blocks: block }),
        posterObjectCount: posterObjects.length,
        posterExampleTexts: getPosterExampleText(posterObjects),
      })
    );
  }, [canvas]);

  // 체크리스트에서 항목을 누르면 해당 위치(표지·공유 설정·블록)로 이동한다.
  const handleFixChecklistItem = (item: PublishChecklistItem) => {
    setChecklist(null);
    const { selectedBlock, setIsEdit } = useEditorStore.getState();
    if (item.target === 'poster') selectedBlock('mainPoster');
    else if (item.target === 'shareUrl') selectedBlock('shareUrl');
    else if (item.target === 'block') selectedBlock(item.blockId ?? null);
    setIsEdit(false);
  };

  const startSave = useCallback(() => {
    setChecklist(null);
    void handleUpload();
    setIsModalOpen(true);
  }, [handleUpload]);

  // 저장 중이거나, 정리 중이거나, 저장/로그인 안내 창이 떠 있으면 단축키로 또 저장하지 않는다.
  useSaveShortcut({
    onSave: () => requestSave(),
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
        onClick={() => requestSave()}
      >
        <span>모두 저장하기</span>
        <kbd
          aria-hidden="true"
          className="text-[10px] font-medium leading-none tracking-wide text-text-secondary"
        >
          Ctrl+S
        </kbd>
      </button>
      {checklist && (
        <PublishChecklistModal
          result={checklist}
          onFix={handleFixChecklistItem}
          onSave={startSave}
          onClose={() => setChecklist(null)}
        />
      )}
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
