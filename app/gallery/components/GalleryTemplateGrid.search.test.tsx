import { render, screen, within } from '@testing-library/react';
import { useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';

import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';

import GalleryTemplateGrid from './GalleryTemplateGrid';

jest.mock('next/navigation', () => ({
  usePathname: () => '/gallery',
  useSearchParams: jest.fn(),
}));

function renderGallery(query: string) {
  const searchParams = new URLSearchParams(`q=${encodeURIComponent(query)}`);
  jest
    .mocked(useSearchParams)
    .mockReturnValue(searchParams as ReadonlyURLSearchParams);
  render(<GalleryTemplateGrid />);
}

describe('갤러리 검색', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('받침이 있는 검색어에는 과 를 붙인다', () => {
    renderGallery('모던');

    expect(
      screen.getByText('‘모던’과 맞는 템플릿이 없어요.')
    ).toBeInTheDocument();
  });

  it('받침이 없는 검색어에는 와 를 붙인다', () => {
    renderGallery('없는단어');

    expect(
      screen.getByText('‘없는단어’와 맞는 템플릿이 없어요.')
    ).toBeInTheDocument();
  });

  it('분류 이름 대신 쓰는 말로 검색해도 그 분류의 표지를 보여준다', () => {
    renderGallery('청첩장');

    const weddings = INVITATION_TEMPLATES.filter(
      template => template.type === 'wedding'
    );
    expect(weddings.length).toBeGreaterThan(0);
    expect(screen.getByRole('status')).toHaveTextContent(
      `‘청첩장’ 검색 결과 ${weddings.length}개 템플릿`
    );

    const grid = screen.getByRole('region', { name: '초대장 디자인' });
    expect(within(grid).getAllByRole('button')).toHaveLength(weddings.length);
  });
});
