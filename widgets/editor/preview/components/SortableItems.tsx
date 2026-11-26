import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import React from 'react';

import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { BlockLabel } from './BlockLabel';

interface Props {
  id: string;
  blockInfo: EditorBlock;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, tabId: string) => void;
  onDeleteRequest?: (id: string) => void;
}

const ItemContent = React.memo(
  ({ contents }: { contents: React.ReactNode }) => {
    return <>{contents}</>;
  }
);
ItemContent.displayName = 'ItemContent';

const ACTION_BUTTON_CLASS =
  'flex items-center justify-center rounded-full text-white opacity-0 transition-all duration-200 cursor-pointer group-hover:opacity-100 focus-visible:opacity-100';
const SortableItems = React.memo(
  ({
    id,
    blockInfo,
    isSelected,
    onSelect,
    onContextMenu,
    onDeleteRequest,
  }: Props) => {
    const {
      setNodeRef,
      attributes,
      listeners,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const array = componentCls.find(items => items.english === blockInfo.type);
    const componentName =
      array?.list.find(item => item.component === blockInfo.component) ??
      componentCls
        .flatMap(category => category.list)
        .find(item => item.component === blockInfo.component);
    const displayName =
      typeof componentName?.contents === 'string'
        ? componentName.contents
        : '블록';

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 1,
      opacity: isDragging ? 0.5 : 1,
    };

    const handlePointerDown = (e: React.PointerEvent) => {
      onSelect(id);
      listeners?.onPointerDown?.(e);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        event.target === event.currentTarget &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        onSelect(id);
        return;
      }

      listeners?.onKeyDown?.(event);
    };

    return (
      <div className="relative group">
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          role="button"
          data-order-block-id={id}
          onContextMenu={e => onContextMenu(e, id)}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          className={cn(
            'flex-center py-2 cursor-pointer rounded-sm w-24 transition-colors duration-200 select-none relative',
            isSelected ? 'bg-[#DBE8FC]' : ''
          )}
        >
          <BlockLabel component={blockInfo.component}>
            <ItemContent contents={componentName?.contents} />
          </BlockLabel>
          {!isDragging && onDeleteRequest && (
            <button
              type="button"
              aria-label={`${displayName} 블록 삭제하기`}
              title="삭제하기"
              onPointerDown={e => {
                e.stopPropagation();
              }}
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                onDeleteRequest(id);
              }}
              className={cn(
                ACTION_BUTTON_CLASS,
                'absolute right-1 top-1 z-10 size-4 bg-neutral-400/80 hover:bg-[#FF4D4D] hover:scale-110 active:scale-95'
              )}
            >
              <X size={10} strokeWidth={2.5} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

SortableItems.displayName = 'SortableItems';

export default SortableItems;
