/**
 * 색상 선택기 스와치에 붙일 한국어 접근성 라벨을 만드는 도우미입니다.
 *
 * - 스크린리더가 `Select color #FFFFFF` 같은 영문 자동 라벨 대신
 *   `색상 선택 #FFFFFF (화이트)`처럼 읽도록 합니다.
 * - 널리 쓰이는 색상은 대표 이름을 함께 알려 주고, 이름이 없는 색은 HEX만 알립니다.
 */

/** 자주 쓰는 HEX 값의 한국어 대표 색상 이름 */
const KO_COLOR_NAMES: Readonly<Record<string, string>> = {
  '#000000': '블랙',
  '#111111': '블랙',
  '#171717': '블랙',
  '#202020': '블랙',
  '#333333': '다크 그레이',
  '#555555': '그레이',
  '#808080': '그레이',
  '#999999': '라이트 그레이',
  '#CCCCCC': '라이트 그레이',
  '#D9D9D9': '라이트 그레이',
  '#EAEAEA': '라이트 그레이',
  '#F2F1EF': '오프 화이트',
  '#FAF9F6': '오프 화이트',
  '#FFFFFF': '화이트',
  '#FF0000': '레드',
  '#DC2626': '레드',
  '#EF4444': '레드',
  '#F87171': '라이트 레드',
  '#FFC0CB': '핑크',
  '#F9A8D4': '핑크',
  '#FDE2E4': '라이트 핑크',
  '#FFA500': '오렌지',
  '#F97316': '오렌지',
  '#FFD700': '골드',
  '#D4AF37': '골드',
  '#F5E6C8': '샴페인',
  '#FFFF00': '옐로우',
  '#FDE68A': '라이트 옐로우',
  '#008000': '그린',
  '#22C55E': '그린',
  '#A7C4A0': '세이지 그린',
  '#D7E3D0': '라이트 그린',
  '#0000FF': '블루',
  '#2563EB': '블루',
  '#3B82F6': '블루',
  '#93C5FD': '라이트 블루',
  '#A8C7D8': '스카이 블루',
  '#800080': '퍼플',
  '#7C3AED': '퍼플',
  '#C4B5FD': '라이트 퍼플',
  '#A0522D': '브라운',
  '#8B5E3C': '브라운',
  '#D2B48C': '탄',
  '#C8A98A': '베이지',
  '#E8DCCB': '베이지',
  '#F5F0E6': '아이보리',
  '#FFFFF0': '아이보리',
};

/** `#FFF`, `ffffff`, `#ffffff` 같은 표기를 대문자 6자리 HEX로 맞춥니다. */
export function normalizeHexColor(hex: string): string {
  const trimmed = hex.trim().toUpperCase();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  const shorthand = /^#([0-9A-F])([0-9A-F])([0-9A-F])$/.exec(withHash);

  if (shorthand) {
    return `#${shorthand[1]}${shorthand[1]}${shorthand[2]}${shorthand[2]}${shorthand[3]}${shorthand[3]}`;
  }

  return withHash;
}

/** HEX 값에 해당하는 한국어 대표 색상 이름 (없으면 null) */
export function getColorNameKo(hex: string): string | null {
  return KO_COLOR_NAMES[normalizeHexColor(hex)] ?? null;
}

/** 색상 스와치 버튼의 한국어 접근성 라벨 (예: `색상 선택 #FFFFFF (화이트)`) */
export function formatSwatchAriaLabel(hex: string): string {
  const normalized = normalizeHexColor(hex);
  const name = KO_COLOR_NAMES[normalized];

  return name
    ? `색상 선택 ${normalized} (${name})`
    : `색상 선택 ${normalized}`;
}
