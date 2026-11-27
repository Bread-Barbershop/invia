'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

import NoticeConfirmButton from '@/components/atoms/button/NoticeConfirmButton';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';
import {
  disableBodyScroll,
  getHiddenRoot,
  removeHiddenRoot,
  trapFocus,
} from '@/shared/utils/focusTrap';

type PrivacyNoticeModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  variant?: 'default' | 'mobileHome';
};

const emptySubscribe = () => () => {};

function PrivacyNoticeModal({
  open,
  onClose,
  onConfirm = onClose,
  variant = 'default',
}: PrivacyNoticeModalProps) {
  const isMobileHome = variant === 'mobileHome';
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  const backdropDismiss = useBackdropDismiss<HTMLDivElement>(handleClose);
  const onEscape = useEffectEvent(handleClose);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !mounted || !dialog) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const enableRestore = disableBodyScroll();
    // 안내가 열린 동안 뒤 화면은 스크린리더와 키보드 탐색에서 제외한다.
    getHiddenRoot();

    // 열자마자 제목과 설명이 읽히도록 대화상자 자체로 포커스를 옮긴다.
    dialog.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
        return;
      }

      trapFocus(event, dialog);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      enableRestore();
      removeHiddenRoot();
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [mounted, open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[50000] flex items-center justify-center overflow-y-auto bg-black/50 px-5 py-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          {...backdropDismiss}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="max-h-[calc(100dvh-40px)] max-w-[calc(100vw-40px)] rounded-xl text-left outline-none shadow-[0_24px_60px_-20px_rgb(0_0_0_/_12%),0_8px_24px_-8px_rgb(0_0_0_/_18%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={event => event.stopPropagation()}
          >
            <div
              className={`flex max-h-[calc(100dvh-40px)] flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-black/5 bg-white ${
                isMobileHome ? 'px-5 pb-2.5 pt-[24px]' : 'p-5'
              }`}
            >
              <div
                role="region"
                aria-label="개인정보 안내 내용"
                tabIndex={0}
                className={`min-h-0 w-fit max-w-full flex-1 overflow-y-auto overscroll-contain font-pretendard font-medium text-text-plain focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  isMobileHome
                    ? 'px-0 py-0 text-[13px] leading-[18px]'
                    : 'px-0 py-5 text-[14px] leading-5 sm:px-10'
                }`}
              >
                <h2
                  id={titleId}
                  className={
                    isMobileHome
                      ? 'mb-5 text-center text-[20px] font-bold leading-7'
                      : 'mb-5 break-keep text-[20px] font-bold leading-7 sm:text-[32px] sm:leading-10'
                  }
                >
                  {isMobileHome ? '안심하고 이용하세요.' : '안심하고 이용하세요'}
                </h2>
                <p id={descriptionId} className="mb-5">
                  이 모바일 청첩장 프로젝트는 누구나 쉽게 사용할 수 있도록{' '}
                  <span className="text-[#1F72EF]">무료로 제공</span>되고
                  있어요.
                </p>
                <ol className="mb-5 list-decimal space-y-1 pl-5">
                  <li>
                    초대장을 확인하기 위해 회원가입을 하거나 개인정보를 입력할
                    필요가 없어요.
                  </li>
                  <li>
                    이용자님의 이름, 연락처, 이메일 등의{' '}
                    <span className="text-[#1F72EF]">
                      개인정보를 별도로 수집하거나 저장하지 않아요.
                    </span>
                  </li>
                  <li>
                    청첩장에 사용되는 사진과 자료는 이용자님의{' '}
                    <span className="text-[#1F72EF]">
                      Google Drive 계정에 직접 업로드
                    </span>
                    되며, 직접 보관하고 관리할 수 있어요.
                    <div className="mt-2.5 rounded-lg border border-black/5 bg-[#F8F9FA] p-3 text-[12px] sm:text-[13px] leading-[18px] sm:leading-[19px] text-[#4B5563]">
                      <div className="flex items-start gap-2">
                        <span
                          className="shrink-0 text-[14px] pt-0.5"
                          aria-hidden="true"
                        >
                          💡
                        </span>
                        <div className="flex-1 space-y-1.5">
                          <p>
                            현재 로그인된 Google Drive의{' '}
                            <strong className="font-semibold text-text-primary">
                              ‘나의 모바일 청첩장’
                            </strong>{' '}
                            폴더에 우리 청첩장이 안전하게 저장돼요.
                          </p>
                          <a
                            href="https://drive.google.com/drive/my-drive"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-[#1F72EF] underline underline-offset-2 transition-colors hover:text-[#185bc0] cursor-pointer"
                          >
                            <span>Google Drive(내 드라이브) 바로가기</span>
                            <ExternalLink
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                </ol>
                <p>
                  앞으로도 소중한 순간을 더욱 간편하고 안전하게 공유할 수
                  있도록 노력할게요.
                </p>
              </div>
              <NoticeConfirmButton onClick={onConfirm} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default PrivacyNoticeModal;
