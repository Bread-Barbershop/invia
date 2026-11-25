import {
  EDITOR_SKIP_TARGETS,
  ensureEditorSkipTarget,
  focusEditorSkipTarget,
} from './editorSkipTargets';

describe('편집기 영역 이동(스킵 링크) 대상', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('편집 도구·미리보기·블록 설정 세 영역을 순서대로 가리킨다', () => {
    expect(EDITOR_SKIP_TARGETS.map(target => target.id)).toEqual([
      'editor-style-panel',
      'preview-container',
      'editor-block-panel',
    ]);
    expect(EDITOR_SKIP_TARGETS.map(target => target.label)).toEqual([
      '편집 도구로 바로가기',
      '미리보기로 바로가기',
      '블록 설정으로 바로가기',
    ]);
  });

  it('이름이 없는 대상에는 영역 역할과 이름을 붙인다', () => {
    const preview = document.createElement('div');
    preview.id = 'preview-container';
    document.body.append(preview);

    const element = ensureEditorSkipTarget(document, EDITOR_SKIP_TARGETS[1]);

    expect(element).toBe(preview);
    expect(preview).toHaveAttribute('role', 'region');
    expect(preview).toHaveAttribute('aria-label', '미리보기');
  });

  it('이미 이름이 있는 대상의 이름은 덮어쓰지 않는다', () => {
    const leftPanel = document.createElement('div');
    leftPanel.id = 'editor-style-panel';
    leftPanel.setAttribute('role', 'region');
    leftPanel.setAttribute('aria-label', '편집 도구');
    document.body.append(leftPanel);

    ensureEditorSkipTarget(document, EDITOR_SKIP_TARGETS[0]);

    expect(leftPanel).toHaveAttribute('aria-label', '편집 도구');
  });

  it('링크를 활성화하면 대상에 tabindex="-1"을 주고 포커스를 옮긴다', () => {
    const preview = document.createElement('div');
    preview.id = 'preview-container';
    document.body.append(preview);

    expect(focusEditorSkipTarget(document, EDITOR_SKIP_TARGETS[1])).toBe(true);

    expect(preview).toHaveAttribute('tabindex', '-1');
    expect(preview).toHaveFocus();
  });

  it('이미 포커스 가능한 대상의 tabindex는 바꾸지 않는다', () => {
    const leftPanel = document.createElement('div');
    leftPanel.id = 'editor-style-panel';
    leftPanel.setAttribute('tabindex', '-1');
    document.body.append(leftPanel);

    focusEditorSkipTarget(document, EDITOR_SKIP_TARGETS[0]);

    expect(leftPanel).toHaveAttribute('tabindex', '-1');
    expect(leftPanel).toHaveFocus();
  });

  it('대상이 화면에 없으면 false를 돌려준다', () => {
    expect(focusEditorSkipTarget(document, EDITOR_SKIP_TARGETS[2])).toBe(false);
  });

  it('링 클래스를 넣을 수 없는 미리보기는 포커스 동안 인라인 링을 그린다', () => {
    const preview = document.createElement('div');
    preview.id = 'preview-container';
    document.body.append(preview);

    focusEditorSkipTarget(document, EDITOR_SKIP_TARGETS[1]);

    expect(preview.style.outline).toBe('2px solid var(--color-primary, #1f72ef)');
    expect(preview.style.outlineOffset).toBe('2px');

    preview.blur();

    expect(preview.style.outline).toBe('');
    expect(preview.style.outlineOffset).toBe('');
  });

  it('포커스 링 클래스를 이미 가진 영역에는 인라인 링을 더하지 않는다', () => {
    const leftPanel = document.createElement('div');
    leftPanel.id = 'editor-style-panel';
    document.body.append(leftPanel);

    focusEditorSkipTarget(document, EDITOR_SKIP_TARGETS[0]);

    expect(leftPanel.style.outline).toBe('');
  });
});
