import { Lock, Unlock } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Label } from '@/components/atoms/label';

import type { MouseEvent } from 'react';

type NaverMap = naver.maps.Map;
type Lng = number;
type Lat = number;

const NAVER_MARKER_AREA_SELECTOR = 'map[name^="nmarker"] area';

/**
 * 네이버 지도는 마커를 <img usemap>과 <map><area href="#">로 그린다.
 * 그 area는 경위도만 안내하는 빈 링크라 키보드·스크린리더에 의미 없는
 * 포커스 대상이 된다. 장소 주소는 이미 본문에 글로 있으므로, 마커 링크는
 * 탭 순서와 읽기 순서에서 빼 두자.
 */
export function removeNaverMarkerAreasFromTabOrder(container: HTMLElement) {
  container
    .querySelectorAll<HTMLAreaElement>(NAVER_MARKER_AREA_SELECTOR)
    .forEach(area => {
      if (area.getAttribute('tabindex') !== '-1') {
        area.setAttribute('tabindex', '-1');
      }
      if (area.getAttribute('aria-hidden') !== 'true') {
        area.setAttribute('aria-hidden', 'true');
      }
    });
}

export function PlaceMap({
  lng,
  lat,
  category = '',
  locked = false,
}: {
  lng: Lng;
  lat: Lat;
  category?: string;
  locked?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<NaverMap | null>(null);
  const marker = useRef<naver.maps.Marker | null>(null);
  const [prevLocked, setPrevLocked] = useState(locked);
  const [isLocked, setIsLocked] = useState(locked);
  const isLockedRef = useRef(locked);
  const [mapFailed, setMapFailed] = useState(false);

  const disposeMap = useCallback(() => {
    const currentMarker = marker.current;
    const currentMap = mapInstance.current;
    marker.current = null;
    mapInstance.current = null;

    try {
      currentMarker?.setMap(null);
    } catch (error) {
      console.warn('[PlaceMap] Failed to detach the Naver map marker.', error);
    }

    try {
      currentMap?.destroy();
    } catch (error) {
      console.warn('[PlaceMap] Failed to destroy the Naver map.', error);
    }
  }, []);

  const updateMapStatus = useCallback((failed: boolean) => {
    queueMicrotask(() => {
      if (mapRef.current) setMapFailed(failed);
    });
  }, []);

  const showMapError = useCallback(
    (error: unknown) => {
      console.warn('[PlaceMap] Failed to display the Naver map.', error);
      disposeMap();
      updateMapStatus(true);
    },
    [disposeMap, updateMapStatus]
  );

  if (prevLocked !== locked) {
    setPrevLocked(locked);
    setIsLocked(locked);
  }

  useEffect(() => {
    isLockedRef.current = isLocked;
    if (!mapInstance.current) return;

    try {
      mapInstance.current.setOptions({
        draggable: !isLocked,
        scrollWheel: !isLocked,
        pinchZoom: !isLocked,
        keyboardShortcuts: !isLocked,
        disableDoubleClickZoom: isLocked,
        disableDoubleTapZoom: isLocked,
        disableTwoFingerTapZoom: isLocked,
      });
    } catch (error) {
      showMapError(error);
    }
  }, [isLocked, showMapError]);

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;
    const maps = window.naver?.maps;
    if (!maps) {
      updateMapStatus(true);
      return;
    }

    try {
      const center = new maps.LatLng(lat, lng);
      if (mapInstance.current) {
        mapInstance.current.setCenter(center);
        marker.current?.setPosition(center);
        return;
      }

      const initialLocked = isLockedRef.current;
      mapInstance.current = new maps.Map(container, {
        center,
        zoom: 15,
        scaleControl: false,
        draggable: !initialLocked,
        scrollWheel: !initialLocked,
        pinchZoom: !initialLocked,
        keyboardShortcuts: !initialLocked,
        disableDoubleClickZoom: initialLocked,
        disableDoubleTapZoom: initialLocked,
        disableTwoFingerTapZoom: initialLocked,
      });

      marker.current = new maps.Marker({
        map: mapInstance.current,
        position: center,
      });
      updateMapStatus(false);
    } catch (error) {
      showMapError(error);
    }
  }, [lng, lat, showMapError, updateMapStatus]);

  useEffect(() => disposeMap, [disposeMap]);

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    removeNaverMarkerAreasFromTabOrder(container);

    // 지도는 타일과 마커를 비동기로 다시 그리므로 새로 생긴 마커도 같은 규칙을 적용한다.
    const observer = new MutationObserver(() => {
      removeNaverMarkerAreasFromTabOrder(container);
    });
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['usemap', 'name'],
    });

    return () => observer.disconnect();
  }, []);

  const toggleLock = useCallback(() => {
    setIsLocked(prev => !prev);
  }, []);

  const handleToggleLock = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleLock();
  };

  return (
    <section className="w-full flex flex-col gap-1 items-center">
      <Label
        className={`font-semibold text-center pb-3.5 ${category === 'preview' ? 'hidden' : ''}`}
      >
        지도
      </Label>
      <div className="relative isolate z-0 h-64.5 w-full overflow-hidden rounded-lg">
        <div ref={mapRef} className="h-full w-full" />
        {mapFailed && (
          <p
            role="status"
            className="absolute inset-0 grid place-items-center bg-bg-sub px-4 text-center text-sm text-text-secondary"
          >
            네이버 지도를 불러오지 못했어요.
          </p>
        )}
        {locked && !mapFailed && (
          <button
            type="button"
            onClick={handleToggleLock}
            data-testid="map-lock-button"
            aria-label={isLocked ? '지도 움직이기' : '지도 고정하기'}
            title={isLocked ? '지도 움직이기' : '지도 고정하기'}
            className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5 rounded-md border border-black/10 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-[2px] transition-all hover:bg-white hover:text-black active:scale-95 cursor-pointer select-none"
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-gray-600" />
                <span>지도 움직이기</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-gray-600" />
                <span>지도 고정하기</span>
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
