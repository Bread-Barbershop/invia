import { Canvas } from 'fabric';
import { useEffect, RefObject } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import {
  isEditorEditableTarget,
  shouldIgnoreEditorShortcut,
} from '@/shared/utils/editorShortcutGuard';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { isTextboxObject } from '../utils/fabricUtils';

const arrowOffsets: Partial<Record<string, readonly [number, number]>> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export const useKeyboardEvents = (
  canvas: Canvas | null,
  isMouseInCanvasRef: RefObject<boolean>
) => {
  const {
    copy,
    paste,
    lock,
    unLock,
    moveUp,
    moveDown,
    moveTop,
    moveBottom,
    undo,
    redo,
    handleDeleteShape,
    toggleDrawingMode,
  } = useFabricContext();

  const { setActiveTab } = useEditorStore(
    useShallow(state => ({
      setActiveTab: state.setActiveTab,
    }))
  );

  useEffect(() => {
    if (!canvas) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      if (isEditorEditableTarget(e.target)) return;

      const hasActiveObj = canvas.getActiveObjects().length > 0;
      if (!isMouseInCanvasRef.current && !hasActiveObj) return;

      const mod = e.ctrlKey || e.metaKey;

      const offset = arrowOffsets[e.key];
      if (offset) {
        const text = canvas.getActiveObject();
        if (
          shouldIgnoreEditorShortcut(e) ||
          useEditorStore.getState().selectedId !== 'mainPoster' ||
          !isTextboxObject(text) || text.isEditing ||
          (offset[0] && text.lockMovementX) || (offset[1] && text.lockMovementY)
        ) return;

        e.preventDefault();
        text.set({ left: text.left + offset[0], top: text.top + offset[1] });
        text.setCoords();
        canvas.requestRenderAll();
        canvas.fire('object:modified', { target: text, action: 'drag' });
        return;
      }

      if (mod && e.code === 'KeyC') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          copy();
        }
      }

      if (mod && e.code === 'KeyV') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (!isEditingText) {
          e.preventDefault();
          paste();
        }
      }

      if (mod && !e.shiftKey && e.code === 'KeyL') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          lock(activeObj);
        }
      }

      if (mod && e.shiftKey && e.code === 'KeyL') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          unLock(activeObj);
        }
      }

      if (mod && e.shiftKey && e.code === 'BracketLeft') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          moveTop(activeObj);
        }
      }

      if (mod && e.shiftKey && e.code === 'BracketRight') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          moveBottom(activeObj);
        }
      }

      if (mod && !e.shiftKey && e.code === 'BracketLeft') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          moveUp(activeObj);
        }
      }

      if (mod && !e.shiftKey && e.code === 'BracketRight') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          moveDown(activeObj);
        }
      }

      if (e.key === 'Delete') {
        if (shouldIgnoreEditorShortcut(e)) return;

        const { block, selectedId } = useEditorStore.getState();
        const isSelectedBlock =
          selectedId !== null &&
          selectedId !== 'mainPoster' &&
          block.some(item => item.id === selectedId);

        if (!isSelectedBlock) {
          handleDeleteShape(canvas, e);
        }
      }

      if (mod && !e.shiftKey && e.code === 'KeyZ') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;

        if (!isEditingText) {
          e.preventDefault();
          undo();
        }
      }

      if (mod && e.shiftKey && e.code === 'KeyZ') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;

        if (!isEditingText) {
          e.preventDefault();
          redo();
        }
      }

      if (e.key === 'Escape') {
        canvas.discardActiveObject();
        if (canvas.isDrawingMode) {
          toggleDrawingMode(canvas, { enable: false });
          setActiveTab('background');
        }
        canvas.renderAll();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [
    canvas,
    isMouseInCanvasRef,
    copy,
    paste,
    handleDeleteShape,
    moveUp,
    moveDown,
    moveTop,
    moveBottom,
    lock,
    unLock,
    undo,
    redo,
    toggleDrawingMode,
    setActiveTab,
  ]);
};
