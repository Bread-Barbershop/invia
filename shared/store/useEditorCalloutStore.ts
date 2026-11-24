import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

export type EditorCalloutId =
  | 'add-page-button'
  | 'order-panel'
  | 'preview-panel';

export type EditorCalloutState = Record<EditorCalloutId, boolean>;

type EditorCalloutStore = {
  callouts: EditorCalloutState;
  setCalloutOpen: (id: EditorCalloutId, open: boolean) => void;
  showCallout: (id: EditorCalloutId) => void;
  showCalloutFor: (id: EditorCalloutId, durationMs?: number) => void;
  showAllCallouts: () => void;
  showAllCalloutsFor: (durationMs?: number) => void;
  hideCallout: (id: EditorCalloutId) => void;
  showOnlyCallout: (id: EditorCalloutId) => void;
  hideAllCallouts: () => void;
  resetCallouts: () => void;
};

export const DEFAULT_EDITOR_CALLOUTS: EditorCalloutState = {
  'add-page-button': false,
  'order-panel': false,
  'preview-panel': false,
};

const DEFAULT_AUTO_HIDE_MS = 6000;
const autoHideTimers = new Map<EditorCalloutId, ReturnType<typeof setTimeout>>();

const clearAutoHideTimer = (id: EditorCalloutId) => {
  clearTimeout(autoHideTimers.get(id));
  autoHideTimers.delete(id);
};

const clearAutoHideTimers = () => {
  autoHideTimers.forEach(timer => clearTimeout(timer));
  autoHideTimers.clear();
};

const scheduleAutoHide = (
  id: EditorCalloutId,
  durationMs: number,
  hideCallout: (id: EditorCalloutId) => void
) => {
  clearAutoHideTimer(id);
  autoHideTimers.set(id, setTimeout(() => hideCallout(id), durationMs));
};

const isDesktopViewport = () =>
  typeof window === 'undefined' ||
  window.innerWidth >= DESKTOP_CONTENT_MIN_WIDTH;

const createCallouts = (open: boolean): EditorCalloutState =>
  Object.fromEntries(
    (Object.keys(DEFAULT_EDITOR_CALLOUTS) as EditorCalloutId[]).map(id => [
      id,
      open,
    ])
  ) as EditorCalloutState;

export const useEditorCalloutStore = create<EditorCalloutStore>()(
  devtools(
    (set, get) => ({
      callouts: DEFAULT_EDITOR_CALLOUTS,
      setCalloutOpen: (id, open) => {
        if (open && !isDesktopViewport()) return;
        clearAutoHideTimer(id);
        set(
          state => ({
            callouts: {
              ...state.callouts,
              [id]: open,
            },
          }),
          false,
          'editorCallout/setOpen'
        );
      },
      showCallout: id => {
        if (!isDesktopViewport()) return;
        clearAutoHideTimer(id);
        set(
          state => ({
            callouts: {
              ...state.callouts,
              [id]: true,
            },
          }),
          false,
          'editorCallout/show'
        );
      },
      showCalloutFor: (id, durationMs = DEFAULT_AUTO_HIDE_MS) => {
        if (!isDesktopViewport()) return;
        const { showCallout, hideCallout } = get();
        showCallout(id);
        scheduleAutoHide(id, durationMs, hideCallout);
      },
      showAllCallouts: () => {
        clearAutoHideTimers();
        if (!isDesktopViewport()) return;
        set(
          {
            callouts: createCallouts(true),
          },
          false,
          'editorCallout/showAll'
        );
      },
      showAllCalloutsFor: (durationMs = DEFAULT_AUTO_HIDE_MS) => {
        clearAutoHideTimers();
        if (!isDesktopViewport()) return;
        set(
          {
            callouts: createCallouts(true),
          },
          false,
          'editorCallout/showAllFor'
        );
        const { hideCallout } = get();
        (Object.keys(DEFAULT_EDITOR_CALLOUTS) as EditorCalloutId[]).forEach(
          id => scheduleAutoHide(id, durationMs, hideCallout)
        );
      },
      hideCallout: id => {
        clearAutoHideTimer(id);
        set(
          state => ({
            callouts: {
              ...state.callouts,
              [id]: false,
            },
          }),
          false,
          'editorCallout/hide'
        );
      },
      showOnlyCallout: id => {
        clearAutoHideTimers();
        if (!isDesktopViewport()) return;
        set(
          {
            callouts: {
              ...createCallouts(false),
              [id]: true,
            },
          },
          false,
          'editorCallout/showOnly'
        );
      },
      hideAllCallouts: () => {
        clearAutoHideTimers();
        set(
          {
            callouts: createCallouts(false),
          },
          false,
          'editorCallout/hideAll'
        );
      },
      resetCallouts: () => {
        clearAutoHideTimers();
        set(
          {
            callouts: DEFAULT_EDITOR_CALLOUTS,
          },
          false,
          'editorCallout/reset'
        );
      },
    }),
    { name: 'editor-callout-store' }
  )
);
