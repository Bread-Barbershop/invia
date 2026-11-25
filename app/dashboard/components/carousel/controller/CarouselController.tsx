import { dashboardCarouselLayout } from '../carouselLayout';

import ControlButton from './ControlButton';

import type { ReactNode } from 'react';

type CarouselControllerProps = {
  onMove: (direction: 'left' | 'right') => void;
  previousLabel?: string;
  nextLabel?: string;
  // 좌우 화살표 사이에 표시할 진행 상태
  children?: ReactNode;
  // 화살표 뒤에 붙일 추가 컨트롤(자동 넘김 토글 등)
  trailing?: ReactNode;
};

function CarouselController({
  onMove,
  previousLabel = '이전 초대장 보기',
  nextLabel = '다음 초대장 보기',
  children,
  trailing,
}: CarouselControllerProps) {
  return (
    <div
      role="group"
      aria-label="초대장 넘기기"
      className="flex w-full items-center justify-center gap-6 border border-white/30 bg-white/10 backdrop-blur-md"
      style={{ height: dashboardCarouselLayout.controllerHeight }}
    >
      <ControlButton
        type="left"
        aria-label={previousLabel}
        onClick={() => onMove('left')}
      />
      {children}
      <ControlButton
        type="right"
        aria-label={nextLabel}
        onClick={() => onMove('right')}
      />
      {trailing}
    </div>
  );
}
export default CarouselController;
