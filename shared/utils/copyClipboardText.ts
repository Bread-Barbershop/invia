/**
 * 텍스트를 클립보드에 복사합니다.
 *
 * HTTPS(보안 컨텍스트)가 아니거나 Clipboard API가 없는 브라우저에서는
 * textarea 폴백을 사용합니다. 복사에 실패하면 throw 하므로 호출부에서
 * 사용자에게 안내(토스트·스크린리더 라이브 영역)를 붙일 수 있습니다.
 */
export async function copyClipboardText(text: string): Promise<void> {
  if (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    navigator.clipboard?.writeText
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is not available');
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let isCopied = false;
  try {
    isCopied = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }

  if (!isCopied) {
    throw new Error('Failed to copy text');
  }
}
