import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useMemo } from 'react';

import { cn } from '@/shared/utils/cn';

import { GalleryItemVariants } from '../GalleryCarouselType';
import { useGallerySwipeClick } from '../hooks/useGallerySwipeClick';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { GalleryTemplateProps } from '../types/galleryType';
import { createInfiniteSlides } from '../utils/createInfiniteSlides';
import {
  GALLERY_PHOTO_DECORATIVE_ALT,
  galleryPhotoAriaLabel,
} from '../utils/galleryPhotoLabel';

import { GalleryImage } from './GalleryImage';

function GalleryType4({
  imageClick,
  preview,
  ratio,
  isAutoPlay = false,
}: GalleryTemplateProps) {
  const isLoopActive = preview.length > 1;

  const slides = useMemo(
    () => createInfiniteSlides(preview, isLoopActive, 12),
    [preview, isLoopActive]
  );

  const prefersReducedMotion = usePrefersReducedMotion();

  const plugins = useMemo(() => {
    if (!isAutoPlay || !isLoopActive || prefersReducedMotion) return [];
    return [
      AutoScroll({
        playOnInit: true,
        speed: 0.8,
        startDelay: 0,
        direction: 'forward',
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        stopOnFocusIn: false,
      }),
    ];
  }, [isAutoPlay, isLoopActive, prefersReducedMotion]);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: isLoopActive,
      align: 'center',
      dragFree: isAutoPlay,
      containScroll: isLoopActive ? false : 'trimSnaps',
      watchDrag: true,
    },
    plugins
  );

  const { handlePointerDown, handleCardClick } =
    useGallerySwipeClick(imageClick);

  return (
    <div className="relative w-full group/gallery">
      <div
        ref={emblaRef}
        className="overflow-hidden py-10 touch-pan-y touch-pinch-zoom select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-4">
          {slides.map((src, i) => (
            <div key={i} className="flex-[0_0_50%] shrink-0">
              <div
                role="button"
                aria-label={galleryPhotoAriaLabel(
                  i % preview.length,
                  preview.length
                )}
                data-entrance-side={i % 2 === 0 ? 'left' : 'right'}
                tabIndex={i < preview.length ? 0 : -1}
                aria-hidden={i >= preview.length ? true : undefined}
                className={cn(
                  'relative overflow-hidden rounded-lg min-h-[120px] shadow-gallery-image select-none',
                  GalleryItemVariants({
                    ratio: ratio,
                  })
                )}
                onPointerDown={handlePointerDown}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(i % preview.length);
                  }
                }}
                onClick={e => handleCardClick(i % preview.length, e)}
              >
                <GalleryImage
                  src={src}
                  alt={GALLERY_PHOTO_DECORATIVE_ALT}
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GalleryType4;
