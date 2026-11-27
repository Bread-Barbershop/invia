import { AlertCircle, X } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';

type DashboardCardActionAlertProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
  style?: CSSProperties;
};

/**
 * 카드 안에서 실패를 알리는 안내.
 * role="alert"라 스크린 리더가 즉시 읽고, 같은 자리에서 바로 다시 시도할 수 있다.
 */
function DashboardCardActionAlert({
  title,
  description,
  actionLabel,
  onAction,
  onDismiss,
  className,
  style,
}: DashboardCardActionAlertProps) {
  const stopCardSelection = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const stopCardKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onClick={stopCardSelection}
      onKeyDown={stopCardKeyboard}
      className={cn(
        'pointer-events-auto rounded-lg border border-[#F3C2C2] bg-white/95 px-2.5 py-2 text-left shadow-[0_6px_18px_rgba(0,0,0,0.12)] backdrop-blur-[2px]',
        className
      )}
      style={style}
    >
      <div className="flex items-start gap-1.5">
        <AlertCircle
          size={14}
          strokeWidth={2}
          color="#F32E2E"
          aria-hidden="true"
          className="mt-[1px] shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="break-words font-pretendard text-[12px] font-semibold leading-4 text-[#252522]">
            {title}
          </p>
          {description && (
            <p className="mt-0.5 break-words font-pretendard text-[11px] leading-[15px] text-text-secondary">
              {description}
            </p>
          )}
          {onAction && actionLabel && (
            <button
              type="button"
              onClick={event => {
                event.stopPropagation();
                onAction();
              }}
              className="mt-1.5 inline-flex min-h-6 items-center rounded-md bg-[#FFF1F1] px-2 font-pretendard text-[11px] font-semibold leading-4 text-[#D22222] transition-colors hover:bg-[#FFE3E3] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#F32E2E]"
            >
              {actionLabel}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            aria-label="안내 닫기"
            onClick={event => {
              event.stopPropagation();
              onDismiss();
            }}
            className="shrink-0 rounded p-0.5 text-neutral-400 transition-colors hover:text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-1"
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardCardActionAlert;
