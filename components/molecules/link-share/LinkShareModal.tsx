'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { GroupShareVisibility } from '@/features/invitation/audiences/visibility';
import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';
import {
  disableBodyScroll,
  getHiddenRoot,
  removeHiddenRoot,
  trapFocus,
} from '@/shared/utils/focusTrap';

import { QrShareActions } from './QrShareActions';

type LinkShareModalProps = {
  url: string;
  recipient?: string;
  downloadName?: string;
  shareFolderId?: string;
  canShareKakao?: boolean;
  visibility?: GroupShareVisibility;
  pendingNotice?: string;
  onClose: () => void;
};

type QrResult = {
  url: string;
  attempt: number;
  dataUrl: string | null;
};

type CopyTarget = 'link' | 'qr';
type CopyStatus = {
  target: CopyTarget;
  state: 'copying' | 'copied' | 'failed';
};

export function LinkShareModal({
  url,
  recipient,
  downloadName = 'invitation-qr.png',
  shareFolderId,
  canShareKakao,
  visibility = 'public',
  pendingNotice,
  onClose,
}: LinkShareModalProps) {
  const titleId = useId();
  const backdropDismiss = useBackdropDismiss<HTMLDivElement>(onClose);
  const modalRef = useRef<HTMLDivElement>(null);
  const copying = useRef(false);
  const shareUrl = new URL(url, window.location.origin).href;
  const [qrResult, setQrResult] = useState<QrResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [copyStatus, setCopyStatus] = useState<CopyStatus | null>(null);
  const currentQr =
    qrResult?.url === shareUrl && qrResult.attempt === attempt
      ? qrResult
      : null;
  const qrDataUrl = currentQr?.dataUrl;
  const isCopying = copyStatus?.state === 'copying';
  const qrCopyDisabled = isCopying || !qrDataUrl;

  useEffect(() => {
    let cancelled = false;

    async function generateQr() {
      try {
        const { toDataURL } = await import('./invitationQr');
        const dataUrl = await toDataURL(shareUrl);

        if (!cancelled) setQrResult({ url: shareUrl, attempt, dataUrl });
      } catch {
        if (!cancelled) {
          setQrResult({ url: shareUrl, attempt, dataUrl: null });
        }
      }
    }

    void generateQr();
    return () => {
      cancelled = true;
    };
  }, [shareUrl, attempt]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const restoreScroll = disableBodyScroll();
    getHiddenRoot();
    modalRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      } else if (modalRef.current) {
        trapFocus(event, modalRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      restoreScroll();
      removeHiddenRoot();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [onClose]);

  const handleCopy = async (target: CopyTarget) => {
    if (copying.current || (target === 'qr' && !qrDataUrl)) return;
    copying.current = true;
    setCopyStatus({ target, state: 'copying' });
    try {
      if (target === 'link') {
        await navigator.clipboard.writeText(shareUrl);
      } else if (qrDataUrl) {
        if (
          typeof navigator.clipboard?.write !== 'function' ||
          typeof ClipboardItem === 'undefined' ||
          ClipboardItem.supports?.('image/png') === false
        ) {
          throw new Error('이 브라우저에서는 PNG를 복사할 수 없어요.');
        }
        // Decode synchronously so the clipboard write retains the click's activation.
        const bytes = Uint8Array.from(atob(qrDataUrl.split(',')[1]), char =>
          char.charCodeAt(0)
        );
        const image = new Blob([bytes], { type: 'image/png' });
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': image }),
        ]);
      }
      setCopyStatus({ target, state: 'copied' });
    } catch {
      setCopyStatus({ target, state: 'failed' });
    } finally {
      copying.current = false;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/10 p-4"
      {...backdropDismiss}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[calc(100dvh-32px)] w-[335px] max-w-full flex-col items-center gap-5 overflow-y-auto rounded-xl bg-white p-5 shadow-xl outline-none"
      >
        <div className="flex w-full items-center justify-between gap-3">
          <div className="min-w-0 text-left">
            <h2 id={titleId} className="text-base font-semibold text-[#202020]">
              링크와 QR로 공유하기
            </h2>
            <p className="mt-2 break-words text-sm text-gray-600">
              {recipient ??
                '링크를 보내거나 QR을 스캔해 초대장을 열 수 있어요.'}
            </p>
          </div>
          <div className="flex size-28 shrink-0 items-center justify-center bg-white">
            {currentQr?.dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentQr.dataUrl}
                alt="초대장 공유 QR 코드"
                width={112}
                height={112}
              />
            ) : currentQr ? (
              <div className="text-center text-sm">
                <p role="alert">QR을 만들지 못했어요.</p>
                <button
                  type="button"
                  className="mt-3 cursor-pointer underline underline-offset-4"
                  onClick={() => setAttempt(value => value + 1)}
                >
                  QR 다시 만들기
                </button>
              </div>
            ) : (
              <p role="status" className="text-sm text-gray-500">
                QR을 만들고 있어요.
              </p>
            )}
          </div>
        </div>
        {visibility === 'private' && (
          <div className="w-full rounded-lg bg-red-50 p-3 text-center text-gray-700">
            <p className="text-sm font-semibold text-[#A51F30]">
              비공개 초대장이에요.
            </p>
            <p className="mt-1 text-xs leading-5">
              공개로 변경하면 링크와 QR로 접속할 수 있어요.
            </p>
          </div>
        )}
        {visibility === 'pending' && pendingNotice && (
          <p className="w-full rounded-lg bg-gray-50 p-3 text-center text-xs leading-5 text-gray-600">
            {pendingNotice}
          </p>
        )}
        <div className="w-full">
          <label htmlFor={`${titleId}-url`} className="text-xs text-gray-500">
            초대장 링크
          </label>
          <input
            id={`${titleId}-url`}
            type="text"
            readOnly
            value={shareUrl}
            onFocus={event => event.currentTarget.select()}
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void handleCopy('link')}
              disabled={isCopying}
              className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
            >
              {copyStatus?.state === 'copied' && copyStatus.target === 'link'
                ? '복사 완료'
                : '링크 복사하기'}
            </button>
            <button
              type="button"
              onClick={() => void handleCopy('qr')}
              disabled={qrCopyDisabled}
              className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              QR 복사하기
            </button>
          </div>
          {copyStatus?.state === 'copied' && (
            <p role="status" className="mt-2 text-center text-xs text-gray-500">
              {copyStatus.target === 'link'
                ? '링크를 복사했어요.'
                : 'QR 이미지를 복사했어요.'}
            </p>
          )}
          {copyStatus?.state === 'failed' && (
            <p role="alert" className="mt-2 text-center text-xs text-red-600">
              {copyStatus.target === 'link'
                ? '링크를 복사하지 못했어요. 위 링크를 직접 복사해 주세요.'
                : 'QR 이미지를 복사하지 못했어요. 공유하기를 열어 QR 이미지 저장을 눌러 주세요.'}
            </p>
          )}
          <QrShareActions
            key={shareUrl}
            onCopyQr={() => void handleCopy('qr')}
            copyDisabled={qrCopyDisabled}
            dataUrl={currentQr?.dataUrl}
            filename={downloadName}
            url={shareUrl}
            shareFolderId={shareFolderId}
            canShareKakao={canShareKakao}
            allowSending={visibility === 'public'}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-9 w-full shrink-0 cursor-pointer rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          닫기
        </button>
      </div>
    </div>,
    document.body
  );
}
