/**
 * 목적:
 * app/i/[code]/error.tsx 가 짧은 링크에서도 같은 하객 복구 화면을 보여 주는지 검증한다.
 */

import { fireEvent, render, screen } from '@testing-library/react';

import ShortGuestInvitationError from './error';

jest.mock('@/shared/assets/logo/invia-simple-logo-3d.png', () => ({
  src: '/invia-simple-logo-3d.png',
  height: 82,
  width: 82,
}));

describe('ShortGuestInvitationError', () => {
  it('renders the same guest recovery screen as the long guest route', () => {
    const reset = jest.fn();

    render(
      <ShortGuestInvitationError error={new Error('boom')} reset={reset} />
    );

    expect(
      screen.getByRole('heading', { name: '초대장을 불러오지 못했어요' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도하기' })).toHaveClass(
      'h-11'
    );
    expect(screen.getByRole('button', { name: '새로 고침' })).toHaveClass('h-11');

    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
