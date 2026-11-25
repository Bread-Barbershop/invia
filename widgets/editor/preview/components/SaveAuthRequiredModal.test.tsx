/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';

import { SaveModal } from './SaveModal';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('./SaveLottie', () => ({
  SaveLottie: () => <div data-testid="save-animation" />,
}));

function renderModal({
  authRequired = false,
  escapeDisabled = false,
  isFail = false,
}: {
  authRequired?: boolean;
  escapeDisabled?: boolean;
  isFail?: boolean;
} = {}) {
  const onClose = jest.fn();
  const onRetry = jest.fn();
  const onGoogleLogin = jest.fn();

  render(
    <SaveModal
      isLoading={false}
      isFail={isFail}
      authRequired={authRequired}
      escapeDisabled={escapeDisabled}
      pendingInvitation={null}
      loadingMessage=""
      retry={onRetry}
      onClose={onClose}
      onGoogleLogin={onGoogleLogin}
    />
  );

  return { onClose, onRetry, onGoogleLogin };
}

describe('SaveModal 로그인 안내', () => {
  it('로그인이 필요하면 Google 로그인 안내와 닫기 버튼을 보여 준다', () => {
    const { onClose, onGoogleLogin } = renderModal({ authRequired: true });

    expect(
      screen.getByText('저장을 위해 Google 로그인이 필요해요')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Google로 계속하기/ }));
    expect(onGoogleLogin).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ESC로 저장 안내 창을 닫는다', () => {
    const { onClose } = renderModal({ authRequired: true });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('로그인 창이 떠 있는 동안에는 ESC로 저장 안내 창을 닫지 않는다', () => {
    const { onClose } = renderModal({
      authRequired: true,
      escapeDisabled: true,
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('일반 저장 실패 안내도 X 버튼으로 닫을 수 있다', () => {
    const { onClose, onRetry } = renderModal({ isFail: true });

    expect(screen.getByText('파일 저장에 실패했습니다.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '다시 저장하기' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
