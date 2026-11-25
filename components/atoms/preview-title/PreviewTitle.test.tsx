import { render, screen } from '@testing-library/react';
import React from 'react';

import { previewTitleVariants } from './PreviewTitle.style';
import { PreviewTitle } from './PreviewTitle';
import { PreviewTitleHeadingProvider } from './PreviewTitleHeadingContext';

jest.mock('@/shared/hooks/useTitleFontInfo', () => ({
  useTitleFontInfo: () => ({
    mainStyle: { fontFamily: 'Test Title Font', fontSize: '20px' },
    subStyle: { fontFamily: 'Test Title Font', fontSize: '13px' },
  }),
}));

const mainTitleClassName = previewTitleVariants({ language: 'main' });

describe('PreviewTitle 섹션 제목 시맨틱', () => {
  it('문서 컨텍스트가 없으면(편집 미리보기) 지금처럼 <p>로 렌더한다', () => {
    render(<PreviewTitle isMainTitle mainTitle="인사말" />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    const title = screen.getByText('인사말');
    expect(title.tagName).toBe('P');
    expect(title).toHaveClass(...mainTitleClassName.split(' '));
  });

  it('하객 문서 컨텍스트에서는 h2 heading으로 렌더한다', () => {
    render(
      <PreviewTitleHeadingProvider level={2}>
        <PreviewTitle isMainTitle mainTitle="예식 일시" />
      </PreviewTitleHeadingProvider>
    );

    const heading = screen.getByRole('heading', {
      level: 2,
      name: '예식 일시',
    });
    expect(heading.tagName).toBe('H2');
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  it('heading으로 바뀌어도 클래스와 인라인 스타일(시각 결과)은 그대로다', () => {
    const { unmount } = render(<PreviewTitle isMainTitle mainTitle="갤러리" />);
    const paragraphTitle = screen.getByText('갤러리');
    const paragraphClassName = paragraphTitle.className;
    const paragraphStyle = paragraphTitle.getAttribute('style');

    unmount();

    render(
      <PreviewTitleHeadingProvider level={2}>
        <PreviewTitle isMainTitle mainTitle="갤러리" />
      </PreviewTitleHeadingProvider>
    );

    const heading = screen.getByRole('heading', { level: 2, name: '갤러리' });
    expect(heading.className).toBe(paragraphClassName);
    expect(heading.getAttribute('style')).toBe(paragraphStyle);
  });

  it('headingLevel prop이 컨텍스트보다 우선한다', () => {
    render(
      <PreviewTitleHeadingProvider level={2}>
        <PreviewTitle isMainTitle mainTitle="마음 전하실 곳" headingLevel={3} />
      </PreviewTitleHeadingProvider>
    );

    expect(
      screen.getByRole('heading', { level: 3, name: '마음 전하실 곳' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('부제목(kicker)은 heading으로 올리지 않는다', () => {
    render(
      <PreviewTitleHeadingProvider level={2}>
        <PreviewTitle isMainTitle mainTitle="오시는 길" subTitle="LOCATION" />
      </PreviewTitleHeadingProvider>
    );

    expect(screen.getAllByRole('heading')).toHaveLength(1);
    const subTitle = screen.getByText('LOCATION');
    expect(subTitle.tagName).toBe('P');
  });

  it('제목을 쓰지 않는 블록은 heading을 만들지 않는다', () => {
    render(
      <PreviewTitleHeadingProvider level={2}>
        <PreviewTitle isMainTitle={false} mainTitle="인사말" />
      </PreviewTitleHeadingProvider>
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
