import { render, screen } from '@testing-library/react';
import React from 'react';

import GuestInvitationView from './GuestInvitationView';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

jest.mock('./GuestRenderer', () => ({
  __esModule: true,
  default: () =>
    React.createElement('div', { 'data-testid': 'guest-renderer' }),
}));

jest.mock('./GuestBgm', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('./GuestMainPoster', () => ({
  GuestMainPoster: () =>
    React.createElement('div', { 'data-testid': 'guest-main-poster' }),
}));

jest.mock('@/shared/assets/logo/invia-logo.svg', () => ({
  __esModule: true,
  default: () => null,
}));

const payload: NormalizedGuestPayload = {
  mainPoster: { version: '1.0.0', objects: [], thumbnailFileId: 'poster' },
  shareUrl: {
    titleFormat: 'raw',
    title: '',
    description: '',
    images: [],
    urlTitle: '민수 ♥ 서연 결혼합니다',
    urlDescription: '',
    urlImage: [],
    showLocationButton: false,
  },
  bgm: {
    selectedBgmId: null,
    isLoop: true,
    volume: 0.5,
    userBgmTitle: null,
    userBgmDuration: null,
    userBgmFileId: null,
  },
  bulkData: {
    backgroundColor: '#ffffff',
    titleData: {
      font: 'font-lineseed',
      fontSize: '20px',
      fontWeight: '700',
      color: '#111111',
      isDefault: false,
    },
    bodyData: {
      font: 'font-pretendard',
      fontSize: '16px',
      fontWeight: '400',
      color: '#222222',
      isDefault: false,
    },
    isZoom: false,
    scrollAnimation: {
      animationType: 'fade-up',
      triggerMode: 'down-only',
      animationDurationMs: 700,
      animationEasing: 'natural',
    },
  },
  blocks: [],
};

describe('GuestInvitationView 문서 구조', () => {
  it('하객 화면은 main 랜드마크 + sr-only h1을 갖춘다', () => {
    const { container } = render(<GuestInvitationView payload={payload} />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('민수 ♥ 서연 결혼합니다');
    expect(heading).toHaveClass('sr-only');
    expect(container.querySelector('footer')).not.toBeNull();
  });

  it('h1은 랜드마크(main) 안, 본문 맨 앞에 둔다', () => {
    render(<GuestInvitationView payload={payload} />);

    const main = screen.getByRole('main');
    const heading = screen.getByRole('heading', { level: 1 });
    expect(main.firstElementChild).toBe(heading);
  });

  it('대시보드 폰 미리보기 모드에서는 문서 제목·랜드마크를 만들지 않는다', () => {
    render(<GuestInvitationView payload={payload} mode="dashboard-preview" />);

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
