import { ReactNode } from 'react';

import { dashboardCarouselLayout } from '../carouselLayout';

import ControlButton from './ControlButton';

type CarouselControllerProps = {
  onMove: (direction: 'left' | 'right') => void;
  previousLabel?: string;
  nextLabel?: string;
  children?: ReactNode;
};

function CarouselController({
  onMove,
  previousLabel = '이전 초대장',
  nextLabel = '다음 초대장',
  children,
}: CarouselControllerProps) {
  return (
    <div
      className="flex w-full items-center justify-center gap-6 border border-white/30 bg-white/10 backdrop-blur-md"
      style={{ height: dashboardCarouselLayout.controllerHeight }}
    >
      <ControlButton
        type="left"
        aria-label={previousLabel}
        title={previousLabel}
        onClick={() => onMove('left')}
      />
      {children}
      <ControlButton
        type="right"
        aria-label={nextLabel}
        title={nextLabel}
        onClick={() => onMove('right')}
      />
    </div>
  );
}
export default CarouselController;
