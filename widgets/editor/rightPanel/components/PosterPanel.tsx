'use client';

import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';
import { filterInvitationTemplates } from '@/shared/data/invitationTemplates/search';
import type { InvitationTemplateType } from '@/shared/data/invitationTemplates/types';
import { useInvitationTemplate } from '@/widgets/editor/preview/hooks/useInvitationTemplate';

import { PosterPanelView } from './PosterPanelView';

const CATEGORIES = [
  ['all', '전체'],
  ['wedding', '결혼식'],
  ['birthday', '생일'],
  ['seminar', '세미나'],
  ['firstBirthday', '돌잔치'],
] as const;

export const PosterPanel = () => {
  const [category, setCategory] = useState<InvitationTemplateType | 'all'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const { applyTemplate, isApplying } = useInvitationTemplate();
  const templates = useMemo(() => {
    const categorized = INVITATION_TEMPLATES.filter(
      template => category === 'all' || template.type === category
    );
    return filterInvitationTemplates(categorized, searchQuery);
  }, [category, searchQuery]);

  return (
    <section
      className="flex h-full min-h-0 flex-1 flex-col gap-3 px-1"
      aria-label="표지 디자인 선택"
    >
      <nav className="flex shrink-0 justify-between" aria-label="표지 카테고리">
        {CATEGORIES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            disabled={isApplying}
            className={`h-11 px-1 text-xs transition-colors disabled:opacity-50 ${category === value ? 'border-b border-black font-semibold text-text-primary' : 'text-text-secondary'}`}
            onClick={() => setCategory(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="relative flex h-9 shrink-0 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 transition-colors focus-within:border-primary focus-within:bg-white">
        <Search size={14} className="shrink-0 text-neutral-400" />
        <label htmlFor="poster-search" className="sr-only">
          표지 검색
        </label>
        <input
          id="poster-search"
          type="search"
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          placeholder="표지 검색 (예: 클래식, 꽃)"
          className="w-full bg-transparent text-xs text-text-primary outline-none placeholder:text-text-tertiary [&::-webkit-search-cancel-button]:hidden"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => setSearchQuery('')}
            className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-neutral-600"
          >
            <X size={12} />
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 text-[11px] text-text-secondary">
        <p>표지만 바꿔요. 본문은 그대로 유지돼요.</p>
        <span className="shrink-0 tabular-nums">
          {searchQuery.trim()
            ? `검색 결과 ${templates.length}개`
            : `총 ${templates.length}개`}
        </span>
      </div>
      <PosterPanelView
        templates={templates}
        isApplying={isApplying}
        onSelectTemplate={id => void applyTemplate(id, { posterOnly: true })}
        onResetSearch={() => setSearchQuery('')}
      />
    </section>
  );
};
