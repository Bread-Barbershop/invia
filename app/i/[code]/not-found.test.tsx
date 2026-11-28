/**
 * 목적:
 * 짧은 링크(/i/[code])에서도 초대장을 찾지 못했을 때 같은 하객 전용 안내가 나오는지 검증한다.
 */

import { render, screen } from '@testing-library/react';

import ShortGuestInvitationNotFound from './not-found';

jest.mock('@/shared/assets/logo/invia-simple-logo-3d.png', () => ({
  src: '/invia-simple-logo-3d.png',
  height: 82,
  width: 82,
}));

describe('ShortGuestInvitationNotFound', () => {
  it('shows the guest-first message instead of the marketing 404', () => {
    render(<ShortGuestInvitationNotFound />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '초대장을 찾을 수 없어요'
    );
    expect(
      screen.getByText('초대장을 보내준 분에게 새 링크를 받아 주세요.')
    ).toBeInTheDocument();
  });
});
