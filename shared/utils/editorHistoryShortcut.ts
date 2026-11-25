import { isEditorEditableTarget } from './editorShortcutGuard';

export type EditorHistoryAction = 'undo' | 'redo';

/**
 * 열려 있는 동안에는 블록 실행 취소를 가로채지 않는 팝업들.
 * 팝업 안에서의 Ctrl+Z는 그 팝업의 입력을 되돌리는 동작이어야 한다.
 */
const HISTORY_BLOCKING_SELECTOR =
  'dialog[open], [aria-modal="true"], [role="menu"], [data-editor-popup="true"]';

export type EditorHistoryShortcutContext = {
  /** 커버 포스터(메인 포스터)를 편집 중이면 포스터 캔버스의 실행 취소가 우선이다. */
  selectedId: string | null;
  /** 포인터가 커버 포스터 캔버스 위에 있으면 fabric 실행 취소와 겹치지 않게 비켜준다. */
  isCoverCanvasActive?: boolean;
};

/**
 * 키 이벤트가 블록 실행 취소/재실행 단축키인지 판별한다.
 * 입력 중이거나 커버 포스터 캔버스가 앞에 있는 경우에는 null을 돌려준다.
 */
export function resolveEditorHistoryAction(
  event: KeyboardEvent,
  context: EditorHistoryShortcutContext
): EditorHistoryAction | null {
  if (event.defaultPrevented || event.repeat || event.isComposing) return null;
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return null;

  const key = typeof event.key === 'string' ? event.key.toLowerCase() : '';
  const action: EditorHistoryAction | null =
    key === 'z'
      ? event.shiftKey
        ? 'redo'
        : 'undo'
      : key === 'y' && event.ctrlKey && !event.metaKey
        ? 'redo'
        : null;

  if (!action) return null;

  // 글자 입력 중이면 브라우저·에디터의 기본 실행 취소를 그대로 둔다.
  if (isEditorEditableTarget(event.target)) return null;

  // 커버 포스터 캔버스 모드에서는 fabric 캔버스의 실행 취소를 가로채지 않는다.
  if (context.isCoverCanvasActive) return null;
  if (context.selectedId === 'mainPoster') return null;

  if (
    typeof document !== 'undefined' &&
    document.querySelector(HISTORY_BLOCKING_SELECTOR)
  ) {
    return null;
  }

  return action;
}
