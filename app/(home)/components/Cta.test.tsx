import { fireEvent, render, screen } from '@testing-library/react';

import Cta from './Cta';

const mockPush = jest.fn();
const mockRunAfterAuth = jest.fn((action: () => void) => action());

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: jest.fn(), replace: jest.fn() }),
}));

jest.mock('@/features/session/hooks/useAuthGate', () => ({
  useAuthGate: () => ({
    isBusy: false,
    isLoginOpen: false,
    isLoginPending: false,
    isPrivacyNoticeOpen: false,
    isDrivePermissionRequiredOpen: false,
    closeLogin: jest.fn(),
    closePrivacyNotice: jest.fn(),
    confirmPrivacyNotice: jest.fn(),
    closeDrivePermissionRequired: jest.fn(),
    loginWithGoogle: jest.fn(),
    retryDrivePermission: jest.fn(),
    runAfterAuth: mockRunAfterAuth,
  }),
}));

describe('홈 히어로 CTA', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRunAfterAuth.mockClear();
  });

  it('링크로 렌더링해 주소 복사·새 탭 열기·JS 없는 환경에서도 편집기로 간다', () => {
    render(<Cta />);

    const link = screen.getByRole('link', { name: '무료로 제작하기' });
    expect(link).toHaveAttribute('href', '/editor');
  });

  it('클릭하면 로그인 게이트를 거쳐 편집기로 이동한다', () => {
    render(<Cta />);

    fireEvent.click(screen.getByRole('link', { name: '무료로 제작하기' }));

    expect(mockRunAfterAuth).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/editor');
  });

  it('Ctrl·Cmd 클릭은 브라우저의 새 탭 열기를 막지 않는다', () => {
    render(<Cta />);

    fireEvent.click(screen.getByRole('link', { name: '무료로 제작하기' }), {
      ctrlKey: true,
    });

    expect(mockRunAfterAuth).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
