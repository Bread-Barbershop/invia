import { act, renderHook } from '@testing-library/react';

import {
  hasBlockingEditorOverlay,
  isSaveShortcut,
  useSaveShortcut,
} from './useSaveShortcut';

const createKeyEvent = (init: {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  repeat?: boolean;
  isComposing?: boolean;
}) =>
  new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...init,
  });

const dispatch = (event: KeyboardEvent, target: EventTarget = window) => {
  act(() => {
    target.dispatchEvent(event);
  });
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('isSaveShortcut', () => {
  it.each([
    ['Ctrl+S', { key: 's', ctrlKey: true }],
    ['⌘+S', { key: 's', metaKey: true }],
    ['대문자 S', { key: 'S', ctrlKey: true }],
    ['code 기반(비라틴 자판)', { key: 'ㄴ', code: 'KeyS', metaKey: true }],
  ] as const)('%s 조합을 저장 단축키로 인정한다', (_, init) => {
    expect(isSaveShortcut(createKeyEvent(init))).toBe(true);
  });

  it.each([
    ['수식 키 없는 S', { key: 's' }],
    ['Shift 조합', { key: 's', ctrlKey: true, shiftKey: true }],
    ['Alt 조합', { key: 's', metaKey: true, altKey: true }],
    ['다른 글자', { key: 'z', ctrlKey: true }],
  ] as const)('%s 는 저장 단축키가 아니다', (_, init) => {
    expect(isSaveShortcut(createKeyEvent(init))).toBe(false);
  });
});

describe('hasBlockingEditorOverlay', () => {
  it('모달(dialog[aria-modal])이 열려 있으면 true', () => {
    document.body.innerHTML =
      '<div role="dialog" aria-modal="true"><p>저장하시겠습니까?</p></div>';
    expect(hasBlockingEditorOverlay()).toBe(true);
  });

  it('일반 요소만 있으면 false', () => {
    document.body.innerHTML = '<div><span>편집기</span></div>';
    expect(hasBlockingEditorOverlay()).toBe(false);
  });
});

describe('useSaveShortcut', () => {
  it('Ctrl+S 로 저장을 시작하고 브라우저 기본 동작을 막는다', () => {
    const onSave = jest.fn();
    renderHook(() => useSaveShortcut({ onSave, enabled: true }));

    const event = createKeyEvent({ key: 's', ctrlKey: true });
    dispatch(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('⌘+S 도 같은 방식으로 동작한다', () => {
    const onSave = jest.fn();
    renderHook(() => useSaveShortcut({ onSave, enabled: true }));

    const event = createKeyEvent({ key: 'S', metaKey: true });
    dispatch(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['Shift 조합', { key: 's', ctrlKey: true, shiftKey: true }],
    ['Alt 조합', { key: 's', ctrlKey: true, altKey: true }],
    ['수식 키 없는 S', { key: 's' }],
  ] as const)('%s 에는 반응하지 않는다', (_, init) => {
    const onSave = jest.fn();
    renderHook(() => useSaveShortcut({ onSave, enabled: true }));

    const event = createKeyEvent(init);
    dispatch(event);

    expect(event.defaultPrevented).toBe(false);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('한글 조합 중(isComposing)에는 아무것도 하지 않는다', () => {
    const onSave = jest.fn();
    renderHook(() => useSaveShortcut({ onSave, enabled: true }));

    const event = createKeyEvent({ key: 's', ctrlKey: true, isComposing: true });
    dispatch(event);

    expect(event.defaultPrevented).toBe(false);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('키를 누르고 있어 반복되는 keydown(repeat)에는 한 번만 저장한다', () => {
    const onSave = jest.fn();
    renderHook(() => useSaveShortcut({ onSave, enabled: true }));

    dispatch(createKeyEvent({ key: 's', ctrlKey: true }));
    const repeated = createKeyEvent({ key: 's', ctrlKey: true, repeat: true });
    dispatch(repeated);

    expect(repeated.defaultPrevented).toBe(true);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('저장할 수 없는 상태(저장 중·비활성)에는 저장을 시작하지 않지만 페이지 저장 창은 막는다', () => {
    const onSave = jest.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useSaveShortcut({ onSave, enabled }),
      { initialProps: { enabled: false } }
    );

    const event = createKeyEvent({ key: 's', ctrlKey: true });
    dispatch(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onSave).not.toHaveBeenCalled();

    rerender({ enabled: true });
    dispatch(createKeyEvent({ key: 's', ctrlKey: true }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('모달이 열려 있으면 저장을 시작하지 않는다', () => {
    document.body.innerHTML =
      '<div role="dialog" aria-modal="true">저장하시겠습니까?</div>';
    const onSave = jest.fn();
    renderHook(() => useSaveShortcut({ onSave, enabled: true }));

    const event = createKeyEvent({ key: 's', ctrlKey: true });
    dispatch(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('입력창에 포커스가 있어도(캡처 단계) 저장을 시작한다', () => {
    document.body.innerHTML = '<textarea data-testid="body"></textarea>';
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const onSave = jest.fn();
    renderHook(() => useSaveShortcut({ onSave, enabled: true }));

    const event = createKeyEvent({ key: 's', metaKey: true });
    dispatch(event, textarea);

    expect(event.defaultPrevented).toBe(true);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('다시 렌더링해도 최신 onSave 를 호출한다', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ onSave }) => useSaveShortcut({ onSave, enabled: true }),
      { initialProps: { onSave: first } }
    );

    rerender({ onSave: second });
    dispatch(createKeyEvent({ key: 's', ctrlKey: true }));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('언마운트 뒤에는 반응하지 않는다', () => {
    const onSave = jest.fn();
    const { unmount } = renderHook(() =>
      useSaveShortcut({ onSave, enabled: true })
    );

    unmount();
    dispatch(createKeyEvent({ key: 's', ctrlKey: true }));

    expect(onSave).not.toHaveBeenCalled();
  });
});
