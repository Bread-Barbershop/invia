'use client';

import { CloudOff, Loader2 } from 'lucide-react';

import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

import { getDashboardLoadErrorDescription } from '../../dashboardErrorMessages';

import {
  dashboardCarouselLayout,
  dashboardCarouselVars,
} from './carouselLayout';

type DashboardErrorCardProps = {
  message: string | null;
  retrying?: boolean;
  onRetry: () => void;
};

/**
 * 목록을 한 번도 보여 주지 못했을 때의 오류 카드.
 * 빈 목록 카드(`아직 만든 초대장이 없어요`)와 같은 자리를 차지해 화면이 흔들리지 않는다.
 */
function DashboardErrorCard({
  message,
  retrying = false,
  onRetry,
}: DashboardErrorCardProps) {
  const selectedLift = `calc(${dashboardCarouselLayout.dashboardSelectedLift} + ${dashboardCarouselLayout.headerHeight})`;

  return (
    <section
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{
        height: dashboardCarouselLayout.dashboardStageHeight,
        minWidth: DESKTOP_CONTENT_MIN_WIDTH,
      }}
    >
      <div
        className="h-full w-full overflow-hidden"
        style={{
          ...dashboardCarouselVars,
          paddingTop: 'var(--carousel-safe-top)',
          paddingBottom: 'var(--carousel-safe-bottom)',
        }}
      >
        <div
          className="relative flex justify-center"
          style={{
            top: 'calc(var(--carousel-base-offset) - var(--carousel-safe-top))',
            transform: `translateY(calc(-1 * ${selectedLift}))`,
          }}
        >
          <div
            role="alert"
            aria-live="assertive"
            className="flex flex-col items-center justify-center rounded-xl bg-white/90 px-8 text-center"
            style={{
              width: dashboardCarouselLayout.cardWidth,
              height: dashboardCarouselLayout.selectedVisualHeight,
              boxShadow: dashboardCarouselLayout.sideActionShadow,
            }}
          >
            <span
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-full bg-[#F1F5F9]"
            >
              <CloudOff
                className="size-8 text-[#64748B]"
                strokeWidth={1.75}
              />
            </span>
            <h2 className="mt-5 font-pretendard text-[16px] font-semibold leading-5 text-text-plain">
              초대장을 불러오지 못했어요
            </h2>
            <p className="mt-2 font-pretendard text-[13px] font-medium leading-[18px] text-text-secondary">
              {getDashboardLoadErrorDescription(message)}
            </p>
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              aria-busy={retrying}
              className="mt-5 flex h-8 w-[139px] items-center justify-center gap-1.5 rounded-lg bg-bg-plain font-pretendard text-[14px] font-semibold leading-5 text-white transition-colors hover:bg-[#202020] active:bg-[#0D0D0D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-[#8B8B8B]"
            >
              {retrying && (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              )}
              {retrying ? '다시 불러오는 중…' : '다시 시도'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardErrorCard;
