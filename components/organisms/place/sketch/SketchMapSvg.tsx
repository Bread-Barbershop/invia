'use client';

import { useId } from 'react';

import type { SketchPalette } from '@/shared/map/sketch/palettes';
import { encodedToPath } from '@/shared/map/sketch/projection';
import {
  SKETCH_VIEWBOX_SIZE,
  type SketchMapData,
  type SketchRoadClass,
} from '@/shared/map/sketch/sketchTypes';
import { cn } from '@/shared/utils/cn';

const SIZE = SKETCH_VIEWBOX_SIZE;
const HALF = SIZE / 2;
const FRAME_INSET = 0.8;
const ROAD_STYLES: Record<
  SketchRoadClass,
  { casing: number; width: number }
> = {
  major: { casing: 11, width: 5.6 },
  medium: { casing: 7.4, width: 3.6 },
  minor: { casing: 0, width: 1.9 },
};

export interface SketchMapSvgProps {
  data: SketchMapData;
  palette: SketchPalette;
  /** 주변 지하철역 배지 표시 */
  showStations?: boolean;
  /** 예식장 이름 라벨 표시 */
  showVenueLabel?: boolean;
  /** 축척·방위 표시 */
  showScale?: boolean;
  venueLabel?: string;
  className?: string;
  /** 접근성용 설명 (기본: "행사장 약도") */
  ariaLabel?: string;
}

/**
 * 종이 청첩장 스타일의 미니멀 약도(SVG).
 *
 * 순수 벡터라 에디터 미리보기와 발행된 초대장에서 동일하게 선명하게 렌더링된다.
 * 저장된 좌표 데이터만 사용하므로 발행 후에는 외부 API에 의존하지 않는다.
 */
export function SketchMapSvg({
  data,
  palette,
  showStations = true,
  showVenueLabel = true,
  showScale = true,
  venueLabel,
  className,
  ariaLabel,
}: SketchMapSvgProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const clipId = `sketch-clip-${uid}`;
  const paperId = `sketch-paper-${uid}`;
  const venueText = (venueLabel ?? '').trim();
  const accessibleLabel =
    ariaLabel ?? (venueText ? `${venueText} 약도` : '행사장 약도');

  const roads: Record<SketchRoadClass, string[]> = {
    minor: [],
    medium: [],
    major: [],
  };
  for (const road of data.roads) {
    const path = encodedToPath(road.p);
    if (path) roads[road.c].push(path);
  }

  const parkAreas = data.areas.filter(area => area.k === 'park');
  const waterAreas = data.areas.filter(area => area.k === 'water');
  const stations = showStations ? data.stations.slice(0, 3) : [];

  const metersPerUnit = data.radius / HALF;
  const scale = resolveScaleBar(metersPerUnit);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={cn('block h-auto w-full select-none', className)}
      role="img"
      aria-label={accessibleLabel}
      style={{ fontFamily: 'inherit' }}
    >
      <title>{accessibleLabel}</title>
      <defs>
        <clipPath id={clipId}>
          <rect
            x={0}
            y={0}
            width={SIZE}
            height={SIZE}
            rx={18}
            ry={18}
          />
        </clipPath>
        <radialGradient id={paperId} cx="50%" cy="46%" r="72%">
          <stop offset="0%" stopColor={palette.paper} />
          <stop offset="100%" stopColor={palette.paperEdge} />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect width={SIZE} height={SIZE} fill={`url(#${paperId})`} />

        {parkAreas.map((area, index) => (
          <path
            key={`park-${index}`}
            d={encodedToPath(area.p, area.a === 1)}
            fill={palette.park}
            stroke={area.a === 1 ? 'none' : palette.park}
            strokeWidth={area.a === 1 ? 0 : 10}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
        ))}

        {waterAreas.map((area, index) => (
          <path
            key={`water-${index}`}
            d={encodedToPath(area.p, area.a === 1)}
            fill={area.a === 1 ? palette.water : 'none'}
            stroke={palette.water}
            strokeWidth={area.a === 1 ? 0 : 9}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.95}
          />
        ))}

        {(['minor', 'medium', 'major'] as SketchRoadClass[]).map(roadClass => {
          const style = ROAD_STYLES[roadClass];
          const color =
            roadClass === 'major'
              ? palette.major
              : roadClass === 'medium'
                ? palette.medium
                : palette.minor;
          return (
            <g key={roadClass} data-sketch-road={roadClass}>
              {style.casing > 0 &&
                roads[roadClass].map((path, index) => (
                  <path
                    key={`casing-${index}`}
                    d={path}
                    fill="none"
                    stroke={palette.paper}
                    strokeWidth={style.casing}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.95}
                  />
                ))}
              {roads[roadClass].map((path, index) => (
                <path
                  key={`road-${index}`}
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={style.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </g>
          );
        })}

        {stations.map((station, index) => (
          <SketchStationMarker
            key={`${station.n}-${index}`}
            station={station}
            palette={palette}
          />
        ))}

        <VenueMarker palette={palette} />

        {showVenueLabel && venueText && (
          <text
            x={HALF}
            y={HALF + 58}
            textAnchor="middle"
            fontSize={30}
            fontWeight={600}
            fill={palette.label}
            stroke={palette.paper}
            strokeWidth={7}
            paintOrder="stroke"
            strokeLinejoin="round"
          >
            {venueText}
          </text>
        )}

        {showScale && (
          <>
            <g data-sketch-scale>
              <line
                x1={56}
                y1={926}
                x2={56 + scale.length}
                y2={926}
                stroke={palette.label}
                strokeWidth={2.4}
                strokeLinecap="round"
                opacity={0.75}
              />
              <line
                x1={56}
                y1={918}
                x2={56}
                y2={934}
                stroke={palette.label}
                strokeWidth={2.4}
                strokeLinecap="round"
                opacity={0.75}
              />
              <line
                x1={56 + scale.length}
                y1={918}
                x2={56 + scale.length}
                y2={934}
                stroke={palette.label}
                strokeWidth={2.4}
                strokeLinecap="round"
                opacity={0.75}
              />
              <text
                x={56}
                y={908}
                fontSize={19}
                fill={palette.label}
                opacity={0.8}
              >
                {scale.label}
              </text>
            </g>
            <g data-sketch-north transform={`translate(${SIZE - 62}, 74)`}>
              <line
                x1={0}
                y1={22}
                x2={0}
                y2={-6}
                stroke={palette.label}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.7}
              />
              <path
                d="M-7 -6 L0 -22 L7 -6 Z"
                fill={palette.label}
                opacity={0.75}
              />
              <text
                x={0}
                y={-30}
                textAnchor="middle"
                fontSize={19}
                letterSpacing={1}
                fill={palette.label}
                opacity={0.85}
              >
                N
              </text>
            </g>
          </>
        )}

        {/* OpenStreetMap ODbL 출처 표기 (발행된 초대장에도 남는다) */}
        <text
          x={SIZE - 26}
          y={SIZE - 22}
          textAnchor="end"
          fontSize={13}
          fill={palette.label}
          opacity={0.5}
        >
          © OpenStreetMap
        </text>
      </g>

      <rect
        x={FRAME_INSET}
        y={FRAME_INSET}
        width={SIZE - FRAME_INSET * 2}
        height={SIZE - FRAME_INSET * 2}
        rx={18}
        ry={18}
        fill="none"
        stroke={palette.frame}
        strokeWidth={1.6}
      />
    </svg>
  );
}

