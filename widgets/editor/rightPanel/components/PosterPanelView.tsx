import { Search } from 'lucide-react';

import type { InvitationTemplate } from '@/shared/data/invitationTemplates/types';
import InvitationTemplatePoster from '@/widgets/editor/preview/components/InvitationTemplatePoster';

export function PosterPanelView({
  templates,
  isApplying,
  onSelectTemplate,
  onResetSearch,
}: {
  templates: InvitationTemplate[];
  isApplying: boolean;
  onSelectTemplate: (id: string) => void;
  onResetSearch?: () => void;
}) {
  if (templates.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-lg bg-black/[0.02] px-4 py-10 text-center">
        <Search className="mb-1 size-7 text-neutral-300" aria-hidden="true" />
        <p className="text-xs font-semibold text-text-primary">
          검색 결과가 없어요
        </p>
        <p className="text-[11px] leading-4 text-text-secondary">
          다른 키워드로 찾아보거나
          <br />
          검색어를 지워보세요.
        </p>
        {onResetSearch && (
          <button
            type="button"
            onClick={onResetSearch}
            className="mt-2 h-8 cursor-pointer rounded-full border border-neutral-300 bg-white px-3 text-[11px] font-semibold text-text-primary transition-colors hover:border-black"
          >
            검색 초기화
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-2 content-start gap-3 overflow-y-auto pb-5 scrollbar-hide">
      {templates.map(template => (
        <button
          type="button"
          key={template.id}
          aria-label={`${template.name} 표지 적용`}
          disabled={isApplying}
          onClick={() => onSelectTemplate(template.id)}
          className="group flex flex-col overflow-hidden rounded-lg border border-black/5 text-left transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-50"
        >
          <div className="h-[315px] w-full shrink-0">
            <InvitationTemplatePoster template={template} />
          </div>
          <span className="w-full truncate bg-white px-2 py-2.5 text-[11px] font-medium text-text-plain">
            {template.name}
          </span>
        </button>
      ))}
    </div>
  );
}
