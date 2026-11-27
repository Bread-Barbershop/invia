'use client';

import { X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import Confirm from '@/components/molecules/confirm/Confirm';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock, InvitationType } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import {
  CHECKLIST_LIMITS,
  createChecklistItem,
  getChecklistPreset,
  normalizeChecklistItems,
} from './checklistItems';

const TYPE_LABELS: Partial<Record<InvitationType, string>> = {
  wedding: '결혼식',
  firstBirthday: '돌잔치',
  birthday: '생일',
  seminar: '세미나',
  bridalShower: '브라이덜샤워',
  exhibition: '전시·팝업',
  etc: '기본',
};

export function ChecklistBlock({
  blockInfo,
  id,
}: {
  blockInfo: EditorBlock<'checklist'>;
  id: string;
}) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [showPresetConfirm, setShowPresetConfirm] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);
  const closePresetConfirm = useCallback(() => setShowPresetConfirm(false), []);
  const items = normalizeChecklistItems(blockInfo.props.items);
  const typeLabel = TYPE_LABELS[blockInfo.type] ?? '기본';

  const changeItem = (
    key: string,
    field: 'label' | 'note',
    value: string
  ) =>
    updateBlock(id, {
      items: items.map(item =>
        item.id === key
          ? { ...item, [field]: value.slice(0, CHECKLIST_LIMITS[field]) }
          : item
      ),
    });

  const applyPreset = () => {
    updateBlock(id, { items: getChecklistPreset(blockInfo.type) });
    closePresetConfirm();
  };

  return (
    <LeftEditorWrapper ariaLabel="체크리스트" className="gap-3">
      <NavigationBar>체크리스트 편집</NavigationBar>
      <div className="flex w-full flex-col gap-3 py-2">
        <label className="flex flex-col gap-1 text-sm text-text-primary">
          제목
          <input
            value={blockInfo.props.title || ''}
            maxLength={CHECKLIST_LIMITS.title}
            onChange={event => updateBlock(id, { title: event.target.value })}
            className="h-10 rounded-md border border-border-divider px-3 outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-primary">
          안내 문구
          <textarea
            value={blockInfo.props.description ?? ''}
            maxLength={CHECKLIST_LIMITS.description}
            rows={2}
            onChange={event =>
              updateBlock(id, { description: event.target.value })
            }
            placeholder="체크리스트에 대한 짧은 안내를 적어 주세요."
            className="resize-y rounded-md border border-border-divider p-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setShowPresetConfirm(true)}
          className="rounded-md border border-border-divider px-3 py-2 text-xs text-text-primary hover:bg-[#FAFAFB]"
        >
          {typeLabel} 준비물 예시 적용
        </button>
        {showPresetConfirm && (
          <Confirm
            ref={confirmRef}
            message="현재 항목을 준비물 예시로 교체할까요?"
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
            aria-labelledby={`${id}-checklist-${item.id}`}
            className="flex flex-col gap-2 rounded-lg border border-border-divider p-3"
          >
            <div className="flex items-center justify-between">
              <h4
                id={`${id}-checklist-${item.id}`}
                className="text-sm font-semibold text-text-primary"
              >
                {index + 1}번째 항목
              </h4>
              <button
                type="button"
                aria-label={`${index + 1}번째 항목 삭제`}
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
              항목
              <input
                value={item.label}
                maxLength={CHECKLIST_LIMITS.label}
                onChange={event =>
                  changeItem(item.id, 'label', event.target.value)
                }
                placeholder="예: 초대장 링크 저장"
                className="h-9 w-full rounded-md border border-border-divider px-2 text-sm text-text-primary outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-secondary">
              설명 (선택)
              <input
                value={item.note}
                maxLength={CHECKLIST_LIMITS.note}
                onChange={event =>
                  changeItem(item.id, 'note', event.target.value)
                }
                placeholder="예: 당일 입장할 때 필요해요."
                className="h-9 w-full rounded-md border border-border-divider px-2 text-sm text-text-primary outline-none focus:border-primary"
              />
            </label>
          </section>
        ))}
        <button
          type="button"
          disabled={items.length >= CHECKLIST_LIMITS.items}
          onClick={() =>
            updateBlock(id, { items: [...items, createChecklistItem()] })
          }
          className="rounded-md border border-border-divider px-3 py-2 text-sm text-text-primary hover:bg-[#FAFAFB] disabled:opacity-40"
        >
          + 항목 추가
        </button>
        <p className="text-xs text-text-secondary">
          하객이 초대장에서 직접 체크할 수 있어요. 체크 상태는 하객의 기기에만
          저장됩니다.
        </p>
      </div>
    </LeftEditorWrapper>
  );
}
