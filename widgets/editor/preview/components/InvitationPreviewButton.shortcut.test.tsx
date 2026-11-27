import { act, fireEvent, render, screen } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import InvitationPreviewButton from './InvitationPreviewButton';

const mockExport = jest.fn(() => ({
  dataUrl: 'data:image/webp;base64,current-poster',
}));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricViewContext: () => ({ canvas: {} }),
  useFabricActionsContext: () => ({ exportCanvasPreview: mockExport }),
}));
jest.mock('@/components/organisms/bgm/context/EditorBgmPlayerContext', () => ({
  useEditorBgmPlayer: () => ({ isPlaying: false, togglePlay: jest.fn() }),
}));

const pressPreviewShortcut = () => {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
};

describe('미리보기 단축키 (Ctrl+Enter)', () => {
  beforeEach(() => {
    mockExport.mockClear();
    useEditorStore.getState().reset();
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    useEditorStore.getState().reset();
    document.body.style.overflow = '';
    jest.useRealTimers();
  });

  it('버튼이 단축키를 스크린리더와 마우스 사용자에게 알린다', () => {
    render(<InvitationPreviewButton />);

    const button = screen.getByRole('button', { name: '미리보기' });
    expect(button).toHaveAttribute(
      'aria-keyshortcuts',
      'Control+Enter Meta+Enter'
    );
    expect(button).toHaveAttribute('title', '미리보기 (Ctrl+Enter)');
  });

  it('Ctrl+Enter를 누르면 미리보기 버튼을 누른 것과 같게 열린다', () => {
    render(<InvitationPreviewButton />);

    const event = pressPreviewShortcut();
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      '초대장을 준비하고 있어요.'
    );

    act(() => jest.advanceTimersToNextFrame());
    act(() => jest.advanceTimersToNextFrame());

    expect(mockExport).toHaveBeenCalledTimes(1);
    expect(screen.getByTitle('초대장 미리보기')).toBeInTheDocument();
  });

  it('미리보기가 열려 있는 동안 다시 눌러도 새로 열지 않는다', () => {
    render(<InvitationPreviewButton />);

    pressPreviewShortcut();
    act(() => jest.advanceTimersToNextFrame());
    act(() => jest.advanceTimersToNextFrame());
    expect(mockExport).toHaveBeenCalledTimes(1);

    pressPreviewShortcut();
    act(() => jest.advanceTimersToNextFrame());
    act(() => jest.advanceTimersToNextFrame());

    expect(mockExport).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('블록 추가 팝업처럼 다른 모달이 열려 있으면 미리보기를 겹쳐 열지 않는다', () => {
    const otherDialog = document.createElement('div');
    otherDialog.setAttribute('role', 'dialog');
    otherDialog.setAttribute('aria-modal', 'true');
    document.body.append(otherDialog);

    try {
      render(<InvitationPreviewButton />);
      pressPreviewShortcut();

      expect(screen.queryByTitle('초대장 미리보기')).not.toBeInTheDocument();
      expect(mockExport).not.toHaveBeenCalled();
    } finally {
      otherDialog.remove();
    }
  });

  it('입력 중(한글 조합)에는 미리보기를 열지 않는다', () => {
    render(<InvitationPreviewButton />);

    const composing = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(composing, 'isComposing', { value: true });
    act(() => {
      window.dispatchEvent(composing);
    });

    expect(screen.queryByTitle('초대장 미리보기')).not.toBeInTheDocument();
  });

  it('단축키 없이 버튼을 눌러도 그대로 열린다', () => {
    render(<InvitationPreviewButton />);

    fireEvent.click(screen.getByRole('button', { name: '미리보기' }));

    expect(screen.getByRole('dialog')).toBeVisible();
  });
});
