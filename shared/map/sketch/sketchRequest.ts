/**
 * /api/map/sketch 요청 파라미터 검증.
 * 라우트와 테스트가 같은 규칙을 공유하도록 분리했다.
 */

import {
  SKETCH_DENSITIES,
  SKETCH_RADIUS_DEFAULT,
  SKETCH_RADIUS_MAX,
  SKETCH_RADIUS_MIN,
  type SketchDensity,
} from './sketchTypes';

export interface SketchRequestParams {
  lat: number;
  lng: number;
  radius: number;
  density: SketchDensity;
}

export type SketchRequestResult =
  | { ok: true; value: SketchRequestParams }
  | { ok: false; message: string };

export function parseSketchRequest(
  searchParams: URLSearchParams
): SketchRequestResult {
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));
  const radiusParam = searchParams.get('radius');
  const radius =
    radiusParam === null || radiusParam === '' ? SKETCH_RADIUS_DEFAULT : Number(radiusParam);
  const densityParam = searchParams.get('density') ?? 'standard';

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { ok: false, message: 'lat 값이 올바르지 않습니다.' };
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { ok: false, message: 'lng 값이 올바르지 않습니다.' };
  }
  if (lat === 0 && lng === 0) {
    return { ok: false, message: '예식장 좌표를 먼저 선택해 주세요.' };
  }
  if (
    !Number.isFinite(radius) ||
    radius < SKETCH_RADIUS_MIN ||
    radius > SKETCH_RADIUS_MAX
  ) {
    return {
      ok: false,
      message: `radius는 ${SKETCH_RADIUS_MIN}~${SKETCH_RADIUS_MAX}m 사이여야 합니다.`,
    };
  }
  if (!SKETCH_DENSITIES.includes(densityParam as SketchDensity)) {
    return { ok: false, message: 'density 값이 올바르지 않습니다.' };
  }

  return {
    ok: true,
    value: {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      radius: Math.round(radius),
      density: densityParam as SketchDensity,
    },
  };
}
