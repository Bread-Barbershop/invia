import { dashboardCarouselLayout } from '../carouselLayout';

import ControlButton from './ControlButton';

type CarouselControllerProps = {
  onMove: (direction: 'left' | 'right') => void;
  /** 스크린리더가 읽을 이전/다음 버튼 이름 */
  previousLabel?: string;
  nextLabel?: string;
  /** 양 끝에 닿았을 때는 눌러도 움직이지 않으므로 버튼을 잠근다 */
  canMovePrevious?: boolean;
  canMoveNext?: boolean;
};

function CarouselController({
  onMove,
  previousLabel = '이전 초대장',
  nextLabel = '다음 초대장',
  canMovePrevious = true,
  canMoveNext = true,
}: CarouselControllerProps) {
  return (
    <div
      className="flex w-full items-center justify-center gap-6 border border-white/30 bg-white/10 backdrop-blur-md"
      style={{ height: dashboardCarouselLayout.controllerHeight }}
    >
      <ControlButton
        type="left"
        label={previousLabel}
        disabled={!canMovePrevious}
        onClick={() => onMove('left')}
      />
      <ControlButton
        type="right"
        label={nextLabel}
        disabled={!canMoveNext}
        onClick={() => onMove('right')}
      />
    </div>
  );
}
export default CarouselController;
