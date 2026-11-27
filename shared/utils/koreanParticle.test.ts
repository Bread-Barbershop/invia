import { hasFinalConsonant, withParticle } from './koreanParticle';

describe('한글 조사 판단', () => {
  it('받침이 있는 말은 받침 있는 조사를 쓴다', () => {
    expect(withParticle('모던', '과', '와')).toBe('모던과');
    expect(withParticle('가든', '과', '와')).toBe('가든과');
    expect(withParticle('클래식', '과', '와')).toBe('클래식과');
    expect(withParticle('돌잔치', '이', '가')).toBe('돌잔치가');
    expect(withParticle('가을', '과', '와')).toBe('가을과');
  });

  it('받침이 없는 말은 받침 없는 조사를 쓴다', () => {
    expect(withParticle('선라이트', '과', '와')).toBe('선라이트와');
    expect(withParticle('브런치', '과', '와')).toBe('브런치와');
    expect(withParticle('모먼트', '을', '를')).toBe('모먼트를');
  });

  it('따옴표·문장부호가 붙어 있어도 마지막 글자로 판단한다', () => {
    expect(withParticle('‘모던’', '과', '와')).toBe('‘모던’과');
    expect(hasFinalConsonant('가든!')).toBe(true);
    expect(hasFinalConsonant('"브런치"')).toBe(false);
  });

  it('숫자는 읽는 소리로 받침을 판단한다', () => {
    expect(hasFinalConsonant('2026')).toBe(true);
    expect(hasFinalConsonant('3')).toBe(true);
    expect(hasFinalConsonant('2')).toBe(false);
  });

  it('발음을 단정할 수 없는 영문으로 끝나면 fallback 조사를 쓴다', () => {
    expect(hasFinalConsonant('brunch')).toBeUndefined();
    expect(withParticle('brunch', '과', '와', '과')).toBe('brunch과');
    expect(withParticle('brunch', '과', '와')).toBe('brunch과');
  });

  it('빈 문자열은 판단하지 않는다', () => {
    expect(hasFinalConsonant('')).toBeUndefined();
    expect(hasFinalConsonant('   ')).toBeUndefined();
  });
});
