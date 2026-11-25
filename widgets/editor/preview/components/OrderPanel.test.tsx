import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useEditorCalloutStore } from '@/shared/store/useEditorCalloutStore';

import OrderPanel from './OrderPanel';

jest.mock('@/components/molecules/editor-callout', () => ({
  EditorCallout: ({ open, text }: { open: boolean; text: string }) =>
    open ? <div data-testid="order-callout">{text}</div> : null,
}));

jest.mock('@/widgets/editor/preview/components/ChipCarousel', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('./SortableItems', () => ({
  __esModule: true,
  default: ({ id }: { id: string }) => <div>{id}</div>,
}));

describe('블록 Delete 단축키', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    window.innerWidth = 1440;
    act(() => useEditorStore.getState().reset());
    act(() => {
      const state = useEditorStore.getState();
      state.addBlock('wedding', 'greeting', 'test-greeting');
      state.selectedBlock('test-greeting');
      state.setIsEdit(true);
    });
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    act(() => useEditorStore.getState().reset());
    document
      .querySelectorAll('[role="dialog"], [data-shortcut-guard-test]')
      .forEach(dialog => dialog.remove());
  });

  it('선택한 항목을 삭제하고 포스터를 선택한다', () => {
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'Delete' });

    const state = useEditorStore.getState();
    expect(state.block).toHaveLength(0);
    expect(state.selectedId).toBe('mainPoster');
    expect(state.isEdit).toBe(false);
  });

  it('저장된 방명록은 순서에서 숨기고 Delete 키로 삭제하지 않는다', () => {
    act(() => {
      const state = useEditorStore.getState();
      state.addBlock('wedding', 'guestbook', 'saved-guestbook');
      state.selectedBlock('saved-guestbook');
    });
    render(<OrderPanel />);
    expect(screen.queryByText('saved-guestbook')).not.toBeInTheDocument();
    expect(screen.getByText('test-greeting')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Delete' });
    expect(useEditorStore.getState().block).toHaveLength(2);
    expect(
      useEditorStore
        .getState()
        .block.some(block => block.id === 'saved-guestbook')
    ).toBe(true);
  });

  it('포스터를 선택했을 때 Delete 키로 항목을 삭제하지 않는다', () => {
    act(() => useEditorStore.getState().selectedBlock('mainPoster'));
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'Delete' });

    const state = useEditorStore.getState();
    expect(state.block).toHaveLength(1);
    expect(state.selectedId).toBe('mainPoster');
  });

  it('Backspace 또는 대화상자가 열린 상태에서는 항목을 삭제하지 않는다', () => {
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(useEditorStore.getState().block).toHaveLength(1);

    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    document.body.append(dialog);
    fireEvent.keyDown(window, { key: 'Delete' });

    expect(useEditorStore.getState().block).toHaveLength(1);
  });

  it('열린 네이티브 대화상자 안에서 Delete를 눌러도 배경 블록을 지우지 않는다', () => {
    render(<OrderPanel />);

    const dialog = document.createElement('dialog');
    dialog.open = true;
    dialog.dataset.shortcutGuardTest = 'true';
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '취소';
    dialog.append(cancelButton);
    document.body.append(dialog);
    cancelButton.focus();

    fireEvent.keyDown(cancelButton, { key: 'Delete' });

    expect(useEditorStore.getState().block).toHaveLength(1);
  });

  it('네이티브 대화상자를 닫으면 Delete 단축키가 다시 동작한다', () => {
    render(<OrderPanel />);

    const dialog = document.createElement('dialog');
    dialog.open = true;
    dialog.dataset.shortcutGuardTest = 'true';
    document.body.append(dialog);
    dialog.open = false;

    fireEvent.keyDown(window, { key: 'Delete' });

    expect(useEditorStore.getState().block).toHaveLength(0);
  });
});

