import {
  SKETCH_MAP_VERSION,
  distanceInMeters,
  isSketchMapData,
  matchesSketchMapSettings,
  type SketchMapData,
} from './sketchTypes';

function createSketch(patch: Partial<SketchMapData> = {}): SketchMapData {
  return {
    v: SKETCH_MAP_VERSION,
    lat: 37.5088,
    lng: 127.0606,
    radius: 500,
    density: 'standard',
    roads: [{ c: 'major', p: '0,0 10,10' }],
    areas: [{ k: 'park', p: '0,0 10,0 10,10 0,0', a: 1 }],
    stations: [
      { n: '언주역', code: '926', exits: ['2', '5'], x: 620, y: 480 },
    ],
    ...patch,
  };
}

describe('isSketchMapData', () => {
  it('정상 데이터를 통과시킨다', () => {
    expect(isSketchMapData(createSketch())).toBe(true);
  });

  it('버전이 다르면 거부한다', () => {
    expect(isSketchMapData(createSketch({ v: 2 }))).toBe(false);
  });

  it('좌표 문자열이 깨졌거나 도로 등급이 이상하면 거부한다', () => {
    expect(
      isSketchMapData(
        createSketch({ roads: [{ c: 'major', p: '10,20 30' }] })
      )
    ).toBe(false);
    expect(
      isSketchMapData(
        createSketch({ roads: [{ c: 'huge' as never, p: '0,0 1,1' }] })
      )
    ).toBe(false);
  });

  it('역 정보의 좌표가 숫자가 아니면 거부한다', () => {
    expect(
      isSketchMapData(
        createSketch({
          stations: [
            {
              n: '언주역',
              exits: [],
              x: Number.NaN,
              y: 10,
            },
          ],
        })
      )
    ).toBe(false);
  });

  it('배열이 아닌 값이나 null은 거부한다', () => {
    expect(isSketchMapData(null)).toBe(false);
    expect(isSketchMapData({})).toBe(false);
    expect(isSketchMapData(createSketch({ roads: null as never }))).toBe(false);
  });

  it('도로가 지나치게 많으면 저장 데이터로 신뢰하지 않는다', () => {
    const roads = Array.from({ length: 3001 }, () => ({
      c: 'minor' as const,
      p: '0,0 1,1',
    }));
    expect(isSketchMapData(createSketch({ roads }))).toBe(false);
  });
});

describe('distanceInMeters', () => {
  it('위도 0.001도 차이는 약 111m로 계산한다', () => {
    const distance = distanceInMeters(37.5, 127, 37.501, 127);
    expect(distance).toBeGreaterThan(108);
    expect(distance).toBeLessThan(114);
  });
});

describe('matchesSketchMapSettings', () => {
  const sketch = createSketch();

  it('요청의 반올림 정밀도를 반영해 같은 좌표를 비교한다', () => {
    expect(
      matchesSketchMapSettings(sketch, { ...sketch, lat: sketch.lat + 0.0000001 })
    ).toBe(true);
  });

  it.each([
    ['주소', { lat: 37.509 }],
    ['반경', { radius: 800 }],
    ['밀도', { density: 'detailed' }],
  ] as const)('%s가 달라졌으면 현재 설정과 일치하지 않는다', (_field, change) => {
    expect(matchesSketchMapSettings(sketch, { ...sketch, ...change })).toBe(false);
  });

  it('저장된 약도가 없으면 현재 설정과 일치하지 않는다', () => {
    expect(matchesSketchMapSettings(null, sketch)).toBe(false);
  });
});
