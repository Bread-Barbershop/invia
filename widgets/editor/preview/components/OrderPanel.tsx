import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { EditorCallout } from '@/components/molecules/editor-callout';
import { isBlockEnabled } from '@/shared/data/registry/blockAvailability';
import { useToast } from '@/shared/hooks/useToast';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useEditorCalloutStore } from '@/shared/store/useEditorCalloutStore';
import {
  getBlockDisplayName,
  getReorderIndexes,
  type BlockMoveDirection,
} from '@/shared/utils/blockManagement';
import {
  isEditorShortcutBlocked,
  shouldIgnoreEditorShortcut,
} from '@/shared/utils/editorShortcutGuard';
import ChipCarousel from '@/widgets/editor/preview/components/ChipCarousel';

import {
  BlockContextMenu,
  type BlockContextMenuAction,
} from './BlockContextMenu';
import DeleteModal from './DeleteModal';
import SortableItems from './SortableItems';

const reorderHint =
  '블록을 꾹 누른 채로 끌거나 Alt+↑/↓ 로 순서를 바꿀 수 있어요.';
const deleteHint =
  '선택한 블록은 Delete 키로 삭제, Ctrl+D(⌘+D)로 복제할 수 있어요.';

const CONTEXT_MENU_WIDTH = 140;
const CONTEXT_MENU_HEIGHT = 132;

/*todo : 
max-h넘어가면 아래 방향 추가
     
*/

