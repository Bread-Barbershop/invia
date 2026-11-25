import { render, screen } from '@testing-library/react';

import DashboardTitle from './DashboardTitle';

it('대시보드의 문서 제목을 h1으로 세운다', () => {
  render(<DashboardTitle />);

  const heading = screen.getByRole('heading', { level: 1, name: '내 초대장' });
  expect(heading.tagName).toBe('H1');
});

it('무엇을 할 수 있는 화면인지 제목 아래에서 설명한다', () => {
  render(<DashboardTitle />);

  expect(
    screen.getByText('저장한 초대장을 다시 편집하거나 사용할 수 있어요.')
  ).toBeInTheDocument();
});
