/**
 * Copies text from a click handler. Uses the async clipboard API on secure
 * pages and falls back to a temporary textarea elsewhere (older browsers,
 * preview iframes without clipboard permission).
 */
export async function copyFaqText(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the selection-based copy below.
    }
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
    throw new Error('Failed to copy FAQ link');
  }
}
