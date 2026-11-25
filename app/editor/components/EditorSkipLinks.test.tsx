import { fireEvent, render, screen } from '@testing-library/react';

import EditorSkipLinks from './EditorSkipLinks';

describe('편집기 화면 맨 앞의 영역 이동 링크', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const renderEditorTargets = () => {
    const stylePanel = document.createElement('div');
    stylePanel.id = 'editor-style-panel';

    const preview = document.createElement('div');
    preview.id = 'preview-container';

    const blockPanel = document.createElement('div');
    blockPanel.id = 'editor-block-panel';

    document.body.append(stylePanel, preview, blockPanel);

    return { stylePanel, preview, blockPanel };
  };

  it('편집기 바로가기 내비게이션으로 세 링크를 보여 준다', () => {
    renderEditorTargets();
    render(<EditorSkipLinks />);

    expect(
      screen.getByRole('navigation', { name: '편집기 바로가기' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '편집 도구로 바로가기' })
    ).toHaveAttribute('href', '#editor-style-panel');
    expect(
      screen.getByRole('link', { name: '미리보기로 바로가기' })
    ).toHaveAttribute('href', '#preview-container');
    expect(
      screen.getByRole('link', { name: '블록 설정으로 바로가기' })
    ).toHaveAttribute('href', '#editor-block-panel');
  });

  it('미리보기 링크를 누르면 미리보기 영역으로 포커스가 옮겨 간다', () => {
    const { preview } = renderEditorTargets();
    render(<EditorSkipLinks />);

    fireEvent.click(screen.getByRole('link', { name: '미리보기로 바로가기' }));

    expect(preview).toHaveFocus();
    expect(preview).toHaveAttribute('tabindex', '-1');
    expect(preview).toHaveAttribute('aria-label', '미리보기');
  });

  it('화면이 그려질 때 이름 없는 영역에 이름을 붙여 스크린리더 목록에 세운다', () => {
    const { preview, blockPanel } = renderEditorTargets();
    render(<EditorSkipLinks />);

    expect(preview).toHaveAttribute('role', 'region');
    expect(preview).toHaveAttribute('aria-label', '미리보기');
    expect(blockPanel).toHaveAttribute('aria-label', '블록 설정');
  });
});
