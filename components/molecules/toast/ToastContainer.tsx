'use client';

import { createPortal } from 'react-dom';

import { useToastStore } from '@/shared/store/useToastStore';

import { ToastBar } from './ToastBar';

const getToastVisibilityClass = (
  isVisible: boolean,
  animation: 'slide' | 'fade'
) => {
  if (animation === 'fade') {
    return isVisible ? 'opacity-100' : 'opacity-0';
  }

  return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4';
};

const toastWrapperClass =
  'fixed top-10 left-1/2 -translate-x-1/2 z-[50000] w-fit max-w-[calc(100vw-32px)] transition-all duration-300 pointer-events-none';

export const ToastContainer = () => {
  const { message, variant, isVisible, options } = useToastStore();
  const isAssertive = variant === 'error' || variant === 'warning';
  const visibility = getToastVisibilityClass(isVisible, options.animation);

  return createPortal(
    <>
      {/*
        live region은 비어 있어도 화면에서 지우지 않아야 새 메시지를 스크린 리더가 읽는다.
        보통 안내(성공·정보)는 polite, 실패 안내(오류·경고)는 assertive로 나눠 둔다.
      */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`${toastWrapperClass} ${visibility}`}
      >
        {!isAssertive && message ? (
          <ToastBar message={message} variant={variant} />
        ) : null}
      </div>
      <div
        role="alert"
        aria-atomic="true"
        className={`${toastWrapperClass} ${visibility}`}
      >
        {isAssertive && message ? (
          <ToastBar message={message} variant={variant} />
        ) : null}
      </div>
    </>,
    document.body
  );
};
