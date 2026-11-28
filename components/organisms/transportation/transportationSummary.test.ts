import { buildTransportationSummary } from './transportationSummary';

describe('교통·주차 안내 복사 문장', () => {
  it('입력한 항목만 순서대로 담는다', () => {
    const summary = buildTransportationSummary({
      title: '오시는 길',
      subwayLine: '3호선',
      subwayStation: '압구정역',
      subwayExit: '2번 출구',
      subwayWalk: '정문에서 도보 5분',
      busRoutes: '143 · 401',
      shuttleStop: '',
      shuttleInterval: '',
      parkingHours: '무료 2시간',
      alternativeParking: '',
      navigationUrl: 'https://map.naver.com/p/search/압구정',
    });

    expect(summary).toBe(
      [
        '오시는 길',
        '',
        '지하철: 3호선 · 압구정역 · 2번 출구 (정문에서 도보 5분)',
        '버스: 143 · 401',
        '자가용/주차: 무료 2시간',
        `지도: ${new URL('https://map.naver.com/p/search/압구정').toString()}`,
      ].join('\n')
    );
  });

  it('제목이 비어 있으면 기본 제목을 쓰고, 역 정보가 없으면 도보 안내만 남긴다', () => {
    const summary = buildTransportationSummary({
      title: '   ',
      subwayWalk: '2번 출구에서 도보 3분',
    });

    expect(summary).toBe(
      ['오시는 길 안내', '', '도보: 2번 출구에서 도보 3분'].join('\n')
    );
  });

  it('허용되지 않은 지도 링크는 문장에 넣지 않는다', () => {
    const summary = buildTransportationSummary({
      busRoutes: '143',
      navigationUrl: 'https://evil.example/phishing',
    });

    expect(summary).toBe(['오시는 길 안내', '', '버스: 143'].join('\n'));
    expect(summary).not.toContain('evil.example');
  });

  it('보여줄 내용이 없으면 빈 문자열을 반환한다', () => {
    expect(buildTransportationSummary({})).toBe('');
    expect(
      buildTransportationSummary({
        subwayLine: ' ',
        busRoutes: '',
        parkingHours: '\n',
        navigationUrl: 'javascript:alert(1)',
      })
    ).toBe('');
  });
});
