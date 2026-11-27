'use client';

import { Loader2, RefreshCw, X } from 'lucide-react';

type DashboardRefreshErrorNoticeProps = {
  retrying?: boolean;
  onRetry: () => void;
  onDismiss: () => void;
};

/**
 * 이미 보이는 초대장이 있을 때의 새로 고침 실패 안내.
 * 목록을 지우지 않고, 지금 화면이 그대로라는 사실과 다시 시도할 길만 알린다.
 */
function DashboardRefreshErrorNotice({
  retrying = false,
  onRetry,
  onDismiss,
}: DashboardRefreshErrorNoticeProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed left-1/2 top-[4.5rem] z-40 flex w-[min(90vw,520px)] -translate-x-1/2 items-center gap-3 rounded-xl border border-white/70 bg-white/95 px-4 py-3 shadow-[0_18px_44px_-28px_rgb(15_23_42_/_55%)] backdrop-blur"
    >
      <RefreshCw
        aria-hidden="true"
        className="size-4 shrink-0 text-[#64748B]"
      />
      <div className="min-w-0 flex-1">
        <p className="font-pretendard text-[13px] font-semibold leading-[18px] text-text-plain">
          초대장 목록을 새로 불러오지 못했어요
        </p>
        <p className="font-pretendard text-[12px] font-medium leading-4 text-text-secondary">
          지금 보이는 초대장은 그대로예요. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        aria-busy={retrying}
        className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-bg-plain px-3 font-pretendard text-[13px] font-semibold leading-4 text-white transition-colors hover:bg-[#202020] active:bg-[#0D0D0D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-[#8B8B8B]"
      >
        {retrying && (
          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
        )}
        {retrying ? '다시 불러오는 중…' : '다시 시도'}
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="새로 고침 오류 안내 닫기"
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#64748B] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D0D0D] focus-visible:ring-offset-2"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

export default DashboardRefreshErrorNotice;
