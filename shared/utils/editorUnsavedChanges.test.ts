import { getEditorSaveStatusView } from './editorUnsavedChanges';

describe('편집기 저장 상태 문구', () => {
  it('저장된 초대장에 바뀐 내용이 없으면 저장됨으로 보여 준다', () => {
    expect(
      getEditorSaveStatusView({ isDirty: false, hasSavedInvitation: true })
    ).toEqual({
      tone: 'saved',
      label: '저장됨',
      description: '마지막 저장 이후 바뀐 내용이 없어요.',
    });
  });

  it('고친 내용이 있으면 저장하지 않은 변경사항으로 알린다', () => {
    const view = getEditorSaveStatusView({
      isDirty: true,
      hasSavedInvitation: true,
    });

    expect(view.tone).toBe('dirty');
    expect(view.label).toBe('저장하지 않은 변경사항');
    expect(view.description).toContain('사라질 수 있어요');
  });

  it('한 번도 저장하지 않은 새 초대장은 저장 전으로 구분한다', () => {
    const view = getEditorSaveStatusView({
      isDirty: false,
      hasSavedInvitation: false,
    });

    expect(view.tone).toBe('unsaved');
    expect(view.label).toBe('아직 저장 전');
  });

  it('저장 전이라도 고친 내용이 있으면 변경사항을 먼저 알린다', () => {
    expect(
      getEditorSaveStatusView({ isDirty: true, hasSavedInvitation: false }).tone
    ).toBe('dirty');
  });
});
