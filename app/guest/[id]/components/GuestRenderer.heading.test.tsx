import { render, screen } from '@testing-library/react';
import React from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';

import GuestRenderer from './GuestRenderer';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

const mockSetTitleData = jest.fn();
const mockSetBodyData = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/guest/data-json-file-id',
}));

jest.mock('@/shared/data/registry/registry', () => ({
  blockRegistry: {
    coupleIntroduction: {
      viewComponent: (props: { blockInfo: { props: { title: string } } }) => (
        <MiddlePreviewWrapper
          className=""
          subTitle="INTRODUCTION"
          mainTitle={props.blockInfo.props.title}
          mainTitleDefault="신랑・신부 소개"
        >
          <p>본문</p>
        </MiddlePreviewWrapper>
      ),
    },
    visualEffects: { viewComponent: () => <div /> },
  },
}));

jest.mock('@/components/molecules/scroll-fade-in/ScrollFadeIn', () => ({
  ScrollFadeIn: (props: { children: React.ReactNode }) => (
    <div className="scroll-fade-in-item">{props.children}</div>
  ),
}));

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: unknown) =>
    (selector as CallableFunction)({
      setTitleData: mockSetTitleData,
      setBodyData: mockSetBodyData,
      bodyData: undefined,
      titleData: undefined,
    }),
}));

jest.mock('@/shared/hooks/useTitleFontInfo', () => ({
  useTitleFontInfo: () => ({
    mainStyle: { fontFamily: 'Test Title Font', fontSize: '20px' },
    subStyle: { fontFamily: 'Test Title Font', fontSize: '13px' },
  }),
}));

jest.mock('./guestFontPreload', () => ({
  resolveGuestFontFamiliesToPreload: () => [],
}));

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
  scrollAnimation: {
    animationType: 'fade-up',
    triggerMode: 'down-only',
    animationDurationMs: 700,
    animationEasing: 'natural',
  },
};

const blocks: NormalizedGuestPayload['blocks'] = [
  {
    id: 'couple',
    type: 'wedding',
    component: 'coupleIntroduction',
    props: { title: '신랑・신부 소개', groom: '김민수', bride: '이서연' },
  },
];

describe('GuestRenderer 섹션 제목 heading', () => {
  it('하객 화면에서는 섹션 제목이 h2로 노출된다', () => {
    render(<GuestRenderer blocks={blocks} bulkData={bulkData} isGuestPage />);

    expect(
      screen.getByRole('heading', { level: 2, name: '신랑・신부 소개' })
    ).toBeInTheDocument();
  });

  it('편집 미리보기(isGuestPage=false)에서는 기존 <p> 그대로다', () => {
    render(
      <GuestRenderer blocks={blocks} bulkData={bulkData} isGuestPage={false} />
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('신랑・신부 소개').tagName).toBe('P');
  });
});
