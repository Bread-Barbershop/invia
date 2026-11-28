import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { BlockContextMenu } from './BlockContextMenu';

const renderMenu = (
  props: Partial<React.ComponentProps<typeof BlockContextMenu>> = {}
) => {
  const onAction = jest.fn();
  const onClose = jest.fn();

  render(
    <BlockContextMenu
      label="인사말"
      x={12}
      y={24}
      canMoveUp
      canMoveDown
      onAction={onAction}
      onClose={onClose}
      {...props}
    />
  );

  return { onAction, onClose };
};

describe('BlockContextMenu', () => {
  it('블록 이름이 담긴 메뉴로 열린다', () => {
    renderMenu();

    expect(
      screen.getByRole('menu', { name: '인사말 블록 관리' })
    ).toBeInTheDocument();
  });

  it('복제·위로 이동·아래로 이동·삭제 항목을 제공한다', () => {
    renderMenu();

    expect(
      screen.getByRole('menuitem', { name: '복제하기' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: '위로 이동' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: '아래로 이동' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: '삭제하기' })
    ).toBeInTheDocument();
  });

  it('열리면 첫 항목에 포커스가 간다', () => {
    renderMenu();

    expect(screen.getByRole('menuitem', { name: '복제하기' })).toHaveFocus();
  });

  it('항목을 누르면 해당 동작을 알린다', () => {
    const { onAction } = renderMenu();

    fireEvent.click(screen.getByRole('menuitem', { name: '삭제하기' }));

    expect(onAction).toHaveBeenCalledWith('delete');
  });

  it('위로/아래로 이동이 불가능하면 항목을 비활성화한다', () => {
    renderMenu({ canMoveUp: false, canMoveDown: false });

    expect(screen.getByRole('menuitem', { name: '위로 이동' })).toBeDisabled();
    expect(
      screen.getByRole('menuitem', { name: '아래로 이동' })
    ).toBeDisabled();
  });

  it('Esc를 누르면 메뉴를 닫는다', () => {
    const { onClose } = renderMenu();

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('↑/↓ 키로 비활성 항목을 건너뛰며 포커스를 옮긴다', () => {
    renderMenu({ canMoveUp: false });

    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: '아래로 이동' })).toHaveFocus();

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: '삭제하기' })).toHaveFocus();

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: '복제하기' })).toHaveFocus();

    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(screen.getByRole('menuitem', { name: '삭제하기' })).toHaveFocus();
  });

  it('Home/End로 처음과 마지막 항목으로 이동한다', () => {
    renderMenu();

    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'End' });
    expect(screen.getByRole('menuitem', { name: '삭제하기' })).toHaveFocus();

    fireEvent.keyDown(menu, { key: 'Home' });
    expect(screen.getByRole('menuitem', { name: '복제하기' })).toHaveFocus();
  });

  it('Tab을 누르면 메뉴를 닫아 다음 요소로 이동하게 한다', () => {
    const { onClose } = renderMenu();

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('메뉴 안에서 우클릭해도 브라우저 기본 메뉴를 열지 않는다', () => {
    renderMenu();

    const menu = screen.getByRole('menu');
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });
    const prevented = !menu.dispatchEvent(event);

    expect(prevented).toBe(true);
  });
});
