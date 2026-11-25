import { act, fireEvent, render, screen } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { setCoverCanvasPointerInside } from '@/shared/utils/coverCanvasPointer';

import UndoRedoButtons from './UndoRedoButtons';

const addBlock = (id: string) => {
  act(() => {
    useEditorStore.getState().addBlock('seminar', 'notice', id);
  });
};

const getUndoButton = () =>
  screen.getByRole('button', { name: '실행 취소' }) as HTMLButtonElement;
const getRedoButton = () =>
  screen.getByRole('button', { name: '다시 실행' }) as HTMLButtonElement;

describe('블록 실행 취소·다시 실행 버튼', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    setCoverCanvasPointerInside(false);
  });

  it('되돌릴 이력이 없으면 두 버튼이 모두 비활성화된다', () => {
    render(<UndoRedoButtons />);

    expect(getUndoButton()).toBeDisabled();
    expect(getRedoButton()).toBeDisabled();
  });

  it('블록을 추가하면 실행 취소 버튼이 활성화되고 단축키 안내를 단다', () => {
    render(<UndoRedoButtons />);

    addBlock('added');

    expect(getUndoButton()).toBeEnabled();
    expect(getUndoButton()).toHaveAttribute(
      'title',
      expect.stringContaining('Ctrl+Z')
    );
    expect(getRedoButton()).toHaveAttribute(
      'title',
      expect.stringContaining('Ctrl+Shift+Z')
    );
  });

  it('실행 취소 버튼을 누르면 블록이 사라지고 다시 실행 버튼이 켜진다', () => {
    render(<UndoRedoButtons />);
    addBlock('added');

    fireEvent.click(getUndoButton());

    expect(useEditorStore.getState().block).toEqual([]);
    expect(getUndoButton()).toBeDisabled();
    expect(getRedoButton()).toBeEnabled();
  });

  it('다시 실행 버튼을 누르면 되돌린 블록이 돌아온다', () => {
    render(<UndoRedoButtons />);
    addBlock('added');

    fireEvent.click(getUndoButton());
    fireEvent.click(getRedoButton());

    expect(useEditorStore.getState().block.map(block => block.id)).toEqual([
      'added',
    ]);
    expect(getRedoButton()).toBeDisabled();
  });

  it('Ctrl+Z 단축키로 실행 취소하고 ⌘+Shift+Z로 다시 실행한다', () => {
    render(<UndoRedoButtons />);
    addBlock('added');

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    expect(useEditorStore.getState().block).toEqual([]);

    fireEvent.keyDown(window, { key: 'z', metaKey: true, shiftKey: true });
    expect(useEditorStore.getState().block.map(block => block.id)).toEqual([
      'added',
    ]);
  });

  it('입력 요소 안에서는 단축키를 가로채지 않는다', () => {
    render(
      <>
        <UndoRedoButtons />
        <input aria-label="제목" />
      </>
    );
    addBlock('added');

    const input = screen.getByRole('textbox', { name: '제목' });
    fireEvent.keyDown(input, { key: 'z', ctrlKey: true });

    expect(useEditorStore.getState().block.map(block => block.id)).toEqual([
      'added',
    ]);
  });

  it('커버 포스터 캔버스 위에서는 캔버스 실행 취소를 가로채지 않는다', () => {
    render(<UndoRedoButtons />);
    addBlock('added');
    setCoverCanvasPointerInside(true);

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });

    expect(useEditorStore.getState().block.map(block => block.id)).toEqual([
      'added',
    ]);
  });

  it('실행 취소 결과를 화면 낭독기용 안내로 알린다', () => {
    render(<UndoRedoButtons />);
    addBlock('added');

    fireEvent.click(getUndoButton());

    expect(screen.getByText('실행 취소했습니다.')).toBeInTheDocument();
  });
});
