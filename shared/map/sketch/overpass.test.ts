import {
  buildOverpassQuery,
  highwayClassesForDensity,
  highwayRegexForDensity,
} from './overpass';

describe('도로 등급 필터', () => {
  it('미니멀 밀도는 골목(tertiary 이하)을 제외한다', () => {
    expect(highwayClassesForDensity('minimal')).toEqual([
      'motorway',
      'trunk',
      'primary',
      'secondary',
    ]);
    expect(highwayRegexForDensity('minimal')).toBe(
      '^(motorway|trunk|primary|secondary)$'
    );
  });

  it('상세 밀도는 주거 지역 도로까지 포함한다', () => {
    expect(highwayClassesForDensity('detailed')).toContain('residential');
  });
});

describe('buildOverpassQuery', () => {
  const query = buildOverpassQuery({
    lat: 37.5088,
    lng: 127.0606,
    radius: 500,
    density: 'standard',
  });

  it('약도 반경보다 조금 넓은 around 조건을 쓴다', () => {
    expect(query).toContain('(around:675,37.508800,127.060600)');
  });

  it('도로 외에 수변·공원·지하철역도 함께 요청한다', () => {
    expect(query).toContain('way["waterway"~"^(river|stream|canal)$"]');
    expect(query).toContain('way["leisure"~"^(park|garden)$"]');
    expect(query).toContain('node["railway"="subway_entrance"]');
    expect(query).toContain('node["railway"="station"]["station"="subway"]');
  });

  it('도로 형상(geom)을 포함해 요청한다', () => {
    expect(query).toContain('out tags geom qt;');
  });
});
