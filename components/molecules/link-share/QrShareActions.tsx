import { useEffect, useId, useMemo, useRef, useState } from 'react';

import {
  loadShareData,
  shareInvitationWithKakao,
} from '@/shared/utils/kakaoInvitationShare';

type Props = {
  dataUrl?: string | null;
  filename: string;
  kakaoFolderId?: string;
  allowSending: boolean;
};

const actionStyle =
  'min-h-11 w-full rounded-lg px-3 text-left text-sm font-medium hover:bg-neutral-50 focus-visible:outline-2 disabled:opacity-50';

export function QrShareActions({
  dataUrl,
  filename,
  kakaoFolderId,
  allowSending,
}: Props) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);

  // 클릭 시점의 사용자 활성화를 유지하기 위해 공유할 PNG를 미리 준비한다.
  const file = useMemo(() => {
    if (!expanded || !dataUrl || typeof File === 'undefined') return;
    const bytes = Uint8Array.from(atob(dataUrl.split(',')[1]), char =>
      char.charCodeAt(0)
    );
    return new File([bytes], filename, { type: 'image/png' });
  }, [expanded, dataUrl, filename]);
  const canCopy =
    typeof navigator.clipboard?.write === 'function' &&
    typeof ClipboardItem !== 'undefined' &&
    (ClipboardItem.supports?.('image/png') ?? true);
  const canShareFile =
    file &&
    typeof navigator.share === 'function' &&
    navigator.canShare?.({ files: [file] });

  async function run(action: 'copy' | 'share' | 'kakao') {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setFeedback('');
    try {
      if (action === 'kakao' && kakaoFolderId) {
        const data = await loadShareData(kakaoFolderId, controller.signal);
        if (controller.signal.aborted) return;
        if (typeof data === 'string') {
          setFeedback('공개 상태를 확인한 뒤 카카오톡으로 보내 주세요.');
          return;
        }
        await shareInvitationWithKakao(data);
      } else if (action === 'copy' && file) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': file }),
        ]);
        if (!controller.signal.aborted) {
          setFeedback('QR 이미지를 복사했어요. 채팅창에 붙여넣어 주세요.');
        }
      } else if (action === 'share' && file) {
        await navigator.share({ files: [file] });
      }
    } catch (error) {
      if (
        controller.signal.aborted ||
        (error instanceof Error && error.name === 'AbortError')
      )
        return;
      if (action === 'kakao') {
        setFeedback('카카오톡을 열 수 없어요. 링크를 복사해 보내 주세요.');
      } else {
        setFeedback('QR 저장하기로 이미지를 저장한 뒤 첨부해 주세요.');
      }
    } finally {
      if (pending.current === controller) {
        if (!controller.signal.aborted) setBusy(false);
        pending.current = null;
      }
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        className="min-h-11 w-full rounded-lg bg-black px-3 text-sm font-semibold text-white hover:bg-neutral-800"
        onClick={() => {
          if (expanded) {
            pending.current?.abort();
            pending.current = null;
            setFeedback('');
            setBusy(false);
          }
          setExpanded(!expanded);
        }}
      >
        공유하기
      </button>
      <div
        id={id}
        hidden={!expanded}
        className="mt-2 rounded-lg border border-gray-200 p-1"
      >
        {kakaoFolderId && (
          <button
            type="button"
            className={actionStyle}
            disabled={busy || !allowSending}
            onClick={() => void run('kakao')}
          >
            카카오톡으로 초대장 링크 보내기
          </button>
        )}
        {canCopy && (
          <button
            type="button"
            className={actionStyle}
            disabled={busy || !file}
            onClick={() => void run('copy')}
          >
            QR 이미지 복사
          </button>
        )}
        {canShareFile && (
          <button
            type="button"
            className={actionStyle}
            disabled={busy || !allowSending}
            onClick={() => void run('share')}
          >
            QR 이미지 보내기
          </button>
        )}
        {dataUrl && !canShareFile && !canCopy && (
          <p className="px-3 py-2 text-sm text-gray-600">
            QR 저장하기로 이미지를 저장한 뒤 원하는 앱에 첨부해 주세요.
          </p>
        )}
        <p role="status" className="px-3 text-sm text-gray-600 empty:hidden">
          {feedback}
        </p>
      </div>
    </div>
  );
}