describe('순서 도움말', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    window.innerWidth = 1440;
    jest.useFakeTimers();
    useEditorStore.getState().reset();
    useEditorCalloutStore.getState().resetCallouts();
  });

  afterEach(() => {
    cleanup();
    useEditorCalloutStore.getState().resetCallouts();
    useEditorStore.getState().reset();
    jest.useRealTimers();
    window.innerWidth = originalInnerWidth;
  });

  it('포스터와 숨긴 방명록을 제외하고 보이는 블록이 하나면 삭제 도움말만 표시한다', () => {
    const { addBlock } = useEditorStore.getState();
    useEditorCalloutStore.getState().showAllCalloutsFor();
    render(<OrderPanel />);

    expect(screen.getByRole('button', { name: '포스터' })).toBeVisible();
    expect(screen.queryByTestId('order-callout')).not.toBeInTheDocument();

    act(() => {
      addBlock('wedding', 'greeting', 'greeting');
      addBlock('wedding', 'guestbook', 'saved-guestbook');
    });

    expect(screen.getByTestId('order-callout')).toHaveTextContent(
      '선택한 블록은 Delete 키로 삭제, Ctrl+D(⌘+D)로 복제할 수 있어요.'
    );
    expect(screen.getByTestId('order-callout')).not.toHaveTextContent('꾹 누른');
  });

  it('초기 도움말이 끝난 뒤 두 번째 블록을 추가하면 순서 도움말만 6초 동안 표시한다', () => {
    const { addBlock, moveBlock } = useEditorStore.getState();
    useEditorCalloutStore.getState().showAllCalloutsFor();
    render(<OrderPanel />);
    act(() => jest.advanceTimersByTime(6000));

    act(() => addBlock('wedding', 'greeting', 'greeting'));
    expect(screen.queryByTestId('order-callout')).not.toBeInTheDocument();

    act(() => addBlock('etc', 'divider', 'divider'));

    expect(screen.getByTestId('order-callout')).toHaveTextContent(
      '블록을 꾹 누른 채로 끌거나 Alt+↑/↓ 로 순서를 바꿀 수 있어요.'
    );
    expect(useEditorCalloutStore.getState().callouts).toMatchObject({
      'add-page-button': false,
      'preview-panel': false,
    });

    act(() => jest.advanceTimersByTime(5000));
    act(() => {
      addBlock('etc', 'spacer', 'spacer');
      moveBlock(1, 0);
    });
    act(() => jest.advanceTimersByTime(999));
    expect(screen.getByTestId('order-callout')).toBeVisible();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.queryByTestId('order-callout')).not.toBeInTheDocument();
  });

  it('복원한 블록 두 개에 도움말을 표시하고 하나를 삭제하면 바로 숨긴다', () => {
    const { addBlock, deleteBlock } = useEditorStore.getState();
    addBlock('wedding', 'greeting', 'greeting');
    addBlock('etc', 'divider', 'divider');
    const { unmount } = render(<OrderPanel />);

    expect(screen.getByTestId('order-callout')).toHaveTextContent('꾹 누른');

    act(() => deleteBlock('divider'));
    expect(screen.queryByTestId('order-callout')).not.toBeInTheDocument();

    act(() => addBlock('etc', 'spacer', 'spacer'));
    expect(screen.getByTestId('order-callout')).toHaveTextContent('꾹 누른');

    unmount();
    expect(useEditorCalloutStore.getState().callouts['order-panel']).toBe(false);
  });

  it('초기 도움말이 표시 중일 때 두 번째 블록을 추가해도 순서 도움말은 전체 시간을 유지한다', () => {
    const { addBlock } = useEditorStore.getState();
    useEditorCalloutStore.getState().showAllCalloutsFor();
    addBlock('wedding', 'greeting', 'greeting');
    render(<OrderPanel />);
    act(() => jest.advanceTimersByTime(4000));

    act(() => addBlock('etc', 'divider', 'divider'));
    act(() => jest.advanceTimersByTime(2000));

    expect(screen.getByTestId('order-callout')).toHaveTextContent('꾹 누른');
    expect(useEditorCalloutStore.getState().callouts).toMatchObject({
      'add-page-button': false,
      'preview-panel': false,
    });

    act(() => jest.advanceTimersByTime(4000));
    expect(screen.queryByTestId('order-callout')).not.toBeInTheDocument();
  });
});
