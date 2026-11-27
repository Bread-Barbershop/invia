import {
  buildSketchMapFromOverpass,
  normalizeStationName,
  parseStationLabel,
} from './buildSketchMap';
import type { OverpassElement } from './overpass';

const CENTER = { lat: 37.5088, lng: 127.0606 };

function way(
  id: number,
  tags: Record<string, string>,
  geometry: { lat: number; lon: number }[]
): OverpassElement {
  return { type: 'way', id, tags, geometry };
}

function node(
  id: number,
  tags: Record<string, string>,
  lat: number,
  lon: number
): OverpassElement {
  return { type: 'node', id, tags, lat, lon };
}

const fixture: OverpassElement[] = [
  way(
    1,
    { highway: 'primary', name: '언주로' },
    [
      { lat: 37.5088, lon: 127.059 },
      { lat: 37.5088, lon: 127.0606 },
      { lat: 37.5088, lon: 127.0622 },
    ]
  ),
  // 같은 도로가 여러 구간으로 중복 제공되는 경우
  way(
    2,
    { highway: 'primary', name: '언주로' },
    [
      { lat: 37.5088, lon: 127.059 },
      { lat: 37.5088, lon: 127.0606 },
      { lat: 37.5088, lon: 127.0622 },
    ]
  ),
  way(
    3,
    { highway: 'secondary', name: '봉은사로' },
    [
      { lat: 37.5065, lon: 127.0615 },
      { lat: 37.5111, lon: 127.0615 },
    ]
  ),
  way(
    4,
    { highway: 'tertiary', name: '언주로93길' },
    [
      { lat: 37.5095, lon: 127.0602 },
      { lat: 37.5095, lon: 127.061 },
    ]
  ),
  way(
    5,
    { leisure: 'park' },
    [
      { lat: 37.5098, lon: 127.0598 },
      { lat: 37.5098, lon: 127.0603 },
      { lat: 37.5102, lon: 127.0603 },
      { lat: 37.5102, lon: 127.0598 },
      { lat: 37.5098, lon: 127.0598 },
    ]
  ),
  way(
    6,
    { waterway: 'stream' },
    [
      { lat: 37.5122, lon: 127.0606 },
      { lat: 37.5062, lon: 127.0606 },
    ]
  ),
  node(10, { railway: 'subway_entrance', description: '언주역 2번출구' }, 37.5098, 127.0616),
  node(11, { railway: 'subway_entrance', description: '언주역 5번출구' }, 37.5099, 127.0617),
  node(12, { railway: 'station', station: 'subway', name: '언주', ref: '926' }, 37.5098, 127.0616),
  node(
    13,
    { railway: 'subway_entrance', description: '선정릉역 1번출구' },
    37.5164,
    127.0606
  ),
];

describe('buildSketchMapFromOverpass', () => {
  const data = buildSketchMapFromOverpass(fixture, {
    ...CENTER,
    radius: 500,
    density: 'standard',
    generatedAt: '2026-11-25T00:00:00.000Z',
  });

  it('예식장 좌표와 버전을 함께 저장한다', () => {
    expect(data.lat).toBeCloseTo(CENTER.lat, 6);
    expect(data.lng).toBeCloseTo(CENTER.lng, 6);
    expect(data.v).toBe(1);
    expect(data.generatedAt).toBe('2026-11-25T00:00:00.000Z');
  });

  it('도로를 등급별로 분류한다', () => {
    const classes = data.roads.map(road => road.c);
    expect(classes).toContain('major');
    expect(classes).toContain('medium');
    expect(classes).toContain('minor');
  });

  it('중복 도로 구간은 한 번만 그린다', () => {
    const majors = data.roads.filter(road => road.c === 'major');
    expect(majors).toHaveLength(1);
  });

  it('도로 좌표는 뷰박스(0~1000) 안쪽으로 투영된다', () => {
    const first = data.roads[0].p.split(' ')[0].split(',').map(Number);
    expect(first[0]).toBeGreaterThanOrEqual(0);
    expect(first[0]).toBeLessThanOrEqual(1000);
    expect(first[1]).toBeGreaterThanOrEqual(0);
    expect(first[1]).toBeLessThanOrEqual(1000);
  });

  it('공원은 면, 하천은 선으로 저장한다', () => {
    const park = data.areas.find(area => area.k === 'park');
    const water = data.areas.find(area => area.k === 'water');
    expect(park?.a).toBe(1);
    expect(water?.a).toBe(0);
  });

  it('출구 정보를 역 단위로 묶고 역 번호를 붙인다', () => {
    expect(data.stations).toHaveLength(1);
    const [station] = data.stations;
    expect(station.n).toBe('언주역');
    expect(station.code).toBe('926');
    expect(station.exits).toEqual(['2', '5']);
    expect(station.x).toBeGreaterThan(500);
    expect(station.y).toBeLessThan(500);
  });

  it('반경 밖 역은 넣지 않는다', () => {
    expect(data.stations.some(station => station.n === '선정릉역')).toBe(false);
  });

  it('미니멀 밀도에서는 이면도로를 제외한다', () => {
    const minimal = buildSketchMapFromOverpass(fixture, {
      ...CENTER,
      radius: 500,
      density: 'minimal',
    });
    expect(minimal.roads.some(road => road.c === 'minor')).toBe(false);
    expect(minimal.density).toBe('minimal');
  });

  it('데이터가 없으면 빈 약도를 돌려준다', () => {
    const empty = buildSketchMapFromOverpass([], {
      ...CENTER,
      radius: 500,
      density: 'standard',
    });
    expect(empty.roads).toEqual([]);
    expect(empty.areas).toEqual([]);
    expect(empty.stations).toEqual([]);
  });
});

describe('역 이름 파싱', () => {
  it('"언주역 2번출구"에서 역명과 출구 번호를 뽑는다', () => {
    expect(parseStationLabel('언주역 2번출구')).toEqual({
      name: '언주역',
      exit: '2',
    });
    expect(parseStationLabel('삼성(무역센터)역 10번 출구')).toEqual({
      name: '삼성(무역센터)역',
      exit: '10',
    });
  });

  it('역명만 있는 경우도 인식한다', () => {
    expect(parseStationLabel('강남역')).toEqual({ name: '강남역' });
  });

  it('역명이 아닌 문구는 무시한다', () => {
    expect(parseStationLabel('')).toBeNull();
    expect(parseStationLabel('지하철 출구')).toBeNull();
  });

  it('한글 역명에는 역 접미사를 붙인다', () => {
    expect(normalizeStationName('언주')).toBe('언주역');
    expect(normalizeStationName('언주역')).toBe('언주역');
    expect(normalizeStationName('Samseong')).toBe('Samseong');
  });
});
