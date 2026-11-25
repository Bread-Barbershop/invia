'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { Selector } from '@/components/molecules/selector';
import {
  SKETCH_PALETTE_KEYS,
  SKETCH_PALETTES,
  resolveSketchPalette,
} from '@/shared/map/sketch/palettes';
import {
  SKETCH_DENSITIES,
  SKETCH_DENSITY_LABELS,
  SKETCH_RADIUS_PRESETS,
  isSketchMapData,
  isSketchOutdated,
  type SketchDensity,
  type SketchMapStyle,
} from '@/shared/map/sketch/sketchTypes';
import { cn } from '@/shared/utils/cn';

import { hasPlaceCoordinates } from '../placeCoordinates';


import { SketchErrorBoundary } from './SketchErrorBoundary';
import { SketchMapSvg } from './SketchMapSvg';
import { useSketchMapGenerator } from './useSketchMapGenerator';

import type { PlaceSketchProps } from './sketchOptionsModel';

const MAP_STYLE_OPTIONS: { value: SketchMapStyle; label: string }[] = [
  { value: 'naver', label: '지도' },
  { value: 'sketch', label: '미니멀 약도' },
];

export function SketchMapModeTabs({
  value,
  onChange,
  className,
}: {
  value: SketchMapStyle;
  onChange: (value: SketchMapStyle) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="지도 스타일"
      className={cn(
        'flex w-full items-center gap-0.5 rounded-lg bg-bg-sub p-0.5',
        className
      )}
    >
      {MAP_STYLE_OPTIONS.map(option => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-[12px] transition-colors',
              active
                ? 'bg-bg-base font-semibold text-text-primary shadow-btn-drop-black'
                : 'text-text-tertiary enabled:hover:text-text-primary'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export interface SketchMapPanelProps {
  lat: number;
  lng: number;
  venueLabel: string;
  props: PlaceSketchProps;
  onChange: (patch: Partial<PlaceSketchProps>) => void;
}

/**
 * 미니멀 약도 편집 패널.
 * 팔레트·반경·밀도·표시 항목을 고르고, OpenStreetMap 데이터로 약도를 생성한다.
 */
export function SketchMapPanel({
  lat,
  lng,
  venueLabel,
  props,
  onChange,
}: SketchMapPanelProps) {
  const {
    sketch,
    sketchPalette,
    sketchRadius,
    sketchDensity,
    sketchShowStations,
    sketchShowLabel,
    sketchShowScale,
  } = props;

  const hasCoords = hasPlaceCoordinates(lng, lat);
  const autoRequested = useRef(false);
  const validSketch = isSketchMapData(sketch) ? sketch : null;

  const handleGenerated = useCallback(
    (data: PlaceSketchProps['sketch']) => {
      onChange({ sketch: data });
    },
    [onChange]
  );

  const { status, errorMessage, generate } =
    useSketchMapGenerator(handleGenerated);

  useEffect(() => {
    if (!hasCoords || validSketch || autoRequested.current) return;
    autoRequested.current = true;
    void generate({
      lat,
      lng,
      radius: sketchRadius,
      density: sketchDensity,
    });
  }, [hasCoords, validSketch, generate, lat, lng, sketchRadius, sketchDensity]);

  const palette = resolveSketchPalette(sketchPalette);
  const outdated =
    validSketch !== null &&
    isSketchOutdated(validSketch, { lat, lng }, sketchRadius);
  const isLoading = status === 'loading';

  const regenerate = () => {
    if (!hasCoords) return;
    void generate({ lat, lng, radius: sketchRadius, density: sketchDensity });
  };

  const updateDensity = (value: string) => {
    if (!SKETCH_DENSITIES.includes(value as SketchDensity)) return;
    onChange({ sketchDensity: value as SketchDensity });
  };

  return (
    <section
      className="flex w-full flex-col gap-2 rounded-lg border border-border-neutral p-2.5"
      aria-label="미니멀 약도 설정"
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-text-primary">
          종이 약도
        </span>
        <UtilityButton
          type="button"
          size="sm"
          onClick={regenerate}
          disabled={!hasCoords || isLoading}
          aria-label={validSketch ? '약도 다시 만들기' : '약도 만들기'}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          <span className="text-[12px]">
            {validSketch ? '다시 만들기' : '약도 만들기'}
          </span>
        </UtilityButton>
      </div>

      {!hasCoords && (
        <p className="rounded-md bg-bg-sub px-2 py-1.5 text-[12px] text-text-secondary">
          주소를 먼저 선택하면 예식장 주변 약도를 만들 수 있어요.
        </p>
      )}

      {hasCoords && !validSketch && (
        <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-border-neutral bg-bg-sub">
          <p className="px-4 text-center text-[12px] leading-relaxed text-text-secondary">
            {isLoading
              ? '예식장 주변 도로를 그리는 중이에요. 잠시만 기다려 주세요.'
              : status === 'error'
                ? '약도를 만들지 못했어요. 위의 ‘약도 만들기’로 다시 시도해 주세요.'
                : '약도를 아직 만들지 않았어요.'}
          </p>
        </div>
      )}

      {hasCoords && validSketch && (
        <>
          <div className="w-full overflow-hidden rounded-lg border border-border-neutral">
            <SketchErrorBoundary
              label="panel"
              fallback={
                <p className="flex aspect-square w-full items-center justify-center px-4 text-center text-[12px] leading-relaxed text-text-secondary">
                  약도를 표시하지 못했어요. ‘다시 만들기’로 다시 시도해 주세요.
                </p>
              }
            >
              <SketchMapSvg
                data={validSketch}
                palette={palette}
                showStations={sketchShowStations}
                showVenueLabel={sketchShowLabel}
                showScale={sketchShowScale}
                venueLabel={venueLabel}
                ariaLabel={`${venueLabel || '행사장'} 약도`}
              />
            </SketchErrorBoundary>
          </div>
          {outdated && (
            <p className="rounded-md bg-status-warning-bg px-2 py-1.5 text-[11px] leading-relaxed text-text-secondary">
              주소나 반경이 바뀌었어요. ‘다시 만들기’를 눌러 약도를 갱신해
              주세요.
            </p>
          )}
        </>
      )}

      {hasCoords && isLoading && validSketch && (
        <p className="text-[11px] text-text-secondary">약도를 다시 그리는 중…</p>
      )}

      {hasCoords && status === 'error' && (
        <p
          role="status"
          className="rounded-md bg-status-error-bg px-2 py-1.5 text-[11px] leading-relaxed text-text-secondary"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex w-full items-center gap-1.5">
        {SKETCH_PALETTE_KEYS.map(key => {
          const option = SKETCH_PALETTES[key];
          const active = key === sketchPalette;
          return (
            <button
              key={key}
              type="button"
              aria-label={`${option.name} 팔레트`}
              aria-pressed={active}
              onClick={() => onChange({ sketchPalette: key })}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 rounded-md border px-1 py-1.5 transition-colors',
                active
                  ? 'border-primary bg-primary-hover'
                  : 'border-border-neutral enabled:hover:bg-btn-hover'
              )}
            >
              <span
                aria-hidden
                className="flex h-5 w-5 items-center justify-center rounded-full border"
                style={{
                  backgroundColor: option.paper,
                  borderColor: option.accent,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: option.accent }}
                />
              </span>
              <span className="text-[10px] leading-none text-text-secondary">
                {option.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full items-center gap-2">
        <span className="w-8 shrink-0 text-[12px] font-semibold text-text-primary">
          반경
        </span>
        <Selector
          className="w-[92px]"
          ariaLabel="약도 반경"
          options={SKETCH_RADIUS_PRESETS.map(radius => ({
            value: String(radius),
            label: `${radius}m`,
          }))}
          selected={{
            value: String(sketchRadius),
            label: `${sketchRadius}m`,
          }}
          onSelect={option => onChange({ sketchRadius: Number(option.value) })}
        />
        <span className="w-8 shrink-0 text-[12px] font-semibold text-text-primary">
          밀도
        </span>
        <Selector
          className="w-[92px]"
          ariaLabel="약도 밀도"
          options={SKETCH_DENSITIES.map(density => ({
            value: density,
            label: SKETCH_DENSITY_LABELS[density],
          }))}
          selected={{
            value: sketchDensity,
            label: SKETCH_DENSITY_LABELS[sketchDensity],
          }}
          onSelect={option => updateDensity(option.value)}
        />
      </div>

      <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5">
        <Checkbox
          direction="right"
          onChange={event =>
            onChange({ sketchShowStations: event.target.checked })
          }
          checked={sketchShowStations}
        >
          <span className="text-[12px]">지하철역 표시</span>
        </Checkbox>
        <Checkbox
          direction="right"
          onChange={event => onChange({ sketchShowLabel: event.target.checked })}
          checked={sketchShowLabel}
        >
          <span className="text-[12px]">장소 이름</span>
        </Checkbox>
        <Checkbox
          direction="right"
          onChange={event => onChange({ sketchShowScale: event.target.checked })}
          checked={sketchShowScale}
        >
          <span className="text-[12px]">축척·방위</span>
        </Checkbox>
      </div>

      {hasCoords && validSketch?.stations.length === 0 && sketchShowStations && (
        <p role="status" className="text-[11px] text-text-tertiary">
          반경 안에 지하철역이 없어 역 표시는 생략되었어요.
        </p>
      )}
    </section>
  );
}
