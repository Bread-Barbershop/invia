import { Search, X } from 'lucide-react';

import { componentCls } from '@/shared/data/componentsInfo/componentInfo';

interface Props {
  active: string;
  tabClick: (english: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onClose?: () => void;
}

function TabArea({
  active,
  tabClick,
  searchQuery = '',
  onSearchChange,
  onClose,
}: Props) {
  return (
    <div className="flex min-w-0 items-center gap-2 px-3">
      <ul className="flex min-w-0 flex-1 overflow-x-auto scrollbar-hide">
        {componentCls.map((items, index) => (
          <li
            key={index}
            className={`w-18 shrink-0 h-11 cursor-pointer select-none flex-center font-semibold text-sm ${active === items.english ? 'text-text-primary border-b' : 'text-text-secondary border-0'}`}
            onClick={() => tabClick(items.english)}
          >
            {items.korea}
          </li>
        ))}
      </ul>
      <div className="flex shrink-0 items-center">
        <div className="relative flex w-32 items-center">
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
        {onClose && (
          <button
            type="button"
            aria-label="블록 추가 닫기"
            onClick={onClose}
            className="ml-1 grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default TabArea;
