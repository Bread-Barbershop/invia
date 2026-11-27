/**
 * 목적:
 * 하객 초대장 오류 화면(GuestLoadErrorRecovery)의 복구 동작과 안내 문구를 검증한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) 일반 오류에서는 다시 시도/새로 고침 버튼을 44px 높이로 주고 reset·reload를 호출하는지
 * 2) 오프라인이면 연결 안내를 보여주고, 연결이 돌아오면 자동으로 다시 시도하는지
 * 3) 배포 직후 청크 오류면 한 번 자동으로 새로 고침하고, 쿨다운 안에서는 반복하지 않는지
 * 4) 오류 코드(digest)가 있으면 문의용으로 보여주는지
 */

import { act, fireEvent, render, screen } from '@testing-library/react';

import {
  GUEST_ERROR_AUTO_RELOAD_COOLDOWN_MS,
  GUEST_ERROR_AUTO_RELOAD_DELAY_MS,
  GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY,
  reloadGuestPage,
} from '@/shared/utils/guestLoadError';

import { GuestLoadErrorRecovery } from './GuestLoadErrorRecovery';

jest.mock('@/shared/utils/guestLoadError', () => ({
  ...jest.requireActual('@/shared/utils/guestLoadError'),
  reloadGuestPage: jest.fn(),
}));

// 정적 이미지 import는 jsdom에서 빈 경로가 되므로 실제 파일 모양으로 대체한다.
jest.mock('@/shared/assets/logo/invia-simple-logo-3d.png', () => ({
  src: '/invia-simple-logo-3d.png',
  height: 82,
  width: 82,
}));

const reloadMock = reloadGuestPage as jest.Mock;

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
}

function makeChunkError() {
  const error = new Error('Loading chunk 4821 failed.');
  error.name = 'ChunkLoadError';
  return error;
}

describe('GuestLoadErrorRecovery', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    reloadMock.mockClear();
    setOnline(true);
    window.sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('offers retry and refresh for a generic error', () => {
    const reset = jest.fn();

    render(<GuestLoadErrorRecovery error={new Error('boom')} reset={reset} />);

    expect(
      screen.getByRole('heading', { name: '초대장을 불러오지 못했어요' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('같은 문제가 계속되면 초대장을 보내준 분에게 새 링크를 받아 주세요.')
    ).toBeInTheDocument();

    const retry = screen.getByRole('button', { name: '다시 시도하기' });
    const refresh = screen.getByRole('button', { name: '새로 고침' });
    expect(retry).toHaveClass('h-11');
    expect(refresh).toHaveClass('h-11');

    fireEvent.click(retry);
    expect(reset).toHaveBeenCalledTimes(1);

    fireEvent.click(refresh);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('moves focus to the heading so screen readers announce the failure', () => {
    render(<GuestLoadErrorRecovery error={new Error('boom')} reset={jest.fn()} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
  });

  it('explains the offline state and retries as soon as the connection returns', () => {
    setOnline(false);
    const reset = jest.fn();

    render(<GuestLoadErrorRecovery error={new Error('boom')} reset={reset} />);

    expect(
      screen.getByRole('heading', { name: '인터넷 연결을 확인해 주세요' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '새로 고침' })).toBeInTheDocument();

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });

    expect(reset).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('heading', { name: '초대장을 불러오지 못했어요' })
    ).toBeInTheDocument();
  });

  it('waits for the connection instead of reloading while offline', () => {
    setOnline(false);

    render(
      <GuestLoadErrorRecovery error={makeChunkError()} reset={jest.fn()} />
    );

    act(() => {
      jest.advanceTimersByTime(GUEST_ERROR_AUTO_RELOAD_DELAY_MS + 1_000);
    });

    expect(reloadMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: '인터넷 연결을 확인해 주세요' })
    ).toBeInTheDocument();
  });

  it('Strict Mode에서도 실제로 새로 고침할 때만 기록하고 한 번 실행한다', () => {
    render(
      <GuestLoadErrorRecovery error={makeChunkError()} reset={jest.fn()} />,
      { reactStrictMode: true }
    );

    expect(
      screen.getByRole('heading', { name: '초대장을 새로 불러오는 중이에요' })
    ).toBeInTheDocument();
    expect(
      window.sessionStorage.getItem(GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY)
    ).toBeNull();

    act(() => {
      jest.advanceTimersByTime(GUEST_ERROR_AUTO_RELOAD_DELAY_MS);
    });

    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(
      window.sessionStorage.getItem(GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY)
    ).toBe(String(Date.now()));
  });

  it.each([
    {
      operation: '접근',
      blockStorage: () =>
        jest.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => {
          throw new DOMException('Storage unavailable', 'SecurityError');
        }),
    },
    {
      operation: '읽기',
      blockStorage: () =>
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
          throw new DOMException('Storage read blocked', 'SecurityError');
        }),
    },
    {
      operation: '쓰기',
      blockStorage: () =>
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new DOMException('Storage write blocked', 'QuotaExceededError');
        }),
    },
  ])('저장소 $operation 실패 시 수동 새로 고침만 제공한다', ({ blockStorage }) => {
    blockStorage();
    render(
      <GuestLoadErrorRecovery error={makeChunkError()} reset={jest.fn()} />
    );

    act(() => {
      jest.advanceTimersByTime(GUEST_ERROR_AUTO_RELOAD_DELAY_MS * 2);
    });

    expect(
      screen.getByRole('heading', { name: '초대장을 새로 고치지 못했어요' })
    ).toBeInTheDocument();
    expect(reloadMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '새로 고침' }));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('대기 중 연결이 끊겨 취소된 새로 고침은 기록하지 않는다', () => {
    render(
      <GuestLoadErrorRecovery error={makeChunkError()} reset={jest.fn()} />
    );

    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    act(() => {
      jest.advanceTimersByTime(GUEST_ERROR_AUTO_RELOAD_DELAY_MS);
    });

    expect(reloadMock).not.toHaveBeenCalled();
    expect(
      window.sessionStorage.getItem(GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY)
    ).toBeNull();

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });
    act(() => {
      jest.advanceTimersByTime(GUEST_ERROR_AUTO_RELOAD_DELAY_MS);
    });

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('does not auto refresh again inside the cooldown', () => {
    window.sessionStorage.setItem(
      GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY,
      String(Date.now() - 1_000)
    );

    render(
      <GuestLoadErrorRecovery error={makeChunkError()} reset={jest.fn()} />
    );

    expect(
      screen.getByRole('heading', { name: '초대장을 새로 고치지 못했어요' })
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(GUEST_ERROR_AUTO_RELOAD_DELAY_MS * 2);
    });

    expect(reloadMock).not.toHaveBeenCalled();
  });

  it('tries again automatically when a previous attempt is older than the cooldown', () => {
    window.sessionStorage.setItem(
      GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY,
      String(Date.now() - GUEST_ERROR_AUTO_RELOAD_COOLDOWN_MS - 1_000)
    );

    render(
      <GuestLoadErrorRecovery error={makeChunkError()} reset={jest.fn()} />
    );

    act(() => {
      jest.advanceTimersByTime(GUEST_ERROR_AUTO_RELOAD_DELAY_MS);
    });

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('shows the error digest for support when Next.js provides one', () => {
    const error = Object.assign(new Error('boom'), { digest: '3f81a2c9' });

    render(<GuestLoadErrorRecovery error={error} reset={jest.fn()} />);

    expect(screen.getByTestId('guest-load-error-digest')).toHaveTextContent(
      '3f81a2c9'
    );
  });
});
