/**
 * 텍스트를 클립보드에 복사합니다.
 * - 보안 컨텍스트(https)에서는 Clipboard API를 사용합니다.
 * - 그 외 환경(구형 브라우저, http 미리보기 등)에서는 textarea + execCommand로 폴백합니다.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.clipboard?.writeText === 'function' &&
      (typeof window === 'undefined' || window.isSecureContext)
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 권한 거부 등은 아래 폴백으로 이어서 시도합니다.
  }

  if (typeof document === 'undefined') return false;

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const isCopied = document.execCommand('copy');
    document.body.removeChild(textarea);

    return isCopied;
  } catch {
    return false;
  }
}
