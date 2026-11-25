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

export default function HomeShowcaseCarousel({
  items,
}: {
  items: typeof showcaseItems;
}) {
  const openPreview = useShowcasePreview();
  const isPreviewOpen = useContext(ShowcasePreviewOpenContext);
  const reducedMotion = usePrefersReducedMotion();
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [slideStatus, setSlideStatus] = useState({
    index: 0,
    total: items.length,
  });
  const [plugins] = useState(() => [
    AutoScroll({ speed: 0.45, startDelay: 0, playOnInit: false }),
  ]);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      // 자동으로 흐르는 트랙에서는 드래그를 받지 않아 카드 클릭이 그대로 전달된다.
      watchDrag: false,
      active: false,
      breakpoints: {
        [`(min-width: ${DESKTOP_CONTENT_MIN_WIDTH}px)`]: { active: true },
      },
    },
    plugins
  );
  const paused =
    reducedMotion ||
    isPointerInside ||
    isFocusWithin ||
    isPausedByUser ||
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

  useEffect(() => {
    if (!emblaApi) return;
    const syncSlideStatus = () => {
      setSlideStatus({
        index: emblaApi.selectedScrollSnap(),
        total: emblaApi.scrollSnapList().length,
      });
    };
    syncSlideStatus();
    emblaApi.on('select', syncSlideStatus);
    emblaApi.on('reInit', syncSlideStatus);
    return () => {
      emblaApi.off('select', syncSlideStatus);
      emblaApi.off('reInit', syncSlideStatus);
    };
  }, [emblaApi]);

  const progressPercent =
    slideStatus.total > 1
      ? ((slideStatus.index + 1) / slideStatus.total) * 100
      : 100;

  return (
    <section
      aria-label="초대장 디자인"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      style={{ height: dashboardCarouselLayout.stageHeight }}
      onPointerEnter={() => setIsPointerInside(true)}
      onPointerLeave={() => setIsPointerInside(false)}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={event => {
        if (
          event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget)
        ) {
          return;
        }
        setIsFocusWithin(false);
      }}
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
          onMove={direction => {
            if (direction === 'left') emblaApi?.scrollPrev(reducedMotion);
            else emblaApi?.scrollNext(reducedMotion);
          }}
          trailing={
            reducedMotion ? null : (
              <button
                type="button"
                aria-label={
                  isPausedByUser ? '자동 넘김 다시 시작' : '자동 넘김 일시정지'
                }
                onClick={() => setIsPausedByUser(previous => !previous)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-[#EEEEF2] transition-colors hover:bg-[#E5E7EB]"
              >
                {isPausedByUser ? (
                  <Play
                    size={16}
                    strokeWidth={2.5}
                    className="text-[#6B7280]"
                    aria-hidden="true"
                  />
                ) : (
                  <Pause
                    size={16}
                    strokeWidth={2.5}
                    className="text-[#6B7280]"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          }
        >
          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="h-1 w-32 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-[#252522]/70 transition-[width] duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-pretendard text-[11px] font-semibold tabular-nums text-[#5B5B57]">
              {String(slideStatus.index + 1).padStart(2, '0')} /{' '}
              {String(slideStatus.total).padStart(2, '0')}
            </span>
          </div>
        </CarouselController>
      </div>
    </section>
  );
}
