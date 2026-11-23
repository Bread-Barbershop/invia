'use client';

import { useCallback, useRef, useState } from 'react';

import Confirm from '@/components/molecules/confirm/Confirm';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { SortableEditorRow } from '@/features/DndKit/Sort/SortableEditorRow';
import SortableWrapper from '@/features/DndKit/Sort/SortableWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { createTimelineItem, getTimelinePreset, normalizeTimelineItems } from './timelineItems';

export function TimelineBlock({
  blockInfo,
  id,
}: {
  blockInfo: EditorBlock<'timeline'>;
  id: string;
}) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [showPresetConfirm, setShowPresetConfirm] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);
  const closePresetConfirm = useCallback(() => setShowPresetConfirm(false), []);
  const items = normalizeTimelineItems(blockInfo.props.items);
  const changeItem = (key: string, name: 'time' | 'title' | 'description', value: string) =>
    updateBlock(id, { items: items.map(item => item.id === key ? { ...item, [name]: value } : item) });
  const applyPreset = () => {
    updateBlock(id, { items: getTimelinePreset(blockInfo.type) });
    closePresetConfirm();
  };

  return (
    <LeftEditorWrapper ariaLabel="식순 및 타임라인" className="gap-3">
      <NavigationBar>식순 / 타임라인 편집</NavigationBar>
      <div className="flex w-full flex-col gap-3 py-2">
        <label className="flex flex-col gap-1 text-sm text-text-primary">
          제목
          <input
            value={blockInfo.props.title || ''}
            maxLength={40}
            onChange={event => updateBlock(id, { title: event.target.value })}
            className="h-10 rounded-md border border-border-divider px-3 outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setShowPresetConfirm(true)}
          className="rounded-md border border-border-divider px-3 py-2 text-xs text-text-primary hover:bg-[#FAFAFB]"
        >
          {blockInfo.type === 'wedding' ? '결혼식' : blockInfo.type === 'firstBirthday' ? '돌잔치' : blockInfo.type === 'seminar' ? '세미나' : '기본'} 식순 예시 적용
        </button>
        {showPresetConfirm && (
          <Confirm
            ref={confirmRef}
            message="현재 식순을 예시 식순으로 교체할까요?"
            confirmText="적용하기"
            cancelText="취소"
            variant="white"
            yPosition="center"
            onConfirm={applyPreset}
            onCancel={closePresetConfirm}
            onClose={closePresetConfirm}
          />
        )}
        <SortableWrapper
          vertical
          items={items}
          onChange={items => updateBlock(id, { items })}
          className="flex-col gap-3 empty:hidden"
        >
          {(item, index, moveItem) => (
            <SortableEditorRow
              key={item.id}
              id={item.id}
              label={`${index + 1}번째`}
              heading={<span className="text-sm font-semibold text-text-primary">{index + 1}번째 순서</span>}
              removeLabel={`${index + 1}번째 순서 삭제`}
              removeText="삭제"
              onRemove={() => updateBlock(id, { items: items.filter(row => row.id !== item.id) })}
              onMove={moveItem}
              className="flex flex-col gap-2 rounded-lg border border-border-divider p-3"
            >
              {([
                { field: 'time', label: '시간', max: 24 },
                { field: 'title', label: '일정 제목', max: 60 },
                { field: 'description', label: '상세 설명', max: 200 },
              ] as const).map(input => (
                <label className="flex flex-col gap-1 text-xs text-text-secondary" key={input.field}>
                  {input.label}
                  <input
                    value={item[input.field]}
                    maxLength={input.max}
                    onChange={event => changeItem(item.id, input.field, event.target.value)}
                    className="h-9 w-full rounded-md border border-border-divider px-2 text-sm text-text-primary outline-none focus:border-primary"
                  />
                </label>
              ))}
            </SortableEditorRow>
          )}
        </SortableWrapper>
        <button
          type="button"
          disabled={items.length >= 20}
          onClick={() => updateBlock(id, { items: [...items, createTimelineItem()] })}
          className="rounded-md border border-border-divider px-3 py-2 text-sm text-text-primary hover:bg-[#FAFAFB] disabled:opacity-40"
        >
          + 순서 추가
        </button>
      </div>
    </LeftEditorWrapper>
  );
}
