/**
 * 미니멀 약도 팔레트 프리셋.
 * 초대장 톤(아이보리·모노·세이지·블러시)에 맞춘 4종을 제공한다.
 */

export type SketchPaletteKey = 'ivory' | 'mono' | 'sage' | 'blush';

export interface SketchPalette {
  key: SketchPaletteKey;
  name: string;
  /** 종이 바탕 */
  paper: string;
  /** 바탕 가장자리(은은한 그라데이션) */
  paperEdge: string;
  /** 주요 도로 */
  major: string;
  /** 보조 도로 */
  medium: string;
  /** 이면 도로 */
  minor: string;
  water: string;
  park: string;
  /** 핀·지하철역 배지 강조색 */
  accent: string;
  /** 역 배지 바탕 */
  badge: string;
  /** 역 번호 글자 */
  badgeInk: string;
  /** 라벨 글자 */
  label: string;
  /** 프레임 선 */
  frame: string;
}

export const SKETCH_PALETTES: Record<SketchPaletteKey, SketchPalette> = {
  ivory: {
    key: 'ivory',
    name: '웜 아이보리',
    paper: '#FBF7EE',
    paperEdge: '#F3EBDD',
    major: '#8A7458',
    medium: '#B39C80',
    minor: '#D6C7B3',
    water: '#DCE7E5',
    park: '#E6EDDC',
    accent: '#B4885B',
    badge: '#FFFDF8',
    badgeInk: '#8A6A45',
    label: '#5B4C3B',
    frame: '#E1D4BF',
  },
  mono: {
    key: 'mono',
    name: '클래식 모노',
    paper: '#FFFFFF',
    paperEdge: '#F4F4F4',
    major: '#3F3F3F',
    medium: '#787878',
    minor: '#B4B4B4',
    water: '#E8EEF1',
    park: '#EDF1EA',
    accent: '#2B2B2B',
    badge: '#FFFFFF',
    badgeInk: '#333333',
    label: '#2B2B2B',
    frame: '#DCDCDC',
  },
  sage: {
    key: 'sage',
    name: '세이지 그린',
    paper: '#F6F7F1',
    paperEdge: '#EBEEE2',
    major: '#6E7B62',
    medium: '#94A287',
    minor: '#C4CEB8',
    water: '#DCE7E4',
    park: '#E1E9D4',
    accent: '#6F8A5E',
    badge: '#FBFCF7',
    badgeInk: '#5C7350',
    label: '#4C5844',
    frame: '#D8DECC',
  },
  blush: {
    key: 'blush',
    name: '블러시 핑크',
    paper: '#FDF7F5',
    paperEdge: '#F8ECE8',
    major: '#A5807A',
    medium: '#C1A39D',
    minor: '#DEC8C2',
    water: '#E4EDEC',
    park: '#EBEFE2',
    accent: '#C08585',
    badge: '#FFFCFB',
    badgeInk: '#A87272',
    label: '#6B5350',
    frame: '#EEDDD8',
  },
};

export const SKETCH_PALETTE_KEYS = Object.keys(
  SKETCH_PALETTES
) as SketchPaletteKey[];
export const SKETCH_PALETTE_DEFAULT: SketchPaletteKey = 'ivory';

/** 저장된 키가 유효하지 않으면 기본 팔레트로 대체한다. */
export function resolveSketchPalette(key: string | undefined | null): SketchPalette {
  if (key && key in SKETCH_PALETTES) {
    return SKETCH_PALETTES[key as SketchPaletteKey];
  }
  return SKETCH_PALETTES[SKETCH_PALETTE_DEFAULT];
}
