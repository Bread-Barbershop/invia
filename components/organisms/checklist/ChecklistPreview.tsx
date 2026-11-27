'use client';

import { Check } from 'lucide-react';
import { useCallback, useSyncExternalStore } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import {
  getCheckedItemIdsSnapshot,
  getChecklistStorageKey,
  getEmptyCheckedItemIdsSnapshot,
  setCheckedItemIds,
  subscribeCheckedItemIds,
} from './checklistChecks';
import { normalizeChecklistItems } from './checklistItems';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'checklist'>;
  isGuestPage?: boolean;
  checklistStorageScope?: string;
  titleClassName?: string;
}

export function ChecklistPreview({
  blockInfo,
  className = '',
  titleClassName,
  isGuestPage = false,
  checklistStorageScope,
  ...rest
}: Props) {
  const accentColor = useEditorStore(
    state => state.titleData.color || TITLE_BULK_DATA.color
  );
  const items = normalizeChecklistItems(blockInfo.props.items).filter(item =>
    item.label.trim()
  );
  const storageKey =
    isGuestPage && checklistStorageScope
      ? getChecklistStorageKey(checklistStorageScope, blockInfo.id)
      : null;
  const checkedIds = useSyncExternalStore(
    useCallback(
      (onChange: () => void) => subscribeCheckedItemIds(storageKey, onChange),
      [storageKey]
    ),
    useCallback(() => getCheckedItemIdsSnapshot(storageKey), [storageKey]),
    getEmptyCheckedItemIdsSnapshot
  );

  const toggle = (itemId: string) => {
    if (!storageKey) return;
    const next = checkedIds.includes(itemId)
      ? checkedIds.filter(id => id !== itemId)
      : [...checkedIds, itemId];
    setCheckedItemIds(storageKey, next);
  };

  const checkedSet = new Set(checkedIds);
  const doneCount = items.filter(item => checkedSet.has(item.id)).length;
  const percent = items.length
    ? Math.round((doneCount / items.length) * 100)
    : 0;
  const description = blockInfo.props.description?.trim() ?? '';

  if (isGuestPage && items.length === 0) return null;

  return (
    <MiddlePreviewWrapper
      matchBodyFontSize
      className={className}
      titleClassName={titleClassName}
      mainTitle={blockInfo.props.title}
      mainTitleDefault="체크리스트"
      {...rest}
    >
      {description && (
        <p className="w-full whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      )}
      {items.length === 0 ? (
        !isGuestPage && (
          <p className="text-xs text-text-tertiary">
            체크할 항목을 추가해 주세요.
          </p>
        )
      ) : (
        <div className="flex w-full flex-col gap-3 text-left">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-semibold text-text-secondary">
              <span style={{ color: accentColor }}>{doneCount}</span>
              {` / ${items.length} 완료`}
            </p>
            <div
              role="progressbar"
              aria-label="체크리스트 진행률"
              aria-valuemin={0}
              aria-valuemax={items.length}
              aria-valuenow={doneCount}
              className="h-1 w-24 overflow-hidden rounded-full bg-border-divider"
            >
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${percent}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>
          <ul role="list" className="flex w-full flex-col gap-2">
            {items.map(item => {
              const isChecked = checkedSet.has(item.id);
              return (
                <li key={item.id}>
                  <label
                    className={cn(
                      'flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
                      isChecked
                        ? 'border-transparent bg-[#FAFAFB]'
                        : 'border-border-divider bg-white'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!storageKey}
                      onChange={() => toggle(item.id)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                        'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
                        isChecked
                          ? 'border-transparent'
                          : 'border-border-divider bg-white'
                      )}
                      style={
                        isChecked
                          ? { backgroundColor: accentColor }
                          : undefined
                      }
                    >
                      {isChecked && (
                        <Check size={12} strokeWidth={3} color="#FFFFFF" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block break-words text-sm text-text-primary transition-opacity',
                          isChecked && 'line-through opacity-60'
                        )}
                      >
                        {item.label}
                      </span>
                      {item.note && (
                        <span
                          className={cn(
                            'mt-0.5 block whitespace-pre-wrap break-words text-xs leading-relaxed text-text-secondary transition-opacity',
                            isChecked && 'opacity-60'
                          )}
                        >
                          {item.note}
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          {items.length > 0 && doneCount === items.length && (
            <p
              role="status"
              className="text-center text-xs font-semibold"
              style={{ color: accentColor }}
            >
              모두 완료했어요!
            </p>
          )}
        </div>
      )}
    </MiddlePreviewWrapper>
  );
}
