import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  useSearchParams,
  type ReadonlyURLSearchParams,
} from 'next/navigation';

import GallerySearchBar from './GallerySearchBar';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/gallery',
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: jest.fn(),
}));

function renderSearchBar(query = '') {
  jest
    .mocked(useSearchParams)
    .mockReturnValue(
      new URLSearchParams(query) as unknown as ReadonlyURLSearchParams
    );
  render(<GallerySearchBar />);
}

function lastReplaceHref() {
  const calls = mockReplace.mock.calls;
  const [href] = calls[calls.length - 1] ?? [];
  return new URL(String(href), 'https://invia.test');
}

describe('갤러리 검색 입력', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('입력한 검색어를 잠시 뒤 주소에 반영한다', () => {
    renderSearchBar();

    fireEvent.change(screen.getByLabelText('템플릿 검색'), {
      target: { value: '꽃' },
    });
    expect(mockReplace).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(lastReplaceHref().searchParams.get('q')).toBe('꽃');
    expect(mockReplace).toHaveBeenCalledWith('/gallery?q=%EA%BD%83', {
      scroll: false,
    });
  });

  it('보고 있던 분류는 그대로 두고 검색어만 주소에 더한다', () => {
    renderSearchBar('category=birthday');

    fireEvent.change(screen.getByLabelText('템플릿 검색'), {
      target: { value: '꽃' },
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    const url = lastReplaceHref();
    expect(url.searchParams.get('category')).toBe('birthday');
    expect(url.searchParams.get('q')).toBe('꽃');
  });

  it('검색어 지우기 버튼을 누르면 주소에서 검색어를 빼고 바로 이동한다', () => {
    renderSearchBar('category=birthday&q=%EA%BD%83');

    fireEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));

    expect(lastReplaceHref().searchParams.has('q')).toBe(false);
    expect(lastReplaceHref().searchParams.get('category')).toBe('birthday');
  });

  it('검색어 입력 후 엔터를 누르면 기다리지 않고 바로 반영한다', () => {
    renderSearchBar();

    fireEvent.change(screen.getByLabelText('템플릿 검색'), {
      target: { value: '모던' },
    });
    fireEvent.submit(screen.getByRole('search'));

    expect(lastReplaceHref().searchParams.get('q')).toBe('모던');
  });

  it('주소가 늦게 따라와도 이어서 입력한 검색어를 되돌리지 않는다', () => {
    jest.mocked(useSearchParams).mockReturnValue(new URLSearchParams());
    const { rerender } = render(<GallerySearchBar />);
    const input = screen.getByLabelText('템플릿 검색');

    fireEvent.change(input, { target: { value: '브라' } });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    fireEvent.change(input, { target: { value: '브라이덜' } });
    jest
      .mocked(useSearchParams)
      .mockReturnValue(new URLSearchParams('q=브라'));
    rerender(<GallerySearchBar />);

    expect(screen.getByLabelText('템플릿 검색')).toHaveValue('브라이덜');
  });
});
