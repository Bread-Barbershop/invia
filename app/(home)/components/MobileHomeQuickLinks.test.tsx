import { render, screen } from '@testing-library/react';

import MobileHomeQuickLinks from './MobileHomeQuickLinks';

it('모바일 홈에서 갤러리와 FAQ로 이동하는 링크를 제공한다', () => {
  render(<MobileHomeQuickLinks />);

  const gallery = screen.getByRole('link', { name: '갤러리 둘러보기' });
  const faq = screen.getByRole('link', { name: '자주 묻는 질문' });

  expect(gallery).toHaveAttribute('href', '/gallery');
  expect(faq).toHaveAttribute('href', '/faq');
  expect(
    screen.getByRole('navigation', { name: '둘러보기' })
  ).toBeInTheDocument();
});
