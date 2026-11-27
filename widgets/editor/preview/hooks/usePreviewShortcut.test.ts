import { act, renderHook } from '@testing-library/react';

import {
  hasBlockingEditorOverlay,
  isPreviewShortcut,
  usePreviewShortcut,
} from './usePreviewShortcut';

type KeyPressInit = {
  key?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  repeat?: boolean;
  isComposing?: boolean;
};

const pressKey = (init: KeyPressInit = {}) => {
  const { isComposing, ...eventInit } = init;
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    bubbles: true,
    cancelable: true,
    ...eventInit,
  });
  if (isComposing) {
    Object.defineProperty(event, 'isComposing', { value: true });
  }
  window.dispatchEvent(event);
  return event;
};

const appendOverlay = (html: string) => {
  const element = document.createElement('div');
  element.innerHTML = html;
  document.body.append(element.firstElementChild as Element);
  return element.firstElementChild as Element;
};

describe('편집기 미리보기 단축키 (Ctrl/⌘+Enter)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
  });

  describe('조합 판별', () => {
    it('Ctrl+Enter와 ⌘+Enter만 미리보기 단축키로 본다', () => {
      expect(isPreviewShortcut({ key: 'Enter', ctrlKey: true } as never)).toBe(
        true
      );
      expect(isPreviewShortcut({ key: 'Enter', metaKey: true } as never)).toBe(
        true
      );
      expect(isPreviewShortcut({ key: 'Enter' } as never)).toBe(false);
      expect(isPreviewShortcut({ key: 'a', ctrlKey: true } as never)).toBe(
        false
      );
    });

    it('Shift·Alt가 섞인 조합은 브라우저 단축키에 양보한다', () => {
      expect(
        isPreviewShortcut({
          key: 'Enter',
          ctrlKey: true,
          shiftKey: true,
        } as never)
      ).toBe(false);
      expect(
        isPreviewShortcut({
          key: 'Enter',
          ctrlKey: true,
          altKey: true,
        } as never)
      ).toBe(false);
    });
  });

  describe('열린 오버레이 확인', () => {
    it('모달 dialog가 열려 있으면 true', () => {
      appendOverlay('<dialog open></dialog>');
      expect(hasBlockingEditorOverlay(document)).toBe(true);
    });

    it('aria-modal 대화상자와 편집기 팝업도 막는다', () => {
      appendOverlay('<div role="dialog" aria-modal="true"></div>');
      expect(hasBlockingEditorOverlay(document)).toBe(true);
    });

    it('아무것도 열려 있지 않으면 false', () => {
      appendOverlay('<div>편집기</div>');
      expect(hasBlockingEditorOverlay(document)).toBe(false);
    });
  });

  describe('단축키 동작', () => {
    it('Ctrl+Enter를 누르면 미리보기를 연다', () => {
      const onOpen = jest.fn();
      renderHook(() => usePreviewShortcut({ onOpen, enabled: true }));

      const event = pressKey({ ctrlKey: true });

      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it('⌘+Enter도 같은 동작을 한다', () => {
      const onOpen = jest.fn();
      renderHook(() => usePreviewShortcut({ onOpen, enabled: true }));

      pressKey({ metaKey: true });

      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('한글 조합 중에는 열지도, 기본 동작을 막지도 않는다', () => {
      const onOpen = jest.fn();
      renderHook(() => usePreviewShortcut({ onOpen, enabled: true }));

      const event = pressKey({ ctrlKey: true, isComposing: true });

      expect(onOpen).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('키를 누르고 있는 동안(repeat)에는 한 번만 연다', () => {
      const onOpen = jest.fn();
      renderHook(() => usePreviewShortcut({ onOpen, enabled: true }));

      const repeated = pressKey({ ctrlKey: true, repeat: true });

      expect(onOpen).not.toHaveBeenCalled();
      expect(repeated.defaultPrevented).toBe(true);
    });

    it('준비 중처럼 열 수 없는 상태에서는 열지 않는다', () => {
      const onOpen = jest.fn();
      renderHook(() => usePreviewShortcut({ onOpen, enabled: false }));

      pressKey({ ctrlKey: true });

      expect(onOpen).not.toHaveBeenCalled();
    });

    it('블록 추가 팝업이나 다른 모달이 열려 있으면 겹쳐 열지 않는다', () => {
      const onOpen = jest.fn();
      renderHook(() => usePreviewShortcut({ onOpen, enabled: true }));

      appendOverlay('<div role="dialog" aria-modal="true"></div>');
      pressKey({ ctrlKey: true });

      expect(onOpen).not.toHaveBeenCalled();
    });

    it('다른 키 조합에는 반응하지 않는다', () => {
      const onOpen = jest.fn();
      renderHook(() => usePreviewShortcut({ onOpen, enabled: true }));

      pressKey({ key: 'Enter' });
      pressKey({ key: 's', ctrlKey: true });

      expect(onOpen).not.toHaveBeenCalled();
    });

    it('최신 콜백과 상태를 사용한다 (다시 그려도 한 번만 연다)', () => {
      const first = jest.fn();
      const second = jest.fn();
      const { rerender } = renderHook(
        ({ onOpen, enabled }) => usePreviewShortcut({ onOpen, enabled }),
        { initialProps: { onOpen: first, enabled: true } }
      );

      rerender({ onOpen: second, enabled: true });
      act(() => {
        pressKey({ ctrlKey: true });
      });

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });
  });
});
