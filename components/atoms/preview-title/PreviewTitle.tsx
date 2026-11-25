'use client';

import { VariantProps } from 'class-variance-authority';
import React from 'react';

import { useTitleFontInfo } from '@/shared/hooks/useTitleFontInfo';
import { cn } from '@/shared/utils/cn';

import { previewTitleVariants } from './PreviewTitle.style';
import {
  usePreviewTitleHeadingLevel,
  type PreviewTitleHeadingLevel,
} from './PreviewTitleHeadingContext';

interface PreviewTitleProps extends VariantProps<typeof previewTitleVariants> {
  isMainTitle?: boolean;
  mainTitle?: string;
  subTitle?: string;
  className?: string;
  titleClassName?: string;
  /**
   * 제목을 heading으로 렌더할 레벨. 값을 주지 않으면 주변 컨텍스트
   * (하객 화면·쇼케이스)를 따르고, 컨텍스트도 없으면 <p>로 렌더한다.
   * 어느 경우에도 클래스·인라인 스타일은 그대로라 시각 결과는 같다.
   */
  headingLevel?: PreviewTitleHeadingLevel;
}

export const PreviewTitle = ({
  isMainTitle,
  mainTitle,
  subTitle,
  className,
  titleClassName,
  headingLevel,
}: PreviewTitleProps) => {
  const contextHeadingLevel = usePreviewTitleHeadingLevel();
  const resolvedHeadingLevel = headingLevel ?? contextHeadingLevel;
  const mainText = mainTitle?.trim() || '제목을 입력해 주세요';
  const subText = subTitle?.trim();
  const { mainStyle, subStyle } = useTitleFontInfo();
  const MainTitleTag =
    resolvedHeadingLevel === 2 ? 'h2' : resolvedHeadingLevel === 3 ? 'h3' : 'p';

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      {subText && subText !== '' && (
        <p
          className={cn(
            previewTitleVariants({ language: 'sub' }),
            titleClassName
          )}
          style={subStyle}
        >
          {subText}
        </p>
      )}
      {isMainTitle && (
        <MainTitleTag
          className={cn(
            previewTitleVariants({ language: 'main' }),
            titleClassName
          )}
          style={mainStyle}
        >
          {mainText}
        </MainTitleTag>
      )}
    </div>
  );
};

PreviewTitle.displayName = 'PreviewTitle';
