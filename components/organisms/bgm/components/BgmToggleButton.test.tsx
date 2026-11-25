import { fireEvent, render, screen } from '@testing-library/react';

import BgmToggleButton from './BgmToggleButton';

describe('BgmToggleButton', () => {
  it('이름은 고정하고 눌림 상태를 aria-pressed로 알린다', () => {
    const { rerender } = render(
      <BgmToggleButton isOn={false} onToggle={jest.fn()} />
    );

    const button = screen.getByRole('button', { name: '배경음악' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAttribute('title', '배경음악 켜기');

    rerender(<BgmToggleButton isOn onToggle={jest.fn()} />);

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('title', '배경음악 끄기');
  });

  it('터치 영역을 44px로 넓히고 보이는 원은 32px로 유지한다', () => {
    render(<BgmToggleButton isOn={false} onToggle={jest.fn()} />);

    const button = screen.getByRole('button', { name: '배경음악' });
    // h-11 = 44px, w-11 = 44px (터치 최소 규격)
    expect(button).toHaveClass('h-11', 'w-11', '-m-1.5');

    const circle = button.firstElementChild;
    expect(circle).toHaveClass('h-8', 'w-8');
  });

  it('키보드 포커스에 테두리를 보여 준다', () => {
    render(<BgmToggleButton isOn={false} onToggle={jest.fn()} />);

    const button = screen.getByRole('button', { name: '배경음악' });
    expect(button).toHaveClass(
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-white'
    );
  });

  it('클릭하면 onToggle을 한 번 호출한다', () => {
    const onToggle = jest.fn();
    render(<BgmToggleButton isOn={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole('button', { name: '배경음악' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
