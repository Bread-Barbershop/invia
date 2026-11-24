import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';

import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';

import GalleryCategoryTabs from './GalleryCategoryTabs';
import GalleryTemplateGrid from './GalleryTemplateGrid';

jest.mock('next/navigation', () => ({
  usePathname: () => '/gallery',
  useSearchParams: jest.fn(),
}));

function renderGallery(category?: string, query?: string) {
  const searchParams = new URLSearchParams(query);
  if (category) searchParams.set('category', category);
  jest
    .mocked(useSearchParams)
    .mockReturnValue(searchParams as ReadonlyURLSearchParams);
  render(
    <>
      <GalleryCategoryTabs />
      <GalleryTemplateGrid />
    </>
  );
}

describe('초대장 갤러리', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = jest.fn();
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  });

  it.each(['all', 'wedding', 'birthday', 'seminar', 'firstBirthday'])(
    '%s 카테고리에 공용 카탈로그의 모든 해당 디자인을 표시한다',
    category => {
      renderGallery(category);
      const grid = screen.getByRole('region', { name: '초대장 디자인' });
      const templates = INVITATION_TEMPLATES.filter(
        template => category === 'all' || template.type === category
      );

      expect(within(grid).getAllByRole('button')).toHaveLength(
        templates.length
      );
      for (const template of templates) {
        const poster = within(grid).getByAltText(
          `${template.name} 포스터 미리보기`
        );
        const imagePath = decodeURIComponent(poster.getAttribute('src') ?? '');
        expect(imagePath).toContain(template.posterImage);
      }
    }
  );

  it('선택한 최신 디자인의 본문을 열고 같은 카테고리 안에서 탐색한다', async () => {
    const user = userEvent.setup();
    renderGallery('seminar');

    await user.click(screen.getByRole('button', { name: '커피 감각 연구소' }));
    await user.click(screen.getByRole('button', { name: '디자인 미리보기' }));

    const dialog = screen.getByRole('dialog', { name: '커피 감각 연구소' });
    expect(
      within(dialog).getByTitle('커피 감각 연구소 초대장 내용')
    ).toHaveAttribute('src', '/showcase/showcase-40');
    await user.click(
      within(dialog).getByRole('button', { name: '다음 초대장' })
    );
    expect(screen.getByTitle('볼드 비즈니스 초대장 내용')).toHaveAttribute(
      'src',
      '/showcase/showcase-12'
    );
  });

  it('예전 큰 글씨 필터 링크에서도 카테고리의 모든 디자인을 탐색한다', async () => {
    const user = userEvent.setup();
    renderGallery('birthday', 'largePrint=1');

    expect(screen.getByRole('link', { name: '생일' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(
      screen.queryByRole('checkbox', { name: '큰 글씨만 보기' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '생신 꽃편지' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '칠순 감사연' }));
    await user.click(screen.getByRole('button', { name: '디자인 미리보기' }));
    await user.click(screen.getByRole('button', { name: '이전 초대장' }));
    expect(screen.getByTitle('생신 꽃편지 초대장 내용')).toHaveAttribute(
      'src',
      '/showcase/showcase-41'
    );
  });

  it('카테고리 링크에서 예전 필터를 제거하고 다른 검색 매개변수를 유지한다', () => {
    renderGallery('birthday', 'category=birthday&largePrint=1&source=shared');

    expect(screen.getByRole('link', { name: '세미나' })).toHaveAttribute(
      'href',
      '/gallery?category=seminar&source=shared'
    );
    expect(screen.getByRole('link', { name: '전체' })).toHaveAttribute(
      'href',
      '/gallery?source=shared'
    );
  });

  it('미리보기 안에서 바깥으로 드래그하면 유지하고 바깥을 클릭하면 닫는다', async () => {
    const user = userEvent.setup();
    renderGallery('seminar');

    await user.click(screen.getByRole('button', { name: '커피 감각 연구소' }));
    const previewButton = screen.getByRole('button', {
      name: '디자인 미리보기',
    });
    await user.click(previewButton);
    const dialog = screen.getByRole('dialog', { name: '커피 감각 연구소' });
    const title = within(dialog).getByRole('heading', {
      name: '커피 감각 연구소',
    });

    await user.pointer([
      { target: title, keys: '[MouseLeft>]' },
      { target: dialog, keys: '[/MouseLeft]' },
    ]);
    expect(dialog).toBeVisible();

    await user.click(dialog);
    expect(dialog).not.toBeInTheDocument();
    expect(previewButton).toHaveFocus();
  });

  it('제작 동작을 선택한 템플릿의 새 작성 경로에 연결한다', async () => {
    const user = userEvent.setup();
    renderGallery('seminar');

    await user.click(screen.getByRole('button', { name: '커피 감각 연구소' }));

    expect(
      screen.getByRole('link', { name: '이 디자인으로 만들기' })
    ).toHaveAttribute('href', '/editor?template=showcase-40');
  });
});
