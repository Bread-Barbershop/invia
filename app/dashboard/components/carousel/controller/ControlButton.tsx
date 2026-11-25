import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

type ControlButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'aria-label'
> & {
  type: 'left' | 'right';
  /**
   * 화면에는 화살표만 보이므로, 스크린리더가 무엇을 하는 버튼인지 알 수 있게
   * 호출하는 쪽에서 반드시 이름을 넘긴다.
   */
  label: string;
};

function ControlButton({
  type,
  label,
  disabled = false,
  className,
  ...props
}: ControlButtonProps) {
  const Icon = type === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      {...props}
      disabled={disabled}
      aria-label={label}
      aria-disabled={disabled ? true : undefined}
      className={cn(
        'flex size-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252522]',
        disabled
          ? 'cursor-not-allowed bg-[#F1F2F5] text-[#A6ADBA]'
          : 'cursor-pointer bg-[#EEEEF2] hover:bg-[#E5E7EB]',
        className
      )}
    >
      <Icon
        aria-hidden="true"
        strokeWidth={3}
        className={cn(
          type === 'left' ? '-translate-x-px' : 'translate-x-px',
          disabled ? 'text-[#A6ADBA]' : 'text-[#6B7280]'
        )}
      />
    </button>
  );
}
export default ControlButton;
