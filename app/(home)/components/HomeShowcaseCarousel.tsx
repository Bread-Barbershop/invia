'use client';

import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import { Pause, Play } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';

import { dashboardCarouselLayout } from '@/app/dashboard/components/carousel/carouselLayout';
import CarouselTrack from '@/app/dashboard/components/carousel/CarouselTrack';
import CarouselController from '@/app/dashboard/components/carousel/controller/CarouselController';
import { usePrefersReducedMotion } from '@/components/organisms/gallery/hooks/usePrefersReducedMotion';
import {
  ShowcasePreviewOpenContext,
  useShowcasePreview,
} from '@/features/showcase/components/ShowcasePreviewProvider';
import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

import type { showcaseItems } from './showcaseItems';

/** 자동 넘김을 멈추는 버튼은 스스로를 멈춤 사유로 삼지 않는다 */
const AUTOPLAY_TOGGLE_SELECTOR = '[data-autoplay-toggle]';

function isCarouselControl(target: EventTarget | null) {
  return (
    target instanceof Element && !!target.closest('button, [role="button"]')
  );
}

function isAutoplayToggle(target: EventTarget | null) {
  return (
    target instanceof Element && !!target.closest(AUTOPLAY_TOGGLE_SELECTOR)
  );
}

/** 카드나 화살표 위에 포인터·포커스가 있을 때만 자동 넘김을 잠시 멈춘다 */
function isContentInteraction(target: EventTarget | null) {
  return isCarouselControl(target) && !isAutoplayToggle(target);
}

export default function HomeShowcaseCarousel({
  items,
}: {
  items: typeof showcaseItems;
}) {
  const openPreview = useShowcasePreview();
  const isPreviewOpen = useContext(ShowcasePreviewOpenContext);
  const reducedMotion = usePrefersReducedMotion();
  const [pointerOverCardOrControl, setPointerOverCardOrControl] =
    useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [plugins] = useState(() => [
    AutoScroll({ speed: 0.45, startDelay: 0, playOnInit: false }),
  ]);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      watchDrag: (_, event) => isCarouselControl(event.target),
      active: false,
      breakpoints: {
        [`(min-width: ${DESKTOP_CONTENT_MIN_WIDTH}px)`]: { active: true },
      },
    },
    plugins
  );
  const paused =
    reducedMotion ||
    !autoplayEnabled ||
    pointerOverCardOrControl ||
    keyboardFocused ||
    isPreviewOpen;

  useEffect(() => {
    if (!emblaApi) return;
    const syncPlayback = () => {
      const scroll = emblaApi.plugins()?.autoScroll;
      if (!scroll || emblaApi.scrollSnapList().length < 2) return;
      if (paused) scroll.stop();
      else scroll.play();
    };
    syncPlayback();
    emblaApi.on('reInit', syncPlayback);
    return () => {
      emblaApi.off('reInit', syncPlayback);
    };
  }, [emblaApi, paused]);

  return (
    <section
      aria-label="초대장 디자인"
      aria-roledescription="캐러셀"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ height: dashboardCarouselLayout.stageHeight }}
      onPointerOver={event =>
        setPointerOverCardOrControl(isContentInteraction(event.target))
      }
      onPointerLeave={() => setPointerOverCardOrControl(false)}
      onFocus={event => {
        if (isAutoplayToggle(event.target)) return;
        setKeyboardFocused(
          event.target instanceof Element &&
            event.target.matches(':focus-visible')
        );
      }}
      onBlur={() => setKeyboardFocused(false)}
    >
      {!reducedMotion && (
        <button
          type="button"
          data-autoplay-toggle=""
          onClick={() => setAutoplayEnabled(enabled => !enabled)}
          aria-label={
            autoplayEnabled ? '자동 넘김 멈추기' : '자동 넘김 다시 시작하기'
          }
          className="absolute right-6 z-20 flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3.5 font-pretendard text-[12px] font-semibold text-[#252522] shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252522]"
          style={{
            bottom: `calc((${dashboardCarouselLayout.controllerHeight} - 36px) / 2)`,
          }}
        >
          {autoplayEnabled ? (
            <Pause aria-hidden="true" size={14} strokeWidth={2.5} />
          ) : (
            <Play aria-hidden="true" size={14} strokeWidth={2.5} />
          )}
          {autoplayEnabled ? '자동 넘김 멈춤' : '자동 넘김 시작'}
        </button>
      )}
      <CarouselTrack
        emblaRef={emblaRef}
        items={items}
        isReady={Boolean(emblaApi)}
        selectedIndex={-1}
        preloadItemCount={5}
        showPreviewLabel
        onSelect={index => openPreview(items[index].id)}
      />
      <div className="absolute inset-x-0 bottom-0 z-10">
        <CarouselController
          previousLabel="이전 초대장 디자인"
          nextLabel="다음 초대장 디자인"
          onMove={direction => {
            if (direction === 'left') emblaApi?.scrollPrev(reducedMotion);
            else emblaApi?.scrollNext(reducedMotion);
          }}
        />
      </div>
    </section>
  );
}
