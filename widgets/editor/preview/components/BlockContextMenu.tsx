'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/shared/utils/cn';

import type { KeyboardEvent } from 'react';

export type BlockContextMenuAction =
  | 'duplicate'
  | 'moveUp'
  | 'moveDown'
  | 'delete';

interface MenuItem {
  action: BlockContextMenuAction;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
}

interface Props {
  /** 스크린리더에 읽어 줄 블록 이름 */
  label: string;
  x: number;
  y: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAction: (action: BlockContextMenuAction) => void;
  onClose: () => void;
}

const ITEM_CLASS =
  'flex w-full items-center justify-between gap-4 rounded-sm px-2.5 py-1.5 text-left text-[13px] text-text-primary transition-colors enabled:cursor-pointer enabled:hover:bg-bg-sub disabled:cursor-not-allowed disabled:text-text-secondary';
const SHORTCUT_CLASS = 'text-[11px] font-normal text-text-secondary';

/**
 * 순서 목록에서 블록을 우클릭했을 때 열리는 메뉴.
 * 복제·순서 이동·삭제를 한 곳에서 제공하고, 키보드(↑/↓, Home/End, Esc)로 조작할 수 있다.
 */
export function BlockContextMenu({
  label,
  x,
  y,
  canMoveUp,
  canMoveDown,
  onAction,
  onClose,
}: Props) {
  const menuRef = useRef<HTMLUListElement>(null);

  const items: MenuItem[] = [
    { action: 'duplicate', label: '복제하기', shortcut: 'Ctrl+D' },
    {
      action: 'moveUp',
      label: '위로 이동',
      shortcut: 'Alt+↑',
      disabled: !canMoveUp,
    },
    {
      action: 'moveDown',
      label: '아래로 이동',
      shortcut: 'Alt+↓',
      disabled: !canMoveDown,
    },
    { action: 'delete', label: '삭제하기', destructive: true },
  ];

  useEffect(() => {
    const firstEnabled =
      menuRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
    firstEnabled?.focus();
  }, []);

  const focusBy = (step: 1 | -1) => {
    const buttons = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        'button:not(:disabled)'
      ) ?? []
    );
    if (buttons.length === 0) return;

    const currentIndex = buttons.findIndex(
      button => button === document.activeElement
    );
    const nextIndex =
      currentIndex < 0
        ? 0
        : (currentIndex + step + buttons.length) % buttons.length;

    buttons[nextIndex].focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      case 'ArrowDown':
        event.preventDefault();
        focusBy(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        focusBy(-1);
        return;
      case 'Home':
      case 'End': {
        event.preventDefault();
        const buttons = Array.from(
          menuRef.current?.querySelectorAll<HTMLButtonElement>(
            'button:not(:disabled)'
          ) ?? []
        );
        buttons[event.key === 'Home' ? 0 : buttons.length - 1]?.focus();
        return;
      }
      case 'Tab':
        onClose();
        return;
      default:
    }
  };

  return (
    <ul
      ref={menuRef}
      role="menu"
      aria-label={`${label} 블록 관리`}
      style={{ position: 'absolute', top: y, left: x }}
      onKeyDown={handleKeyDown}
      onContextMenu={event => event.preventDefault()}
      className="z-20 min-w-35 rounded-md border border-border-neutral bg-bg-base py-1 shadow-edit"
    >
      {items.map(item => (
        <li key={item.action} role="none">
          <button
            type="button"
            role="menuitem"
            disabled={item.disabled}
            aria-label={item.label}
            onClick={event => {
              event.stopPropagation();
              onAction(item.action);
            }}
            className={cn(
              ITEM_CLASS,
              item.destructive &&
                'text-status-error enabled:hover:bg-status-error-bg'
            )}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className={SHORTCUT_CLASS} aria-hidden="true">
                {item.shortcut}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
