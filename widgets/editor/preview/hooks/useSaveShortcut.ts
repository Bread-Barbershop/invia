import { useEffect, useRef } from 'react';

/** 저장 버튼에 알려 줄 단축키 조합(스크린리더용). */
export const SAVE_SHORTCUT_ARIA_KEYS = 'Control+S Meta+S';

/** 편집기에서 저장을 가로막는 오버레이(모달·팝업). */
const BLOCKING_OVERLAY_SELECTOR =
  '[role="dialog"][aria-modal="true"], dialog[open], [data-editor-popup="true"]';

/**
 * Ctrl+S / ⌘+S 인지 판별한다.
 * Alt·Shift 조합은 브라우저·OS 단축키(예: Shift+Ctrl+S '다른 이름으로 저장')와 겹치므로 제외한다.
 */
export function isSaveShortcut(event: KeyboardEvent) {
  const ctrlOrMeta = event.ctrlKey || event.metaKey;
  if (!ctrlOrMeta || event.altKey || event.shiftKey) return false;

  return event.key?.toLowerCase() === 's' || event.code === 'KeyS';
}

/** 저장을 막아야 하는 모달·팝업이 열려 있는지 확인한다. */
export function hasBlockingEditorOverlay(
  doc: Document | null | undefined = typeof document === 'undefined'
    ? undefined
    : document
) {
  if (!doc) return false;
  return doc.querySelector(BLOCKING_OVERLAY_SELECTOR) !== null;
}

type UseSaveShortcutOptions = {
  /** 저장 버튼을 눌렀을 때와 완전히 같은 동작. */
  onSave: () => void;
  /** 지금 저장을 시작할 수 있는 상태인지(저장 중·정리 중·모달 열림이면 false). */
  enabled: boolean;
};

/**
 * 편집기에서 Ctrl+S / ⌘+S 로 저장을 시작한다.
 *
 * - 조합이 맞으면 브라우저의 '페이지 저장' 창이 뜨지 않도록 항상 preventDefault 한다.
 * - 한글 입력 조합 중(isComposing)이거나 키를 누르고 있을 때(repeat)에는 동작하지 않는다.
 * - 이미 저장 중이거나 모달이 열려 있으면 저장을 다시 시작하지 않는다.
 */
export function useSaveShortcut({ onSave, enabled }: UseSaveShortcutOptions) {
  const onSaveRef = useRef(onSave);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSaveShortcut(event)) return;
      // 한글 조합 중에는 브라우저 기본 동작도 건드리지 않는다.
      if (event.isComposing) return;

      // 편집기 안에서는 Ctrl+S 로 '페이지 저장' 창이 절대 뜨지 않게 한다.
      event.preventDefault();

      if (event.repeat) return;
      if (!enabledRef.current) return;
      if (hasBlockingEditorOverlay()) return;

      onSaveRef.current();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);
}
