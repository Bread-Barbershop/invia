import type { EditorDraftSnapshot } from '@/features/editor/draft/editorDraft';
import { hydrateShareUrlState } from '@/shared/utils/shareUrlDefaults';

import type { SavedData } from '../[id]/types/savedata';

// 저장 직전에 로그인으로 막힌 초안을 에디터가 읽는 SavedData 형태로 되살린다.
export function toEditorDraftSavedData(draft: EditorDraftSnapshot): SavedData {
  return {
    bulkData: {
      backgroundColor: draft.bulkData.backgroundColor,
      backgroundTexture: draft.bulkData.backgroundTexture,
      sectionStyle: draft.bulkData.sectionStyle,
      titleData: draft.bulkData.titleData,
      bodyData: draft.bulkData.bodyData,
      isZoom: draft.bulkData.isZoom,
      invitationPrivacy: draft.bulkData.invitationPrivacy,
      scrollAnimation: draft.bulkData.scrollAnimation,
      invitationEffects: draft.bulkData.invitationEffects,
    },
    blocks: draft.blocks,
    mainPoster: JSON.stringify(draft.mainPoster),
    bgm: {
      bgmInfo: draft.bgm,
      bgmFile: draft.audioFile,
    },
    shareUrl: hydrateShareUrlState(draft.shareUrl),
    imageFolderId: '',
    audioFolderId: '',
    invitationImage: draft.images,
  };
}
