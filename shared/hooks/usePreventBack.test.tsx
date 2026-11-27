import { act, renderHook } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useConfirmStore } from '@/shared/store/useConfirmStore';

import { usePreventBack } from './usePreventBack';

function dispatchBeforeUnload() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

async function dispatchPopState() {
  await act(async () => {
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

describe('편집기 이탈 방지', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    useConfirmStore.setState({
      isOpen: false,
      message: '',
      resolveRef: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('저장할 변경사항이 없으면 탭 닫기 경고를 걸지 않는다', () => {
    renderHook(() => usePreventBack());

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('블록을 고치면 탭을 닫거나 새로고침할 때 브라우저가 경고한다', () => {
    renderHook(() => usePreventBack());

    act(() => {
      useEditorStore.getState().setIsDirty(true);
    });

    // jsdom의 returnValue는 문자열이 아닌 레거시 불리언이라 preventDefault만 확인한다.
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);
  });

  it('저장이 끝나면 경고가 바로 풀린다', () => {
    renderHook(() => usePreventBack());

    act(() => {
      useEditorStore.getState().setIsDirty(true);
    });
    act(() => {
      useEditorStore.getState().setIsDirty(false);
    });

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('편집기를 떠나면 경고 리스너를 남기지 않는다', () => {
    const { unmount } = renderHook(() => usePreventBack());

    act(() => {
      useEditorStore.getState().setIsDirty(true);
    });
    unmount();

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('저장할 변경사항이 없으면 뒤로가기를 막지 않는다', async () => {
    renderHook(() => usePreventBack());

    await dispatchPopState();

    expect(useConfirmStore.getState().isOpen).toBe(false);
  });

  it('저장하지 않은 채 뒤로 가면 확인을 묻고, 취소하면 편집기에 머문다', async () => {
    const pushState = jest.spyOn(window.history, 'pushState');
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    renderHook(() => usePreventBack());

    act(() => {
      useEditorStore.getState().setIsDirty(true);
    });
    await dispatchPopState();

    expect(useConfirmStore.getState().isOpen).toBe(true);
    expect(useConfirmStore.getState().message).toContain(
      '수정된 내용이 저장되지 않을 수 있습니다.'
    );

    await act(async () => {
      useConfirmStore.getState().handleCancel();
    });

    expect(back).not.toHaveBeenCalled();
    expect(pushState).toHaveBeenLastCalledWith(
      null,
      '',
      window.location.href
    );
  });

  it('나가기를 확인하면 이전 화면으로 돌아간다', async () => {
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    renderHook(() => usePreventBack());

    act(() => {
      useEditorStore.getState().setIsDirty(true);
    });
    await dispatchPopState();
    await act(async () => {
      useConfirmStore.getState().handleConfirm();
    });

    expect(back).toHaveBeenCalledTimes(1);
  });
});
