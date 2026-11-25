/**
 * @jest-environment jsdom
 */

import {
  EDITOR_DRAFT_MAX_AGE_MS,
  clearEditorDraft,
  createEditorDraftSnapshot,
  isEditorDraftUsable,
  loadEditorDraft,
  saveEditorDraft,
} from './editorDraft';

import type { EditorDraftInput } from './editorDraft';

const bulkData = {
  backgroundColor: '#ffffff',
  titleData: {
    font: 'font-lineseed',
    fontSize: '20px',
    fontWeight: '700',
    color: '#111111',
    isDefault: false,
  },
  bodyData: {
    font: 'font-lineseed',
    fontSize: '16px',
    fontWeight: '500',
    color: '#222222',
    isDefault: false,
  },
  isZoom: false,
  scrollAnimation: {
    animationType: 'fade-up' as const,
    triggerMode: 'down-only' as const,
    animationDurationMs: 700,
    animationEasing: 'natural' as const,
  },
};

const shareUrl = {
  title: '초대장',
  description: '초대합니다',
  images: [],
  urlTitle: '초대장',
  urlDescription: '초대합니다',
  urlImage: [],
  showLocationButton: false,
};

const bgm = {
  selectedBgmId: null,
  isLoop: false,
  volume: 0.2,
  userBgmTitle: null,
  userBgmDuration: null,
  userBgmFileId: null,
};

function createInput(file: File): EditorDraftInput {
  return {
    bulkData,
    blocks: [],
    images: [{ id: 'gallery', file }],
    shareUrl,
    bgm,
    audioFile: null,
    mainPoster: { version: '7.1.0', objects: [] },
  };
}

beforeEach(async () => {
  await clearEditorDraft();
});

it('사진 파일을 잃지 않고 초안 스냅샷을 만든다', () => {
  const file = new File(['photo'], 'photo.png', { type: 'image/png' });
  const snapshot = createEditorDraftSnapshot(createInput(file));

  expect(snapshot.version).toBe(1);
  expect(snapshot.images[0].file).toBe(file);
  expect(typeof snapshot.savedAt).toBe('number');
});

it('저장한 초안을 다시 불러오고 지울 수 있다', async () => {
  const file = new File(['photo'], 'photo.png', { type: 'image/png' });

  await saveEditorDraft(createInput(file));
  const restored = await loadEditorDraft();

  expect(restored?.images[0].file).toBe(file);

  await clearEditorDraft();
  expect(await loadEditorDraft()).toBeNull();
});

it('일주일이 지난 초안은 되살리지 않는다', () => {
  const file = new File(['photo'], 'photo.png', { type: 'image/png' });
  const fresh = createEditorDraftSnapshot(createInput(file), Date.now());
  const stale = createEditorDraftSnapshot(
    createInput(file),
    Date.now() - EDITOR_DRAFT_MAX_AGE_MS - 1000
  );

  expect(isEditorDraftUsable(fresh)).toBe(true);
  expect(isEditorDraftUsable(stale)).toBe(false);
});