function SketchStationMarker({
  station,
  palette,
}: {
  station: SketchMapData['stations'][number];
  palette: SketchPalette;
}) {
  const labelOnLeft = station.x > SIZE * 0.62;
  const textX = labelOnLeft ? station.x - 24 : station.x + 24;
  const anchor = labelOnLeft ? 'end' : 'start';
  const exitLabel = formatExits(station.exits);

  return (
    <g data-sketch-station>
      <circle
        cx={station.x}
        cy={station.y}
        r={15}
        fill={palette.badge}
        stroke={palette.accent}
        strokeWidth={2.2}
      />
      {station.code ? (
        <text
          x={station.x}
          y={station.y}
          dy="0.34em"
          textAnchor="middle"
          fontSize={14}
          fontWeight={600}
          fill={palette.badgeInk}
        >
          {station.code}
        </text>
      ) : (
        <circle cx={station.x} cy={station.y} r={5.4} fill={palette.accent} />
      )}
      <text
        x={textX}
        y={station.y + 8}
        textAnchor={anchor}
        fontSize={25}
        fontWeight={500}
        fill={palette.label}
        stroke={palette.paper}
        strokeWidth={6}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {station.n}
      </text>
      {exitLabel && (
        <text
          x={textX}
          y={station.y + 30}
          textAnchor={anchor}
          fontSize={16}
          fill={palette.label}
          opacity={0.78}
          stroke={palette.paper}
          strokeWidth={5}
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          {exitLabel}
        </text>
      )}
    </g>
  );
}

function VenueMarker({ palette }: { palette: SketchPalette }) {
  return (
    <g data-sketch-venue transform={`translate(${HALF}, ${HALF})`}>
      <circle r={34} fill={palette.paper} opacity={0.72} />
      <circle r={26} fill="none" stroke={palette.accent} strokeWidth={2} opacity={0.65} />
      <path
        d="M0 15 C-13 4 -21 -3 -21 -12 C-21 -20 -15 -25 -8.5 -25 C-4.5 -25 -1.5 -22.5 0 -19.5 C1.5 -22.5 4.5 -25 8.5 -25 C15 -25 21 -20 21 -12 C21 -3 13 4 0 15 Z"
        fill={palette.accent}
      />
    </g>
  );
}

/** "2·5번 출구" 형태로 가까운 출구를 요약한다. */
export function formatExits(exits: string[]): string {
  if (exits.length === 0) return '';
  return `${exits.join('·')}번 출구`;
}

/** 축척 막대의 길이(뷰박스 단위)와 라벨을 계산한다. */
export function resolveScaleBar(metersPerUnit: number): {
  length: number;
  label: string;
} {
  const candidates = [50, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500];
  const targetMeters = 150 * metersPerUnit;
  const distance = candidates.reduce((best, candidate) =>
    Math.abs(candidate - targetMeters) < Math.abs(best - targetMeters)
      ? candidate
      : best
  );
  const label = distance >= 1000 ? `${distance / 1000} km` : `${distance} m`;
  return { length: distance / metersPerUnit, label };
}
