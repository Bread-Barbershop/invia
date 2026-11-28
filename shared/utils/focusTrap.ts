// 모달 내에서 포커스 트랩을 구현하는 유틸리티

const FOCUSABLE_ELEMENTS = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const getFocusableElements = (element: HTMLElement): HTMLElement[] => {
  return Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS)).filter(
    (el) => {
      const htmlEl = el as HTMLElement;
      return !htmlEl.hasAttribute('disabled') &&
             htmlEl.offsetParent !== null &&
             getComputedStyle(htmlEl).visibility !== 'hidden';
    }
  ) as HTMLElement[];
};

export const trapFocus = (event: KeyboardEvent, element: HTMLElement): void => {
  if (event.key !== 'Tab') return;

  const focusableElements = getFocusableElements(element);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = element.ownerDocument.activeElement;
  const boundary = event.shiftKey ? firstElement : lastElement;

  if (activeElement !== element && activeElement !== boundary) return;

  event.preventDefault();
  const nextElement = event.shiftKey ? lastElement : firstElement;
  nextElement?.focus();
};

export const disableBodyScroll = (): (() => void) => {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const originalStyle = document.body.style.cssText;

  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`;

  return () => {
    document.body.style.cssText = originalStyle;
  };
};

let ariaHiddenCount = 0;

export const getHiddenRoot = (): void => {
  const root = document.getElementById('app-root');
  if (!root) return;
  if (ariaHiddenCount === 0) {
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('inert', '');
  }
  ariaHiddenCount++;
};

export const removeHiddenRoot = (): void => {
  const root = document.getElementById('app-root');
  if (!root) return;
  ariaHiddenCount--;
  if (ariaHiddenCount === 0) {
    root.removeAttribute('aria-hidden');
    root.removeAttribute('inert');
  }
};
