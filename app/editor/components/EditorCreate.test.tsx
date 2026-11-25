import { render, screen } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';

import {
  clearEditorDraft,
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

describe('EditorCreate 초안 복원', () => {
  const sampleKey = 'sample:wedding_14';
  const mockSearchParams = jest.mocked(useSearchParams);

  afterEach(async () => {
    await clearEditorDraft(sampleKey);
    mockSearchParams.mockReset();
  });

  it('샘플 주소에서 작업 색상을 복원하고 기본 에디터에는 가져오지 않는다', async () => {
    const backgroundColor = '#f8dde3';
    const { titleData, bodyData, scrollAnimation } =
      useEditorStore.getInitialState();
    await saveEditorDraft(sampleKey, {
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
    const searchParams = new URLSearchParams('sample=wedding_14');
    mockSearchParams.mockReturnValue(
      searchParams as ReturnType<typeof useSearchParams>
    );

    const { rerender } = render(<EditorCreate />);
    expect(await screen.findByText(backgroundColor)).toBeInTheDocument();

    mockSearchParams.mockReturnValue(
      new URLSearchParams() as ReturnType<typeof useSearchParams>
    );
    rerender(<EditorCreate />);
    expect(await screen.findByText('빈 초대장')).toBeInTheDocument();
  });
});
