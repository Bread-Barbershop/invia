export const EDITOR_TITLE_PLACEHOLDERS: readonly string[] = [
  '제목을 입력해 주세요',
  '제목을 입력해주세요',
];

/**
 * 작성자가 남긴 제목 문자열에서 실제로 보여 줄 값을 뽑는다.
 * 앞뒤 공백만 있는 값과, 예전 편집기가 기본값으로 저장했을 수 있는 안내문은 빈 값으로 본다.
 */
export function cleanSectionText(value?: string | null) {
  const text = typeof value === 'string' ? value.trim() : '';
  return EDITOR_TITLE_PLACEHOLDERS.includes(text) ? '' : text;
}

/**
 * 블록 제목/부제목으로 실제 렌더링할 문구를 고른다.
 *
 * - 편집기 화면: 지금까지처럼 작성자가 넣은 값을 그대로 넘겨, 비어 있으면 PreviewTitle이
 *   입력 안내문("제목을 입력해 주세요")을 그리게 둔다.
 * - 하객 화면: 공백만 있거나 안내문이 저장된 제목은 없는 것으로 보고 기본 문구로 채운다.
 *   기본 문구도 없으면 빈 문자열을 돌려주고, 호출부가 제목 줄 자체를 그리지 않는다.
 */
export function resolveSectionTitleText(
  value: string | undefined,
  fallback: string | undefined,
  isGuestSurface: boolean
): string {
  if (!isGuestSurface) {
    return value && value.length >= 1 ? value : (fallback ?? '');
  }
  return cleanSectionText(value) || cleanSectionText(fallback);
}

export type SectionTitleRenderState = {
  text: string;
  visible: boolean;
};

/**
 * 그릴 제목이 없으면 제목 요소를 아예 만들지 않는다.
 * 편집기 화면은 입력 안내문을 보여 줘야 하므로 항상 그린다.
 */
export function resolveSectionTitleRenderState(
  value: string | undefined,
  fallback: string | undefined,
  isGuestSurface: boolean
): SectionTitleRenderState {
  const text = resolveSectionTitleText(value, fallback, isGuestSurface);
  return {
    text,
    visible: isGuestSurface ? text !== '' : true,
  };
}
