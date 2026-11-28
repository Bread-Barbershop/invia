/**
 * @jest-environment jsdom
 */

import {
  BLANK_EDITOR_DRAFT_KEY,
  EDITOR_DRAFT_MAX_AGE_MS,
  clearEditorDraft,
  createEditorDraftSnapshot,
  discardEditorDraft,
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
  await clearEditorDraft(BLANK_EDITOR_DRAFT_KEY);
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

  await saveEditorDraft(BLANK_EDITOR_DRAFT_KEY, createInput(file));
  const restored = await loadEditorDraft(BLANK_EDITOR_DRAFT_KEY);

  expect(restored?.images[0].file).toBe(file);

  await clearEditorDraft(BLANK_EDITOR_DRAFT_KEY);
  expect(await loadEditorDraft(BLANK_EDITOR_DRAFT_KEY)).toBeNull();
});

it('저장 시각이 같은 초안이라도 확인 이후 갱신됐으면 지우지 않는다', async () => {
  const clock = jest.spyOn(Date, 'now').mockReturnValue(Date.now());
  try {
    const first = new File(['first'], 'first.png');
    const latest = new File(['latest'], 'latest.png');

    await saveEditorDraft(BLANK_EDITOR_DRAFT_KEY, createInput(first));
    const shown = await loadEditorDraft(BLANK_EDITOR_DRAFT_KEY);
    if (!shown) throw new Error('삭제 확인에 표시할 초안을 불러오지 못했어요.');

    await saveEditorDraft(BLANK_EDITOR_DRAFT_KEY, createInput(latest));
    const result = await discardEditorDraft(BLANK_EDITOR_DRAFT_KEY, shown);

    expect(result.status).toBe('changed');
    const remaining = await loadEditorDraft(BLANK_EDITOR_DRAFT_KEY);
    expect(remaining?.savedAt).toBe(shown.savedAt);
    expect(remaining?.images[0].file).toBe(latest);
  } finally {
    clock.mockRestore();
  }
});

it('같은 이름의 샘플과 템플릿에서 보관한 초안을 따로 불러오고 지운다', async () => {
  const sampleFile = new File(['sample'], 'sample.png');
  const templateFile = new File(['template'], 'template.png');
  const sampleKey = 'sample:wedding_14';
  const templateKey = 'template:wedding_14';

  await saveEditorDraft(sampleKey, createInput(sampleFile));
  await saveEditorDraft(templateKey, createInput(templateFile));

  expect(await loadEditorDraft(BLANK_EDITOR_DRAFT_KEY)).toBeNull();
  expect((await loadEditorDraft(sampleKey))?.images[0].file).toBe(sampleFile);
  await clearEditorDraft(sampleKey);
  expect(await loadEditorDraft(sampleKey)).toBeNull();
  expect((await loadEditorDraft(templateKey))?.images[0].file).toBe(
    templateFile
  );
  await clearEditorDraft(templateKey);
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
