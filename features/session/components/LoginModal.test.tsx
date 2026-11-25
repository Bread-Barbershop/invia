import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import LoginModal from './LoginModal';

describe('LoginModal', () => {
  const mockOnClose = jest.fn();
  const mockOnGoogleLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.getElementById('app-root')?.remove();
  });

  function renderModal(props: { open?: boolean; isLoading?: boolean } = {}) {
    return render(
      <LoginModal
        open={props.open ?? true}
        isLoading={props.isLoading ?? false}
        onClose={mockOnClose}
        onGoogleLogin={mockOnGoogleLogin}
      />
    );
  }

  it('Google 로그인 대화상자에 접근 가능한 이름을 준다', () => {
    renderModal();

    expect(
      screen.getByRole('dialog', { name: 'Invia 로그인' })
    ).toBeInTheDocument();
  });

  it('열리면 Google로 계속하기 버튼으로 포커스를 옮긴다', async () => {
    renderModal();

    const googleButton = screen.getByRole('button', {
      name: /Google로 계속하기/,
    });

    await waitFor(() => expect(googleButton).toHaveFocus());
  });

  it('닫히면 열기 전에 포커스가 있던 버튼으로 돌아간다', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            무료로 제작하기
          </button>
          <LoginModal
            open={open}
            isLoading={false}
            onClose={() => setOpen(false)}
            onGoogleLogin={mockOnGoogleLogin}
          />
        </>
      );
    }

    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: '무료로 제작하기' });
    await user.click(trigger);

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Google로 계속하기/ })
      ).toHaveFocus()
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('Google 버튼을 누르면 로그인 요청을 넘긴다', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /Google로 계속하기/ }));

    expect(mockOnGoogleLogin).toHaveBeenCalledTimes(1);
  });

  it('로그인 중에는 버튼을 잠그고 진행 상태를 알린다', () => {
    renderModal({ isLoading: true });

    const googleButton = screen.getByRole('button', { name: /로그인 중/ });

    expect(googleButton).toBeDisabled();
    expect(googleButton).toHaveAttribute('aria-busy', 'true');
  });

  it('열린 동안 뒤 화면(app-root)을 보조기기에서 감춘다', () => {
    const appRoot = document.createElement('div');
    appRoot.id = 'app-root';
    document.body.appendChild(appRoot);

    renderModal();

    expect(appRoot).toHaveAttribute('aria-hidden', 'true');
    expect(appRoot).toHaveAttribute('inert');
  });

  it('open이 false이면 아무것도 그리지 않는다', () => {
    renderModal({ open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
