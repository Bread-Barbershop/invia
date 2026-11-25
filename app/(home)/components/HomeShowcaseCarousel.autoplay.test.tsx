import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShowcasePreviewProvider from '@/features/showcase/components/ShowcasePreviewProvider';

import HomeShowcaseCarousel from './HomeShowcaseCarousel';
import { showcaseItems } from './showcaseItems';

const mockScroll = { play: jest.fn(), stop: jest.fn() };
const mockScrollPrev = jest.fn();
const mockScrollNext = jest.fn();
const mockApi = {
  on: jest.fn(),
  off: jest.fn(),
  plugins: () => ({ autoScroll: mockScroll }),
  scrollSnapList: () => [0, 1],
  scrollPrev: mockScrollPrev,
  scrollNext: mockScrollNext,
};
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: jest.fn(() => [undefined, mockApi]),
}));

const originalMatchMedia = window.matchMedia;

function renderShowcase() {
  render(
    <ShowcasePreviewProvider>
      <HomeShowcaseCarousel items={showcaseItems.slice(0, 2)} />
    </ShowcasePreviewProvider>
  );
}

function mockReducedMotion() {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia;
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

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

it('자동 넘김을 멈추는 버튼을 두고, 누르면 흐름이 멈춘다', async () => {
  const user = userEvent.setup();
  renderShowcase();

  expect(mockScroll.play).toHaveBeenCalledTimes(1);
  expect(mockScroll.stop).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: '자동 넘김 멈추기' }));
  expect(mockScroll.stop).toHaveBeenCalled();
  expect(
    screen.getByRole('button', { name: '자동 넘김 다시 시작하기' })
  ).toBeInTheDocument();

  const playCount = mockScroll.play.mock.calls.length;
  await user.click(
    screen.getByRole('button', { name: '자동 넘김 다시 시작하기' })
  );
  expect(mockScroll.play.mock.calls.length).toBe(playCount + 1);
});

it('멈춤 버튼 자신에 포인터를 올리거나 포커스를 줘도 정지로 치지 않는다', async () => {
  const user = userEvent.setup();
  renderShowcase();

  const toggle = screen.getByRole('button', { name: '자동 넘김 멈추기' });
  fireEvent.pointerOver(toggle);
  expect(mockScroll.stop).not.toHaveBeenCalled();

  await user.tab();
  expect(toggle).toHaveFocus();
  expect(mockScroll.stop).not.toHaveBeenCalled();
});

it('카드에 포인터를 올리면 지금처럼 잠시 멈추고, 떼면 다시 흐른다', () => {
  renderShowcase();

  const card = screen.getAllByRole('button', { name: /초대장 미리보기$/ })[0];
  fireEvent.pointerOver(card);
  expect(mockScroll.stop).toHaveBeenCalledTimes(1);

  fireEvent.pointerOut(card, { relatedTarget: document.body });
  expect(mockScroll.play).toHaveBeenCalledTimes(2);
});

it('화살표 버튼에도 무슨 초대장을 넘기는지 이름이 있다', async () => {
  const user = userEvent.setup();
  renderShowcase();

  await user.click(
    screen.getByRole('button', { name: '이전 초대장 디자인' })
  );
  await user.click(
    screen.getByRole('button', { name: '다음 초대장 디자인' })
  );

  expect(mockScrollPrev).toHaveBeenCalledTimes(1);
  expect(mockScrollNext).toHaveBeenCalledTimes(1);
});

it('모션 줄이기를 켠 사용자에게는 흐르지도, 멈춤 버튼이 보이지도 않는다', () => {
  mockReducedMotion();
  renderShowcase();

  expect(
    screen.queryByRole('button', { name: '자동 넘김 멈추기' })
  ).not.toBeInTheDocument();
  expect(mockScroll.play).not.toHaveBeenCalled();
  expect(mockScroll.stop).toHaveBeenCalled();
});
