import { render, screen } from '@testing-library/react';

import EditorCallout from './EditorCallout';

describe('미리보기 도움말 위치', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  const originalResizeObserver = global.ResizeObserver;
  const bubbleWidth = 236;
  const bubbleHeight = 40;
  const toolbarLeft = 875;

  beforeEach(() => {
    window.innerWidth = 1440;
    global.ResizeObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, bubbleWidth, bubbleHeight));
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.innerHeight = originalInnerHeight;
    global.ResizeObserver = originalResizeObserver;
    jest.restoreAllMocks();
  });

  const renderCallout = (toolbarBottom: number) => {
    const preview = document.createElement('div');
    const toolbar = document.createElement('div');
    preview.getBoundingClientRect = () => new DOMRect(478, 56, 375, 812);
    toolbar.getBoundingClientRect = () =>
      new DOMRect(toolbarLeft, 166, 112, toolbarBottom - 166);

    render(
      <EditorCallout
        targetRef={{ current: preview }}
        avoidRef={{ current: toolbar }}
        arrowSide="left"
        targetAnchor={{ x: 1, y: 0.8 }}
        offset={0}
        text="블록을 클릭해 내용을 편집할 수 있어요."
      />
    );

    const bubble = screen.getByRole('status');
    return {
      left: parseFloat(bubble.style.left),
      top: parseFloat(bubble.style.top),
    };
  };

  it('편집 도구와 겹치면 도구 모음 바로 아래에 표시한다', () => {
    window.innerHeight = 900;
    const toolbarBottom = 688;

    const { left, top } = renderCallout(toolbarBottom);

    expect(left + bubbleWidth).toBeGreaterThan(toolbarLeft);
    expect(top).toBeGreaterThan(toolbarBottom);
    expect(top + bubbleHeight).toBeLessThan(window.innerHeight);
  });

  it('아래 공간이 부족하면 도구 모음 왼쪽의 미리보기 쪽에 표시한다', () => {
    window.innerWidth = 1340;
    window.innerHeight = 768;

    const { left, top } = renderCallout(740);

    expect(left + bubbleWidth).toBeLessThan(toolbarLeft);
    expect(top + bubbleHeight).toBeLessThan(window.innerHeight);
  });
});
