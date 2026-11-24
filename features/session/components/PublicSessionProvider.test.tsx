import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useAuthGate } from '@/features/session/hooks/useAuthGate';

import {
  PublicSessionProvider,
  usePublicSession,
} from './PublicSessionProvider';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));
jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({ success: jest.fn() }),
}));

function deferred<T>() {
  let resolve!: (value: T) => void; // eslint-disable-line no-unused-vars
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}
const response = (isLoggedIn: boolean) =>
  ({ ok: true, status: 200, json: async () => ({ isLoggedIn }) }) as Response;
const wrapper = ({ children }: { children: ReactNode }) => (
  <PublicSessionProvider>{children}</PublicSessionProvider>
);

describe('공개 페이지 세션', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('첫 클릭은 진행 중인 조회를 공유하고 로그인된 사용자의 동작을 실행한다', async () => {
    const request = deferred<Response>();
    jest.mocked(fetch).mockReturnValue(request.promise);
    const action = jest.fn();
    const { result } = renderHook(
      () => ({ first: useAuthGate(), second: useAuthGate() }),
      { wrapper }
    );
    act(() => {
      void result.current.second.runAfterAuth(action);
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () => {
      request.resolve(response(true));
      await request.promise;
    });
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(result.current.first.isLoggedIn).toBe(true);
    expect(result.current.second.isPrivacyNoticeOpen).toBe(false);
  });

  it('첫 클릭의 조회 결과가 로그아웃 상태이면 로그인 안내를 연다', async () => {
    const request = deferred<Response>();
    jest.mocked(fetch).mockReturnValue(request.promise);
    const action = jest.fn();
    const { result } = renderHook(() => useAuthGate(), { wrapper });
    act(() => {
      void result.current.runAfterAuth(action);
    });
    await act(async () => {
      request.resolve(response(false));
      await request.promise;
    });
    await waitFor(() => expect(result.current.isPrivacyNoticeOpen).toBe(true));
    expect(action).not.toHaveBeenCalled();
  });

  it('인증된 상태라도 재검증이 실패하면 보호 동작을 실행하지 않는다', async () => {
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(response(true))
      .mockRejectedValueOnce(new Error('network'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const action = jest.fn();
    const { result } = renderHook(() => useAuthGate(), { wrapper });
    await waitFor(() => expect(result.current.isLoggedIn).toBe(true));
    await act(async () => {
      await result.current.runAfterAuth(action);
    });
    expect(action).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    '늦게 도착한 조회 결과는 이후 인증 상태 %s를 덮어쓰지 않는다',
    async state => {
      const request = deferred<Response>();
      jest.mocked(fetch).mockReturnValue(request.promise);
      const { result } = renderHook(() => usePublicSession()!, { wrapper });
      act(() => result.current.setSession(state));
      await act(async () => {
        request.resolve(response(!state));
        await request.promise;
      });
      expect(result.current.isLoggedIn).toBe(state);
    }
  );

  it('모바일 홈에서는 조회하지 않고 데스크톱 전환 시 조회한다', async () => {
    let listener: (() => void) | undefined;
    const media = {
      matches: false,
      addEventListener: jest.fn((_event, cb) => {
        listener = cb;
      }),
      removeEventListener: jest.fn(),
    };
    window.matchMedia = jest.fn().mockReturnValue(media);
    jest.mocked(fetch).mockResolvedValue(response(true));
    const desktopWrapper = ({ children }: { children: ReactNode }) => (
      <PublicSessionProvider desktopOnly>{children}</PublicSessionProvider>
    );
    const { result } = renderHook(() => usePublicSession()!, {
      wrapper: desktopWrapper,
    });
    expect(fetch).not.toHaveBeenCalled();
    media.matches = true;
    await act(async () => {
      listener?.();
    });
    await waitFor(() => expect(result.current.isLoggedIn).toBe(true));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
