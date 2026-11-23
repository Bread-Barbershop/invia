import { Copy, Download, MessageCircle, Share2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import {
  loadShareData,
  shareInvitationWithKakao,
} from '@/shared/utils/kakaoInvitationShare';

import { ShareActionLabel, shareRow } from './ShareActionLabel';
import { SmsShareAction } from './SmsShareAction';

type Props = {
  dataUrl?: string | null;
  filename: string;
  url: string;
  shareFolderId?: string;
  canShareKakao?: boolean;
  allowSending: boolean;
  onCopyQr: () => void;
  copyDisabled: boolean;
};

export function QrShareActions({
  dataUrl,
  filename,
  url,
  shareFolderId,
  canShareKakao = true,
  allowSending,
  onCopyQr,
  copyDisabled,
}: Props) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);

  const saveLabel = (
    <ShareActionLabel icon={Download} title="QR 이미지 저장" detail="PNG 파일" />
  );

  async function sendKakao() {
    if (pending.current || !shareFolderId || !canShareKakao || !allowSending)
      return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setFeedback('');
    try {
      const data = await loadShareData(shareFolderId, controller.signal);
      if (controller.signal.aborted) return;
      if (typeof data === 'string') {
        setFeedback('공개 상태를 확인한 뒤 카카오톡으로 보내 주세요.');
        return;
      }
      await shareInvitationWithKakao(data);
    } catch (error) {
      if (
        controller.signal.aborted ||
        (error instanceof Error && error.name === 'AbortError')
      )
        return;
      setFeedback('카카오톡을 열 수 없어요. 링크를 복사해 보내 주세요.');
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
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-black px-3 text-sm font-semibold text-white hover:bg-neutral-800"
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
        <Share2 size={16} aria-hidden="true" /> 공유하기
      </button>
      <div
        id={id}
        hidden={!expanded}
        className="mt-2 rounded-lg border border-gray-200 p-1"
      >
        {shareFolderId && canShareKakao && (
          <button
            type="button"
            className={shareRow}
            aria-label="카카오톡으로 보내기"
            disabled={busy || !allowSending}
            onClick={() => void sendKakao()}
          >
            <ShareActionLabel
              icon={MessageCircle}
              title="카카오톡으로 보내기"
              detail="초대장 링크 카드"
              tone="bg-[#fee500] text-[#332122]"
            />
          </button>
        )}
        {expanded && shareFolderId && (
          <SmsShareAction
            key={`${shareFolderId}-${allowSending}`}
            folderId={shareFolderId}
            url={url}
            allowSending={allowSending}
            busy={busy}
          />
        )}
        {shareFolderId && <hr className="my-1 border-neutral-200" />}
        <button
          type="button"
          className={shareRow}
          aria-label="QR 이미지 복사"
          disabled={copyDisabled}
          onClick={onCopyQr}
        >
          <ShareActionLabel
            icon={Copy}
            title="QR 이미지 복사"
            detail="채팅창에 붙여넣기"
          />
        </button>
        {dataUrl ? (
          <a
            href={dataUrl}
            download={filename}
            className={shareRow}
            aria-label="QR 이미지 저장"
          >
            {saveLabel}
          </a>
        ) : (
          <button
            type="button"
            className={shareRow}
            aria-label="QR 이미지 저장"
            disabled
          >
            {saveLabel}
          </button>
        )}
        <p role="status" className="px-3 text-sm text-gray-600 empty:hidden">
          {feedback}
        </p>
      </div>
    </div>
  );
}
