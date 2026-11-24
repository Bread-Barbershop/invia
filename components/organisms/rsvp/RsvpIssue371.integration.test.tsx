import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import React from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';

import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));

jest.mock('@/components/molecules/scroll-fade-in/ScrollFadeIn', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    ScrollFadeIn: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => React.createElement('div', { className }, children),
  };
});

jest.mock('@/shared/fonts/fontLoader', () => ({
  preloadFontFamilyWeights: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: unknown) =>
    (selector as CallableFunction)({
      setTitleData: jest.fn(),
      setBodyData: jest.fn(),
      titleData: {
        font: 'font-lineseed',
        fontSize: '20px',
        fontWeight: '700',
        color: '#111111',
        isDefault: false,
      },
    }),
}));

jest.mock('@/app/guest/[id]/components/guestFontPreload', () => ({
  resolveGuestFontFamiliesToPreload: jest.fn(() => []),
}));

const mockUsePathname = jest.mocked(usePathname);

const bulkData: NormalizedGuestPayload['bulkData'] = {
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
  scrollAnimation: { animationType: 'fade-up', triggerMode: 'down-only', animationDurationMs: 700, animationEasing: 'natural' },
};

const emptyRsvpBlock = {
  id: 'rsvp-block',
  type: 'wedding',
  component: 'rsvp',
  props: {},
} as NormalizedGuestPayload['blocks'][number];

describe('RSVP 게스트 페이지 통합 렌더링', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['/guest/id', '/i/yaKg'])('공개 경로 %s에서는 링크가 없는 블록 전체를 숨긴다', pathname => {
    mockUsePathname.mockReturnValue(pathname);
    render(<GuestRenderer blocks={[emptyRsvpBlock]} bulkData={bulkData} />);
    expect(screen.queryByText('참석 여부 안내')).not.toBeInTheDocument();
  });

  it('하객 미리보기에서 응답자용 링크를 입력하면 블록을 표시한다', async () => {
    mockUsePathname.mockReturnValue('/preview/invitation');
    const { rerender } = render(<GuestRenderer isGuestPage blocks={[emptyRsvpBlock]} bulkData={bulkData} />);
    expect(screen.queryByText('참석 여부 안내')).not.toBeInTheDocument();

    const formUrl = 'https://forms.gle/sample';
    const block = { ...emptyRsvpBlock, props: { ...emptyRsvpBlock.props, formUrl } };
    rerender(<GuestRenderer isGuestPage blocks={[block]} bulkData={bulkData} />);
    expect(await screen.findByRole('link', { name: '참석 여부 응답하기' })).toHaveAttribute('href', formUrl);
  });

  it('편집 화면에는 링크가 없어도 편집할 제목이 남는다', async () => {
    mockUsePathname.mockReturnValue('/editor');
    render(<GuestRenderer blocks={[emptyRsvpBlock]} bulkData={bulkData} />);
    expect(await screen.findByText('참석 여부 안내')).toBeInTheDocument();
  });
});
