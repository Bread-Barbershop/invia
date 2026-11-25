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

  it('읽기 편한 디자인 필터를 켜면 카테고리 안의 읽기 편한 디자인만 보여준다', async () => {
    const user = userEvent.setup();
    renderGallery('birthday', 'largePrint=1');

    const largePrintLink = screen.getByRole('link', {
      name: '읽기 편한 디자인만 보기',
    });
    expect(largePrintLink).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: '생일' })).toHaveAttribute(
      'aria-current',
      'page'
    );

    const largePrintTemplates = INVITATION_TEMPLATES.filter(
      template => template.type === 'birthday' && template.largePrint
    );
    const grid = screen.getByRole('region', { name: '초대장 디자인' });
    expect(within(grid).getAllByRole('button')).toHaveLength(
      largePrintTemplates.length
    );
    for (const template of largePrintTemplates) {
      expect(
        within(grid).getByRole('button', { name: template.name })
      ).toBeInTheDocument();
    }
    expect(
      within(grid).queryByRole('button', { name: '생신 꽃편지' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '칠순 감사연' }));
    await user.click(screen.getByRole('button', { name: '디자인 미리보기' }));
    expect(screen.getByRole('dialog', { name: '칠순 감사연' })).toBeVisible();
  });

  it('읽기 편한 디자인이 없는 카테고리에서는 안내 문구를 보여준다', () => {
    renderGallery('seminar', 'largePrint=1');

    expect(
      screen.getByText('이 카테고리에는 아직 읽기 편한 디자인이 없습니다.')
    ).toBeInTheDocument();
  });

  it('카테고리를 바꿔도 읽기 편한 디자인 필터와 다른 검색 매개변수를 유지한다', () => {
    renderGallery('birthday', 'category=birthday&largePrint=1&source=shared');

    expect(screen.getByRole('link', { name: '세미나' })).toHaveAttribute(
      'href',
      '/gallery?category=seminar&largePrint=1&source=shared'
    );
    expect(screen.getByRole('link', { name: '전체' })).toHaveAttribute(
      'href',
      '/gallery?largePrint=1&source=shared'
    );
  });

  it('읽기 편한 디자인 필터 링크로 필터를 켜고 끌 수 있다', () => {
    renderGallery('birthday', 'category=birthday&source=shared');

    expect(
      screen.getByRole('link', { name: '읽기 편한 디자인만 보기' })
    ).toHaveAttribute(
      'href',
      '/gallery?category=birthday&source=shared&largePrint=1'
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
