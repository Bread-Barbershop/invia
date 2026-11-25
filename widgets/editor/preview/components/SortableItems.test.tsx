import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import SortableItems from './SortableItems';

import type { EditorBlock } from '@/shared/types/block';

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    setNodeRef: jest.fn(),
    attributes: {},
    listeners: {
      onPointerDown: jest.fn(),
    },
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

jest.mock('@/shared/data/componentsInfo/componentInfo', () => ({
  componentCls: [
    {
      english: 'greeting',
      list: [
        {
          component: 'Greeting1',
          contents: '인사말 1',
        },
      ],
    },
  ],
}));

describe('SortableItems 컴포넌트', () => {
  const blockInfo = {
    id: 'block-1',
    type: 'greeting',
    component: 'Greeting1',
    props: {},
  } as unknown as EditorBlock;

  const defaultProps = {
    id: 'block-1',
    blockInfo,
    isSelected: false,
    onSelect: jest.fn(),
    onContextMenu: jest.fn(),
    onDeleteRequest: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('아이템 내용이 정상적으로 렌더링된다', () => {
    render(<SortableItems {...defaultProps} />);

    expect(screen.getByText('인사말 1')).toBeInTheDocument();
  });

  it('다른 카테고리의 공용 블록도 순서 목록에서 이름을 표시한다', () => {
    render(
      <SortableItems
        {...defaultProps}
        blockInfo={{ ...blockInfo, type: 'birthday' } as unknown as EditorBlock}
      />
    );
    expect(screen.getByText('인사말 1')).toBeInTheDocument();
  });

  it('호버 시 노출되는 삭제(X) 버튼이 블록 이름과 함께 렌더링된다', () => {
    render(<SortableItems {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: '인사말 1 블록 삭제하기' })
    ).toBeInTheDocument();
  });

  it('삭제(X) 버튼 클릭 시 onDeleteRequest가 호출되고 onSelect는 호출되지 않는다', () => {
    render(<SortableItems {...defaultProps} />);

    const deleteBtn = screen.getByRole('button', { name: /삭제하기/ });

    fireEvent.pointerDown(deleteBtn);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();

    fireEvent.click(deleteBtn);
    expect(defaultProps.onDeleteRequest).toHaveBeenCalledWith('block-1');
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('삭제 핸들러가 없으면 X 버튼을 노출하지 않는다', () => {
    render(<SortableItems {...defaultProps} onDeleteRequest={undefined} />);

    expect(
      screen.queryByRole('button', { name: /삭제하기/ })
    ).not.toBeInTheDocument();
  });

  it('순서 항목에 블록 id를 담아 키보드 포커스로 되돌아올 수 있게 한다', () => {
    render(<SortableItems {...defaultProps} />);

    expect(
      document.querySelector('[data-order-block-id="block-1"]')
    ).toBeInTheDocument();
  });

  it('우클릭 시 onContextMenu가 호출된다', () => {
    render(<SortableItems {...defaultProps} />);

    const item = screen.getByText('인사말 1').closest('[role="button"]')!;
    fireEvent.contextMenu(item);

    expect(defaultProps.onContextMenu).toHaveBeenCalledWith(
      expect.anything(),
      'block-1'
    );
  });
});
