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

function isCarouselControl(target: EventTarget | null) {
  return (
    target instanceof Element && !!target.closest('button, [role="button"]')
  );
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
  const [userPaused, setUserPaused] = useState(false);
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
    userPaused ||
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
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ height: dashboardCarouselLayout.stageHeight }}
      onPointerOver={event =>
        setPointerOverCardOrControl(isCarouselControl(event.target))
      }
      onPointerLeave={() => setPointerOverCardOrControl(false)}
      onFocus={event =>
        setKeyboardFocused(event.target.matches(':focus-visible'))
      }
      onBlur={() => setKeyboardFocused(false)}
    >
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
        >
          {!reducedMotion && (
            <button
              type="button"
              aria-pressed={userPaused}
              aria-label={
                userPaused ? '자동 넘김 다시 시작' : '자동 넘김 멈춤'
              }
              title={userPaused ? '자동 넘김 다시 시작' : '자동 넘김 멈춤'}
              onClick={() => setUserPaused(current => !current)}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#EEEEF2] transition-colors hover:bg-[#E5E7EB]"
            >
              {userPaused ? (
                <Play
                  size={18}
                  strokeWidth={3}
                  className="translate-x-px fill-[#6B7280] text-[#6B7280]"
                />
              ) : (
                <Pause
                  size={18}
                  strokeWidth={3}
                  className="fill-[#6B7280] text-[#6B7280]"
                />
              )}
            </button>
          )}
        </CarouselController>
      </div>
    </section>
  );
}
