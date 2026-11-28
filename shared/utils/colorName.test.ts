import {
  formatSwatchAriaLabel,
  getColorNameKo,
  normalizeHexColor,
} from '@/shared/utils/colorName';

describe('색상 스와치 한국어 라벨', () => {
  it('대표 색상 이름을 아는 HEX는 이름까지 함께 알려 준다', () => {
    expect(formatSwatchAriaLabel('#FFFFFF')).toBe('색상 선택 #FFFFFF (화이트)');
    expect(formatSwatchAriaLabel('#000000')).toBe('색상 선택 #000000 (블랙)');
  });

  it('이름이 없는 HEX는 HEX만 알려 준다', () => {
    expect(formatSwatchAriaLabel('#182433')).toBe('색상 선택 #182433');
    expect(getColorNameKo('#182433')).toBeNull();
  });

  it('소문자·축약 표기를 6자리 대문자 HEX로 맞춘다', () => {
    expect(normalizeHexColor('#fff')).toBe('#FFFFFF');
    expect(normalizeHexColor('ffffff')).toBe('#FFFFFF');
    expect(normalizeHexColor('#171717')).toBe('#171717');
    expect(formatSwatchAriaLabel('#fff')).toBe('색상 선택 #FFFFFF (화이트)');
  });
});
