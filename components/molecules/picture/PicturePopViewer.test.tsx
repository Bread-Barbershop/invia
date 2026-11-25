import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { savePhotoToDevice } from '@/shared/utils/photoDownload';
import { sharePhotoLink } from '@/shared/utils/photoShare';

import { PicturePopViewer } from './PicturePopViewer';

jest.mock('@/shared/utils/photoDownload', () => ({
  savePhotoToDevice: jest.fn().mockResolvedValue('saved'),
}));
jest.mock('@/shared/utils/photoShare', () => ({
  sharePhotoLink: jest.fn().mockResolvedValue('copied'),
}));

const eventHandlers: Record<string, (() => void)[]> = {};
let mockCurrentIndex = 0;
let mockLoop = true;
const emitSelect = () => eventHandlers['select']?.forEach(callback => callback());
const mockScrollPrev = jest.fn(() => {
  if (mockLoop) {
    mockCurrentIndex = (mockCurrentIndex - 1 + 3) % 3;
  } else {
    mockCurrentIndex = Math.max(0, mockCurrentIndex - 1);
  }
  emitSelect();
});
const mockScrollNext = jest.fn(() => {
  if (mockLoop) {
    mockCurrentIndex = (mockCurrentIndex + 1) % 3;
  } else {
    mockCurrentIndex += 1;
  }
  emitSelect();
});
const mockScrollTo = jest.fn((index: number) => {
  mockCurrentIndex = Math.max(0, index);
  emitSelect();
});
const mockCanScrollPrev = jest.fn(() => (mockLoop ? true : mockCurrentIndex > 0));
const mockCanScrollNext = jest.fn(() => (mockLoop ? true : mockCurrentIndex < 2));
const mockSelectedScrollSnap = jest.fn(() => mockCurrentIndex);

const mockEmblaApi = {
  scrollPrev: mockScrollPrev,
  scrollNext: mockScrollNext,
  scrollTo: mockScrollTo,
  canScrollPrev: mockCanScrollPrev,
  canScrollNext: mockCanScrollNext,
  selectedScrollSnap: mockSelectedScrollSnap,
  on: jest.fn((evt: string, cb: () => void) => {
    if (!eventHandlers[evt]) eventHandlers[evt] = [];
    eventHandlers[evt].push(cb);
    return mockEmblaApi;
  }),
  off: jest.fn((evt: string, cb: () => void) => {
    if (eventHandlers[evt]) {
      eventHandlers[evt] = eventHandlers[evt].filter(fn => fn !== cb);
    }
    return mockEmblaApi;
  }),
  reInit: jest.fn(),
};

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: (options?: { loop?: boolean }) => {
    mockLoop = Boolean(options?.loop);
    return [jest.fn(), mockEmblaApi];
  },
}));

jest.mock('@/shared/assets/icons/slideArrow.svg', () => ({
  __esModule: true,
  default: (props: any) => <svg data-testid="slide-arrow" {...props} />,
}));

jest.mock('@/components/atoms/image', () => ({
  Image: ({ alt, src }: { alt?: string; src: string }) => (
    <div data-testid="mock-image" data-src={src} aria-label={alt}>
      {alt}
    </div>
  ),
}));

