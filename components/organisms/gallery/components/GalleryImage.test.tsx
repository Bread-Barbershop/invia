import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import GalleryType1 from './GalleryType1';
import GalleryType6 from './GalleryType6';
import GalleryType7 from './GalleryType7';
import { GalleryImage } from './GalleryImage';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, unoptimized, priority, ...rest } = props;
    void fill;
    void unoptimized;
    void priority;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={(rest.alt as string) || ''}
        {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)}
      />
    );
  },
}));

jest.mock('@/shared/assets/icons/loadingSpinner.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('embla-carousel-react', () => {
  const emblaApi: any = {
    scrollPrev: jest.fn(),
    scrollNext: jest.fn(),
    selectedScrollSnap: () => 0,
    scrollProgress: () => 0,
    slideNodes: () => [],
    canScrollPrev: () => true,
    canScrollNext: () => true,
    on: jest.fn(),
    off: jest.fn(),
    reInit: jest.fn(),
  };
  emblaApi.on.mockReturnValue(emblaApi);
  emblaApi.off.mockReturnValue(emblaApi);
  return { __esModule: true, default: () => [jest.fn(), emblaApi] };
});

jest.mock('embla-carousel-auto-scroll', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  Object.defineProperty(global, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: MockResizeObserver,
  });
});

describe('GalleryImage', () => {
  it('기본값으로 지연 로딩 + 비동기 디코딩을 사용한다', () => {
    render(
      <GalleryImage src="https://cdn.example.com/a.jpg" alt="갤러리 사진" />
    );

    const image = screen.getByRole('img', { name: '갤러리 사진' });
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/a.jpg');
  });

  it('라이트박스의 현재 사진은 eager + high priority로 즉시 불러온다', () => {
    render(
      <GalleryImage
        src="https://cdn.example.com/a.jpg"
        alt="현재 사진"
        loading="eager"
        fetchPriority="high"
      />
    );

    const image = screen.getByRole('img', { name: '현재 사진' });
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('fetchpriority', 'high');
    expect(image).toHaveAttribute('decoding', 'async');
  });

  it('로드에 실패하면 깨진 이미지 대신 같은 자리의 안내 블록을 보여준다', () => {
    render(
      <GalleryImage src="https://cdn.example.com/broken.jpg" alt="깨진 사진" />
    );

    fireEvent.error(screen.getByRole('img', { name: '깨진 사진' }));

    expect(
      screen.queryByRole('img', { name: '깨진 사진' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: '사진을 불러오지 못했어요' })
    ).toBeInTheDocument();
    expect(screen.getByText('사진을 불러오지 못했어요')).toBeInTheDocument();
  });

  it('같은 자리에 새 사진이 들어오면 다시 로드를 시도한다', () => {
    const { rerender } = render(
      <GalleryImage src="https://cdn.example.com/broken.jpg" alt="사진" />
    );
    fireEvent.error(screen.getByRole('img', { name: '사진' }));
    expect(
      screen.getByRole('img', { name: '사진을 불러오지 못했어요' })
    ).toBeInTheDocument();

    rerender(
      <GalleryImage src="https://cdn.example.com/next.jpg" alt="사진" />
    );

    expect(screen.getByRole('img', { name: '사진' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/next.jpg'
    );
  });
});

describe('갤러리 템플릿 이미지 로딩 속성', () => {
  const preview = [
    'https://cdn.example.com/1.jpg',
    'https://cdn.example.com/2.jpg',
    'https://cdn.example.com/3.jpg',
    'https://cdn.example.com/4.jpg',
  ];

  it('3열 그리드(galleryType6)는 모든 사진을 지연 로딩한다', () => {
    render(
      <GalleryType6 preview={preview} ratio="1:1" imageClick={jest.fn()} />
    );

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(preview.length);
    images.forEach(image => {
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('decoding', 'async');
    });
  });

  it('2열 그리드(galleryType7)는 모든 사진을 지연 로딩한다', () => {
    render(
      <GalleryType7 preview={preview} ratio="1:1" imageClick={jest.fn()} />
    );

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(preview.length);
    images.forEach(image => {
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('decoding', 'async');
    });
  });

  it('캐러셀(galleryType1)도 지연 로딩 + 비동기 디코딩을 사용한다', () => {
    render(
      <GalleryType1 preview={preview} ratio="1:1" imageClick={jest.fn()} />
    );

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(preview.length);
    images.forEach(image => {
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('decoding', 'async');
    });
  });
});
