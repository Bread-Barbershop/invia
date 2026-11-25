import { render, screen } from '@testing-library/react';

import NotFound from './not-found';

function hrefsOf(name: RegExp) {
  return screen
    .getAllByRole('link', { name })
    .map(link => link.getAttribute('href'));
}

it('404 화면에서 갤러리·제작·FAQ·홈으로 이동할 수 있다', () => {
  render(<NotFound />);

  expect(hrefsOf(/초대장 갤러리 둘러보기/)).toContain('/gallery');
  expect(hrefsOf(/새 초대장 만들기/)).toContain('/editor');
  expect(hrefsOf(/FAQ 살펴보기/)).toContain('/faq');
  expect(hrefsOf(/홈으로 돌아가기/)).toContain('/');
});

it('404 헤더 메뉴는 다른 화면과 같은 내비게이션을 보여준다', () => {
  render(<NotFound />);

  const header = screen.getByRole('banner');
  expect(header).toHaveTextContent('Create');
  expect(header).toHaveTextContent('Gallery');
  expect(header).toHaveTextContent('FAQ');
});