function OrderPanel() {
  const {
    block,
    moveBlock,
    selectedBlock,
    selectedId,
    setIsEdit,
    deleteBlock,
    duplicateBlock,
  } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      moveBlock: state.moveBlock,
      selectedBlock: state.selectedBlock,
      selectedId: state.selectedId,
      setIsEdit: state.setIsEdit,
      deleteBlock: state.deleteBlock,
      duplicateBlock: state.duplicateBlock,
    }))
  );
  const isOrderCalloutOpen = useEditorCalloutStore(
    state => state.callouts['order-panel']
  );
  const showCalloutFor = useEditorCalloutStore(state => state.showCalloutFor);
  const hideCallout = useEditorCalloutStore(state => state.hideCallout);
  const { success: successToast } = useToast();
  const visibleBlocks = block.filter(item => isBlockEnabled(item.component));
  const canReorder = visibleBlocks.length >= 2;

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [isDrag, setIsDrag] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: 300, tolerance: 5 }, // 500ms 롱프레스
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 5 },
    })
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
  } | null>(null);

  useEffect(() => {
    if (canReorder) showCalloutFor('order-panel');
    return () => hideCallout('order-panel');
  }, [canReorder, hideCallout, showCalloutFor]);

  const closeContextMenu = useCallback((restoreFocusTo?: string) => {
    setContextMenu(null);
    if (restoreFocusTo) {
      document
        .querySelector<HTMLElement>(`[data-order-block-id="${restoreFocusTo}"]`)
        ?.focus();
    }
  }, []);

  const focusSelectedBlock = useCallback((id: string) => {
    window.setTimeout(() => {
      document
        .querySelector<HTMLElement>(`[data-order-block-id="${id}"]`)
        ?.focus();
    }, 0);
  }, []);

  const handleDuplicate = useCallback(
    (id: string) => {
      const sourceBlock = useEditorStore
        .getState()
        .block.find(item => item.id === id);
      if (!sourceBlock) return;

      const newId = duplicateBlock(id);
      if (!newId) return;

      selectedBlock(newId);
      setIsEdit(false);
      setAnnouncement(
        `${getBlockDisplayName(sourceBlock.component)} 블록을 복제했어요.`
      );
      successToast('블록을 복제했어요');
      focusSelectedBlock(newId);
    },
    [duplicateBlock, focusSelectedBlock, selectedBlock, setIsEdit, successToast]
  );

  const handleMove = useCallback(
    (id: string, direction: BlockMoveDirection) => {
      const indexes = getReorderIndexes(block, id, direction);
      if (!indexes) return;

      moveBlock(indexes.from, indexes.to);
      selectedBlock(id);

      const movedBlock = block.find(item => item.id === id);
      setAnnouncement(
        `${movedBlock ? getBlockDisplayName(movedBlock.component) : '블록'} ${
          direction === 'up' ? '위' : '아래'
        }로 옮겼어요.`
      );
    },
    [block, moveBlock, selectedBlock]
  );

  const handleMenuAction = useCallback(
    (action: BlockContextMenuAction) => {
      if (!contextMenu) return;
      const targetId = contextMenu.tabId;
      closeContextMenu();

      switch (action) {
        case 'duplicate':
          handleDuplicate(targetId);
          return;
        case 'moveUp':
          handleMove(targetId, 'up');
          return;
        case 'moveDown':
          handleMove(targetId, 'down');
          return;
        case 'delete':
          setDeleteTargetId(targetId);
          return;
        default:
      }
    },
    [closeContextMenu, contextMenu, handleDuplicate, handleMove, setDeleteTargetId]  );

  useEffect(() => {
    const handleDeleteShortcut = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' || shouldIgnoreEditorShortcut(event)) return;

      const state = useEditorStore.getState();
      const targetId = state.selectedId;
      const isSelectedBlock = state.block.some(
        block => block.id === targetId && isBlockEnabled(block.component)
      );

      if (!targetId || targetId === 'mainPoster' || !isSelectedBlock) return;

      event.preventDefault();
      state.deleteBlock(targetId);
      state.selectedBlock('mainPoster');
      state.setIsEdit(false);
    };

    window.addEventListener('keydown', handleDeleteShortcut);
    return () => window.removeEventListener('keydown', handleDeleteShortcut);
  }, []);

  useEffect(() => {
    const handleBlockShortcut = (event: KeyboardEvent) => {
      const isDuplicateShortcut =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'd';
      const isMoveShortcut =
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        (event.key === 'ArrowUp' || event.key === 'ArrowDown');

      if (!isDuplicateShortcut && !isMoveShortcut) return;
      if (isEditorShortcutBlocked(event)) return;

      const targetId = useEditorStore.getState().selectedId;
      if (!targetId || targetId === 'mainPoster') return;

      const isSelectedBlock = useEditorStore
        .getState()
        .block.some(
          block => block.id === targetId && isBlockEnabled(block.component)
        );
      if (!isSelectedBlock) return;

      event.preventDefault();

      if (isDuplicateShortcut) {
        handleDuplicate(targetId);
        return;
      }

      handleMove(targetId, event.key === 'ArrowUp' ? 'up' : 'down');
    };

    window.addEventListener('keydown', handleBlockShortcut);
    return () => window.removeEventListener('keydown', handleBlockShortcut);
  }, [handleDuplicate, handleMove]);

  // 각 탭 아이템에 연결
  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault(); // 기본 브라우저 메뉴 차단
    // 일부 PC(확장 프로그램, 마우스 드라이버 등)에서 preventDefault가
    // 늦게 처리되거나 다른 리스너에 의해 무시되는 경우를 방지하기 위해
    // 네이티브 이벤트 레벨에서도 한 번 더 차단한다.
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      setContextMenu({
        x: Math.max(
          0,
          Math.min(
            e.clientX - containerRect.left,
            containerRect.width - CONTEXT_MENU_WIDTH
          )
        ),
        y: Math.max(
          0,
          Math.min(
            e.clientY - containerRect.top,
            containerRect.height - CONTEXT_MENU_HEIGHT
          )
        ),
        tabId,
      });
    }
  };

  // 캡처 단계에서 한 번 더 네이티브 컨텍스트 메뉴를 차단 (일부 PC 환경 방어)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const blockNativeMenu = (e: MouseEvent) => e.preventDefault();
    container.addEventListener('contextmenu', blockNativeMenu, {
      capture: true,
    });
    return () =>
      container.removeEventListener('contextmenu', blockNativeMenu, {
        capture: true,
      });
  }, []);

  // 메뉴 닫기 (바깥 클릭 시)
  useEffect(() => {
    const close = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', close);
      window.addEventListener('wheel', close);
      return () => {
        window.removeEventListener('click', close);
        window.removeEventListener('wheel', close);
      };
    }
  }, [contextMenu]);

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDrag(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = block.findIndex(b => b.id === active.id);
    const newIndex = block.findIndex(b => b.id === over.id);
    moveBlock(oldIndex, newIndex);
  };

  const handlePageSelect = (event: DragStartEvent) => {
    const active = event.active;
    const id = active.id as string;
    setIsDrag(true);
    selectedBlock(id);
    setIsEdit(false);
  };

  const handleSelect = useCallback(
    (id: string) => {
      selectedBlock(id);
      setIsEdit(false);
    },
    [selectedBlock, setIsEdit]
  );

  const contextMenuBlock = contextMenu
    ? visibleBlocks.find(item => item.id === contextMenu.tabId)
    : undefined;
  const contextMenuIndex = contextMenuBlock
    ? visibleBlocks.findIndex(item => item.id === contextMenuBlock.id)
    : -1;

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={handlePageSelect}
    >
      <div
        ref={containerRef}
        className="relative flex flex-col items-center w-full rounded-lg bg-bg-base shadow-edit"
      >
        <p className="font-semibold text-sm px-9 py-3.5 select-none">순서</p>
        <div className="w-full px-2 relative">
          {/* Reserve shell chrome, action controls, title/margins, both arrows, and header clearance. */}
          <ChipCarousel
            options={{
              align: 'start',
              axis: 'y',
              containScroll: 'trimSnaps',
              dragFree: true,
              watchDrag: !isDrag,
            }}
            parentClassName="flex-col mb-2 max-h-[min(376px,calc(100dvh-532px))]"
            onReset={() => {
              setContextMenu(null);
            }}
          >
            <button
              type="button"
              className={`flex-center px-3 py-2 w-24 cursor-pointer select-none rounded-sm ${selectedId === 'mainPoster' ? 'bg-[#DBE8FC]' : ''}`}
              onPointerDown={() => handleSelect('mainPoster')}
            >
              포스터
            </button>
            <SortableContext
              items={visibleBlocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {visibleBlocks.map(items => (
                <SortableItems
                  key={items.id}
                  id={items.id}
                  blockInfo={items}
                  isSelected={selectedId === items.id}
                  onContextMenu={handleContextMenu}
                  onSelect={handleSelect}
                  onDeleteRequest={id => setDeleteTargetId(id)}
                />
              ))}
            </SortableContext>
          </ChipCarousel>
        </div>
        {contextMenu && contextMenuBlock && (
          <BlockContextMenu
            label={getBlockDisplayName(contextMenuBlock.component)}
            x={contextMenu.x}
            y={contextMenu.y}
            canMoveUp={contextMenuIndex > 0}
            canMoveDown={
              contextMenuIndex >= 0 &&
              contextMenuIndex < visibleBlocks.length - 1
            }
            onAction={handleMenuAction}
            onClose={() => closeContextMenu(contextMenu.tabId)}
          />
        )}
        <div
          role="status"
          aria-live="polite"
          data-testid="order-announcement"
          className="sr-only"
        >
          {announcement}
        </div>
      </div>
      {visibleBlocks.length > 0 && (
        <EditorCallout
          targetRef={containerRef}
          open={isOrderCalloutOpen}
          arrowSide="bottom"
          targetAnchor={{ x: 0.5, y: 0 }}
          offset={0}
          className="max-w-[300px] break-keep text-[14px] leading-5"
          text={canReorder ? `${reorderHint} ${deleteHint}` : deleteHint}
        />
      )}
      <AnimatePresence>
        {deleteTargetId && (
          <DeleteModal
            onDelete={() => {
              deleteBlock(deleteTargetId);
              setDeleteTargetId(null);
            }}
            setIsDeleteModal={value => !value && setDeleteTargetId(null)}
          />
        )}
      </AnimatePresence>
    </DndContext>
  );
}

export default OrderPanel;
