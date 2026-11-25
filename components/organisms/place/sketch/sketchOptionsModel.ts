import { SKETCH_PALETTE_DEFAULT } from '@/shared/map/sketch/palettes';
import {
  SKETCH_DENSITIES,
  SKETCH_RADIUS_DEFAULT,
  SKETCH_RADIUS_MAX,
  SKETCH_RADIUS_MIN,
  isSketchMapData,
  type SketchDensity,
  type SketchMapData,
  type SketchMapStyle,
} from '@/shared/map/sketch/sketchTypes';

/** place 블록이 약도 기능을 위해 추가로 보관하는 props. */
export interface PlaceSketchProps {
  /** 기존 인터랙티브 지도(naver) / 미니멀 약도(sketch) */
  mapStyle: SketchMapStyle;
  /** 생성된 약도 형상 데이터 (초대장 data.json에 함께 저장) */
  sketch: SketchMapData | null;
  sketchPalette: string;
  sketchRadius: number;
  sketchDensity: SketchDensity;
  sketchShowStations: boolean;
  sketchShowLabel: boolean;
  sketchShowScale: boolean;
}

export const PLACE_SKETCH_DEFAULTS: PlaceSketchProps = {
  mapStyle: 'naver',
  sketch: null,
  sketchPalette: SKETCH_PALETTE_DEFAULT,
  sketchRadius: SKETCH_RADIUS_DEFAULT,
  sketchDensity: 'standard',
  sketchShowStations: true,
  sketchShowLabel: true,
  sketchShowScale: true,
};

export function normalizeSketchDensity(value: unknown): SketchDensity {
  return SKETCH_DENSITIES.includes(value as SketchDensity)
    ? (value as SketchDensity)
    : PLACE_SKETCH_DEFAULTS.sketchDensity;
}

export function normalizeSketchRadius(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return PLACE_SKETCH_DEFAULTS.sketchRadius;
  }
  return Math.min(
    SKETCH_RADIUS_MAX,
    Math.max(SKETCH_RADIUS_MIN, Math.round(value))
  );
}

/** 저장된 블록(구버전 포함)에서 약도 설정을 안전하게 복원한다. */
export function resolvePlaceSketchProps(props: {
  mapStyle?: unknown;
  sketch?: unknown;
  sketchPalette?: unknown;
  sketchRadius?: unknown;
  sketchDensity?: unknown;
  sketchShowStations?: unknown;
  sketchShowLabel?: unknown;
  sketchShowScale?: unknown;
}): PlaceSketchProps {
  return {
    mapStyle: props.mapStyle === 'sketch' ? 'sketch' : 'naver',
    sketch: isSketchMapData(props.sketch) ? props.sketch : null,
    sketchPalette:
      typeof props.sketchPalette === 'string' && props.sketchPalette
        ? props.sketchPalette
        : PLACE_SKETCH_DEFAULTS.sketchPalette,
    sketchRadius: normalizeSketchRadius(props.sketchRadius),
    sketchDensity: normalizeSketchDensity(props.sketchDensity),
    sketchShowStations:
      typeof props.sketchShowStations === 'boolean'
        ? props.sketchShowStations
        : PLACE_SKETCH_DEFAULTS.sketchShowStations,
    sketchShowLabel:
      typeof props.sketchShowLabel === 'boolean'
        ? props.sketchShowLabel
        : PLACE_SKETCH_DEFAULTS.sketchShowLabel,
    sketchShowScale:
      typeof props.sketchShowScale === 'boolean'
        ? props.sketchShowScale
        : PLACE_SKETCH_DEFAULTS.sketchShowScale,
  };
}
