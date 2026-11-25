import type { InvitationType } from '@/shared/types/block';

type InvitationTypeCarrier = { type: InvitationType };

/**
 * 지금 편집 중인 초대장 종류는 첫 블록의 타입을 기준으로 삼는다.
 * 블록이 아직 하나도 없으면 종류를 알 수 없으므로 null을 돌려준다.
 */
export function getCurrentInvitationType(
  blocks: readonly InvitationTypeCarrier[] | null | undefined
): InvitationType | null {
  return blocks?.[0]?.type ?? null;
}

/**
 * 현재 초대장 종류의 카테고리를 맨 앞으로 올린다.
 * 나머지 카테고리는 기존 순서를 그대로 유지해, 자주 쓰는 분류가 늘 같은 자리에 있게 한다.
 */
export function prioritizeComponentCategories<T extends { english: string }>(
  categories: readonly T[],
  currentType: string | null
): T[] {
  const ordered = [...categories];
  if (!currentType) return ordered;

  const currentIndex = ordered.findIndex(
    category => category.english === currentType
  );
  if (currentIndex <= 0) return ordered;

  const [currentCategory] = ordered.splice(currentIndex, 1);
  ordered.unshift(currentCategory);
  return ordered;
}
