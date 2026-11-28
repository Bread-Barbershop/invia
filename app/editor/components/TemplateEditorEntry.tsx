'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ScreenTransitionLoader } from '@/components/molecules/screen-transition-loader';
import { DEFAULT_SCROLL_ANIMATION } from '@/components/molecules/scroll-fade-in/animationConfig';
import {
  loadEditorDraft,
  type EditorDraftKey,
  type EditorDraftSnapshot,
} from '@/features/editor/draft/editorDraft';
import EditorDraftRecoveryDialog from '@/features/editor/draft/EditorDraftRecoveryDialog';
import DrivePermissionRequiredModal from '@/features/session/components/DrivePermissionRequiredModal';
import LoginModal from '@/features/session/components/LoginModal';
import PrivacyNoticeModal from '@/features/session/components/PrivacyNoticeModal';
import { useAuthGate } from '@/features/session/hooks/useAuthGate';
import { DEFAULT_BACKGROUND_TEXTURE } from '@/shared/data/backgroundTextures';
import { createInvitationTemplate } from '@/shared/data/invitationTemplates';
import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';
import type { PersistedEditorBlock } from '@/shared/types/block';
import { createDefaultShareUrlState } from '@/shared/utils/shareUrlDefaults';
import InvitationTemplatePoster from '@/widgets/editor/preview/components/InvitationTemplatePoster';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import { toEditorDraftSavedData } from './draftSavedData';
import MainContentsArea from './MainContentsArea';

import type { SavedData } from '../[id]/types/savedata';

export async function prepareTemplateEditorData(
  templateId: string
): Promise<SavedData> {
  const prepared = await createInvitationTemplate(templateId);
  return {
    blocks: prepared.blocks as PersistedEditorBlock[],
    bulkData: {
      backgroundColor: prepared.backgroundColor,
      backgroundTexture: DEFAULT_BACKGROUND_TEXTURE,
      sectionStyle: prepared.sectionStyle,
      titleData: prepared.titleData,
      bodyData: prepared.bodyData,
      isZoom: false,
      scrollAnimation: DEFAULT_SCROLL_ANIMATION,
    },
    mainPoster: JSON.stringify(prepared.posterJson),
    bgm: { bgmInfo: null, bgmFile: null },
    shareUrl: createDefaultShareUrlState(),
    imageFolderId: '',
    audioFolderId: '',
    invitationImage: [],
  };
}

