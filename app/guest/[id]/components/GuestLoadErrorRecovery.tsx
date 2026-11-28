'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import inviaLogo3d from '@/shared/assets/logo/invia-simple-logo-3d.png';
import {
  GUEST_ERROR_AUTO_RELOAD_DELAY_MS,
  isChunkLoadError,
  markGuestErrorAutoReload,
  readGuestErrorAutoReloadAt,
  reloadGuestPage,
  resolveGuestLoadErrorCopy,
  shouldAutoReloadGuestPage,
  type GuestLoadErrorAction,
} from '@/shared/utils/guestLoadError';

export type GuestLoadErrorRecoveryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const PRIMARY_BUTTON_CLASS =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-black px-5 font-pretendard text-[14px] font-semibold text-white transition-colors hover:bg-[#202020] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111827] sm:w-auto sm:min-w-[134px]';

const SECONDARY_BUTTON_CLASS =
  'inline-flex h-11 w-full items-center justify-center rounded-lg border border-black/10 bg-white px-5 font-pretendard text-[14px] font-semibold text-[#374151] transition-colors hover:bg-[#F3F4F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111827] sm:w-auto sm:min-w-[134px]';

function readIsOnline() {
  if (typeof navigator === 'undefined') return true;
  if (typeof navigator.onLine !== 'boolean') return true;
  return navigator.onLine;
}

function readSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * 하객 초대장 화면이 오류로 멈췄을 때 보여주는 복구 화면.
 * - 오프라인이면 연결이 돌아오는 순간 자동으로 다시 시도한다.
 * - 배포 직후 청크 오류면 한 번 자동으로 새로 고침한다.
 * - 그 밖에는 "다시 시도하기"와 "새로 고침" 버튼을 44px 높이로 제공한다.
 */
export function GuestLoadErrorRecovery({
  error,
  reset,
}: GuestLoadErrorRecoveryProps) {
  const [online, setOnline] = useState(readIsOnline);
  const [manualReloadError, setManualReloadError] = useState<Error | null>(null);
  const autoReloadSkipped = manualReloadError === error;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const onlineRef = useRef(online);
  const didFocusHeading = useRef(false);

  // 오류 화면으로 바뀌면 제목으로 초점을 옮겨 화면 낭독기가 바로 안내하게 한다.
  useEffect(() => {
    if (didFocusHeading.current) return;
    didFocusHeading.current = true;
    headingRef.current?.focus();
  }, []);

  // 연결이 끊겼다가 돌아오면 하객이 버튼을 누르지 않아도 다시 시도한다.
  useEffect(() => {
    const handleOnline = () => {
      const wasOffline = !onlineRef.current;
      onlineRef.current = true;
      setOnline(true);
      if (wasOffline) reset();
    };
    const handleOffline = () => {
      onlineRef.current = false;
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [reset]);

  // 배포 직후 사라진 청크를 받으려다 난 오류는 새 화면을 받아야 풀린다.
  useEffect(() => {
    if (!online || autoReloadSkipped || !isChunkLoadError(error)) return;

    const storage = readSessionStorage();
    const canAutoReload = (now: number) =>
      shouldAutoReloadGuestPage({
        error,
        online: onlineRef.current,
        lastAutoReloadAt: readGuestErrorAutoReloadAt(storage),
        now,
      });

    if (!canAutoReload(Date.now())) {
      // sessionStorage의 현재 상태에 맞춰 수동 복구를 안내한다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setManualReloadError(error);
      return;
    }

    const timer = window.setTimeout(() => {
      if (!onlineRef.current) return;
      const now = Date.now();
      if (!canAutoReload(now) || !markGuestErrorAutoReload(storage, now)) {
        setManualReloadError(error);
        return;
      }
      reloadGuestPage();
    }, GUEST_ERROR_AUTO_RELOAD_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoReloadSkipped, error, online]);

  const copy = resolveGuestLoadErrorCopy({ error, online, autoReloadSkipped });

  const handleAction = useCallback(
    (action: GuestLoadErrorAction) => {
      if (action === 'reload') {
        reloadGuestPage();
        return;
      }
      reset();
    },
    [reset]
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F6F7F9] px-5 py-10">
      <section className="w-full max-w-[390px] rounded-[28px] border border-black/5 bg-white px-7 py-9 text-center shadow-[0_24px_80px_-40px_rgb(17_24_39_/_45%)] sm:max-w-[430px] sm:px-9 sm:py-10">
        <Image
          src={inviaLogo3d}
          alt="Invia"
          width={82}
          height={82}
          priority
          className="mx-auto mb-2 h-[100px] w-[100px] object-contain"
        />
        <p className="mb-3 font-pretendard text-[12px] font-bold tracking-[0.2em] text-[#9AA3AF]">
          {copy.eyebrow}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-pretendard text-[24px] font-bold leading-8 tracking-[-0.02em] text-[#111827] focus:outline-none sm:text-[26px] sm:leading-9"
        >
          {copy.title}
        </h1>
        <p className="mx-auto mt-4 max-w-[300px] font-pretendard text-[14px] font-medium leading-[140%] text-[#6B7280]">
          {copy.description}
        </p>
        <p className="mt-4 rounded-2xl bg-[#F8FAFC] px-4 py-3 font-pretendard text-[13px] font-semibold leading-[140%] text-[#4B5563]">
          {copy.hint}
        </p>
        <div className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => handleAction(copy.primaryAction)}
            className={PRIMARY_BUTTON_CLASS}
          >
            {copy.primaryLabel}
          </button>
          {copy.secondaryLabel && copy.secondaryAction && (
            <button
              type="button"
              onClick={() => handleAction(copy.secondaryAction as GuestLoadErrorAction)}
              className={SECONDARY_BUTTON_CLASS}
            >
              {copy.secondaryLabel}
            </button>
          )}
        </div>
        {error.digest && (
          <p
            data-testid="guest-load-error-digest"
            className="mt-4 font-pretendard text-[11px] font-medium leading-[150%] text-[#9AA3AF]"
          >
            문의 시 알려 주세요 · 오류 코드 {error.digest}
          </p>
        )}
      </section>
    </main>
  );
}
