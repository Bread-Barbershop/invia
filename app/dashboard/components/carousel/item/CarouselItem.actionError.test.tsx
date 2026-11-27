import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { privateInvite } from '../fixtures/invitationPreview';

import CarouselItem from './CarouselItem';

jest.mock('@/shared/assets/icons/edit.svg', () => () => null);
jest.mock('@/shared/assets/icons/kakao2.svg', () => () => null);
jest.mock('@/shared/assets/icons/link.svg', () => () => null);
jest.mock('@/shared/assets/icons/preview.svg', () => () => null);

const realFetch = global.fetch;
const mockFetch = jest.fn();
const publishFailure = {
  title: '초대장을 공개로 바꾸지 못했어요',
  description: '공개 링크 권한을 설정하지 못했어요. 다시 시도해 주세요.',
};

function renderItem(
  overrides: Partial<ComponentProps<typeof CarouselItem>> = {}
) {
  const card = (patch: Partial<ComponentProps<typeof CarouselItem>> = {}) => (
    <CarouselItem
      item={{
        id: privateInvite.folderId,
        image: '/cover.webp',
        alt: '비공개 초대장',
        invite: privateInvite,
      }}
      index={0}
      isSelected
      showHeader
      onSelect={jest.fn()}
      guestUrl={null}
      isDeleting={false}
      isSharing={false}
      isVisibilityUpdating={false}
      visibilityError={null}
      {...overrides}
      {...patch}
    />
  );
  const result = render(card());
  return {
    ...result,
    rerenderItem: (patch: Partial<ComponentProps<typeof CarouselItem>>) =>
      result.rerender(card(patch)),
  };
}

describe('대시보드 카드 액션 실패 안내', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = realFetch;
  });

  it('공개 전환에 실패하면 카드 안에서 이유를 읽고 바로 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    const onToggleVisibility = jest.fn();

    renderItem({
      visibilityError: publishFailure,
      onToggleVisibility,
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('초대장을 공개로 바꾸지 못했어요');
    expect(alert).not.toHaveTextContent(/visibility update failed/i);

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(onToggleVisibility).toHaveBeenCalledWith(
      privateInvite.folderId,
      true
    );
  });

  it('실패 안내를 닫으면 카드에서 사라지고 공개 토글은 그대로 남는다', async () => {
    const user = userEvent.setup();

    renderItem({
      visibilityError: {
        title: '초대장을 비공개로 바꾸지 못했어요',
        description: '이미 보낸 링크로 초대장이 열릴 수 있어요.',
      },
      item: {
        id: 'public-folder',
        image: '/cover.webp',
        alt: '공개 초대장',
        invite: {
          ...privateInvite,
          folderId: 'public-folder',
          published: true,
        },
      },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      '초대장을 비공개로 바꾸지 못했어요'
    );

    await user.click(screen.getByRole('button', { name: '안내 닫기' }));

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: '공개' })).toBeInTheDocument();
  });

  it('카드 선택이 바뀌어도 닫은 안내는 숨기고 새 공개 전환 실패는 다시 표시한다', async () => {
    const user = userEvent.setup();
    const { rerenderItem } = renderItem({ visibilityError: publishFailure });

    await user.click(screen.getByRole('button', { name: '안내 닫기' }));
    rerenderItem({ isSelected: false });
    rerenderItem({ isSelected: true });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerenderItem({ visibilityError: { ...publishFailure } });

    expect(screen.getByRole('alert')).toHaveTextContent(publishFailure.title);
  });

  it('공유 정보를 불러오지 못하면 alert로 알리고 다시 준비할 수 있다', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));
    const invite = {
      ...privateInvite,
      published: true,
      guestUrl: '/guest/saved-root',
      hasKakaoShareData: true,
    };

    renderItem({
      showHeader: false,
      showCenterActions: true,
      item: {
        id: invite.folderId,
        image: '/cover.webp',
        alt: '공개 초대장',
        invite,
      },
      guestUrl: invite.guestUrl,
      onOpenLinkShare: jest.fn(),
      onShare: jest.fn(),
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('공유 정보를 불러오지 못했어요');
    expect(alert).toHaveTextContent(
      '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
    );

    const callsBeforeRetry = mockFetch.mock.calls.length;
    await user.click(screen.getByRole('button', { name: '다시 준비' }));

    await waitFor(() =>
      expect(mockFetch.mock.calls.length).toBeGreaterThan(callsBeforeRetry)
    );
  });

  it('공유 안내를 닫은 뒤 같은 실패가 다시 나면 새 안내를 표시한다', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));
    const invite = {
      ...privateInvite,
      published: true,
      guestUrl: '/guest/root',
    };
    renderItem({
      showHeader: false,
      showCenterActions: true,
      item: {
        id: invite.folderId,
        image: '/cover.webp',
        alt: '공개 초대장',
        invite,
      },
      guestUrl: invite.guestUrl,
      onOpenLinkShare: jest.fn(),
    });

    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: '안내 닫기' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    const retry = screen.getByRole('button', { name: '공유 다시 준비하기' });
    expect(retry).not.toHaveAttribute('title');
    await user.click(retry);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '공유 정보를 불러오지 못했어요'
    );
  });

  it('삭제 중에는 버튼이 진행 상태를 알리고 다시 누를 수 없다', () => {
    renderItem({ isDeleting: true, showSideActions: true });

    const deleteButton = screen.getByRole('button', {
      name: '초대장 삭제 중',
    });

    expect(deleteButton).toHaveAttribute('aria-busy', 'true');
    expect(deleteButton).toBeDisabled();
  });
});
