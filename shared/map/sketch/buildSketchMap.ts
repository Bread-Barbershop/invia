/**
 * Overpass 응답 → 미니멀 약도 데이터 변환.
 *
 * 서버(API 라우트)에서만 사용하지만 순수 함수라 테스트에서 그대로 검증한다.
 * 실제 도로·하천·공원·지하철역 형상만 사용하며, 데이터가 없으면 아무것도 그리지 않는다.
 */

import { highwayClassesForDensity } from './overpass';
import {
  encodePoints,
  isClosedPolyline,
  isPointInFrame,
  projectPoint,
  simplifyPolyline,
} from './projection';
import {
  SKETCH_MAP_VERSION,
  SKETCH_VIEWBOX_SIZE,
  distanceInMeters,
  type SketchArea,
  type SketchDensity,
  type SketchMapData,
  type SketchRoad,
  type SketchRoadClass,
  type SketchStation,
} from './sketchTypes';

import type { OverpassElement } from './overpass';

const HIGHWAY_CLASS_MAP: Record<string, SketchRoadClass> = {
  motorway: 'major',
  motorway_link: 'major',
  trunk: 'major',
  trunk_link: 'major',
  primary: 'major',
  primary_link: 'major',
  secondary: 'medium',
  secondary_link: 'medium',
  tertiary: 'minor',
  tertiary_link: 'minor',
  residential: 'minor',
  unclassified: 'minor',
  living_street: 'minor',
  service: 'minor',
};

const DENSITY_TOLERANCE: Record<SketchDensity, number> = {
  minimal: 7,
  standard: 5,
  detailed: 3,
};

const AREA_TOLERANCE = 4;
const FRAME_MARGIN = 60;
const MAX_STATIONS = 4;
const MAX_ROADS = 3000;
/** 초대장 data.json이 지나치게 커지지 않도록 전체 좌표 수를 제한한다. */
const MAX_TOTAL_POINTS = 40000;

const EXIT_PATTERN = /^(.+?역)\s*(\d{1,2})\s*번\s*출구?/;
const STATION_CODE_PATTERN = /^\d{2,4}$/;

export interface BuildSketchMapParams {
  lat: number;
  lng: number;
  radius: number;
  density: SketchDensity;
  generatedAt?: string;
}

interface StationAccumulator {
  name: string;
  code?: string;
  exits: Set<string>;
  stationPosition?: { lat: number; lng: number };
  entrancePositions: { lat: number; lng: number }[];
}

export function buildSketchMapFromOverpass(
  elements: OverpassElement[],
  { lat, lng, radius, density, generatedAt }: BuildSketchMapParams
): SketchMapData {
  const frame = { lat, lng, radius };
  const allowedHighways = new Set(highwayClassesForDensity(density));
  const roadTolerance = DENSITY_TOLERANCE[density];

  const roads: SketchRoad[] = [];
  const areas: SketchArea[] = [];
  const seenRoads = new Set<string>();
  const seenAreas = new Set<string>();
  const stations = new Map<string, StationAccumulator>();

  for (const element of elements) {
    if (element.type === 'node') {
      collectStationNode(element, stations);
      continue;
    }
    if (element.type !== 'way') continue;

    const geometry = element.geometry;
    if (!Array.isArray(geometry) || geometry.length < 2) continue;

    const projected = geometry
      .filter(point => Number.isFinite(point?.lat) && Number.isFinite(point?.lon))
      .map(point => projectPoint(point.lat, point.lon, frame));
    if (projected.length < 2) continue;
    if (
      !projected.some(point =>
        isPointInFrame(point, SKETCH_VIEWBOX_SIZE, FRAME_MARGIN)
      )
    ) {
      continue;
    }

    const tags = element.tags ?? {};
    const highway = tags.highway;
    if (highway) {
      if (!allowedHighways.has(highway)) continue;
      const roadClass = HIGHWAY_CLASS_MAP[highway] ?? 'minor';
      const encoded = encodePoints(
        simplifyPolyline(projected, roadTolerance)
      );
      if (!encoded) continue;
      const key = `${roadClass}:${encoded}`;
      if (seenRoads.has(key)) continue;
      seenRoads.add(key);
      if (roads.length < MAX_ROADS) roads.push({ c: roadClass, p: encoded });
      continue;
    }

    const areaKind =
      tags.leisure === 'park' || tags.leisure === 'garden'
        ? 'park'
        : tags.natural === 'water' ||
            tags.waterway === 'river' ||
            tags.waterway === 'stream' ||
            tags.waterway === 'canal'
          ? 'water'
          : null;
    if (!areaKind) continue;

    const closed = isClosedPolyline(projected, 12);
    // 공원은 면(폴리곤)만, 하천은 선형도 허용한다.
    const areaEncoded = encodePoints(
      simplifyPolyline(projected, AREA_TOLERANCE)
    );
    if (!areaEncoded) continue;
    const key = `${areaKind}:${closed ? 1 : 0}:${areaEncoded}`;
    if (seenAreas.has(key)) continue;
    seenAreas.add(key);
    areas.push({ k: areaKind, p: areaEncoded, a: closed ? 1 : 0 });
  }

  return {
    v: SKETCH_MAP_VERSION,
    lat,
    lng,
    radius,
    density,
    roads: applyPointBudget(roads),
    areas,
    stations: resolveStations(stations, { lat, lng, radius }),
    generatedAt: generatedAt ?? new Date().toISOString(),
  };
}

