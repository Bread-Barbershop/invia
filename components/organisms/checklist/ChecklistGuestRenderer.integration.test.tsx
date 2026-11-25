import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';

import { getChecklistStorageKey } from '@/components/organisms/checklist/checklistChecks';

import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

let mockPathname = '/guest/yaKg';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('@/shared/data/registry/registry', () => ({
  blockRegistry: {
    checklist: {
      viewComponent: jest.requireActual(
        '@/components/organisms/checklist/ChecklistPreview'
      ).ChecklistPreview,
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

const checklistBlock = {
  id: 'checklist-block',
  type: 'seminar' as const,
  component: 'checklist' as const,
  props: {
    title: '준비물 체크리스트',
    description: '',
    items: [
      { id: 'a', label: '명함', note: '' },
      { id: 'b', label: '필기 도구', note: '' },
    ],
  },
};

type GuestBlock = NormalizedGuestPayload['blocks'][number];

function asGuestBlocks(...blocks: (typeof checklistBlock)[]): GuestBlock[] {
  return blocks as unknown as GuestBlock[];
}

async function renderChecklistAt(pathname: string) {
  mockPathname = pathname;

  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <GuestRenderer blocks={asGuestBlocks(checklistBlock)} bulkData={bulkData} />
    );
  });

  return result;
}

describe('GuestRenderer 준비물 체크리스트', () => {
  beforeEach(() => localStorage.clear());

  it.each(['/guest/yaKg', '/i/yaKg'])(
    '공개 경로 %s에서는 하객이 직접 체크할 수 있다',
    async pathname => {
      const user = userEvent.setup();
      await renderChecklistAt(pathname);

      const checkbox = screen.getAllByRole('checkbox')[0];
      expect(checkbox).toBeEnabled();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      expect(
        JSON.parse(
          localStorage.getItem(getChecklistStorageKey(checklistBlock.id)) ??
            '[]'
        )
      ).toEqual(['a']);
    }
  );

  it('편집 화면 경로에서는 체크할 수 없다', async () => {
    await renderChecklistAt('/editor');

    expect(screen.getAllByRole('checkbox')[0]).toBeDisabled();
  });

  it('준비물이 비어 있으면 공개 초대장에서 블록을 숨긴다', async () => {
    mockPathname = '/guest/yaKg';
    await act(async () => {
      render(
        <GuestRenderer
          blocks={asGuestBlocks({
            ...checklistBlock,
            props: { ...checklistBlock.props, items: [] },
          })}
          bulkData={bulkData}
        />
      );
    });

    await waitFor(() =>
      expect(screen.queryByText('준비물 체크리스트')).not.toBeInTheDocument()
    );
  });
});
