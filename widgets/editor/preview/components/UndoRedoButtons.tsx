'use client';

import { Redo2, Undo2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { isCoverCanvasPointerInside } from '@/shared/utils/coverCanvasPointer';
import {
  resolveEditorHistoryAction,
  type EditorHistoryAction,
} from '@/shared/utils/editorHistoryShortcut';

const UNDO_SHORTCUT_HINT = 'Ctrl+Z / ⌘Z';
const REDO_SHORTCUT_HINT = 'Ctrl+Shift+Z / ⌘⇧Z';

const buttonClassName =
  'flex h-11 flex-1 items-center justify-center rounded-lg bg-white text-text-primary shadow-edit transition-colors enabled:hover:bg-neutral-50 enabled:active:bg-[#F5F8FF] disabled:cursor-not-allowed disabled:text-neutral-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/**
 * 블록 편집 실행 취소·다시 실행 버튼과 키보드 단축키.
 * 글자 입력 중이거나 커버 포스터 캔버스를 만지는 중에는 브라우저·캔버스의
 * 실행 취소를 가로채지 않는다.
 */
function UndoRedoButtons() {
  const { canUndo, canRedo } = useEditorStore(
    useShallow(state => ({
      canUndo: state.canUndo,
      canRedo: state.canRedo,
    }))
  );
  const [announcement, setAnnouncement] = useState('');

  const runAction = useCallback((action: EditorHistoryAction) => {
    const state = useEditorStore.getState();

    if (action === 'undo') {
      if (!state.canUndo) return false;
      state.undo();
      setAnnouncement('실행 취소했습니다.');
      return true;
    }

    if (!state.canRedo) return false;
    state.redo();
    setAnnouncement('다시 실행했습니다.');
    return true;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = resolveEditorHistoryAction(event, {
        selectedId: useEditorStore.getState().selectedId,
        isCoverCanvasActive: isCoverCanvasPointerInside(),
      });

      if (!action) return;
      if (!runAction(action)) return;

      event.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runAction]);

  return (
    <div
      className="flex w-full gap-2"
      role="group"
      aria-label="블록 실행 취소 및 다시 실행"
    >
      <button
        type="button"
        aria-label="실행 취소"
        aria-keyshortcuts="Control+Z Meta+Z"
        title={`실행 취소 (${UNDO_SHORTCUT_HINT})`}
        disabled={!canUndo}
        onClick={() => runAction('undo')}
        className={buttonClassName}
      >
        <Undo2 size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="다시 실행"
        aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y"
        title={`다시 실행 (${REDO_SHORTCUT_HINT})`}
        disabled={!canRedo}
        onClick={() => runAction('redo')}
        className={buttonClassName}
      >
        <Redo2 size={18} aria-hidden="true" />
      </button>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

export default UndoRedoButtons;
