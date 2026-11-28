import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

const EDITABLE_TARGET_SELECTOR =
  'input, textarea, select, [role="combobox"], [role="textbox"], [contenteditable]:not([contenteditable="false"])';
const ACTIVE_POPUP_SELECTOR =
  'dialog[open], [role="dialog"], [aria-modal="true"], [role="menu"], [data-editor-popup="true"]';

export function isEditorEditableTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    target.closest(EDITABLE_TARGET_SELECTOR) !== null
  );
}

export function isEditorShortcutBlocked(event: KeyboardEvent) {
  if (
    event.defaultPrevented ||
    event.repeat ||
    event.isComposing ||
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    window.innerWidth < DESKTOP_CONTENT_MIN_WIDTH
  ) {
    return true;
  }

  if (isEditorEditableTarget(event.target)) return true;

  return document.querySelector(ACTIVE_POPUP_SELECTOR) !== null;
}

/**
 * 수정키가 없는 단축키(Delete 등)를 처리해도 되는지 판단한다.
 * Ctrl/Alt/Shift 조합 단축키는 `isEditorShortcutBlocked`로 따로 검사한다.
 */
export function shouldIgnoreEditorShortcut(event: KeyboardEvent) {
  if (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.shiftKey
  ) {
    return true;
  }

  return isEditorShortcutBlocked(event);
}
