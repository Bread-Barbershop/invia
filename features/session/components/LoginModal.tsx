'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import InviaSimpleLogo3d from '@/shared/assets/logo/invia-simple-logo-3d.png';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';
import {
  trapFocus,
  disableBodyScroll,
  getHiddenRoot,
  removeHiddenRoot,
} from '@/shared/utils/focusTrap';

interface LoginModalProps {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
}

const FADE_OUT_MS = 180;

function LoginModal({
  open,
  isLoading,
  onClose,
  onGoogleLogin,
}: LoginModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const googleButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const closeWithFade = useCallback(() => {
    if (isClosing) return;

    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, FADE_OUT_MS);
  }, [isClosing, onClose]);

  const backdropDismiss = useBackdropDismiss<HTMLDivElement>(closeWithFade);
  const onEscape = useEffectEvent(closeWithFade);

  useEffect(() => {
    const dialog = modalRef.current;
    if (!open || !dialog) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const enableRestore = disableBodyScroll();
    getHiddenRoot();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
        return;
      }
      trapFocus(event, dialog);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      enableRestore();
      removeHiddenRoot();
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const initialFocus = isLoading ? modalRef.current : googleButtonRef.current;
    initialFocus?.focus();
  }, [isLoading, open]);

  if (!open && !isClosing) return null;

  return createPortal(
    <div
      ref={modalRef}
      className={`fixed inset-0 z-9999 flex items-center justify-center transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'animate-[fade-in_180ms_ease-out] opacity-100'
      }`}
      {...backdropDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className="pointer-events-none absolute inset-0 bg-[rgb(0_0_0_/_8%)]" />

      <div
        className={`relative flex w-[min(392px,calc(100vw-40px))] flex-col items-center gap-6 rounded-[12px] bg-white p-5 ring-1 ring-white/22 ring-inset transition-all duration-200 ${
          isClosing
            ? 'scale-[0.98] opacity-0'
            : 'animate-[fade-in_180ms_ease-out] scale-100 opacity-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <h2 id={titleId} className="sr-only">
          Invia 로그인
        </h2>
        <Image
          src={InviaSimpleLogo3d}
          alt="Invia"
          width={120}
          height={120}
          className="block h-[120px] w-[120px] shrink-0"
          priority
        />

        <button
          ref={googleButtonRef}
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoading}
          aria-busy={isLoading}
          className="relative flex h-11 w-full cursor-pointer items-center justify-center rounded-[8px] bg-white px-2 py-1.5 text-[15px] font-medium text-[#111827] ring-1 ring-[#EBEBEB] ring-inset enabled:hover:bg-[#FAFAFB] enabled:active:bg-[#F5F8FF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Image
            src="/assets/icons/google-icon.svg"
            alt="Google"
            width={32}
            height={32}
            className="absolute left-2"
          />
          <p>{isLoading ? '로그인 중…' : 'Google로 계속하기'}</p>
        </button>
      </div>
    </div>,
    document.body
  );
}

export default LoginModal;
