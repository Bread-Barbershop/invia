import { getColorLabel } from './colorName';

describe('getColorLabel', () => {
  it('미리 정의한 색상은 색상명과 16진수를 함께 돌려준다', () => {
    expect(getColorLabel('#FA7564')).toBe('코랄 #FA7564');
    expect(getColorLabel('#fa7564')).toBe('코랄 #FA7564');
  });

  it('알파 값이 붙은 16진수도 같은 색상명을 쓴다', () => {
    expect(getColorLabel('#00000080')).toBe('검정 #000000');
  });

  it('정의하지 않은 색은 사용자 지정 색으로 표시한다', () => {
    expect(getColorLabel('#123456')).toBe('사용자 지정 색 #123456');
    expect(getColorLabel('rgb(1, 2, 3)')).toBe('사용자 지정 색');
  });
});
