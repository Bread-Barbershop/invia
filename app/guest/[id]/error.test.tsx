/**
 * 목적:
 * app/guest/[id]/error.tsx 가 Next.js 오류 경계의 error·reset 을 하객 복구 화면으로 넘기는지 검증한다.
 */

import { fireEvent, render, screen } from '@testing-library/react';

import GuestInvitationError from './error';

jest.mock('@/shared/assets/logo/invia-simple-logo-3d.png', () => ({
  src: '/invia-simple-logo-3d.png',
  height: 82,
  width: 82,
}));

describe('GuestInvitationError', () => {
  it('renders the guest recovery screen and forwards reset', () => {
    const reset = jest.fn();

    render(<GuestInvitationError error={new Error('boom')} reset={reset} />);

    expect(
      screen.getByRole('heading', { name: '초대장을 불러오지 못했어요' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
