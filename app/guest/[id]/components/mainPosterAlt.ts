import { cleanSectionText } from '@/components/organisms/wrapper/sectionTitle';

export const MAIN_POSTER_ALT_FALLBACK = '초대장 대표 이미지';

/**
 * 하객 화면 대표 이미지의 alt 문구.
 *
 * 화면 낭독기는 이미지의 alt를 이미지 제목처럼 읽는다. "초대장 메인 포스터"처럼 모든 초대장에
 * 같은 문구를 쓰면 어느 초대장인지 알 수 없으므로, 초대장 제목(공유 제목 → 행사 이름 →
 * 신랑·신부 이름 → 아이 이름 순)이 있으면 그 이름을 담아 준다.
 */
export function mainPosterAltText(title?: string | null) {
  const cleaned = cleanSectionText(title);
  return cleaned ? `${cleaned} 대표 이미지` : MAIN_POSTER_ALT_FALLBACK;
}
