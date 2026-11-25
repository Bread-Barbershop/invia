/** @jest-environment jsdom */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CarouselWrapper from './CarouselWrapper';
import { sourceInvitation } from './fixtures/dashboardCopyInvitations';

const mockRouter = { push: jest.fn(), replace: jest.fn(), refresh: jest.fn() };
jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }));

jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

const mockEmblaApi = {
  selectedScrollSnap: () => 0,
  on: jest.fn(),
  off: jest.fn(),
  reInit: jest.fn(),
  scrollTo: jest.fn(),
};
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [jest.fn(), mockEmblaApi],
}));

const ERROR_TITLE = '초대장을 불러오지 못했어요';
const EMPTY_COPY = '아직 만든 초대장이 없어요.';
const REFRESH_ERROR_TITLE = '초대장 목록을 새로 불러오지 못했어요';

function listResponse(invites: (typeof sourceInvitation)[]) {
  return { ok: true, status: 200, json: async () => ({ invites }) };
}

describe('대시보드 목록 불러오기 실패 안내', () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(window, 'Image').mockImplementation(() => {
      const image = document.createElement('img');
      queueMicrotask(() => image.dispatchEvent(new Event('load')));
      return image;
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('처음 목록을 불러오지 못하면 빈 초대장 대신 오류 카드와 다시 시도를 보여 준다', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    render(<CarouselWrapper loadOnMount />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(ERROR_TITLE);
    expect(
      screen.getByText('네트워크 연결과 로그인 상태를 확인한 뒤 다시 시도해 주세요.')
    ).toBeVisible();
    expect(screen.queryByText(EMPTY_COPY)).not.toBeInTheDocument();
    const retry = screen.getByRole('button', { name: '다시 시도' });
    expect(retry).toBeEnabled();
    expect(retry).toHaveAttribute('aria-busy', 'false');
  });

  it('오류 카드의 다시 시도가 성공하면 초대장 카드로 바꾼다', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(listResponse([sourceInvitation]));

    render(<CarouselWrapper loadOnMount />);

    await user.click(await screen.findByRole('button', { name: '다시 시도' }));

    expect(
      await screen.findByRole('button', { name: sourceInvitation.name })
    ).toBeVisible();
    expect(screen.queryByText(ERROR_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('다시 시도하는 동안 버튼에 진행 상태를 표시하고 두 번 보내지 않는다', async () => {
    const user = userEvent.setup();
    let finishRetry!: () => void;
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishRetry = () =>
              resolve(listResponse([sourceInvitation]) as never);
          })
      );

    render(<CarouselWrapper loadOnMount />);

    await user.click(await screen.findByRole('button', { name: '다시 시도' }));

    const retrying = await screen.findByRole('button', {
      name: '다시 불러오는 중…',
    });
    expect(retrying).toBeDisabled();
    expect(retrying).toHaveAttribute('aria-busy', 'true');
    await user.click(retrying);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    finishRetry();
    expect(
      await screen.findByRole('button', { name: sourceInvitation.name })
    ).toBeVisible();
  });

  it('이미 보이는 초대장이 있으면 새로 고침 실패에도 카드를 지우지 않고 안내만 남긴다', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    render(
      <CarouselWrapper initialInvites={[sourceInvitation]} loadOnMount />
    );

    const notice = await screen.findByRole('alert');
    expect(notice).toHaveTextContent(REFRESH_ERROR_TITLE);
    expect(
      notice
    ).toHaveTextContent('지금 보이는 초대장은 그대로예요. 잠시 후 다시 시도해 주세요.');
    expect(
      screen.getByRole('button', { name: sourceInvitation.name })
    ).toBeVisible();
    expect(screen.queryByText(ERROR_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByText(EMPTY_COPY)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '다시 시도' })
    ).toBeInTheDocument();
  });

  it('새로 고침 안내에서 다시 시도해 성공하면 안내를 닫고 목록을 갱신한다', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(
        listResponse([{ ...sourceInvitation, name: '새로 받은 초대장' }])
      );

    render(
      <CarouselWrapper initialInvites={[sourceInvitation]} loadOnMount />
    );

    await user.click(await screen.findByRole('button', { name: '다시 시도' }));

    expect(
      await screen.findByRole('button', { name: '새로 받은 초대장' })
    ).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByText(REFRESH_ERROR_TITLE)).not.toBeInTheDocument()
    );
  });

  it('새로 고침 안내를 닫으면 이번 오류는 다시 보이지 않고 카드는 그대로 남는다', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    render(
      <CarouselWrapper initialInvites={[sourceInvitation]} loadOnMount />
    );

    await screen.findByRole('alert');
    await user.click(
      screen.getByRole('button', { name: '새로 고침 오류 안내 닫기' })
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: sourceInvitation.name })
    ).toBeVisible();
  });

  it('서버가 준 오류 문구를 그대로 안내한다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Drive 접근 권한이 없습니다.' }),
    });

    render(<CarouselWrapper loadOnMount />);

    expect(await screen.findByText('Drive 접근 권한이 없습니다.')).toBeVisible();
    expect(screen.getByText(ERROR_TITLE)).toBeVisible();
  });

  it('목록이 정상적으로 비어 있으면 빈 초대장 안내를 유지한다', async () => {
    render(<CarouselWrapper initialInvites={[]} loadOnMount={false} />);

    expect(screen.getByText(EMPTY_COPY)).toBeVisible();
    expect(screen.getByRole('link', { name: '무료로 제작하기' })).toBeVisible();
    expect(screen.queryByText(ERROR_TITLE)).not.toBeInTheDocument();
  });
});
