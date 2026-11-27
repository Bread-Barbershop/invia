import { SHOWCASE_CATEGORY_LABELS } from '../showcaseInvitations';

import type { InvitationTemplate } from './types';

const normalizeTemplateSearchValue = (value: string) =>
  value.toLocaleLowerCase().replace(/\s+/g, '');

/**
 * 분류 이름만으로는 찾기 어려운 말을 이어 준다. (예: '청첩장' → 웨딩 표지)
 * 분류가 늘어나도 그 분류의 이름은 그대로 검색되므로, 여기에는 덧붙일 말만 적는다.
 */
const TYPE_SEARCH_ALIASES: Record<string, string[]> = {
  wedding: ['청첩장', '결혼식', '결혼', 'wedding'],
  birthday: ['생일 파티', '생일파티', 'birthday'],
  firstBirthday: ['첫돌', '첫 생일', '아기', 'first birthday'],
  seminar: ['컨퍼런스', '강연', 'conference', 'seminar'],
  bridalShower: ['브라이덜', 'bridal shower'],
};

/**
 * 표지·템플릿 검색에 쓰는 문자열 목록.
 * 이름뿐 아니라 표지에 적힌 문구(eyebrow), 설명, 분류 이름과 분류 별칭, 태그,
 * 그리고 장소처럼 카드에 직접 적히지 않은 검색용 말까지 함께 찾는다.
 */
export function getTemplateSearchValues(
  template: InvitationTemplate
): string[] {
  return [
    template.name,
    template.eyebrow,
    template.description,
    SHOWCASE_CATEGORY_LABELS[template.type],
    ...(TYPE_SEARCH_ALIASES[template.type] ?? []),
    ...template.tags,
    ...(template.searchKeywords ?? []),
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
