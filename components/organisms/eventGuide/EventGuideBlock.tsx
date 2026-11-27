'use client';

import { X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import Confirm from '@/components/molecules/confirm/Confirm';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock, InvitationType } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import {
  createEventGuideItem,
  EVENT_GUIDE_LIMITS,
  getEventGuidePreset,
  normalizeEventGuideItems,
} from './eventGuideItems';

const TYPE_LABELS: Partial<Record<InvitationType, string>> = {
  wedding: '결혼식',
  firstBirthday: '돌잔치',
  birthday: '생일',
  seminar: '세미나',
  etc: '기본',
};

export function EventGuideBlock({
  blockInfo,
  id,
}: {
  blockInfo: EditorBlock<'eventGuide'>;
  id: string;
}) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [showPresetConfirm, setShowPresetConfirm] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);
  const closePresetConfirm = useCallback(() => setShowPresetConfirm(false), []);
  const items = normalizeEventGuideItems(blockInfo.props.items);
  const typeLabel = TYPE_LABELS[blockInfo.type] ?? '기본';

  const changeItem = (
    key: string,
    field: 'title' | 'description' | 'time' | 'place',
    value: string
  ) =>
    updateBlock(id, {
      items: items.map(item =>
        item.id === key
          ? {
              ...item,
              [field]: value.slice(0, EVENT_GUIDE_LIMITS[field]),
            }
          : item
      ),
    });

  const applyPreset = () => {
    updateBlock(id, { items: getEventGuidePreset(blockInfo.type) });
    closePresetConfirm();
  };

  return (
    <LeftEditorWrapper ariaLabel="이벤트 안내" className="gap-3">
      <NavigationBar>이벤트 안내 편집</NavigationBar>
      <div className="flex w-full flex-col gap-3 py-2">
        <label className="flex flex-col gap-1 text-sm text-text-primary">
          제목
          <input
            value={blockInfo.props.title || ''}
            maxLength={EVENT_GUIDE_LIMITS.title}
            onChange={event => updateBlock(id, { title: event.target.value })}
            className="h-10 rounded-md border border-border-divider px-3 outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-primary">
          안내 문구
          <textarea
            value={blockInfo.props.intro ?? ''}
            maxLength={EVENT_GUIDE_LIMITS.intro}
            rows={2}
            onChange={event => updateBlock(id, { intro: event.target.value })}
            placeholder="이벤트에 대한 짧은 소개를 적어 주세요."
            className="resize-y rounded-md border border-border-divider p-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setShowPresetConfirm(true)}
          className="rounded-md border border-border-divider px-3 py-2 text-xs text-text-primary hover:bg-[#FAFAFB]"
        >
          {typeLabel} 이벤트 예시 적용
        </button>
        {showPresetConfirm && (
          <Confirm
            ref={confirmRef}
            message="현재 이벤트를 예시 내용으로 교체할까요?"
            confirmText="적용하기"
            cancelText="취소"
            variant="white"
            yPosition="center"
            onConfirm={applyPreset}
            onCancel={closePresetConfirm}
            onClose={closePresetConfirm}
          />
        )}
        {items.map((item, index) => (
          <section
            key={item.id}
            aria-labelledby={`${id}-event-${item.id}`}
            className="flex flex-col gap-2 rounded-lg border border-border-divider p-3"
          >
            <div className="flex items-center justify-between">
              <h4
                id={`${id}-event-${item.id}`}
                className="text-sm font-semibold text-text-primary"
              >
                {index + 1}번째 이벤트
              </h4>
              <button
                type="button"
                aria-label={`${index + 1}번째 이벤트 삭제`}
                onClick={() =>
                  updateBlock(id, {
                    items: items.filter(row => row.id !== item.id),
                  })
                }
                className="flex size-7 items-center justify-center rounded-md text-text-secondary hover:text-primary"
              >
                <X size={14} />
              </button>
            </div>
            <label className="flex flex-col gap-1 text-xs text-text-secondary">
              이름
              <input
                value={item.title}
                maxLength={EVENT_GUIDE_LIMITS.itemTitle}
                onChange={event =>
                  changeItem(item.id, 'title', event.target.value)
                }
                placeholder="예: 돌잡이"
                className="h-9 w-full rounded-md border border-border-divider px-2 text-sm text-text-primary outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-secondary">
              설명
              <textarea
                value={item.description}
                maxLength={EVENT_GUIDE_LIMITS.description}
                rows={2}
                onChange={event =>
                  changeItem(item.id, 'description', event.target.value)
                }
                className="resize-y rounded-md border border-border-divider p-2 text-sm text-text-primary outline-none focus:border-primary"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-text-secondary">
                시간
                <input
                  value={item.time}
                  maxLength={EVENT_GUIDE_LIMITS.time}
                  onChange={event =>
                    changeItem(item.id, 'time', event.target.value)
                  }
                  placeholder="예: 12:00"
                  className="h-9 w-full rounded-md border border-border-divider px-2 text-sm text-text-primary outline-none focus:border-primary"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-text-secondary">
                장소
                <input
                  value={item.place}
                  maxLength={EVENT_GUIDE_LIMITS.place}
                  onChange={event =>
                    changeItem(item.id, 'place', event.target.value)
                  }
                  placeholder="예: 포토존"
                  className="h-9 w-full rounded-md border border-border-divider px-2 text-sm text-text-primary outline-none focus:border-primary"
                />
              </label>
            </div>
          </section>
        ))}
        <button
          type="button"
          disabled={items.length >= EVENT_GUIDE_LIMITS.items}
          onClick={() =>
            updateBlock(id, { items: [...items, createEventGuideItem()] })
          }
          className="rounded-md border border-border-divider px-3 py-2 text-sm text-text-primary hover:bg-[#FAFAFB] disabled:opacity-40"
        >
          + 이벤트 추가
        </button>
        <p className="text-xs text-text-secondary">
          시간과 장소는 비워 두어도 괜찮아요. 초대장에는 입력한 항목만
          표시됩니다.
        </p>
      </div>
    </LeftEditorWrapper>
  );
}
