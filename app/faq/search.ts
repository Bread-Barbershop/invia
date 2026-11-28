import type { FaqCategoryId, FaqItem } from './data';

/**
 * FAQ 검색어 정규화.
 *
 * 본문은 '나의 저장소'처럼 제품 표기로 통일되어 있지만, 사용자는 '드라이브',
 * '구글 드라이브', 'Google Drive'처럼 다른 이름으로 찾습니다. 그래서
 * - 대소문자,
 * - 띄어쓰기,
 * - 문장부호(가운뎃점·따옴표 등)
 * 차이를 없애고 비교합니다.
 */
export function normalizeFaqSearchText(text: string): string {
  return text.toLowerCase().replace(/[\s·.,!?"'’‘()[\]{}:;/\\~-]/g, '');
}

/** 한 문항이 검색어에 걸리는지 비교할 문자열 (질문 + 답변 + 별칭) */
export function buildFaqSearchIndex(item: FaqItem): string {
  return normalizeFaqSearchText(
    [item.question, item.answer, ...(item.keywords ?? [])].join(' ')
  );
}

/** 여러 단어로 검색하면 모든 단어가 문항 안에 있어야 합니다. */
export function matchesFaqQuery(item: FaqItem, query: string): boolean {
  const tokens = query
    .split(/\s+/)
    .map(normalizeFaqSearchText)
    .filter(Boolean);

  if (tokens.length === 0) return true;

  const haystack = buildFaqSearchIndex(item);

  return tokens.every(token => haystack.includes(token));
}

/** 카테고리와 검색어를 함께 적용해 FAQ 문항을 걸러냅니다. */
export function filterFaqItems(
  items: readonly FaqItem[],
  {
    category,
    query,
  }: {
    category: FaqCategoryId;
    query?: string;
  }
): FaqItem[] {
  return items.filter(item => {
    const matchesCategory = category === 'all' || item.category === category;

    return matchesCategory && matchesFaqQuery(item, query ?? '');
  });
}