describe('PicturePopViewer (오버레이 이미지 뷰어 캐러셀 및 스와이프)', () => {
  const mockImages = [
    'https://example.com/img1.jpg',
    'https://example.com/img2.jpg',
    'https://example.com/img3.jpg',
  ];
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentIndex = 0;
    mockCanScrollPrev.mockImplementation(() => (mockLoop ? true : mockCurrentIndex > 0));
    mockCanScrollNext.mockImplementation(() => (mockLoop ? true : mockCurrentIndex < 2));
    Object.keys(eventHandlers).forEach(eventName => {
      delete eventHandlers[eventName];
    });
    // Portal target div 설정
    document.body.innerHTML = '<div id="preview-container"></div>';
  });

  it('isOpen이 false이면 렌더링되지 않는다', () => {
    render(
      <PicturePopViewer
        isOpen={false}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('isOpen이 true이면 다이얼로그와 슬라이드 이미지들이 렌더링된다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('팝업 이미지 1')).toBeInTheDocument();
    expect(screen.getByLabelText('팝업 이미지 2')).toBeInTheDocument();
    expect(screen.getByLabelText('팝업 이미지 3')).toBeInTheDocument();
  });

  it('이미지가 2장 이상일 때 이전/다음 (< >) 버튼과 페이지 번호가 노출된다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: '이전 사진' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 사진' })).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('이전/다음 버튼 클릭 시 emblaApi.scrollPrev 및 scrollNext가 호출된다', () => {
    mockCanScrollPrev.mockReturnValue(true);
    mockCanScrollNext.mockReturnValue(true);

    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    const prevButton = screen.getByRole('button', { name: '이전 사진' });
    const nextButton = screen.getByRole('button', { name: '다음 사진' });

    fireEvent.click(prevButton);
    expect(mockScrollPrev).toHaveBeenCalledTimes(1);

    fireEvent.click(nextButton);
    expect(mockScrollNext).toHaveBeenCalledTimes(1);
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '닫기' });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('Escape 키를 누르면 onClose가 호출된다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('ArrowLeft 및 ArrowRight 키를 누르면 이전/다음 사진으로 이동한다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(mockScrollPrev).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockScrollNext).toHaveBeenCalledTimes(1);
  });

  it('닫힌 상태에서 세 번째 이미지를 열어도 표시와 화살표 활성 상태가 일치한다', () => {
    const { rerender } = render(
      <PicturePopViewer
        isOpen={false}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );
    rerender(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={2}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(mockScrollTo).toHaveBeenCalledWith(2, true);
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이전 사진' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '다음 사진' })).toBeEnabled();
  });

  it('다음 사진으로 이동하고 닫았다가 다른 사진으로 다시 열면 표시가 초기화된다', () => {
    const { rerender } = render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '다음 사진' }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    rerender(
      <PicturePopViewer
        isOpen={false}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );
    rerender(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={2}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 사진' })).toBeEnabled();
  });

  it('이미지가 2장 이상일 때 무한 루프(loop: true)로 초기화되어 끊김 없이 무한 탐색 가능하다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: '이전 사진' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '다음 사진' })).toBeEnabled();
  });

  it('무한 루프 상태에서 마지막 사진(3/3)에서 다음 버튼 클릭 시 첫 번째 사진(1/3)으로 순환(wrap)된다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={2}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    const nextButton = screen.getByRole('button', { name: '다음 사진' });
    fireEvent.click(nextButton);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('무한 루프 상태에서 첫 번째 사진(1/3)에서 이전 버튼 클릭 시 마지막 사진(3/3)으로 순환(wrap)된다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    const prevButton = screen.getByRole('button', { name: '이전 사진' });
    fireEvent.click(prevButton);
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('이미지 수가 줄어들면 시작 위치가 유효한 마지막 이미지로 제한된다', () => {
    const { rerender } = render(
      <PicturePopViewer
        isOpen={false}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );
    rerender(
      <PicturePopViewer
        isOpen={true}
        images={mockImages.slice(0, 2)}
        startIndex={10}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );
    expect(mockScrollTo).toHaveBeenCalledWith(1, true);
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('팝업 포커스가 내부에 유지되고 닫히면 이전 요소로 복원된다', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );
    const closeButton = screen.getByRole('button', { name: '닫기' });
    const nextButton = screen.getByRole('button', { name: '다음 사진' });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(nextButton).toHaveFocus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('이미지가 1장일 때는 이전/다음 버튼이 노출되지 않는다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={['https://example.com/single.jpg']}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('button', { name: '이전 사진' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다음 사진' })).not.toBeInTheDocument();
  });

  describe('사진 저장 · 공유 액션 (showPhotoActions)', () => {
    it('에디터 미리보기처럼 showPhotoActions가 없으면 액션 버튼을 노출하지 않는다', () => {
      render(
        <PicturePopViewer
          isOpen={true}
          images={mockImages}
          startIndex={0}
          ratio="1:1"
          onClose={mockOnClose}
        />
      );

      expect(
        screen.queryByRole('button', { name: '사진 저장' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '사진 공유하기' })
      ).not.toBeInTheDocument();
    });

    it('하객 화면에서는 사진 저장 · 공유 버튼을 노출한다', () => {
      render(
        <PicturePopViewer
          isOpen={true}
          images={mockImages}
          startIndex={0}
          ratio="1:1"
          showPhotoActions={true}
          onClose={mockOnClose}
        />
      );

      expect(
        screen.getByRole('button', { name: '사진 저장' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '사진 공유하기' })
      ).toBeInTheDocument();
      // 페이지 인디케이터는 그대로 유지된다.
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('현재 보고 있는 사진을 저장하고, 사진을 넘기면 다음 사진을 저장한다', async () => {
      render(
        <PicturePopViewer
          isOpen={true}
          images={mockImages}
          startIndex={0}
          ratio="1:1"
          showPhotoActions={true}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '사진 저장' }));
      expect(savePhotoToDevice).toHaveBeenCalledWith(
        'https://example.com/img1.jpg',
        0
      );
      await waitFor(() =>
        expect(screen.getByRole('button', { name: '사진 저장' })).toBeEnabled()
      );

      fireEvent.click(screen.getByRole('button', { name: '다음 사진' }));
      fireEvent.click(screen.getByRole('button', { name: '사진 저장' }));
      expect(savePhotoToDevice).toHaveBeenLastCalledWith(
        'https://example.com/img2.jpg',
        1
      );
      await waitFor(() =>
        expect(screen.getByRole('status')).toHaveTextContent('사진을 저장했어요')
      );
    });

    it('공유 버튼은 현재 초대장 링크로 공유한다', async () => {
      render(
        <PicturePopViewer
          isOpen={true}
          images={mockImages}
          startIndex={0}
          ratio="1:1"
          showPhotoActions={true}
          shareUrl="https://dev.invia.co.kr/inv/abc"
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '사진 공유하기' }));

      expect(sharePhotoLink).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'https://dev.invia.co.kr/inv/abc' })
      );
      await waitFor(() =>
        expect(screen.getByRole('status')).toHaveTextContent('링크를 복사했어요')
      );
    });

    it('Tab 키 포커스 이동에 저장 · 공유 버튼도 포함된다', () => {
      render(
        <PicturePopViewer
          isOpen={true}
          images={mockImages}
          startIndex={0}
          ratio="1:1"
          showPhotoActions={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus();

      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
      expect(
        screen.getByRole('button', { name: '사진 공유하기' })
      ).toHaveFocus();
    });
  });
});
