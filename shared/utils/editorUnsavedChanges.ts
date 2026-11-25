// 편집기 상단에 보여 줄 저장 상태 문구를 순수하게 계산한다.
// 화면(EditorSaveStatus)과 테스트가 같은 문구를 쓰도록 한 곳에 모아 둔다.

export type EditorSaveStatusTone = 'saved' | 'dirty' | 'unsaved';

export type EditorSaveStatusView = {
  tone: EditorSaveStatusTone;
  label: string;
  description: string;
};

export function getEditorSaveStatusView({
  isDirty,
  hasSavedInvitation,
}: {
  isDirty: boolean;
  hasSavedInvitation: boolean;
}): EditorSaveStatusView {
  if (isDirty) {
    return {
      tone: 'dirty',
      label: '저장하지 않은 변경사항',
      description:
        '고친 내용이 아직 저장되지 않았어요. 창을 닫으면 사라질 수 있어요.',
    };
  }

  if (!hasSavedInvitation) {
    return {
      tone: 'unsaved',
      label: '아직 저장 전',
      description:
        '아직 초대장을 저장하지 않았어요. 저장하면 하객에게 보낼 링크가 만들어져요.',
    };
  }

  return {
    tone: 'saved',
    label: '저장됨',
    description: '마지막 저장 이후 바뀐 내용이 없어요.',
  };
}

// /editor/[id]는 이미 저장된 초대장을 여는 화면이라, 스토어가 아직 uuid를
// 채우기 전에도 '아직 저장 전'으로 잘못 보이지 않게 경로로 먼저 판단한다.
export function isEditorDetailPath(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }

  return /^\/editor\/[^/]+\/?$/.test(pathname);
}
