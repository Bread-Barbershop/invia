const COLOR_NAMES: Record<string, string> = {
  '#000000': '검정',
  '#171717': '검정',
  '#FFFFFF': '흰색',
  '#F8F3EA': '아이보리',
  '#EFE4D6': '베이지',
  '#F8DDE3': '로즈',
  '#F9E1D2': '피치',
  '#F8DB76': '노랑',
  '#FFF1B8': '버터',
  '#DDE8D5': '세이지',
  '#E6DDF4': '라일락',
  '#D7E3F4': '하늘',
  '#536780': '네이비',
  '#54565C': '차콜',
  '#FA7564': '코랄',
  '#FF4D6D': '로즈 핑크',
  '#E96B8A': '핑크',
  '#7F7BFF': '보라',
  '#3B82F6': '파랑',
  '#2CB9A8': '민트',
  '#64748B': '슬레이트',
  '#FFFAF2': '크림',
  '#E2E6ED': '안개',
};

const HEX_COLOR = /^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/i;

function normalizeHex(color: string) {
  const match = color.trim().match(HEX_COLOR);
  return match ? `#${match[1].toUpperCase()}` : null;
}

/**
 * 색상 버튼의 접근성 이름에 쓸 색상명과 16진수 값을 함께 돌려준다.
 * 색상명을 알 수 없으면 '사용자 지정 색'으로 표시한다.
 */
export function getColorLabel(color: string) {
  const hex = normalizeHex(color);

  if (!hex) return '사용자 지정 색';

  return `${COLOR_NAMES[hex] ?? '사용자 지정 색'} ${hex}`;
}
