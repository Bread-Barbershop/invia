import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import ComponentsPopup from './ComponentsPopup';

jest.mock('@floating-ui/dom', () => ({
  autoUpdate: () => () => {},
}));

jest.mock('@/widgets/editor/preview/hooks/useInvitationTemplate', () => ({
  useInvitationTemplate: () => ({ applyTemplate: jest.fn(), isApplying: false }),
}));

jest.mock('@/shared/data/invitationTemplates', () => ({
  getInvitationTemplates: () => [{ id: 'template-1' }],
}));

jest.mock('./ContentsArea', () => ({
  __esModule: true,
  default: () => <div data-testid="blocks-area" />,
}));

describe('ComponentsPopup 닫기', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    // 편집기 폭 가드(1340px)에 걸리지 않도록 데스크톱 폭으로 연다.
    window.innerWidth = 1440;
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  const createAnchorRef = () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    return { current: button };
  };

  it('블록 추가 패널에 닫기 버튼이 있고, 누르면 패널을 닫는다', () => {
    const onPopClose = jest.fn();

    render(
      <ComponentsPopup anchorRef={createAnchorRef()} onPopClose={onPopClose} />
    );

    const closeButton = screen.getByRole('button', { name: '블록 추가 닫기' });
    fireEvent.click(closeButton);

    expect(onPopClose).toHaveBeenCalledTimes(1);
  });

  it('패널은 블록 추가 대화상자로 읽힌다', () => {
    render(
      <ComponentsPopup anchorRef={createAnchorRef()} onPopClose={jest.fn()} />
    );

    expect(screen.getByRole('dialog', { name: '블록 추가' })).toBeInTheDocument();
  });
});
