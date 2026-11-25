import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

import { DEFAULT_SCROLL_ANIMATION } from '@/components/molecules/scroll-fade-in/animationConfig';
import { DEFAULT_BACKGROUND_TEXTURE } from '@/shared/data/backgroundTextures';
import {
  BODY_BULK_DATA,
  DEFAULT_BACKGROUND_COLOR,
  TITLE_BULK_DATA,
} from '@/shared/data/sample/bulkData';
import { EditorState } from '@/shared/types/block';
import { createDefaultShareUrlState } from '@/shared/utils/shareUrlDefaults';

import {
  blockHistoryApplyGuard,
  createBlockHistoryState,
  recordBlockHistory,
} from './blockHistory';
import { createBlockSlice } from './slices/blockSlice';
import { createBulkSlice } from './slices/bulkSlice';
import { createDriveSlice } from './slices/driveSlice';
import { createHistorySlice } from './slices/historySlice';
import { createImageSlice } from './slices/imageSlice';
import { createShareUrlSlice } from './slices/shareUrlSlice';
import { createUISlice } from './slices/uiSlice';

export const useEditorStore = create<EditorState>()(
  devtools(
    subscribeWithSelector((...a) => {
      const [set] = a;
      return {
        ...createBlockSlice(...a),
        ...createImageSlice(...a),
        ...createUISlice(...a),
        ...createDriveSlice(...a),
        ...createBulkSlice(...a),
        ...createShareUrlSlice(...a),
        ...createHistorySlice(...a),
        reset: () => {
          // reset이 블록을 비우는 것까지 실행 취소 단계로 쌓이지 않게 막는다.
          blockHistoryApplyGuard.applying = true;
          try {
            set({
              block: [],
              images: [],
              isEdit: false,
              selectedId: null,
              activeTab: null,
              drawingConfig: { width: 5, color: { h: 0, s: 0, v: 0, a: 1 } },
              shapeConfig: {
                strokeWidth: 2,
                strokeColor: { h: 0, s: 0, v: 0, a: 1 },
                fillColor: { h: 0, s: 0, v: 0, a: 0 },
              },
              invitationFolderId: '',
              invitationUuid: '',
              audioFolderId: '',
              imageFolderId: '',
              backgroundColor: DEFAULT_BACKGROUND_COLOR,
              backgroundTexture: DEFAULT_BACKGROUND_TEXTURE,
              sectionStyle: undefined,
              titleData: TITLE_BULK_DATA,
              bodyData: BODY_BULK_DATA,
              isZoom: false,
              invitationPrivacy: undefined,
              scrollAnimation: DEFAULT_SCROLL_ANIMATION,
              invitationEffects: undefined,
              invitationEffectsReplay: 0,
              shareUrl: createDefaultShareUrlState(),
              hashFiles: [],
              cleanUpFiles: [],
              shareUrlTab: 'url',
              isDirty: false,
              ...createBlockHistoryState(),
            });
          } finally {
            blockHistoryApplyGuard.applying = false;
          }
        },
      };
    })
  )
);

/**
 * 블록 배열이 바뀔 때마다 직전 상태를 실행 취소 이력에 쌓는다.
 * 스토어 생성 시 한 번만 등록해 두고, 실행 취소/재실행으로 인한 변경은 기록하지 않는다.
 */
useEditorStore.subscribe(
  state => ({ block: state.block, selectedId: state.selectedId }),
  (current, previous) => {
    if (blockHistoryApplyGuard.applying) return;
    if (current.block === previous.block) return;

    const patch = recordBlockHistory(
      useEditorStore.getState(),
      previous,
      current
    );
    if (patch) useEditorStore.setState(patch);
  },
  { equalityFn: shallow }
);

export const selectUploadData = (state: EditorState) => ({
  images: state.images,
  block: state.block,
  invitationUuid: state.invitationUuid,
  imageFolderId: state.imageFolderId,
  audioFolderId: state.audioFolderId,
  backgroundColor: state.backgroundColor,
  backgroundTexture: state.backgroundTexture,
  sectionStyle: state.sectionStyle,
  titleData: state.titleData,
  bodyData: state.bodyData,
  isZoom: state.isZoom,
  invitationPrivacy: state.invitationPrivacy,
  scrollAnimation: state.scrollAnimation,
  invitationEffects: state.invitationEffects,
  shareUrl: state.shareUrl,
  setInvitationFolderId: state.setInvitationFolderId,
  setInvitationUuid: state.setInvitationUuid,
  setImageFolderId: state.setImageFolderId,
  setAudioFolderId: state.setAudioFolderId,
});
