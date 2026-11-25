import { SHOWCASE_CATEGORY_LABELS } from '../showcaseInvitations';

import type { InvitationTemplate } from './types';

const normalizeTemplateSearchValue = (value: string) =>
  value.toLocaleLowerCase().replace(/\s+/g, '');

/**
 * 표지·템플릿 검색에 쓰는 문자열 목록.
 * 이름뿐 아니라 표지에 적힌 문구(eyebrow), 설명, 분류, 태그까지 함께 찾는다.
 */
export function getTemplateSearchValues(
  template: InvitationTemplate
): string[] {
  return [
    template.name,
    template.eyebrow,
    template.description,
    SHOWCASE_CATEGORY_LABELS[template.type],
    ...template.tags,
  ].map(normalizeTemplateSearchValue);
}

/**
 * 공백으로 나눈 검색어를 모두 만족하는 템플릿만 남긴다. (예: '생일 꽃' → 생일 분류의 꽃 표지)
 */
export function filterInvitationTemplates(
  templates: InvitationTemplate[],
  searchQuery: string
): InvitationTemplate[] {
  const terms = searchQuery
    .trim()
    .split(/\s+/)
    .map(normalizeTemplateSearchValue)
    .filter(Boolean);
  if (terms.length === 0) return templates;

  return templates.filter(template => {
    const searchValues = getTemplateSearchValues(template);
    return terms.every(term =>
      searchValues.some(value => value.includes(term))
    );
  });
}
