import { render, screen } from '@testing-library/react';

import { GuestSurfaceProvider } from './GuestSurfaceContext';
import { MiddlePreviewWrapper } from './MiddlePreviewWrapper';

import type { ReactNode } from 'react';

const EDITOR_PLACEHOLDER = '제목을 입력해 주세요';

describe('MiddlePreviewWrapper - 블록 제목', () => {
  it('편집기 화면에서 제목을 비우면 기본 문구를 보여 준다', () => {
    render(
      <MiddlePreviewWrapper className="" mainTitle="" mainTitleDefault="갤러리">
        본문
      </MiddlePreviewWrapper>
    );

    expect(screen.getByText('갤러리')).toBeInTheDocument();
    expect(screen.queryByText(EDITOR_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it('편집기 화면에서 기본 문구가 없으면 입력 안내문을 그대로 보여 준다', () => {
    render(
      <MiddlePreviewWrapper className="" mainTitle="">
        본문
      </MiddlePreviewWrapper>
    );

    expect(screen.getByText(EDITOR_PLACEHOLDER)).toBeInTheDocument();
  });
});

describe('MiddlePreviewWrapper - 하객 화면의 빈 제목', () => {
  const renderOnGuestSurface = (ui: ReactNode) =>
    render(<GuestSurfaceProvider>{ui}</GuestSurfaceProvider>);

  it('공백만 남은 제목은 안내문 대신 기본 문구로 보여 준다', () => {
    renderOnGuestSurface(
      <MiddlePreviewWrapper
        className=""
        mainTitle="   "
        mainTitleDefault="갤러리"
      >
        본문
      </MiddlePreviewWrapper>
    );

    expect(screen.getByText('갤러리')).toBeInTheDocument();
    expect(screen.queryByText(EDITOR_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it('기본 문구조차 없으면 제목 요소를 아예 그리지 않는다', () => {
    const { container } = renderOnGuestSurface(
      <MiddlePreviewWrapper className="" mainTitle="  ">
        본문
      </MiddlePreviewWrapper>
    );

    expect(screen.queryByText(EDITOR_PLACEHOLDER)).not.toBeInTheDocument();
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('작성자가 넣은 제목은 앞뒤 공백만 지워 그대로 보여 준다', () => {
    renderOnGuestSurface(
      <MiddlePreviewWrapper
        className=""
        mainTitle="  우리의 봄  "
        mainTitleDefault="갤러리"
      >
        본문
      </MiddlePreviewWrapper>
    );

    expect(screen.getByText('우리의 봄')).toBeInTheDocument();
  });

  it('예전에 저장된 편집 안내문도 하객 화면에서는 기본 문구로 바뀐다', () => {
    renderOnGuestSurface(
      <MiddlePreviewWrapper
        className=""
        mainTitle={EDITOR_PLACEHOLDER}
        mainTitleDefault="공지사항"
      >
        본문
      </MiddlePreviewWrapper>
    );

    expect(screen.getByText('공지사항')).toBeInTheDocument();
    expect(screen.queryByText(EDITOR_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it('영문 부제목도 공백만 남으면 기본 문구를 쓴다', () => {
    renderOnGuestSurface(
      <MiddlePreviewWrapper
        className=""
        checkedSubTitle
        subTitle="   "
        subTitleDefault="GALLERY"
        mainTitle=""
        mainTitleDefault="갤러리"
      >
        본문
      </MiddlePreviewWrapper>
    );

    expect(screen.getByText('GALLERY')).toBeInTheDocument();
    expect(screen.getByText('갤러리')).toBeInTheDocument();
  });

  it('제목 표시를 끈 블록은 하객 화면에서 제목을 그리지 않는다', () => {
    const { container } = renderOnGuestSurface(
      <MiddlePreviewWrapper
        className=""
        checkedMainTitle={false}
        mainTitle="갤러리"
        mainTitleDefault="갤러리"
      >
        본문
      </MiddlePreviewWrapper>
    );

    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('noTitle 블록은 하객 화면에서 제목 영역 없이 본문만 그린다', () => {
    const { container } = renderOnGuestSurface(
      <MiddlePreviewWrapper
        className=""
        noTitle
        mainTitle=""
        mainTitleDefault="연락처"
      >
        본문
      </MiddlePreviewWrapper>
    );

    expect(screen.queryByText('연락처')).not.toBeInTheDocument();
    expect(screen.getByText('본문')).toBeInTheDocument();
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});
