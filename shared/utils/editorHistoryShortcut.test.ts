import { resolveEditorHistoryAction } from './editorHistoryShortcut';

const createKeyEvent = (
  init: {
    key?: string;
    repeat?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    composing?: boolean;
    prevented?: boolean;
  } = {},
  target: Element = document.body
) => {
  const { composing = false, prevented = false, ...eventInit } = init;
  const event = new KeyboardEvent('keydown', {
    key: 'z',
    bubbles: true,
    cancelable: true,
    ...eventInit,
  });

  if (composing) {
    Object.defineProperty(event, 'isComposing', { value: true });
  }

  target.dispatchEvent(event);
  if (prevented) event.preventDefault();

  return event;
};

const defaultContext = { selectedId: 'block-1', isCoverCanvasActive: false };

describe('편집기 블록 실행 취소 단축키 판별', () => {
  afterEach(() => {
    document
      .querySelectorAll('[data-history-shortcut-test]')
      .forEach(element => element.remove());
  });

  it('Ctrl+Z와 ⌘Z는 실행 취소로 판별한다', () => {
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ ctrlKey: true }),
        defaultContext
      )
    ).toBe('undo');
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ metaKey: true }),
        defaultContext
      )
    ).toBe('undo');
  });

  it('Ctrl+Shift+Z와 ⌘+Shift+Z는 다시 실행으로 판별한다', () => {
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ ctrlKey: true, shiftKey: true }),
        defaultContext
      )
    ).toBe('redo');
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ metaKey: true, shiftKey: true }),
        defaultContext
      )
    ).toBe('redo');
  });

  it('Windows 방식인 Ctrl+Y는 다시 실행으로 판별한다', () => {
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ key: 'y', ctrlKey: true }),
        defaultContext
      )
    ).toBe('redo');
  });

  it('수정키가 없는 Z 입력은 실행 취소가 아니다', () => {
    expect(
      resolveEditorHistoryAction(createKeyEvent(), defaultContext)
    ).toBeNull();
  });

  it('Alt 조합과 macOS의 ⌘Y는 실행 취소·다시 실행이 아니다', () => {
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ ctrlKey: true, altKey: true }),
        defaultContext
      )
    ).toBeNull();
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ key: 'y', metaKey: true }),
        defaultContext
      )
    ).toBeNull();
  });

  it('입력 중이거나 이미 처리된 키는 무시한다', () => {
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ ctrlKey: true, composing: true }),
        defaultContext
      )
    ).toBeNull();
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ ctrlKey: true, repeat: true }),
        defaultContext
      )
    ).toBeNull();
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ ctrlKey: true, prevented: true }),
        defaultContext
      )
    ).toBeNull();
  });

  it('텍스트 입력 요소 안에서는 브라우저 기본 실행 취소를 남긴다', () => {
    const input = document.createElement('input');
    input.dataset.historyShortcutTest = 'true';
    document.body.append(input);

    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    editable.dataset.historyShortcutTest = 'true';
    const child = document.createElement('span');
    editable.append(child);
    document.body.append(editable);

    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ ctrlKey: true }, input),
        defaultContext
      )
    ).toBeNull();
    expect(
      resolveEditorHistoryAction(
        createKeyEvent({ ctrlKey: true }, child),
        defaultContext
      )
    ).toBeNull();
  });

  it('커버 포스터 캔버스 모드에서는 캔버스 실행 취소를 가로채지 않는다', () => {
    expect(
      resolveEditorHistoryAction(createKeyEvent({ ctrlKey: true }), {
        selectedId: 'mainPoster',
      })
    ).toBeNull();
    expect(
      resolveEditorHistoryAction(createKeyEvent({ ctrlKey: true }), {
        selectedId: 'block-1',
        isCoverCanvasActive: true,
      })
    ).toBeNull();
  });

  it('팝업이 열려 있으면 블록 실행 취소를 멈춘다', () => {
    const selectors = [
      'dialog[open]',
      '[aria-modal="true"]',
      '[role="menu"]',
      '[data-editor-popup="true"]',
    ];

    selectors.forEach(selector => {
      const popup = document.createElement('div');
      popup.dataset.historyShortcutTest = 'true';

      if (selector === 'dialog[open]') {
        const dialog = document.createElement('dialog');
        dialog.open = true;
        dialog.dataset.historyShortcutTest = 'true';
        document.body.append(dialog);
      } else if (selector.startsWith('[data-')) {
        popup.setAttribute('data-editor-popup', 'true');
        document.body.append(popup);
      } else if (selector.includes('aria-modal')) {
        popup.setAttribute('aria-modal', 'true');
        document.body.append(popup);
      } else {
        popup.setAttribute('role', 'menu');
        document.body.append(popup);
      }

      expect(
        resolveEditorHistoryAction(
          createKeyEvent({ ctrlKey: true }),
          defaultContext
        )
      ).toBeNull();

      document
        .querySelectorAll('[data-history-shortcut-test]')
        .forEach(element => element.remove());
    });
  });
});
