import { render, screen } from '@testing-library/react';

import GuestInvitationView from './GuestInvitationView';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

jest.mock('@/components/molecules/invitation-background-texture/InvitationBackgroundTexture', () => ({
  InvitationBackgroundTexture: () => null,
}));
jest.mock('@/components/organisms/visualEffects/ParticleLayer', () => ({
  AmbientParticles: () => null,
}));
jest.mock('./GuestBgm', () => ({ __esModule: true, default: () => null }));
jest.mock('./GuestPrivacyNotice', () => ({
  GuestPrivacyNotice: () => null,
}));
jest.mock('./GuestMainPoster', () => ({
  GuestMainPoster: ({ title }: { title?: string }) => (
    <p data-testid="poster-title">{title ?? '(없음)'}</p>
  ),
}));
jest.mock('./GuestRenderer', () => {
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

function payloadWith(shareUrl: NormalizedGuestPayload['shareUrl']) {
  return {
    bulkData: { backgroundColor: '#ffffff' },
    blocks: [],
    bgm: {},
    mainPoster: { version: '7.2.0', objects: [], thumbnailFileId: 'poster' },
    shareUrl,
  } as unknown as NormalizedGuestPayload;
}

describe('GuestInvitationView - 하객 표면', () => {
  it('공유 제목을 대표 이미지 alt에 쓸 이름으로 넘긴다', () => {
    render(
      <GuestInvitationView
        payload={payloadWith({
          title: '민성·아현 결혼식',
          urlTitle: '',
          description: '',
          images: [],
          urlDescription: '',
          urlImage: [],
          showLocationButton: false,
        })}
      />
    );

    expect(screen.getByTestId('poster-title')).toHaveTextContent(
      '민성·아현 결혼식'
    );
  });

  it('제목이 없으면 빈 이름으로 넘겨 대표 이미지 컴포넌트가 일반 문구를 쓰게 한다', () => {
    render(<GuestInvitationView payload={payloadWith(undefined)} />);

    expect(screen.getByTestId('poster-title')).toBeEmptyDOMElement();
  });

  it('본문 블록을 하객 표면으로 렌더해 편집 안내문이 새지 않게 한다', () => {
    render(<GuestInvitationView payload={payloadWith(undefined)} />);

    expect(screen.getByText('하객 표면 본문')).toBeInTheDocument();
    expect(screen.queryByText('편집 표면 본문')).not.toBeInTheDocument();
  });

  it('대시보드 미리보기 모드에서도 하객이 보는 그대로를 보여 준다', () => {
    render(
      <GuestInvitationView payload={payloadWith(undefined)} mode="dashboard-preview" />
    );

    expect(screen.getByText('하객 표면 본문')).toBeInTheDocument();
    expect(document.querySelector('main')).toBeNull();
  });
});
