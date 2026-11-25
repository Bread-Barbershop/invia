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
    // 공유 시트가 실제로 열리면 페이지 포커스가 잠시 벗어납니다.
    // (시트가 없는 데스크톱 환경에서는 abort가 즉시 돌아오는데, 이때는 링크 복사로 폴백합니다.)
    let sheetOpened = false;
    const markSheetOpened = () => {
      sheetOpened = true;
    };
    window.addEventListener('blur', markSheetOpened, { once: true });
    document.addEventListener('visibilitychange', markSheetOpened, {
      once: true,
    });

    try {
      await navigator.share({
        url,
        ...(title ? { title } : {}),
        ...(text ? { text } : {}),
      });
      return 'shared';
    } catch (error) {
      // 사용자가 공유 시트를 직접 닫은 경우는 실패가 아니므로 아무 안내도 하지 않습니다.
      if (isAbortError(error) && sheetOpened) return 'canceled';
      // 그 외 오류(시트 미지원 포함)는 링크 복사로 폴백합니다.
    } finally {
      window.removeEventListener('blur', markSheetOpened);
      document.removeEventListener('visibilitychange', markSheetOpened);
    }
  }

  const copied = await copyTextToClipboard(url);
  return copied ? 'copied' : 'failed';
}
