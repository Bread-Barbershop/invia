'use client';

import clsx from 'clsx';

interface BgmPlaybackNoticeProps {
  message: string;
  className?: string;
}

// 재생 실패를 화면 낭독기와 눈으로 모두 알린다. 노출·해제 시점은 부모가 관리한다.
export function BgmPlaybackNotice({
  message,
  className,
}: BgmPlaybackNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={clsx(
        'pointer-events-none absolute right-4 top-14 z-50 w-[min(15rem,calc(100%-2rem))] rounded-xl bg-black/70 px-3 py-2 text-left text-xs font-medium leading-snug text-white shadow-md backdrop-blur-md',
        className
      )}
    >
      {message}
    </div>
  );
}
