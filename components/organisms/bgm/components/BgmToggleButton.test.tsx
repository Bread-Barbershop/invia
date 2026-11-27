import { render, screen } from '@testing-library/react';

import BgmToggleButton from './BgmToggleButton';

describe('BgmToggleButton', () => {
  it('터치 영역을 44px로 넓히고 보이는 원은 32px로 유지한다', () => {
    render(<BgmToggleButton isOn={false} onToggle={jest.fn()} />);

    const button = screen.getByRole('button', { name: '배경음악 켜기' });
    expect(button).toHaveClass('h-11', 'w-11', '-m-1.5');

    const circle = button.firstElementChild;
    expect(circle).toHaveClass('h-8', 'w-8');
  });

  it('음악 버튼이 편집기 포스터 위에 표시되는 레이어를 유지한다', () => {
    render(<BgmToggleButton isOn={false} onToggle={jest.fn()} />);

    expect(screen.getByRole('button', { name: '배경음악 켜기' })).toHaveClass(
      'z-50'
    );
  });
});
