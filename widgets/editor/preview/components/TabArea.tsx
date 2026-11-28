import { Search, X } from 'lucide-react';

import {
  componentCls,
  type SampleDataType,
} from '@/shared/data/componentsInfo/componentInfo';
import { prioritizeComponentCategories } from '@/shared/data/componentsInfo/componentOrder';
import type { InvitationType } from '@/shared/types/block';

interface Props {
  active: string;
  tabClick: (english: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  /** 지금 편집 중인 초대장 종류. 있으면 그 탭을 맨 앞에 두고 표시한다. */
  currentType?: InvitationType | null;
}

function TabArea({
  active,
  tabClick,
  searchQuery = '',
  onSearchChange,
  currentType = null,
}: Props) {
  const orderedCategories: SampleDataType[] = prioritizeComponentCategories(
    componentCls,
    currentType
  );

  return (
    <div className="flex min-w-0 items-center gap-2 px-3">
      <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1">
        {orderedCategories.map((items, index) => (
          <li
            key={index}
            className={`min-w-18 shrink-0 h-11 px-2 cursor-pointer select-none flex-center gap-1 whitespace-nowrap font-semibold text-sm ${active === items.english ? 'text-text-primary border-b' : 'text-text-secondary border-0'}`}
            onClick={() => tabClick(items.english)}
          >
            {items.korea}
            {currentType === items.english && (
              <>
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                <span className="sr-only">현재 초대장</span>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex shrink-0 items-center">
        <div className="relative flex w-36 items-center">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 text-neutral-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
            placeholder="블록 검색"
            autoFocus
            className="h-8 w-full rounded-md border border-neutral-200 bg-neutral-50 pl-8 pr-7 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:bg-white focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => onSearchChange?.('')}
              className="absolute right-2 flex size-4 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TabArea;
