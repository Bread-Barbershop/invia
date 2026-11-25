import { render, screen } from '@testing-library/react';

import { buildShowcaseInvitation } from '@/shared/data/buildShowcaseInvitation';
import { SHOWCASE_INVITATIONS } from '@/shared/data/showcaseInvitations';

import ShowcaseDocument from './ShowcaseDocument';

jest.mock('@/app/guest/[id]/components/GuestRenderer', () => {
  const { useIsGuestSurface } = jest.requireActual(
    '@/components/organisms/wrapper/GuestSurfaceContext'
  );
  return {
    __esModule: true,
    default: function GuestRendererMock() {
      const isGuestSurface = useIsGuestSurface();
      return <p>{isGuestSurface ? '하객 표면 본문' : '편집 표면 본문'}</p>;
    },
  };
});

describe('ShowcaseDocument - 하객 표면', () => {
  it('디자인 쇼케이스도 하객이 보는 표면으로 블록을 그린다', () => {
    const design = SHOWCASE_INVITATIONS[0];

    render(
      <ShowcaseDocument design={design} {...buildShowcaseInvitation(design)} />
    );

    expect(screen.getByText('하객 표면 본문')).toBeInTheDocument();
    expect(screen.queryByText('편집 표면 본문')).not.toBeInTheDocument();
  });
});
