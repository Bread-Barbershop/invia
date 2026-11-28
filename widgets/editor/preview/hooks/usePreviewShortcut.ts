import { useEffect, useRef } from 'react';

/** 미리보기 버튼에 알려 줄 단축키 조합(스크린리더용). */
export const PREVIEW_SHORTCUT_ARIA_KEYS = 'Control+Enter Meta+Enter';

/** 미리보기까지 가로막는 오버레이(모달·팝업). */
const BLOCKING_OVERLAY_SELECTOR =
  '[role="dialog"][aria-modal="true"], dialog[open], [data-editor-popup="true"]';

/**
 * Ctrl+Enter / ⌘+Enter 인지 판별한다.
 * Alt·Shift 조합은 브라우저·OS 단축키와 겹치므로 제외한다.
 */
export function isPreviewShortcut(event: KeyboardEvent) {
  const ctrlOrMeta = event.ctrlKey || event.metaKey;
  if (!ctrlOrMeta || event.altKey || event.shiftKey) return false;

  return event.key === 'Enter';
}

/** 미리보기를 막아야 하는 모달·팝업이 열려 있는지 확인한다. */
export function hasBlockingEditorOverlay(
  doc: Document | null | undefined = typeof document === 'undefined'
    ? undefined
    : document
) {
  if (!doc) return false;
  return doc.querySelector(BLOCKING_OVERLAY_SELECTOR) !== null;
}

type UsePreviewShortcutOptions = {
  /** 미리보기 버튼을 눌렀을 때와 완전히 같은 동작. */
  onOpen: () => void;
  /** 지금 미리보기를 열 수 있는 상태인지(준비 중이면 false). */
  enabled: boolean;
};

/**
 * 편집기에서 Ctrl+Enter / ⌘+Enter 로 미리보기를 연다.
 *
 * - 조합이 맞으면 브라우저 기본 동작을 preventDefault 한다.
 * - 한글 입력 조합 중(isComposing)이거나 키를 누르고 있을 때(repeat)에는 동작하지 않는다.
 * - 다른 모달·블록 추가 팝업이 열려 있으면 미리보기를 겹쳐 열지 않는다.
 */
export function usePreviewShortcut({
  onOpen,
  enabled,
}: UsePreviewShortcutOptions) {
  const onOpenRef = useRef(onOpen);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPreviewShortcut(event)) return;
      // 한글 조합 중에는 브라우저 기본 동작도 건드리지 않는다.
      if (event.isComposing) return;

      event.preventDefault();

      if (event.repeat) return;
      if (!enabledRef.current) return;
      if (hasBlockingEditorOverlay()) return;

      onOpenRef.current();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);
}
