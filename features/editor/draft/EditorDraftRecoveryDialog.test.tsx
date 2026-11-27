import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import EditorDraftRecoveryDialog from './EditorDraftRecoveryDialog';
import { BLANK_EDITOR_DRAFT_KEY, discardEditorDraft } from './editorDraft';

import type { EditorDraftSnapshot } from './editorDraft';

const NOW = new Date(2026, 10, 26, 20, 0).getTime();

jest.mock('./editorDraft', () => ({
  ...jest.requireActual('./editorDraft'),
  discardEditorDraft: jest.fn(),
}));

function createDraft(
  overrides: Partial<EditorDraftSnapshot> = {}
): EditorDraftSnapshot {
  return {
    version: 1,
    savedAt: NOW - 12 * 60 * 1000,
    bulkData: {
      backgroundColor: '#ffffff',
      titleData: {
        font: 'font-lineseed',
        fontSize: '20px',
        fontWeight: '700',
        color: '#111111',
        isDefault: false,
      },
      bodyData: {
        font: 'font-lineseed',
        fontSize: '16px',
        fontWeight: '500',
        color: '#222222',
        isDefault: false,
      },
      isZoom: false,
      scrollAnimation: {
        animationType: 'fade-up',
        triggerMode: 'down-only',
        animationDurationMs: 700,
        animationEasing: 'natural',
      },
    },
    blocks: [],
    images: [],
    shareUrl: {
      title: '초대장',
      description: '초대합니다',
      images: [],
      urlTitle: '초대장',
      urlDescription: '초대합니다',
      urlImage: [],
      showLocationButton: false,
    },
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
    ...overrides,
  };
}

function renderDialog(
  overrides: {
    draft?: EditorDraftSnapshot;
    onResume?: jest.Mock;
    onDiscard?: jest.Mock;
  } = {}
) {
  const onResume = overrides.onResume ?? jest.fn();
  const onDiscard = overrides.onDiscard ?? jest.fn();

  render(
    <EditorDraftRecoveryDialog
      draft={overrides.draft ?? createDraft()}
      draftKey={BLANK_EDITOR_DRAFT_KEY}
      now={NOW}
      onResume={onResume}
      onDraftChange={jest.fn()}
      onDiscard={onDiscard}
    />
  );

  return { onResume, onDiscard };
}

describe('EditorDraftRecoveryDialog', () => {
  beforeEach(() => {
    jest.mocked(discardEditorDraft).mockReset().mockResolvedValue({ status: 'discarded' });
  });

  it('초안 저장 시각과 내용을 알려 주는 대화상자로 열린다', () => {
    renderDialog();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('작성 중이던 초대장이 있어요');
    expect(screen.getByTestId('editor-draft-recovery-summary')).toHaveTextContent(
      '12분 전 저장'
    );
  });

  it('되돌릴 수 없는 선택이 아니라 이어서 쓰는 쪽에 먼저 포커스를 둔다', async () => {
    renderDialog();

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '이어서 작성' })
      ).toHaveFocus()
    );
  });

  it('이어서 작성을 고르면 초안을 그대로 연다', () => {
    const { onResume, onDiscard } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: '이어서 작성' }));

    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onDiscard).not.toHaveBeenCalled();
  });

  it('초안을 이어서 작성하거나 삭제 후 새로 시작할 수 있다', () => {
    renderDialog();

    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '이어서 작성' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '초안 삭제 후 새로 시작' })).toBeInTheDocument();
  });

  it('초안 삭제는 한 번 더 묻고, 취소하면 아무것도 지우지 않는다', async () => {
    const { onDiscard } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: '초안 삭제 후 새로 시작' }));

    const confirmGroup = screen.getByRole('group', { name: '초안 삭제 확인' });
    expect(confirmGroup).toHaveTextContent('되돌릴 수 없어요');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '취소' })).toHaveFocus()
    );

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(discardEditorDraft).not.toHaveBeenCalled();
    expect(onDiscard).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('group', { name: '초안 삭제 확인' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '이어서 작성' })
    ).toBeInTheDocument();
  });

  it('삭제를 확인하면 화면에 표시한 초안을 지우고 새로 시작한다', async () => {
    const draft = createDraft();
    const { onDiscard } = renderDialog({ draft });

    fireEvent.click(screen.getByRole('button', { name: '초안 삭제 후 새로 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '삭제하고 시작' }));

    expect(discardEditorDraft).toHaveBeenCalledWith(BLANK_EDITOR_DRAFT_KEY, draft);
    await waitFor(() => expect(onDiscard).toHaveBeenCalledTimes(1));
  });

  it('저장소에서 삭제에 실패하면 확인 화면에서 다시 시도할 수 있다', async () => {
    jest.mocked(discardEditorDraft).mockResolvedValueOnce({ status: 'failed' });
    const { onDiscard } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: '초안 삭제 후 새로 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '삭제하고 시작' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('초안을 삭제하지 못했어요');
    expect(screen.getByRole('button', { name: '삭제하고 시작' })).toBeEnabled();
    expect(onDiscard).not.toHaveBeenCalled();
  });

  it('Escape는 지우는 쪽이 아니라 남기는 쪽으로 닫는다', () => {
    const { onResume, onDiscard } = renderDialog();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onDiscard).not.toHaveBeenCalled();
  });

  it('삭제 확인 중의 Escape는 확인만 닫고 초안은 그대로 둔다', () => {
    const { onResume, onDiscard } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: '초안 삭제 후 새로 시작' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onDiscard).not.toHaveBeenCalled();
    expect(onResume).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('group', { name: '초안 삭제 확인' })
    ).not.toBeInTheDocument();
  });
});
