/**
 * 초대장 사진 공유 유틸리티.
 * - 모바일 브라우저처럼 Web Share API가 있으면 OS 공유 시트를 엽니다.
 * - 없으면(데스크톱 등) 초대장/사진 링크를 클립보드에 복사합니다.
 */
import { copyTextToClipboard } from './copyTextToClipboard';

export type PhotoShareOutcome = 'shared' | 'copied' | 'canceled' | 'failed';

export interface PhotoSharePayload {
  url: string;
  title?: string;
  text?: string;
}

export function canUseWebShare(): boolean {
  return (
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  );
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'AbortError'
  );
}

export async function sharePhotoLink({
  url,
  title,
  text,
}: PhotoSharePayload): Promise<PhotoShareOutcome> {
  if (canUseWebShare()) {
    try {
      await navigator.share({
        url,
        ...(title ? { title } : {}),
        ...(text ? { text } : {}),
      });
      return 'shared';
    } catch (error) {
      // 사용자가 공유 시트를 닫은 경우는 실패가 아니므로 아무 안내도 하지 않습니다.
      if (isAbortError(error)) return 'canceled';
      // 그 외 오류는 링크 복사로 폴백합니다.
    }
  }

  const copied = await copyTextToClipboard(url);
  return copied ? 'copied' : 'failed';
}
