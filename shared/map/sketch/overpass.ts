/**
 * OpenStreetMap Overpass API 질의 생성.
 *
 * 약도에 필요한 만큼만 요청한다.
 *  - 도로: 등급별 필터 (미니멀/기본/상세)
 *  - 수변·공원: 종이 약도의 은은한 색면
 *  - 지하철 역사·출구: 역 배지와 출구 번호
 */

import type { SketchDensity } from './sketchTypes';

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
] as const;

export const OVERPASS_USER_AGENT =
  'invia-sketch-map/1.0 (+https://dev.invia.co.kr)';

/** 약도 프레임 밖으로 이어지는 도로가 자연스럽게 잘리도록 여유를 둔다. */
const QUERY_RADIUS_FACTOR = 1.35;

export interface OverpassGeometryPoint {
  lat: number;
  lon: number;
}

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  geometry?: OverpassGeometryPoint[];
}

const HIGHWAY_CLASSES: Record<SketchDensity, string[]> = {
  minimal: ['motorway', 'trunk', 'primary', 'secondary'],
  standard: [
    'motorway',
    'trunk',
    'primary',
    'secondary',
    'tertiary',
    'unclassified',
    'residential',
  ],
  detailed: [
    'motorway',
    'trunk',
    'primary',
    'secondary',
    'tertiary',
    'unclassified',
    'residential',
    'living_street',
    'service',
  ],
};

/** 밀도 설정에 따라 요청할 도로 등급 정규식. */
export function highwayRegexForDensity(density: SketchDensity): string {
  return `^(${HIGHWAY_CLASSES[density].join('|')})$`;
}

/** 밀도 설정에 포함되는 도로 등급 목록. */
export function highwayClassesForDensity(density: SketchDensity): string[] {
  return HIGHWAY_CLASSES[density];
}

export interface OverpassQueryParams {
  lat: number;
  lng: number;
  radius: number;
  density: SketchDensity;
}

export function buildOverpassQuery({
  lat,
  lng,
  radius,
  density,
}: OverpassQueryParams): string {
  const around = Math.round(radius * QUERY_RADIUS_FACTOR);
  const aroundClause = `(around:${around},${lat.toFixed(6)},${lng.toFixed(6)})`;
  const highway = highwayRegexForDensity(density);

  return `[out:json][timeout:25];
(
  way["highway"~"${highway}"]${aroundClause};
  way["waterway"~"^(river|stream|canal)$"]${aroundClause};
  way["natural"="water"]${aroundClause};
  way["leisure"~"^(park|garden)$"]${aroundClause};
  node["railway"="subway_entrance"]${aroundClause};
  node["railway"="station"]["station"="subway"]${aroundClause};
  node["public_transport"="station"]["subway"="yes"]${aroundClause};
);
out tags geom qt;`;
}
