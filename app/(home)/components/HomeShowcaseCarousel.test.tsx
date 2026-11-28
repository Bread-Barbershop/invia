import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useEmblaCarousel from 'embla-carousel-react';

import { dashboardCarouselLayout } from '@/app/dashboard/components/carousel/carouselLayout';
import ShowcasePreviewProvider from '@/features/showcase/components/ShowcasePreviewProvider';

import HomeShowcaseCarousel from './HomeShowcaseCarousel';
import { showcaseItems } from './showcaseItems';

const mockScroll = { play: jest.fn(), stop: jest.fn() };
const mockApi = {
  on: jest.fn(),
  off: jest.fn(),
  plugins: () => ({ autoScroll: mockScroll }),
  scrollSnapList: () => [0, 1],
};
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: jest.fn(() => [undefined, mockApi]),
}));

function renderShowcase() {
  render(
    <ShowcasePreviewProvider>
      <HomeShowcaseCarousel items={showcaseItems.slice(0, 2)} />
    </ShowcasePreviewProvider>
  );
  return screen.getByRole('button', {
    name: '어반 모노크롬 웨딩 초대장 미리보기',
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

it('쇼케이스는 선택된 카드 없이 흐르고, 카드에서 포인터를 떼면 이동을 재개한다', () => {
  const card = renderShowcase();
  expect(card).not.toHaveAttribute('aria-pressed');
  expect(
    screen.queryByRole('button', { name: '초대장 복사' })
  ).not.toBeInTheDocument();
  expect(mockScroll.play).toHaveBeenCalledTimes(1);
  fireEvent.pointerOver(card);
  expect(mockScroll.stop).toHaveBeenCalledTimes(1);
  fireEvent.pointerOut(card, { relatedTarget: document.body });
  expect(mockScroll.play).toHaveBeenCalledTimes(2);
});

it('쇼케이스 좌우 화살표와 자동 넘김 버튼에 읽을 수 있는 이름이 있다', () => {
  renderShowcase();
  expect(
    screen.getByRole('button', { name: '이전 초대장 디자인' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: '다음 초대장 디자인' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: '자동 넘김 멈춤' })
  ).toHaveAttribute('aria-pressed', 'false');
});

it('자동 넘김을 멈추면 포인터를 떼도 다시 흐르지 않고, 다시 시작하면 이어진다', () => {
  const card = renderShowcase();
  const pauseButton = screen.getByRole('button', { name: '자동 넘김 멈춤' });
  fireEvent.click(pauseButton);
  expect(pauseButton).toHaveAttribute('aria-pressed', 'true');
  expect(
    screen.getByRole('button', { name: '자동 넘김 다시 시작' })
  ).toBe(pauseButton);
  expect(mockScroll.stop).toHaveBeenCalled();

  const playCount = mockScroll.play.mock.calls.length;
  fireEvent.pointerOver(card);
  fireEvent.pointerOut(card, { relatedTarget: document.body });
  expect(mockScroll.play).toHaveBeenCalledTimes(playCount);

  fireEvent.click(screen.getByRole('button', { name: '자동 넘김 다시 시작' }));
  expect(mockScroll.play).toHaveBeenCalledTimes(playCount + 1);
});

it('첫 카드의 중앙 정렬용 여백 없이 모든 카드 뒤에 같은 순환 간격을 둔다', () => {
  renderShowcase();
  const [options] = jest.mocked(useEmblaCarousel).mock.calls[0];
  expect(options?.loop).toBe(true);
  expect(options?.align ?? 'center').toBe('center');
  const cards = screen.getAllByRole('button', {
    name: /초대장 미리보기$/,
  });
  expect(cards).toHaveLength(2);
  for (const card of cards) {
    expect(card.style.marginInlineStart).toBe('');
    expect(card).toHaveStyle({
      marginInlineEnd: dashboardCarouselLayout.trackGap,
    });
  }
  expect(cards[0].parentElement?.style.gap).toBe('');
});

it.each(['클릭', 'Enter'])(
  '%s하면 해당 초대장을 열고 미리보는 동안 이동을 멈춘다',
  async input => {
    const user = userEvent.setup();
    const card = renderShowcase();
    if (input === '클릭') {
      await user.click(card);
    } else {
      await user.tab();
      await user.tab();
      expect(card).toHaveFocus();
      await user.keyboard('{Enter}');
    }
    expect(screen.getByTitle('어반 모노크롬 초대장 내용')).toHaveAttribute(
      'src',
      '/showcase/showcase-1'
    );
    expect(mockScroll.stop).toHaveBeenCalled();
    const playCount = mockScroll.play.mock.calls.length;
    fireEvent.pointerOut(card, { relatedTarget: document.body });
    expect(mockScroll.play).toHaveBeenCalledTimes(playCount);
  }
);
