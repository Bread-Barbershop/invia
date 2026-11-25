/**
 * 편집기 화면의 주요 영역으로 건너뛰는 링크(스킵 링크)가 가리키는 대상.
 *
 * 편집기는 왼쪽 스타일 패널(글꼴·색·질감 등)과 오른쪽 표지 선택 패널이
 * 모두 DOM 앞쪽에 있어서, 키보드로 미리보기나 도구 버튼까지 가려면
 * Tab 키를 60번 넘게 눌러야 한다. 그래서 화면 맨 앞에 영역 이동 링크를 둔다.
 */
export type EditorSkipTarget = {
  /** 이동할 요소의 id */
  id: string;
  /** 링크에 보이는 문구 */
  label: string;
  /** 대상이 아직 접근 가능한 이름을 갖지 못했을 때 붙일 영역 이름 */
  regionLabel: string;
  /**
   * 포커스 링 클래스를 넣을 수 없는 대상(다른 컴포넌트가 그리는 요소)이면
   * 포커스를 옮긴 뒤 포커스가 떠날 때까지 인라인 링을 그린다.
   */
  ringInStyle?: boolean;
};

export const EDITOR_SKIP_TARGETS: readonly EditorSkipTarget[] = [
  {
    id: 'editor-style-panel',
    label: '편집 도구로 바로가기',
    regionLabel: '편집 도구',
  },
  {
    id: 'preview-container',
    label: '미리보기로 바로가기',
    regionLabel: '미리보기',
    ringInStyle: true,
  },
  {
    id: 'editor-block-panel',
    label: '블록 설정으로 바로가기',
    regionLabel: '블록 설정',
  },
];

function hasAccessibleName(element: HTMLElement) {
  return Boolean(
    element.getAttribute('aria-label')?.trim() ||
      element.getAttribute('aria-labelledby')?.trim()
  );
}

/** 편집기 공통 포커스 링 색(--color-primary)과 같은 값을 쓴다. */
const FOCUS_RING_COLOR = 'var(--color-primary, #1f72ef)';

/** 포커스를 받은 동안만 보이는 인라인 링. 포커스가 떠나면 원래대로 되돌린다. */
function applyTransientFocusRing(element: HTMLElement) {
  element.style.outline = `2px solid ${FOCUS_RING_COLOR}`;
  element.style.outlineOffset = '2px';

  const clear = () => {
    element.style.outline = '';
    element.style.outlineOffset = '';
    element.removeEventListener('blur', clear);
  };

  element.addEventListener('blur', clear);
}

/**
 * 이동 대상이 스크린리더에서 이름 있는 영역으로 읽히도록 준비한다.
 *
 * 미리보기 영역(`#preview-container`)은 다른 컴포넌트가 그리는 요소라
 * 이 작업에서 마크업을 고칠 수 없다. 이미 이름이 있으면 그대로 두고,
 * 없을 때만 영역 역할과 이름을 붙인다.
 */
export function ensureEditorSkipTarget(
  doc: Document,
  target: EditorSkipTarget
): HTMLElement | null {
  const element = doc.getElementById(target.id);
  if (!element) return null;

  if (!element.hasAttribute('role')) element.setAttribute('role', 'region');
  if (!hasAccessibleName(element)) {
    element.setAttribute('aria-label', target.regionLabel);
  }

  return element;
}

/**
 * 링크를 활성화했을 때 실제로 포커스를 옮긴다.
 *
 * 앵커 이동만으로는 브라우저가 스크롤만 하고 포커스는 링크에 남아,
 * 다음 Tab 키가 편집기 처음부터 다시 시작된다. 대상에 `tabindex="-1"`을
 * 주고 포커스를 옮겨 그 영역에서 이어서 Tab 할 수 있게 한다.
 *
 * @returns 대상을 찾아 포커스를 옮겼으면 true
 */
export function focusEditorSkipTarget(
  doc: Document,
  target: EditorSkipTarget
): boolean {
  const element = ensureEditorSkipTarget(doc, target);
  if (!element) return false;

  if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
  element.focus();

  if (target.ringInStyle) applyTransientFocusRing(element);

  return true;
}
