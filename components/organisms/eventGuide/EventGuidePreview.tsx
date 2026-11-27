import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { normalizeEventGuideItems } from './eventGuideItems';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'eventGuide'>;
  isGuestPage?: boolean;
  titleClassName?: string;
}

export function EventGuidePreview({
  blockInfo,
  className = '',
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) {
  const accentColor = useEditorStore(
    state => state.titleData.color || TITLE_BULK_DATA.color
  );
  const intro = blockInfo.props.intro?.trim() ?? '';
  const items = normalizeEventGuideItems(blockInfo.props.items).filter(item =>
    item.title.trim()
  );
  const accentSoft = /^#[0-9a-fA-F]{6}$/.test(accentColor)
    ? `${accentColor}14`
    : undefined;

  if (isGuestPage && items.length === 0) return null;

  return (
    <MiddlePreviewWrapper
      matchBodyFontSize
      className={className}
      titleClassName={titleClassName}
      mainTitle={blockInfo.props.title}
      mainTitleDefault="이벤트 안내"
      {...rest}
    >
      {intro && (
        <p className="w-full whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
          {intro}
        </p>
      )}
      {items.length === 0 ? (
        !isGuestPage && (
          <p className="text-xs text-text-tertiary">
            참여할 수 있는 이벤트를 추가해 주세요.
          </p>
        )
      ) : (
        <ul role="list" className="flex w-full flex-col gap-2.5 text-left">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                'flex items-start gap-3 rounded-xl border border-border-divider px-4 py-3.5',
                'bg-[#FCFCFD]'
              )}
            >
              <span
                aria-hidden="true"
                className="mt-0.5 min-w-6 text-[11px] font-semibold tracking-wider tabular-nums"
                style={{ color: accentColor }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="break-words text-sm font-semibold text-text-primary">
                    {item.title}
                  </p>
                  {item.time && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        color: accentColor,
                        backgroundColor: accentSoft,
                      }}
                    >
                      {item.time}
                    </span>
                  )}
                  {item.place && (
                    <span className="rounded-full bg-[#F4F4F5] px-2 py-0.5 text-[11px] text-text-secondary">
                      {item.place}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-text-secondary">
                    {item.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </MiddlePreviewWrapper>
  );
}
