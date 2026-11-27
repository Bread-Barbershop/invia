import {
  buildStationMapSearchUrl,
  safeNavigationUrl,
} from './navigationUrl';

describe('교통 안내 외부 내비게이션 링크', () => {
  it('신뢰할 수 있는 지도 서비스 HTTPS 주소를 지원한다', () => {
    expect(safeNavigationUrl('https://map.naver.com/p/search/서울')).toContain('map.naver.com');
    expect(safeNavigationUrl('https://map.kakao.com/?q=서울')).toContain('map.kakao.com');
  });
  it('악성 스킴과 피싱 도메인은 차단한다', () => {
    expect(safeNavigationUrl('javascript:alert(1)')).toBeNull();
    expect(safeNavigationUrl('http://map.naver.com/p')).toBeNull();
    expect(safeNavigationUrl('https://map.naver.com.evil.example/')).toBeNull();
    expect(safeNavigationUrl('https://attacker@map.naver.com/path')).toBeNull();
  });
  it('빈 주소는 링크를 렌더링하지 않도록 null을 반환한다', () => {
    expect(safeNavigationUrl('')).toBeNull();
    expect(safeNavigationUrl(undefined)).toBeNull();
  });
});

describe('하차 역·정류장 지도 검색 링크', () => {
  it('역 이름 뒤에 붙은 출구·설명을 떼고 검색어로 만든다', () => {
    expect(buildStationMapSearchUrl('압구정역')).toBe(
      `https://map.naver.com/p/search/${encodeURIComponent('압구정역')}`
    );
    expect(buildStationMapSearchUrl('압구정역 2번 출구')).toBe(
      `https://map.naver.com/p/search/${encodeURIComponent('압구정역')}`
    );
    expect(buildStationMapSearchUrl('3호선 압구정역(2번 출구)')).toBe(
      `https://map.naver.com/p/search/${encodeURIComponent('3호선 압구정역')}`
    );
    expect(buildStationMapSearchUrl('강남터미널')).toBe(
      `https://map.naver.com/p/search/${encodeURIComponent('강남터미널')}`
    );
  });

  it('지도 검색어로 쓸 수 없는 문장은 링크를 만들지 않는다', () => {
    expect(buildStationMapSearchUrl('')).toBeNull();
    expect(buildStationMapSearchUrl('정문에서 도보 5분')).toBeNull();
    expect(buildStationMapSearchUrl(undefined)).toBeNull();
    expect(buildStationMapSearchUrl('https://evil.example/')).toBeNull();
    expect(buildStationMapSearchUrl('역'.repeat(90))).toBeNull();
  });
});
