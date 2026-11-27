import { render, screen } from '@testing-library/react';

import EditorPage from './page';

jest.mock('./components/EditorUpdate', () => ({
  __esModule: true,
  default: () => <div>초대장 편집 화면</div>,
}));

describe('기존 초대장 편집 링크', () => {
  it('초대장 정보가 빠지면 내 초대장으로 돌아가는 방법을 안내한다', async () => {
    render(
      await EditorPage({
        params: Promise.resolve({ id: 'saved-folder' }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(
      screen.getByRole('heading', { name: '초대장을 열 수 없어요.' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '내 초대장으로 이동' })
    ).toHaveAttribute('href', '/dashboard');
  });
});