export default function TemplateEditorEntry({
  templateId,
  initialIsLoggedIn,
}: {
  templateId: string;
  initialIsLoggedIn: boolean;
}) {
  const template = INVITATION_TEMPLATES.find(item => item.id === templateId);
  const draftKey: EditorDraftKey = `template:${templateId}`;
  const router = useRouter();
  const auth = useAuthGate({ initialIsLoggedIn, stayOnSessionExpiry: true });
  const [readyTemplateId, setReadyTemplateId] = useState<string | null>(null);
  const [isInitialAuthPending, setIsInitialAuthPending] =
    useState(initialIsLoggedIn);
  const [preparedData, setPreparedData] = useState<{
    templateId: string;
    data: SavedData;
  } | null>(null);
  const [templateLoadError, setTemplateLoadError] = useState<{
    templateId: string;
    attempt: number;
  } | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [pendingDraft, setPendingDraft] = useState<EditorDraftSnapshot | null>(
    null
  );
  const startedTemplateIdRef = useRef<string | null>(null);
  const savedData =
    preparedData?.templateId === templateId ? preparedData.data : null;
  const beginEditing = useCallback(() => {
    setReadyTemplateId(templateId);
    // Refresh server session props (including the header) while retaining this draft.
    router.refresh();
  }, [router, templateId]);

  useEffect(() => {
    let isCurrent = true;

    if (!template) return;

    async function loadInitialData() {
      const draft = await loadEditorDraft(draftKey);
      // 초안이 있으면 사용자가 고를 때까지 기다린다.
      if (draft) {
        if (isCurrent) setPendingDraft(draft);
        return null;
      }
      return prepareTemplateEditorData(templateId);
    }

    void loadInitialData().then(
      data => {
        if (isCurrent && data) setPreparedData({ templateId, data });
      },
      () => {
        if (isCurrent)
          setTemplateLoadError({ templateId, attempt: loadAttempt });
      }
    );

    return () => {
      isCurrent = false;
    };
  }, [draftKey, loadAttempt, template, templateId]);

  const startFreshTemplate = useCallback(async () => {
    setPendingDraft(null);
    try {
      const data = await prepareTemplateEditorData(templateId);
      setPreparedData({ templateId, data });
    } catch {
      setTemplateLoadError({ templateId, attempt: loadAttempt });
    }
  }, [loadAttempt, templateId]);

  const handleResumeDraft = useCallback(() => {
    if (!pendingDraft) return;

    setPreparedData({
      templateId,
      data: toEditorDraftSavedData(pendingDraft),
    });
    setPendingDraft(null);
  }, [pendingDraft, templateId]);

  useEffect(() => {
    if (!template || !savedData || startedTemplateIdRef.current === templateId)
      return;
    startedTemplateIdRef.current = templateId;
    const authRun = auth.runAfterAuth(beginEditing);
    if (authRun) {
      void authRun.finally(() => setIsInitialAuthPending(false));
    }
  }, [auth, beginEditing, savedData, template, templateId]);

  if (!template)
    return (
      <div className="m-auto rounded-3xl bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">이 템플릿을 찾을 수 없어요.</h1>
        <Link href="/" className="mt-5 inline-block underline">
          홈에서 다른 디자인 고르기
        </Link>
      </div>
    );

  if (
    templateLoadError?.templateId === templateId &&
    templateLoadError.attempt === loadAttempt
  )
    return (
      <section className="m-auto rounded-3xl bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">템플릿을 불러오지 못했어요.</h1>
        <p className="mt-3 text-sm text-text-secondary">
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={() => setLoadAttempt(attempt => attempt + 1)}
          className="mt-6 rounded-full bg-bg-plain px-6 py-3 text-sm font-semibold text-white"
        >
          다시 불러오기
        </button>
      </section>
    );

  if (pendingDraft)
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#E7E9EB]">
        <EditorDraftRecoveryDialog
          draft={pendingDraft}
          draftKey={draftKey}
          isLoggedIn={auth.isLoggedIn}
          onResume={handleResumeDraft}
          onDraftChange={setPendingDraft}
          onStartFresh={() => void startFreshTemplate()}
          onDiscard={() => void startFreshTemplate()}
        />
      </div>
    );

  if (readyTemplateId === templateId && savedData)
    return (
      <FabricProvider initialData={savedData.mainPoster}>
        <div className="flex h-full w-full flex-col justify-center overflow-x-auto overflow-y-hidden bg-[#E7E9EB]">
          <MainContentsArea savedData={savedData} draftKey={draftKey} />
        </div>
      </FabricProvider>
    );

  const showTransitionLoader =
    !savedData || auth.isBusy || isInitialAuthPending;

  return (
    <>
      {showTransitionLoader ? (
        <ScreenTransitionLoader label="초대장을 준비하는 중" />
      ) : (
        <section
          className="m-auto flex w-full max-w-[880px] items-center gap-16 rounded-3xl bg-white px-14 py-12 shadow-edit"
          aria-label="선택한 템플릿으로 제작하기"
        >
          <div className="h-[433px] w-[200px] shrink-0 overflow-hidden rounded-lg shadow-lg">
            <InvitationTemplatePoster template={template} sizes="200px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-text-secondary">선택한 템플릿</p>
            <h1 className="mt-3 text-3xl font-semibold text-text-plain">
              {template.name}
            </h1>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              로그인하면 이 디자인으로 바로 시작해요.
              <br />
              사진과 문구를 바꾸면 같은 디자인으로 완성할 수 있어요.
            </p>
            <button
              type="button"
              disabled={auth.isBusy || auth.isLoginPending}
              onClick={() => auth.runAfterAuth(beginEditing)}
              className="mt-7 flex h-12 w-full max-w-[320px] items-center justify-center rounded-full bg-bg-plain px-6 font-semibold text-white hover:bg-[#202020] disabled:opacity-50"
            >
              로그인하고 시작하기
            </button>
            <Link
              href="/"
              className="mt-4 block text-xs text-text-secondary underline underline-offset-4"
            >
              다른 디자인 살펴보기
            </Link>
          </div>
        </section>
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
    </>
  );
}
