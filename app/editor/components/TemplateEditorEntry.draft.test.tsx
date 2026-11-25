import { act, fireEvent, render, screen } from '@testing-library/react';

import {
  clearEditorDraft,
  loadEditorDraft,
  saveEditorDraft,
} from '@/features/editor/draft/editorDraft';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { createDefaultShareUrlState } from '@/shared/utils/shareUrlDefaults';

import TemplateEditorEntry from './TemplateEditorEntry';

import type { SavedData } from '../[id]/types/savedata';
import type { ReactNode } from 'react';

import { loadOriginalPosterJson } from '@/shared/data/invitationTemplates/originalPosterLoader';

jest.mock('@/shared/assets/logo/invia-logo.svg', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/shared/data/invitationTemplates/originalPosterLoader', () => ({
  loadOriginalPosterJson: jest.fn(async () => ({
    version: '7.2.0',
    objects: [],
  })),
}));

const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockRouter = { replace: mockReplace, refresh: mockRefresh };
jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }));
jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({ success: jest.fn() }),
}));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  FabricProvider: ({
    children,
    initialData,
  }: {
    children: ReactNode;
    initialData: string;
  }) => (
    <div data-testid="poster" data-json={initialData}>
      {children}
    </div>
  ),
}));
jest.mock('./MainContentsArea', () => ({
  __esModule: true,
  default: ({ savedData }: { savedData: SavedData }) => (
    <div
      data-testid="editor"
      data-bulk={JSON.stringify(savedData.bulkData)}
    >
      제작 준비 완료
    </div>
  ),
}));
jest.mock('@/features/session/components/PrivacyNoticeModal', () => ({
  __esModule: true,
  default: ({
    open,
    onConfirm,
  }: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }) => (open ? <button onClick={onConfirm}>개인정보 안내 확인</button> : null),
}));
jest.mock('@/features/session/components/LoginModal', () => ({
  __esModule: true,
  default: ({
    open,
    onGoogleLogin,
  }: {
    open: boolean;
    onGoogleLogin: () => void;
    onClose: () => void;
  }) => (open ? <button onClick={onGoogleLogin}>Google로 계속하기</button> : null),
}));
jest.mock('@/features/session/components/DrivePermissionRequiredModal', () => ({
  __esModule: true,
  default: () => null,
}));

const TEMPLATE_ID = 'showcase-18';
const DRAFT_KEY = `template:${TEMPLATE_ID}`;
const DRAFT_BACKGROUND = '#abcdef';

async function saveTemplateDraft() {
  const { titleData, bodyData, scrollAnimation } =
    useEditorStore.getInitialState();
  await saveEditorDraft(DRAFT_KEY, {
    bulkData: {
      backgroundColor: DRAFT_BACKGROUND,
      titleData,
      bodyData,
      scrollAnimation,
      isZoom: false,
    },
    blocks: [],
    images: [],
    shareUrl: createDefaultShareUrlState(),
    bgm: {
      selectedBgmId: null,
      isLoop: false,
      volume: 0.2,
      userBgmTitle: null,
      userBgmDuration: null,
      userBgmFileId: null,
    },
    audioFile: null,
    mainPoster: { version: '7.1.0', objects: [] },
  });
}

function completeOAuth() {
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        data: { type: 'GOOGLE_OAUTH_SUCCESS' },
      })
    );
  });
}

describe('템플릿 주소에 남아 있던 초안', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isLoggedIn: true }),
    });
    jest.spyOn(window, 'open').mockReturnValue({
      close: jest.fn(),
      focus: jest.fn(),
      closed: false,
    } as unknown as Window);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await clearEditorDraft(DRAFT_KEY);
  });

  it('로그인 화면보다 먼저 이어서 쓸지 묻는다', async () => {
    await saveTemplateDraft();

    render(
      <TemplateEditorEntry
        templateId={TEMPLATE_ID}
        initialIsLoggedIn={false}
      />
    );

    expect(
      await screen.findByRole('dialog', { name: '작성 중이던 초대장이 있어요' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '로그인하고 시작하기' })
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
  });

  it('이어서 작성을 고르면 초안 내용으로 편집을 시작한다', async () => {
    await saveTemplateDraft();

    render(
      <TemplateEditorEntry
        templateId={TEMPLATE_ID}
        initialIsLoggedIn={false}
      />
    );

    fireEvent.click(
      await screen.findByRole('button', { name: '이어서 작성하기' })
    );
    fireEvent.click(
      await screen.findByRole('button', { name: '개인정보 안내 확인' })
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Google로 계속하기' })
    );
    completeOAuth();

    const editor = await screen.findByTestId('editor');
    const bulk = JSON.parse(editor.getAttribute('data-bulk')!);
    expect(bulk.backgroundColor).toBe(DRAFT_BACKGROUND);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('새로 시작하기를 고르면 초안을 지우지 않고 템플릿 기본값으로 연다', async () => {
    await saveTemplateDraft();

    render(
      <TemplateEditorEntry
        templateId={TEMPLATE_ID}
        initialIsLoggedIn={false}
      />
    );

    fireEvent.click(
      await screen.findByRole('button', { name: '새로 시작하기' })
    );

    expect(
      await screen.findByRole('button', { name: '개인정보 안내 확인' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await loadEditorDraft(DRAFT_KEY)).not.toBeNull();
    expect(loadOriginalPosterJson).toHaveBeenCalled();
  });
});
