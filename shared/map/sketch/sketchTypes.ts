/**
 * 미니멀 약도(SVG) 데이터 모델.
 *
 * 초대장 data.json에 그대로 저장되므로 필드명을 짧게 유지한다.
 * 좌표는 1000x1000 뷰박스 기준 정수 단위(1 unit ≈ radius / 500 m)로 저장한다.
 */

export const SKETCH_MAP_VERSION = 1;
export const SKETCH_VIEWBOX_SIZE = 1000;
export const SKETCH_RADIUS_MIN = 200;
export const SKETCH_RADIUS_MAX = 1200;
export const SKETCH_RADIUS_DEFAULT = 500;
export const SKETCH_RADIUS_PRESETS = [300, 500, 800] as const;

export const SKETCH_DENSITIES = ['minimal', 'standard', 'detailed'] as const;
export type SketchDensity = (typeof SKETCH_DENSITIES)[number];
export const SKETCH_DENSITY_LABELS: Record<SketchDensity, string> = {
  minimal: '간략',
  standard: '기본',
  detailed: '상세',
};

export const SKETCH_MAP_STYLES = ['naver', 'sketch'] as const;
export type SketchMapStyle = (typeof SKETCH_MAP_STYLES)[number];

export type SketchRoadClass = 'major' | 'medium' | 'minor';
export type SketchAreaKind = 'water' | 'park';

export interface SketchRoad {
  /** 도로 등급: major(주요 간선) / medium(보조 간선) / minor(이면도로) */
  c: SketchRoadClass;
  /** "x,y x,y ..." 형태의 정수 좌표 목록 */
  p: string;
}

export interface SketchArea {
  /** water(하천·수변) / park(공원·정원) */
  k: SketchAreaKind;
  p: string;
  /** 1이면 폐곡선(면), 0이면 선형(하천) */
  a: 0 | 1;
}

export interface SketchStation {
  /** 역명 (예: 언주역) */
  n: string;
  /** 역 번호 (예: 926) */
  code?: string;
  /** 가까운 출구 번호 (오름차순, 최대 3개) */
  exits: string[];
  x: number;
  y: number;
}

export interface SketchMapData {
  v: number;
  lat: number;
  lng: number;
  radius: number;
  density: SketchDensity;
  roads: SketchRoad[];
  areas: SketchArea[];
  stations: SketchStation[];
  generatedAt?: string;
}

const MAX_ROADS = 3000;
const MAX_AREAS = 800;
const MAX_STATIONS = 8;
const MAX_POINT_STRING = 20000;

const ROAD_CLASSES: SketchRoadClass[] = ['major', 'medium', 'minor'];
const AREA_KINDS: SketchAreaKind[] = ['water', 'park'];

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isPointString = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_POINT_STRING &&
  /^-?\d+,-?\d+( -?\d+,-?\d+)*$/.test(value);

/**
 * 저장된(또는 서버에서 받은) 값이 약도 데이터로 안전하게 렌더링 가능한지 확인한다.
 * 초대장 데이터는 사용자가 편집·복제할 수 있으므로 느슨하지만 확실하게 검사한다.
 */
export function isSketchMapData(value: unknown): value is SketchMapData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<SketchMapData>;

  if (data.v !== SKETCH_MAP_VERSION) return false;
  if (!isFiniteNumber(data.lat) || !isFiniteNumber(data.lng)) return false;
  if (!isFiniteNumber(data.radius) || data.radius <= 0) return false;
  if (!data.density || !SKETCH_DENSITIES.includes(data.density)) return false;

  if (!Array.isArray(data.roads) || data.roads.length > MAX_ROADS) return false;
  for (const road of data.roads) {
    if (!road || typeof road !== 'object') return false;
    if (!ROAD_CLASSES.includes(road.c)) return false;
    if (!isPointString(road.p)) return false;
  }

  if (!Array.isArray(data.areas) || data.areas.length > MAX_AREAS) return false;
  for (const area of data.areas) {
    if (!area || typeof area !== 'object') return false;
    if (!AREA_KINDS.includes(area.k)) return false;
    if (!isPointString(area.p)) return false;
    if (area.a !== 0 && area.a !== 1) return false;
  }

  if (!Array.isArray(data.stations) || data.stations.length > MAX_STATIONS) {
    return false;
  }
  for (const station of data.stations) {
    if (!station || typeof station !== 'object') return false;
    if (typeof station.n !== 'string' || !station.n.trim()) return false;
    if (station.code !== undefined && typeof station.code !== 'string') {
      return false;
    }
    if (!Array.isArray(station.exits)) return false;
    if (!station.exits.every(exit => typeof exit === 'string')) return false;
    if (!isFiniteNumber(station.x) || !isFiniteNumber(station.y)) return false;
  }

  return true;
}

/**
 * 현재 블록 설정과 저장된 약도의 기준점이 일치하는지 확인한다.
 * 주소를 다시 검색한 뒤 이전 약도가 그대로 남아 있는 상황을 감지한다.
 */
export function isSketchOutdated(
  data: SketchMapData | null | undefined,
  center: { lat: number; lng: number },
  radius?: number
): boolean {
  if (!data) return false;
  const moved = distanceInMeters(data.lat, data.lng, center.lat, center.lng) > 40;
  const radiusChanged = radius !== undefined && Math.abs(data.radius - radius) > 1;
  return moved || radiusChanged;
}

/** 두 좌표 사이의 대략적인 거리(m). 약도 반경(1km 내외) 판정에 충분한 정확도. */
export function distanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const EARTH_RADIUS_M = 6378137;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1) * Math.cos(toRad((lat1 + lat2) / 2));
  return Math.sqrt(dLat * dLat + dLng * dLng) * EARTH_RADIUS_M;
}
