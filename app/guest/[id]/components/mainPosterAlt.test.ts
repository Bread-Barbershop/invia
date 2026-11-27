import { MAIN_POSTER_ALT_FALLBACK, mainPosterAltText } from './mainPosterAlt';

describe('mainPosterAltText', () => {
  it('초대장 제목이 있으면 제목을 담은 alt를 만든다', () => {
    expect(mainPosterAltText('민성·아현 결혼식')).toBe(
      '민성·아현 결혼식 대표 이미지'
    );
  });

  it('앞뒤 공백은 지운다', () => {
    expect(mainPosterAltText('  지우 돌잔치  ')).toBe('지우 돌잔치 대표 이미지');
  });

  it('제목이 없으면 모든 초대장이 함께 쓰는 일반 문구로 돌아간다', () => {
    expect(mainPosterAltText(undefined)).toBe(MAIN_POSTER_ALT_FALLBACK);
    expect(mainPosterAltText(null)).toBe(MAIN_POSTER_ALT_FALLBACK);
    expect(mainPosterAltText('')).toBe(MAIN_POSTER_ALT_FALLBACK);
    expect(mainPosterAltText('   ')).toBe(MAIN_POSTER_ALT_FALLBACK);
  });

  it('편집기 안내문이 제목으로 남아 있어도 alt에 쓰지 않는다', () => {
    expect(mainPosterAltText('제목을 입력해 주세요')).toBe(
      MAIN_POSTER_ALT_FALLBACK
    );
  });

  it('일반 문구는 이미지 종류를 알 수 있게 유지한다', () => {
    expect(MAIN_POSTER_ALT_FALLBACK).toBe('초대장 대표 이미지');
  });
});