/**
 * 좌표 예산을 넘기면 우선순위가 낮은 이면도로부터 덜어낸다.
 * 간선도로는 약도의 뼈대이므로 항상 남긴다.
 */
function applyPointBudget(roads: SketchRoad[]): SketchRoad[] {
  const countPoints = (road: SketchRoad) => road.p.split(' ').length;
  const total = roads.reduce((sum, road) => sum + countPoints(road), 0);
  if (total <= MAX_TOTAL_POINTS) return roads;

  const allowed = new Set<SketchRoad>();
  let used = 0;
  for (const roadClass of ['major', 'medium', 'minor'] as SketchRoadClass[]) {
    for (const road of roads) {
      if (road.c !== roadClass) continue;
      const points = countPoints(road);
      if (used + points > MAX_TOTAL_POINTS) continue;
      allowed.add(road);
      used += points;
    }
  }
  return roads.filter(road => allowed.has(road));
}

function collectStationNode(
  element: OverpassElement,
  stations: Map<string, StationAccumulator>
) {
  const tags = element.tags ?? {};
  const isEntrance = tags.railway === 'subway_entrance';
  const isStation =
    (tags.railway === 'station' && tags.station === 'subway') ||
    (tags.public_transport === 'station' && tags.subway === 'yes');
  if (!isEntrance && !isStation) return;
  if (!Number.isFinite(element.lat) || !Number.isFinite(element.lon)) return;

  const position = { lat: element.lat as number, lng: element.lon as number };

  if (isStation) {
    const rawName = (tags.name ?? '').trim();
    if (!rawName) return;
    const name = normalizeStationName(rawName);
    const accumulator = getAccumulator(stations, name);
    accumulator.stationPosition ??= position;
    const code = (tags.ref ?? '').trim();
    if (!accumulator.code && STATION_CODE_PATTERN.test(code)) {
      accumulator.code = code;
    }
    return;
  }

  const label = (tags.description ?? tags.name ?? '').trim();
  const parsed = parseStationLabel(label);
  if (!parsed) return;
  const accumulator = getAccumulator(stations, parsed.name);
  if (parsed.exit) accumulator.exits.add(parsed.exit);
  accumulator.entrancePositions.push(position);
}

/** "언주역 2번출구" → { name: '언주역', exit: '2' } */
export function parseStationLabel(
  label: string
): { name: string; exit?: string } | null {
  const trimmed = label.trim();
  if (!trimmed) return null;
  const matched = trimmed.match(EXIT_PATTERN);
  if (matched) {
    return { name: normalizeStationName(matched[1]), exit: matched[2] };
  }
  if (trimmed.endsWith('역')) {
    return { name: normalizeStationName(trimmed) };
  }
  return null;
}

/** "언주" → "언주역" (한글 역명에만 역 접미사 부여) */
export function normalizeStationName(name: string): string {
  const trimmed = name.replace(/\s+/g, ' ').trim();
  if (!trimmed) return trimmed;
  if (trimmed.endsWith('역')) return trimmed;
  if (/[가-힣]/.test(trimmed)) return `${trimmed}역`;
  return trimmed;
}

function stationKey(name: string): string {
  return name.replace(/\s+/g, '').replace(/역$/, '');
}

function getAccumulator(
  stations: Map<string, StationAccumulator>,
  name: string
): StationAccumulator {
  const key = stationKey(name);
  const existing = stations.get(key);
  if (existing) {
    // "언주역"처럼 역 접미사가 붙은 표기를 우선 사용한다.
    if (name.endsWith('역') && !existing.name.endsWith('역')) {
      existing.name = name;
    }
    return existing;
  }
  const created: StationAccumulator = {
    name,
    exits: new Set<string>(),
    entrancePositions: [],
  };
  stations.set(key, created);
  return created;
}

function resolveStations(
  stations: Map<string, StationAccumulator>,
  frame: { lat: number; lng: number; radius: number }
): SketchStation[] {
  const resolved: (SketchStation & { distance: number })[] = [];

  for (const station of stations.values()) {
    const position =
      station.stationPosition ??
      averagePosition(station.entrancePositions) ??
      null;
    if (!position) continue;
    const distance = distanceInMeters(
      frame.lat,
      frame.lng,
      position.lat,
      position.lng
    );
    if (distance > frame.radius * 0.95) continue;
    const point = projectPoint(position.lat, position.lng, {
      lat: frame.lat,
      lng: frame.lng,
      radius: frame.radius,
    });
    if (!isPointInFrame(point, SKETCH_VIEWBOX_SIZE, 0)) continue;

    const exits = [...station.exits]
      .sort((a, b) => Number(a) - Number(b))
      .slice(0, 3);

    resolved.push({
      n: station.name,
      code: station.code,
      exits,
      x: Math.round(point.x),
      y: Math.round(point.y),
      distance,
    });
  }

  resolved.sort((a, b) => a.distance - b.distance);

  return resolved.slice(0, MAX_STATIONS).map(({ distance: _d, ...rest }) => rest);
}

function averagePosition(
  positions: { lat: number; lng: number }[]
): { lat: number; lng: number } | null {
  if (positions.length === 0) return null;
  const sum = positions.reduce(
    (acc, position) => ({
      lat: acc.lat + position.lat,
      lng: acc.lng + position.lng,
    }),
    { lat: 0, lng: 0 }
  );
  return {
    lat: sum.lat / positions.length,
    lng: sum.lng / positions.length,
  };
}
