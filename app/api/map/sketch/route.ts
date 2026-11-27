import { NextResponse } from 'next/server';

import { buildSketchMapFromOverpass } from '@/shared/map/sketch/buildSketchMap';
import {
  OVERPASS_ENDPOINTS,
  OVERPASS_USER_AGENT,
  buildOverpassQuery,
  type OverpassElement,
} from '@/shared/map/sketch/overpass';
import { parseSketchRequest } from '@/shared/map/sketch/sketchRequest';
import type { SketchMapData } from '@/shared/map/sketch/sketchTypes';

/** Overpass가 느려도 편집기를 붙잡지 않도록 전체 대기 시간을 제한한다. */
export const maxDuration = 60;

const UPSTREAM_TIMEOUT_MS = 22000;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const CACHE_CONTROL = 'public, s-maxage=604800, stale-while-revalidate=86400';

interface CacheEntry {
  at: number;
  data: SketchMapData;
}

const sketchCache = new Map<string, CacheEntry>();

function readCache(key: string): SketchMapData | null {
  const entry = sketchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    sketchCache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key: string, data: SketchMapData) {
  sketchCache.set(key, { at: Date.now(), data });
  while (sketchCache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = sketchCache.keys().next().value;
    if (oldestKey === undefined) break;
    sketchCache.delete(oldestKey);
  }
}

class OverpassUnavailableError extends Error {
  readonly attempts: string[];

  constructor(message: string, attempts: string[]) {
    super(message);
    this.name = 'OverpassUnavailableError';
    this.attempts = attempts;
  }
}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = (error as { cause?: { code?: string; message?: string } }).cause;
  const causeText = cause?.code ?? cause?.message;
  return causeText ? `${error.name}: ${error.message} (${causeText})` : `${error.name}: ${error.message}`;
}

/**
 * 공개 Overpass 미러 여러 곳에 동시에 요청해 가장 먼저 성공한 응답을 쓴다.
 * 한 곳이 막히거나 느려도 나머지가 응답하면 약도를 만들 수 있다.
 */
async function fetchOverpassElements(
  query: string
): Promise<{ elements: OverpassElement[]; attempts: string[] }> {
  const attempts: string[] = [];
  const controllers = OVERPASS_ENDPOINTS.map(() => new AbortController());

  const tasks = OVERPASS_ENDPOINTS.map(async (endpoint, index) => {
    const controller = controllers[index];
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': OVERPASS_USER_AGENT,
        },
        body: new URLSearchParams({ data: query }).toString(),
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!response.ok) {
        attempts.push(`${endpoint} ${response.status}`);
        throw new Error(`${endpoint} responded with ${response.status}`);
      }

      const payload = (await response.json()) as {
        elements?: OverpassElement[];
      };
      if (!Array.isArray(payload?.elements)) {
        attempts.push(`${endpoint} invalid-payload`);
        throw new Error(`${endpoint} payload is missing elements`);
      }
      attempts.push(`${endpoint} ok`);
      return payload.elements;
    } catch (error) {
      attempts.push(`${endpoint} ${describeError(error)}`);
      throw error;
    } finally {
      clearTimeout(timer);
    }
  });

  try {
    const elements = await new Promise<OverpassElement[]>((resolve, reject) => {
      let pending = tasks.length;
      for (const task of tasks) {
        task.then(resolve).catch(() => {
          pending -= 1;
          if (pending === 0) reject(new Error('all Overpass mirrors failed'));
        });
      }
    });
    return { elements, attempts };
  } catch (error) {
    throw new OverpassUnavailableError(describeError(error), attempts);
  } finally {
    controllers.forEach(controller => controller.abort());
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = parseSketchRequest(searchParams);

  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, code: 'invalid_params', message: parsed.message },
      { status: 400 }
    );
  }

  const { lat, lng, radius, density } = parsed.value;
  const cacheKey = `${lat},${lng},${radius},${density}`;

  const cached = readCache(cacheKey);
  if (cached) {
    return NextResponse.json(
      { ok: true, data: cached },
      { headers: { 'Cache-Control': CACHE_CONTROL, 'X-Sketch-Cache': 'hit' } }
    );
  }

  try {
    const { elements } = await fetchOverpassElements(
      buildOverpassQuery({ lat, lng, radius, density })
    );
    const data = buildSketchMapFromOverpass(elements, {
      lat,
      lng,
      radius,
      density,
    });

    if (data.roads.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          code: 'no_road_data',
          message:
            '이 위치의 도로 정보를 찾지 못했어요. 반경을 넓히거나 잠시 후 다시 시도해 주세요.',
        },
        { status: 422 }
      );
    }

    writeCache(cacheKey, data);

    return NextResponse.json(
      { ok: true, data },
      { headers: { 'Cache-Control': CACHE_CONTROL, 'X-Sketch-Cache': 'miss' } }
    );
  } catch (error) {
    console.error('[map/sketch] Overpass 요청 실패', {
      message: error instanceof Error ? error.message : String(error),
      attempts:
        error instanceof OverpassUnavailableError ? error.attempts : undefined,
      lat,
      lng,
      radius,
      density,
    });
    return NextResponse.json(
      {
        ok: false,
        code: 'upstream_unavailable',
        message:
          '약도 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        detail:
          error instanceof OverpassUnavailableError
            ? error.attempts
            : undefined,
      },
      { status: 503 }
    );
  }
}
