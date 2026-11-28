import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';

import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

let mockPathname = '/guest/yaKg';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('@/shared/data/registry/registry', () => ({
  blockRegistry: {
    eventGuide: {
      viewComponent: jest.requireActual(
        '@/components/organisms/eventGuide/EventGuidePreview'
      ).EventGuidePreview,
    },
  },
}));

jest.mock('@/components/molecules/scroll-fade-in/ScrollFadeIn', () => ({
  ScrollFadeIn: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@/shared/fonts/fontLoader', () => ({
  preloadFontFamilyWeights: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: unknown) =>
    (selector as CallableFunction)({
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
      setTitleData: jest.fn(),
      setBodyData: jest.fn(),
    }),
}));

jest.mock('@/app/guest/[id]/components/guestFontPreload', () => ({
  resolveGuestFontFamiliesToPreload: jest.fn(() => []),
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

const eventGuideBlock = {
  id: 'event-guide-block',
  type: 'firstBirthday' as const,
  component: 'eventGuide' as const,
  props: {
    title: '이벤트 안내',
    intro: '',
    items: [
      {
        id: 'a',
        title: '돌잡이',
        description: '함께 지켜봐 주세요.',
        time: '12:00',
        place: '',
      },
    ],
  },
};

type GuestBlock = NormalizedGuestPayload['blocks'][number];

function asGuestBlocks(...blocks: (typeof eventGuideBlock)[]): GuestBlock[] {
  return blocks as unknown as GuestBlock[];
}

async function renderEventAt(pathname: string) {
  mockPathname = pathname;

  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <GuestRenderer blocks={asGuestBlocks(eventGuideBlock)} bulkData={bulkData} />
    );
  });

  return result;
}

describe('GuestRenderer 이벤트 안내', () => {
  it.each(['/guest/yaKg', '/i/yaKg'])(
    '공개 경로 %s에서 이벤트를 보여 준다',
    async pathname => {
      await renderEventAt(pathname);
      expect(screen.getByText('돌잡이')).toBeInTheDocument();
      expect(screen.getByText('12:00')).toBeInTheDocument();
    }
  );

  it('항목이 비어 있으면 공개 초대장에서 블록을 숨긴다', async () => {
    mockPathname = '/guest/yaKg';
    await act(async () => {
      render(
        <GuestRenderer
          blocks={asGuestBlocks({
            ...eventGuideBlock,
            props: { ...eventGuideBlock.props, items: [] },
          })}
          bulkData={bulkData}
        />
      );
    });

    expect(screen.queryByText('이벤트 안내')).not.toBeInTheDocument();
  });

  it('편집 경로에서는 빈 안내 문구를 보여 준다', async () => {
    mockPathname = '/editor';
    await act(async () => {
      render(
        <GuestRenderer
          blocks={asGuestBlocks({
            ...eventGuideBlock,
            props: { ...eventGuideBlock.props, items: [] },
          })}
          bulkData={bulkData}
        />
      );
    });

    expect(
      screen.getByText('참여할 수 있는 이벤트를 추가해 주세요.')
    ).toBeInTheDocument();
  });
});
