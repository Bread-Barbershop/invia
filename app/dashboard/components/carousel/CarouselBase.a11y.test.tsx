import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CarouselCardItem } from './carouselTypes';
import CarouselBase from './CarouselBase';

const listeners: Record<string, (() => void) | undefined> = {};
let selectedIndex = 0;

const mockApi = {
  on: jest.fn((event: string, handler: () => void) => {
    listeners[event] = handler;
  }),
  off: jest.fn(),
  reInit: jest.fn(),
  selectedScrollSnap: jest.fn(() => selectedIndex),
  scrollTo: jest.fn((index: number) => {
    selectedIndex = index;
    listeners.select?.();
  }),
  slideNodes: jest.fn(() => []),
  plugins: () => ({}),
  scrollSnapList: () => [0, 1, 2],
};

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: jest.fn(() => [undefined, mockApi]),
}));

const items: CarouselCardItem[] = [
  { id: 'a', image: '/a.png', alt: '첫 번째 초대장' },
  { id: 'b', image: '/b.png', alt: '두 번째 초대장' },
  { id: 'c', image: '/c.png', alt: '세 번째 초대장' },
];

beforeEach(() => {
  selectedIndex = 0;
  Object.keys(listeners).forEach(key => delete listeners[key]);
  jest.clearAllMocks();
});

it('캐러셀 영역에 이름과 역할 설명을 붙인다', () => {
  render(<CarouselBase items={items} />);

  const region = screen.getByRole('region', { name: '내 초대장' });
  expect(region).toHaveAttribute('aria-roledescription', '캐러셀');
});

it('몇 번째 초대장인지 화면 낭독기로 알려 준다', async () => {
  const user = userEvent.setup();
  render(<CarouselBase items={items} />);

  const status = document.querySelector('[aria-live="polite"]');
  expect(status).toHaveTextContent('초대장 1 / 3');

  await user.click(screen.getByRole('button', { name: '다음 초대장' }));
  expect(status).toHaveTextContent('초대장 2 / 3');

  await user.click(screen.getByRole('button', { name: '다음 초대장' }));
  expect(status).toHaveTextContent('초대장 3 / 3');

  await user.click(screen.getByRole('button', { name: '이전 초대장' }));
  expect(status).toHaveTextContent('초대장 2 / 3');
});

it('첫 초대장에서는 이전 버튼을, 마지막 초대장에서는 다음 버튼을 잠근다', async () => {
  const user = userEvent.setup();
  render(<CarouselBase items={items} />);

  expect(screen.getByRole('button', { name: '이전 초대장' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '다음 초대장' })).toBeEnabled();

  await user.click(screen.getByRole('button', { name: '다음 초대장' }));
  expect(screen.getByRole('button', { name: '이전 초대장' })).toBeEnabled();
  expect(screen.getByRole('button', { name: '다음 초대장' })).toBeEnabled();

  await user.click(screen.getByRole('button', { name: '다음 초대장' }));
  expect(screen.getByRole('button', { name: '다음 초대장' })).toBeDisabled();

  await user.click(screen.getByRole('button', { name: '이전 초대장' }));
  expect(screen.getByRole('button', { name: '이전 초대장' })).toBeEnabled();
});

it('마지막 초대장에서 열리면 다음 버튼부터 잠긴다', () => {
  selectedIndex = items.length - 1;
  render(<CarouselBase items={items} startIndex={items.length - 1} />);

  expect(screen.getByRole('button', { name: '이전 초대장' })).toBeEnabled();
  expect(screen.getByRole('button', { name: '다음 초대장' })).toBeDisabled();
});

it('초대장이 하나뿐이면 양쪽 버튼을 모두 잠근다', () => {
  render(<CarouselBase items={items.slice(0, 1)} />);

  expect(screen.getByRole('button', { name: '이전 초대장' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '다음 초대장' })).toBeDisabled();
});

it('화살표 버튼으로도 같은 Embla 인스턴스를 움직인다', async () => {
  const user = userEvent.setup();
  render(<CarouselBase items={items} />);

  await user.click(screen.getByRole('button', { name: '다음 초대장' }));

  expect(mockApi.scrollTo).toHaveBeenLastCalledWith(1);
});
