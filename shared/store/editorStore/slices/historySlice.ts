import { StateCreator } from 'zustand';

import type { EditorState, HistorySlice } from '@/shared/types/block';

import {
  blockHistoryApplyGuard,
  createBlockHistoryState,
  takeBlockHistoryRedo,
  takeBlockHistoryUndo,
  type BlockHistoryStep,
} from '../blockHistory';

export const createHistorySlice: StateCreator<
  EditorState,
  [],
  [],
  HistorySlice
> = (set, get) => {
  const apply = (step: BlockHistoryStep | null) => {
    if (!step) return;

    blockHistoryApplyGuard.applying = true;
    try {
      set({
        block: step.snapshot.block,
        selectedId: step.snapshot.selectedId,
        ...step.patch,
      });
    } finally {
      blockHistoryApplyGuard.applying = false;
    }
  };

  return {
    ...createBlockHistoryState(),
    undo: () => apply(takeBlockHistoryUndo(get())),
    redo: () => apply(takeBlockHistoryRedo(get())),
    clearHistory: () => set(createBlockHistoryState()),
  };
};
