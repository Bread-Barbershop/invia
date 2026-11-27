'use client';

import { useEffect, useEffectEvent, useState } from 'react';

import {
  isSketchMapData,
  matchesSketchMapSettings,
  type SketchMapData,
  type SketchMapSettings,
} from '@/shared/map/sketch/sketchTypes';

const GENERATION_DELAY_MS = 250;
const CLIENT_TIMEOUT_MS = 40000;

export function useSketchMapGenerator(
  { lat, lng, radius, density }: SketchMapSettings,
  onGenerated: (data: SketchMapData) => void
) {
  const [attempt, setAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const saveSketch = useEffectEvent(onGenerated);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const startTimer = setTimeout(async () => {
      const timeout = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

      try {
        const query = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
          radius: String(radius),
          density,
        });
        const response = await fetch(`/api/map/sketch?${query}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          data?: unknown;
          message?: string;
        } | null;

        if (!active) return;

        if (
          !response.ok ||
          !payload?.ok ||
          !isSketchMapData(payload.data) ||
          !matchesSketchMapSettings(payload.data, { lat, lng, radius, density })
        ) {
          setErrorMessage(
            payload?.message ?? '약도를 만들지 못했어요. 잠시 후 다시 시도해 주세요.'
          );
          return;
        }

        saveSketch(payload.data);
      } catch {
        if (!active) return;
        setErrorMessage(
          controller.signal.aborted
            ? '약도 생성이 시간 안에 끝나지 않았어요. 잠시 후 다시 시도해 주세요.'
            : '약도 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
        );
      } finally {
        clearTimeout(timeout);
      }
    }, GENERATION_DELAY_MS);

    return () => {
      active = false;
      clearTimeout(startTimer);
      controller.abort();
    };
  }, [attempt, lat, lng, radius, density]);

  const retry = () => {
    setErrorMessage(null);
    setAttempt(count => count + 1);
  };

  return { errorMessage, retry };
}
