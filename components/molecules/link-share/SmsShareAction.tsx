import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ShareActionLabel, shareRow } from './ShareActionLabel';

function smsHref(message: string, guestUrl: string) {
  // iPadOS can identify itself as desktop Safari.
  const appleMobile =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const body = encodeURIComponent(`${message}\n${guestUrl}`);
  return `sms:${appleMobile ? '&' : '?'}body=${body}`;
}

export function SmsShareAction({
  folderId,
  url,
  allowSending,
  busy,
}: {
  folderId: string;
  url: string;
  allowSending: boolean;
  busy: boolean;
}) {
  const [result, setResult] = useState<
    { message: string } | 'blocked' | 'failed' | null
  >(null);
  const [attempt, setAttempt] = useState(0);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!allowSending) return;
    const controller = new AbortController();
    async function prepare() {
      const params = new URLSearchParams({
        invitationFolderId: folderId,
        intent: 'sms',
      });
      const response = await fetch(`/api/drive/shareUrl?${params}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (response.status === 409) {
        setResult('blocked');
        return;
      }
      if (!response.ok) throw new Error();
      const { message } = await response.json();
      if (typeof message !== 'string' || !message.trim()) throw new Error();
      if (!controller.signal.aborted) setResult({ message });
    }
    void prepare().catch(() => {
      if (!controller.signal.aborted) setResult('failed');
    });
    return () => controller.abort();
  }, [allowSending, folderId, attempt]);

  const label = (
    <ShareActionLabel
      icon={MessageSquare}
      title="문자로 보내기"
      tone="bg-green-50 text-green-800"
      detail={
        !allowSending || result === 'blocked'
          ? '공개 후 보낼 수 있어요'
          : result === 'failed'
            ? '문자 초안 다시 준비하기'
            : result
              ? '초대 문구와 링크'
              : '문자 초안 준비 중…'
      }
    />
  );
  if (!allowSending || busy || !result || typeof result === 'string') {
    return (
      <button
        className={shareRow}
        type="button"
        disabled={!allowSending || busy || result !== 'failed'}
        onClick={() => {
          setResult(null);
          setAttempt(value => value + 1);
        }}
      >
        {label}
      </button>
    );
  }
  return (
    <>
      <a
        href={smsHref(result.message, url)}
        className={shareRow}
        aria-label="문자로 보내기"
        onClick={() => setOpened(true)}
      >
        {label}
      </a>
      {opened && (
        <p role="status" className="px-2 pb-2 text-xs text-gray-600">
          문자 앱이 열리지 않으면 위의 링크를 복사해 보내 주세요.
        </p>
      )}
    </>
  );
}
