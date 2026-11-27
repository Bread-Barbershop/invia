/**
 * 목적:
 * 삭제되었거나 만료된 초대장 링크로 들어온 하객에게 사이트 404 대신
 * 초대장 전용 안내(새 링크를 받아 달라)를 보여 주는지 검증한다.
 */

import { render, screen } from '@testing-library/react';

import GuestInvitationNotFound from './not-found';

jest.mock('@/shared/assets/logo/invia-simple-logo-3d.png', () => ({
  src: '/invia-simple-logo-3d.png',
  height: 82,
  width: 82,
}));

describe('GuestInvitationNotFound', () => {
  it('explains that the invitation is gone and asks for a new link', () => {
    render(<GuestInvitationNotFound />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '초대장을 찾을 수 없어요'
    );
    expect(
      screen.getByText('링크가 만료되었거나 주소가 바뀌었을 수 있어요.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('초대장을 보내준 분에게 새 링크를 받아 주세요.')
    ).toBeInTheDocument();
    expect(screen.queryByText('PAGE NOT FOUND')).not.toBeInTheDocument();
  });
});
