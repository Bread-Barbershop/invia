import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CarouselController from './CarouselController';

it('화살표만 보이는 버튼에도 이전·다음 초대장 이름을 붙인다', () => {
  render(<CarouselController onMove={jest.fn()} />);

  expect(
    screen.getByRole('button', { name: '이전 초대장' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: '다음 초대장' })
  ).toBeInTheDocument();
});

it('화면마다 다른 이름을 넘길 수 있다', () => {
  render(
    <CarouselController
      onMove={jest.fn()}
      previousLabel="이전 초대장 디자인"
      nextLabel="다음 초대장 디자인"
    />
  );

  expect(
    screen.getByRole('button', { name: '이전 초대장 디자인' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: '다음 초대장 디자인' })
  ).toBeInTheDocument();
});

it('누르면 이동 방향을 알려 준다', async () => {
  const user = userEvent.setup();
  const onMove = jest.fn();
  render(<CarouselController onMove={onMove} />);

  await user.click(screen.getByRole('button', { name: '이전 초대장' }));
  await user.click(screen.getByRole('button', { name: '다음 초대장' }));

  expect(onMove.mock.calls).toEqual([['left'], ['right']]);
});

it('끝에 닿은 방향의 버튼은 잠그고 눌러도 움직이지 않는다', async () => {
  const user = userEvent.setup();
  const onMove = jest.fn();
  render(
    <CarouselController
      onMove={onMove}
      canMovePrevious={false}
      canMoveNext={false}
    />
  );

  const previous = screen.getByRole('button', { name: '이전 초대장' });
  const next = screen.getByRole('button', { name: '다음 초대장' });

  expect(previous).toBeDisabled();
  expect(previous).toHaveAttribute('aria-disabled', 'true');
  expect(next).toBeDisabled();

  await user.click(previous);
  await user.click(next);

  expect(onMove).not.toHaveBeenCalled();
});

it('이동할 수 있는 방향은 잠그지 않는다', () => {
  render(<CarouselController onMove={jest.fn()} canMovePrevious />);

  const previous = screen.getByRole('button', { name: '이전 초대장' });
  expect(previous).toBeEnabled();
  expect(previous).not.toHaveAttribute('aria-disabled');
});
