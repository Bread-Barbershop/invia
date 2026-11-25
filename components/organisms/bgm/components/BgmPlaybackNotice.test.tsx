import { render, screen } from '@testing-library/react';

import { BgmPlaybackNotice } from './BgmPlaybackNotice';

describe('BgmPlaybackNotice', () => {
  it('상태 메시지를 화면 낭독기에 알린다', () => {
    render(<BgmPlaybackNotice message="음악을 불러오지 못했어요." />);

    const notice = screen.getByRole('status');
    expect(notice).toHaveAttribute('aria-live', 'polite');
    expect(notice).toHaveAttribute('aria-atomic', 'true');
    expect(notice).toHaveTextContent('음악을 불러오지 못했어요.');
  });

  it('하객 조작을 가로채지 않는다', () => {
    render(<BgmPlaybackNotice message="음악을 재생하지 못했어요." />);

    expect(screen.getByRole('status')).toHaveClass('pointer-events-none');
  });
});
