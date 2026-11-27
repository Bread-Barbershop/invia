import {
  describeEditorDraftSavedAt,
  summarizeEditorDraft,
} from './draftRecovery';

import type { EditorDraftSnapshot } from './editorDraft';

function createDraft(
  overrides: Partial<EditorDraftSnapshot> = {}
): EditorDraftSnapshot {
  return {
    version: 1,
    savedAt: new Date(2026, 10, 26, 15, 4).getTime(),
    bulkData: {
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
        animationType: 'fade-up',
        triggerMode: 'down-only',
        animationDurationMs: 700,
        animationEasing: 'natural',
      },
    },
    blocks: [],
    images: [],
    shareUrl: {
      title: '초대장',
      description: '초대합니다',
      images: [],
      urlTitle: '초대장',
      urlDescription: '초대합니다',
      urlImage: [],
      showLocationButton: false,
    },
    bgm: {
      selectedBgmId: null,
      isLoop: false,
      volume: 0.2,
      userBgmTitle: null,
      userBgmDuration: null,
      userBgmFileId: null,
    },
    audioFile: null,
    mainPoster: { version: '7.1.0', objects: [] },
    ...overrides,
  };
}

describe('describeEditorDraftSavedAt', () => {
  const now = new Date(2026, 10, 26, 20, 0).getTime();

  it.each([
    ['1분이 안 됐으면 방금 전', now - 30 * 1000, '방금 전 저장'],
    ['1분 단위로 올림 없이 센다', now - 5 * 60 * 1000 - 59 * 1000, '5분 전 저장'],
    ['한 시간이 안 됐으면 분으로 센다', now - 59 * 60 * 1000, '59분 전 저장'],
    ['오늘 안이면 오늘 시각을 보여 준다', new Date(2026, 10, 26, 9, 5).getTime(), '오늘 오전 9:05 저장'],
    ['정오는 오후 12시로 읽는다', new Date(2026, 10, 26, 12, 0).getTime(), '오늘 오후 12:00 저장'],
    ['자정은 오전 12시로 읽는다', new Date(2026, 10, 26, 0, 30).getTime(), '오늘 오전 12:30 저장'],
  ])('%s', (_label, savedAt, expected) => {
    expect(describeEditorDraftSavedAt(savedAt, now)).toBe(expected);
  });

  it('자정을 넘겼으면 시간이 아니라 날짜로 어제를 말한다', () => {
    expect(
      describeEditorDraftSavedAt(
        new Date(2026, 10, 25, 20, 12).getTime(),
        new Date(2026, 10, 26, 9, 0).getTime()
      )
    ).toBe('어제 오후 8:12 저장');
  });

  it('자정을 넘겨도 한 시간이 안 되면 분 단위가 더 정확하다', () => {
    expect(
      describeEditorDraftSavedAt(
        new Date(2026, 10, 25, 23, 40).getTime(),
        new Date(2026, 10, 26, 0, 20).getTime()
      )
    ).toBe('40분 전 저장');
  });

  it('이틀 이상 지난 초안은 날짜를 보여 준다', () => {
    expect(describeEditorDraftSavedAt(new Date(2026, 10, 23, 15, 4).getTime(), now)).toBe(
      '11월 23일 오후 3:04 저장'
    );
  });

  it('해가 바뀐 초안은 연도까지 보여 준다', () => {
    expect(
      describeEditorDraftSavedAt(
        new Date(2025, 11, 31, 23, 59).getTime(),
        new Date(2026, 0, 2, 10, 0).getTime()
      )
    ).toBe('2025년 12월 31일 오후 11:59 저장');
  });

  it('시계가 어긋나 저장 시각이 미래면 방금 전으로 다룬다', () => {
    expect(describeEditorDraftSavedAt(now + 60 * 1000, now)).toBe('방금 전 저장');
  });
});

describe('summarizeEditorDraft', () => {
  const now = new Date(2026, 10, 26, 20, 0).getTime();

  it('사진과 블록 수를 저장 시각과 함께 한 줄로 만든다', () => {
    const draft = createDraft({
      savedAt: now - 12 * 60 * 1000,
      images: [
        { id: 'gallery', file: new File(['a'], 'a.png', { type: 'image/png' }) },
        { id: 'gallery', file: new File(['b'], 'b.png', { type: 'image/png' }) },
      ],
      blocks: [
        { id: 'block-1', component: 'gallery' },
        { id: 'block-2', component: 'guestbook' },
        { id: 'block-3', component: 'place' },
      ] as EditorDraftSnapshot['blocks'],
    });

    expect(summarizeEditorDraft(draft, now)).toBe(
      '사진 2장 · 블록 3개 · 12분 전 저장'
    );
  });

  it('비어 있는 초안은 개수를 지어내지 않고 저장 시각만 말한다', () => {
    const draft = createDraft({ savedAt: now - 30 * 1000 });

    expect(summarizeEditorDraft(draft, now)).toBe('방금 전 저장');
  });

  it('사진만 있거나 블록만 있어도 있는 것만 센다', () => {
    const photosOnly = createDraft({
      savedAt: now - 30 * 1000,
      images: [
        { id: 'gallery', file: new File(['a'], 'a.png', { type: 'image/png' }) },
      ],
    });

    expect(summarizeEditorDraft(photosOnly, now)).toBe(
      '사진 1장 · 방금 전 저장'
    );
  });
});
