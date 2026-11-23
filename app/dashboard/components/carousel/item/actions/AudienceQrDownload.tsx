import { useEffect, useRef, useState } from 'react';

import { qrDownloadName } from '@/components/molecules/link-share/qrDownloadName';

import type { ShareOption } from '../../carouselTypes';

type Props = { eventTitle: string; options: ShareOption[] };

export default function AudienceQrDownload({ eventTitle, options }: Props) {
  const [status, setStatus] = useState<
    'idle' | 'building' | 'failed' | 'ready'
  >('idle');
  const pending = useRef<AbortController | null>(null);
  const link = useRef<HTMLAnchorElement>(null);
  const objectUrl = useRef<string | null>(null);
  const privateNames = options
    .filter(option => option.visibility === 'private')
    .map(option => option.name);
  const pendingNames = options
    .filter(option => option.visibility === 'pending')
    .map(option => option.name);

  useEffect(
    () => () => {
      pending.current?.abort();
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    []
  );

  async function download() {
    if (pending.current || !link.current) return;
    if (objectUrl.current) {
      link.current.click();
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setStatus('building');
    try {
      const { buildQrArchive } = await import('./qrArchive');
      const archive = await buildQrArchive(options, controller.signal);
      if (controller.signal.aborted || !link.current) return;
      objectUrl.current = URL.createObjectURL(archive);
      link.current.href = objectUrl.current;
      link.current.click();
      setStatus('ready');
    } catch {
      if (!controller.signal.aborted) setStatus('failed');
    } finally {
      pending.current = null;
    }
  }

  return (
    <div className="mt-4 border-t border-neutral-200 pt-4">
      {privateNames.length > 0 && (
        <p className="mb-2 break-words text-sm text-text-secondary">
          {privateNames.join(' · ')} QR은 공개 후 접속할 수 있어요.
        </p>
      )}
      {pendingNames.length > 0 && (
        <p className="mb-2 break-words text-sm text-text-secondary">
          {pendingNames.join(' · ')} QR은 보내기 전에 공개 상태를 확인해 주세요.
        </p>
      )}
      {status === 'failed' && (
        <p role="alert" className="mb-2 text-sm text-status-error">
          ZIP 파일을 만들지 못했어요. 다시 시도해 주세요.
        </p>
      )}
      <button
        type="button"
        disabled={status === 'building'}
        aria-busy={status === 'building'}
        onClick={() => void download()}
        className="min-h-11 w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === 'building'
          ? 'QR ZIP 만드는 중…'
          : `QR ${options.length}개 ${status === 'ready' ? '다시 받기' : '한 번에 받기'}`}
      </button>
      <a
        ref={link}
        hidden
        download={qrDownloadName(eventTitle).replace(/\.png$/, '.zip')}
      />
    </div>
  );
}
