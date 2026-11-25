import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useEditorCalloutStore } from '@/shared/store/useEditorCalloutStore';
import { useToastStore } from '@/shared/store/useToastStore';

import OrderPanel from './OrderPanel';

import type { EditorBlock } from '@/shared/types/block';

jest.mock('@/components/molecules/editor-callout', () => ({
  EditorCallout: () => null,
}));

jest.mock('@/widgets/editor/preview/components/ChipCarousel', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('./DeleteModal', () => ({
  __esModule: true,
  default: ({ onDelete }: { onDelete: () => void }) => (
    <button type="button" onClick={onDelete}>
      삭제 확인 모달
    </button>
  ),
}));

jest.mock('./SortableItems', () => ({
  __esModule: true,
  default: ({
    id,
    onContextMenu,
    onDuplicateRequest,
  }: any) => (
    <div>
      <button type="button" data-order-block-id={id} data-testid={`item-${id}`}>
        {id}
      </button>
      <button
        type="button"
        aria-label={`${id} 우클릭`}
        onClick={event => onContextMenu(event, id)}
      />
      <button
        type="button"
        aria-label={`${id} 복제`}
        onClick={() => onDuplicateRequest?.(id)}
      />
    </div>
  ),
}));

const addBlocks = (...blocks: [string, string][]) => {
  act(() => {
    const state = useEditorStore.getState();
    blocks.forEach(([component, id]) =>
      state.addBlock('wedding', component as EditorBlock['component'], id)
    );
  });
};

const getBlockIds = () =>
  useEditorStore.getState().block.map(block => block.id);

describe('순서 패널 블록 관리', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    window.innerWidth = 1440;
    act(() => useEditorStore.getState().reset());
    useEditorCalloutStore.getState().resetCallouts();
    useToastStore.setState({ message: null, isVisible: false });
    addBlocks(['greeting', 'greeting-1'], ['transportation', 'transportation-1']);
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    act(() => useEditorStore.getState().reset());
  });

  it('블록을 우클릭하면 블록 관리 메뉴가 열린다', () => {
    render(<OrderPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'greeting-1 우클릭' }));

    expect(
      screen.getByRole('menu', { name: '인사말 블록 관리' })
    ).toBeInTheDocument();
  });

  it('메뉴에서 복제하면 같은 자리 뒤에 복제본이 생기고 복제본이 선택된다', () => {
    render(<OrderPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'greeting-1 우클릭' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '복제하기' }));

    const ids = getBlockIds();
    expect(ids).toHaveLength(3);
    expect(ids[0]).toBe('greeting-1');
    expect(ids[2]).toBe('transportation-1');
    expect(useEditorStore.getState().selectedId).toBe(ids[1]);
    expect(useToastStore.getState().message).toBe('블록을 복제했어요');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('메뉴의 위로/아래로 이동으로 순서를 바꾼다', () => {
    render(<OrderPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'transportation-1 우클릭' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '위로 이동' }));

    expect(getBlockIds()).toEqual(['transportation-1', 'greeting-1']);
    expect(useEditorStore.getState().selectedId).toBe('transportation-1');

    fireEvent.click(screen.getByRole('button', { name: 'transportation-1 우클릭' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '아래로 이동' }));

    expect(getBlockIds()).toEqual(['greeting-1', 'transportation-1']);
  });

  it('첫 블록은 위로, 마지막 블록은 아래로 이동할 수 없다', () => {
    render(<OrderPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'greeting-1 우클릭' }));
    expect(screen.getByRole('menuitem', { name: '위로 이동' })).toBeDisabled();

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    fireEvent.click(
      screen.getByRole('button', { name: 'transportation-1 우클릭' })
    );
    expect(
      screen.getByRole('menuitem', { name: '아래로 이동' })
    ).toBeDisabled();
  });

  it('메뉴에서 삭제를 고르면 확인 모달을 연다', () => {
    render(<OrderPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'greeting-1 우클릭' }));
    fireEvent.click(screen.getByRole('menuitem', { name: '삭제하기' }));

    expect(screen.getByRole('button', { name: '삭제 확인 모달' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: '삭제 확인 모달' }));
    expect(getBlockIds()).toEqual(['transportation-1']);
  });

  it('Esc로 메뉴를 닫으면 원래 항목으로 포커스가 돌아온다', () => {
    render(<OrderPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'greeting-1 우클릭' }));
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByTestId('item-greeting-1')).toHaveFocus();
  });

  it('복제 버튼을 누르면 복제본이 생긴다', () => {
    render(<OrderPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'greeting-1 복제' }));

    expect(getBlockIds()).toHaveLength(3);
    expect(useEditorStore.getState().block[1].component).toBe('greeting');
  });

  it('Ctrl+D 로 선택한 블록을 복제한다', () => {
    act(() => useEditorStore.getState().selectedBlock('greeting-1'));
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'd', ctrlKey: true });

    expect(getBlockIds()).toHaveLength(3);
    expect(useEditorStore.getState().block[1].component).toBe('greeting');
  });

  it('macOS의 ⌘+D 로도 복제한다', () => {
    act(() => useEditorStore.getState().selectedBlock('greeting-1'));
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'D', metaKey: true });

    expect(getBlockIds()).toHaveLength(3);
  });

  it('Alt+↑/↓ 로 선택한 블록의 순서를 바꾼다', () => {
    act(() => useEditorStore.getState().selectedBlock('transportation-1'));
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'ArrowUp', altKey: true });
    expect(getBlockIds()).toEqual(['transportation-1', 'greeting-1']);

    fireEvent.keyDown(window, { key: 'ArrowDown', altKey: true });
    expect(getBlockIds()).toEqual(['greeting-1', 'transportation-1']);
  });

  it('포스터를 선택했을 때는 단축키로 복제하지 않는다', () => {
    act(() => useEditorStore.getState().selectedBlock('mainPoster'));
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'd', ctrlKey: true });

    expect(getBlockIds()).toHaveLength(2);
  });

  it('글을 입력하는 중에는 복제 단축키를 쓰지 않는다', () => {
    act(() => useEditorStore.getState().selectedBlock('greeting-1'));
    render(<OrderPanel />);

    const editor = document.createElement('div');
    editor.setAttribute('contenteditable', 'true');
    document.body.append(editor);

    fireEvent.keyDown(editor, { key: 'd', ctrlKey: true });

    expect(getBlockIds()).toHaveLength(2);
    editor.remove();
  });

  it('블록을 복제하면 스크린리더용 안내를 남긴다', () => {
    render(<OrderPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'greeting-1 복제' }));

    expect(screen.getByTestId('order-announcement')).toHaveTextContent(
      '인사말 블록을 복제했어요.'
    );
  });

  it('순서를 옮기면 스크린리더용 안내를 남긴다', () => {
    render(<OrderPanel />);

    fireEvent.click(
      screen.getByRole('button', { name: 'transportation-1 복제' })
    );
    expect(screen.getByTestId('order-announcement')).toHaveTextContent(
      '교통 / 주차 블록을 복제했어요.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'greeting-1 복제' }));
    act(() => useEditorStore.getState().selectedBlock('transportation-1'));
    fireEvent.keyDown(window, { key: 'ArrowUp', altKey: true });

    expect(screen.getByTestId('order-announcement')).toHaveTextContent(
      '교통 / 주차 위로 옮겼어요.'
    );
  });
});
