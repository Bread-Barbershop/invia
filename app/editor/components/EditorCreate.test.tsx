import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';

import {
  BLANK_EDITOR_DRAFT_KEY,
  clearEditorDraft,
  loadEditorDraft,
  saveEditorDraft,
} from '@/features/editor/draft/editorDraft';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { createDefaultShareUrlState } from '@/shared/utils/shareUrlDefaults';

import EditorCreate from './EditorCreate';

import type { SavedData } from '../[id]/types/savedata';
import type { ReactNode } from 'react';

jest.mock('next/navigation', () => ({ useSearchParams: jest.fn() }));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  FabricProvider: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('./MainContentsArea', () => ({
  __esModule: true,
  default: ({ savedData }: { savedData: SavedData | null }) => (
    <p>{savedData?.bulkData.backgroundColor ?? '빈 초대장'}</p>
  ),
}));
jest.mock('./TemplateEditorEntry', () => ({
  __esModule: true,
  default: () => null,
}));

async function saveDraftFor(key: string, backgroundColor: string) {
  const { titleData, bodyData, scrollAnimation } =
    useEditorStore.getInitialState();
  await saveEditorDraft(key as Parameters<typeof saveEditorDraft>[0], {
    bulkData: {
      backgroundColor,
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

describe('EditorCreate 초안 복원', () => {
  const sampleKey = 'sample:wedding_14';
  const mockSearchParams = jest.mocked(useSearchParams);

  afterEach(async () => {
    await clearEditorDraft(sampleKey);
    await clearEditorDraft(BLANK_EDITOR_DRAFT_KEY);
    mockSearchParams.mockReset();
  });

  it('샘플 주소에서 작업 색상을 복원하고 기본 에디터에는 가져오지 않는다', async () => {
    const backgroundColor = '#f8dde3';
    await saveDraftFor(sampleKey, backgroundColor);
    const searchParams = new URLSearchParams('sample=wedding_14');
    mockSearchParams.mockReturnValue(
      searchParams as ReturnType<typeof useSearchParams>
    );

    const { rerender } = render(<EditorCreate />);
    fireEvent.click(
      await screen.findByRole('button', { name: '이어서 작성하기' })
    );
    expect(await screen.findByText(backgroundColor)).toBeInTheDocument();

    mockSearchParams.mockReturnValue(
      new URLSearchParams() as ReturnType<typeof useSearchParams>
    );
    rerender(<EditorCreate />);
    expect(await screen.findByText('빈 초대장')).toBeInTheDocument();
  });

  it('초안이 있으면 덮어쓰지 않고 먼저 이어서 쓸지 묻는다', async () => {
    await saveDraftFor(BLANK_EDITOR_DRAFT_KEY, '#123456');
    mockSearchParams.mockReturnValue(
      new URLSearchParams() as ReturnType<typeof useSearchParams>
    );

    render(<EditorCreate />);

    const dialog = await screen.findByRole('dialog', {
      name: '작성 중이던 초대장이 있어요',
    });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.queryByText('#123456')).not.toBeInTheDocument();
  });

  it('새로 시작하기를 고르면 초안을 남긴 채 빈 초대장으로 연다', async () => {
    await saveDraftFor(BLANK_EDITOR_DRAFT_KEY, '#123456');
    mockSearchParams.mockReturnValue(
      new URLSearchParams() as ReturnType<typeof useSearchParams>
    );

    render(<EditorCreate />);
    fireEvent.click(
      await screen.findByRole('button', { name: '새로 시작하기' })
    );

    expect(await screen.findByText('빈 초대장')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await loadEditorDraft(BLANK_EDITOR_DRAFT_KEY)).not.toBeNull();
  });

  it('초안 삭제를 확인하면 기기에 남은 초안까지 지운다', async () => {
    await saveDraftFor(BLANK_EDITOR_DRAFT_KEY, '#123456');
    mockSearchParams.mockReturnValue(
      new URLSearchParams() as ReturnType<typeof useSearchParams>
    );

    render(<EditorCreate />);
    fireEvent.click(await screen.findByRole('button', { name: '초안 삭제' }));
    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));

    expect(await screen.findByText('빈 초대장')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
    expect(await loadEditorDraft(BLANK_EDITOR_DRAFT_KEY)).toBeNull();
  });
});
