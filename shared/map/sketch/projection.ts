/**
 * 약도 좌표 투영·단순화 유틸.
 *
 * 위경도를 예식장 기준의 평면(등장방형 근사)으로 옮긴 뒤,
 * 1000x1000 뷰박스 정수 좌표로 정규화한다. 1 unit ≈ radius / 500 m.
 */

import { SKETCH_VIEWBOX_SIZE } from './sketchTypes';

export interface SketchPoint {
  x: number;
  y: number;
}

const EARTH_RADIUS_M = 6378137;
const toRad = (deg: number) => (deg * Math.PI) / 180;

export interface ProjectionFrame {
  lat: number;
  lng: number;
  radius: number;
  size?: number;
}

/** 위경도 → 뷰박스 좌표(북쪽이 위). */
export function projectPoint(
  lat: number,
  lng: number,
  frame: ProjectionFrame
): SketchPoint {
  const size = frame.size ?? SKETCH_VIEWBOX_SIZE;
  const half = size / 2;
  const metersPerUnit = frame.radius / half;
  const dLat = (lat - frame.lat) * (Math.PI / 180) * EARTH_RADIUS_M;
  const dLng =
    (lng - frame.lng) *
    (Math.PI / 180) *
    Math.cos(toRad(frame.lat)) *
    EARTH_RADIUS_M;

  return {
    x: half + dLng / metersPerUnit,
    y: half - dLat / metersPerUnit,
  };
}

/** 서로 다른 두 점 사이의 뷰박스 단위 거리. */
export function pointDistance(a: SketchPoint, b: SketchPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** 점이 프레임(여유 margin 포함) 안쪽에 있는지 확인한다. */
export function isPointInFrame(
  point: SketchPoint,
  size = SKETCH_VIEWBOX_SIZE,
  margin = 0
): boolean {
  return (
    point.x >= -margin &&
    point.x <= size + margin &&
    point.y >= -margin &&
    point.y <= size + margin
  );
}

/**
 * Douglas–Peucker 폴리라인 단순화.
 * 좌표를 반올림해 저장하므로 tolerance 이하의 흔들림은 제거한다.
 */
export function simplifyPolyline(
  points: SketchPoint[],
  tolerance: number
): SketchPoint[] {
  if (points.length <= 2 || tolerance <= 0) return points;

  const keep = new Array<boolean>(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;

  const stack: [number, number][] = [[0, points.length - 1]];

  while (stack.length > 0) {
    const [start, end] = stack.pop() as [number, number];
    let maxDistance = -1;
    let maxIndex = -1;
    for (let index = start + 1; index < end; index += 1) {
      const distance = perpendicularDistance(
        points[index],
        points[start],
        points[end]
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = index;
      }
    }
    if (maxDistance > tolerance && maxIndex > 0) {
      keep[maxIndex] = true;
      stack.push([start, maxIndex], [maxIndex, end]);
    }
  }

  return points.filter((_, index) => keep[index]);
}

function perpendicularDistance(
  point: SketchPoint,
  start: SketchPoint,
  end: SketchPoint
): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return pointDistance(point, start);
  const numerator = Math.abs(
    dy * point.x - dx * point.y + end.x * start.y - end.y * start.x
  );
  return numerator / Math.hypot(dx, dy);
}

/** 좌표 목록을 "x,y x,y" 문자열로 압축한다. */
export function encodePoints(points: SketchPoint[]): string {
  return points
    .map(point => `${Math.round(point.x)},${Math.round(point.y)}`)
    .join(' ');
}

/** "x,y x,y" 문자열을 좌표 목록으로 복원한다. 잘못된 값은 건너뛴다. */
export function decodePoints(encoded: string): SketchPoint[] {
  if (!encoded) return [];
  const points: SketchPoint[] = [];
  for (const chunk of encoded.split(' ')) {
    const [x, y] = chunk.split(',');
    const nx = Number(x);
    const ny = Number(y);
    if (!Number.isFinite(nx) || !Number.isFinite(ny)) continue;
    points.push({ x: nx, y: ny });
  }
  return points;
}

/** "x,y x,y" 문자열을 SVG path 데이터로 변환한다. */
export function encodedToPath(encoded: string, close = false): string {
  const points = decodePoints(encoded);
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  const segments = rest.map(point => `L${point.x} ${point.y}`).join(' ');
  const path = `M${first.x} ${first.y}${segments ? ` ${segments}` : ''}`;
  return close ? `${path} Z` : path;
}

/** 폴리라인의 닫힘 여부(면 여부)를 판별한다. */
export function isClosedPolyline(points: SketchPoint[], tolerance = 6): boolean {
  if (points.length < 3) return false;
  return pointDistance(points[0], points[points.length - 1]) <= tolerance;
}
