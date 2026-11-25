'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { isSketchMapData } from '@/shared/map/sketch/sketchTypes';
import type {
  SketchDensity,
  SketchMapData,
} from '@/shared/map/sketch/sketchTypes';

/** Overpass가 느릴 때 편집기가 무한정 기다리지 않도록 하는 클라이언트 제한. */
const CLIENT_TIMEOUT_MS = 40000;

export type SketchGenerateStatus = 'idle' | 'loading' | 'error';

export interface SketchGenerateParams {
  lat: number;
  lng: number;
  radius: number;
  density: SketchDensity;
}

export interface UseSketchMapGeneratorResult {
  status: SketchGenerateStatus;
  errorMessage: string | null;
  generate: (params: SketchGenerateParams) => Promise<void>;
  cancel: () => void;
}

/**
 * /api/map/sketch에서 약도 데이터를 받아온다.
 * 늦게 도착한 이전 요청은 버려서 주소를 연속으로 바꿔도 마지막 결과만 반영된다.
 */
export function useSketchMapGenerator(
  onGenerated: (data: SketchMapData) => void
): UseSketchMapGeneratorResult {
  const [status, setStatus] = useState<SketchGenerateStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const onGeneratedRef = useRef(onGenerated);

  useEffect(() => {
    onGeneratedRef.current = onGenerated;
  }, [onGenerated]);

  useEffect(
    () => () => {
      requestRef.current += 1;
      abortRef.current?.abort();
    },
    []
  );

  const cancel = useCallback(() => {
    requestRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
  }, []);

  const generate = useCallback(async (params: SketchGenerateParams) => {
    const requestId = ++requestRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    setStatus('loading');
    setErrorMessage(null);

    try {
      const query = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        radius: String(params.radius),
        density: params.density,
      });
      const response = await fetch(`/api/map/sketch?${query.toString()}`, {
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        data?: unknown;
        message?: string;
      } | null;

      if (requestId !== requestRef.current) return;

      if (!response.ok || !payload?.ok || !isSketchMapData(payload.data)) {
        setStatus('error');
        setErrorMessage(
          payload?.message ??
            '약도를 만들지 못했어요. 잠시 후 다시 시도해 주세요.'
        );
        return;
      }

      onGeneratedRef.current(payload.data);
      setStatus('idle');
    } catch (error) {
      if (requestId !== requestRef.current) return;
      setStatus('error');
      setErrorMessage(
        error instanceof Error && error.name === 'AbortError'
          ? '약도 생성이 시간 안에 끝나지 않았어요. 잠시 후 다시 시도해 주세요.'
          : '약도 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      clearTimeout(timer);
    }
  }, []);

  return { status, errorMessage, generate, cancel };
}
