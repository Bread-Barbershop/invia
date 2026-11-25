'use client';

import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';

import { useIsGuestSurface } from './GuestSurfaceContext';
import { resolveSectionTitleRenderState } from './sectionTitle';

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className: string;
  isGuestPage?: boolean;
  noTitle?: boolean;
  titleClassName?: string;
  checkedSubTitle?: boolean;
  checkedMainTitle?: boolean;
  subTitle?: string;
  subTitleDefault?: string;
  mainTitle?: string;
  mainTitleDefault?: string;
  childClassName?: string;
  matchBodyFontSize?: boolean;
}

export const MiddlePreviewWrapper = ({
  children,
  className,
  noTitle = false,
  titleClassName,
  checkedSubTitle,
  checkedMainTitle = true,
  subTitle,
  subTitleDefault,
  mainTitle,
  mainTitleDefault,
  childClassName,
  matchBodyFontSize = false,
  isGuestPage: _isGuestPage,
  ...rest
}: Props) => {
  const bodyFontSize = useEditorStore(state =>
    matchBodyFontSize ? state.bodyData?.fontSize : undefined
  );
  const isGuestSurface = useIsGuestSurface();
  // 하객 화면에서는 비어 있는 제목에 편집 안내문 대신 기본 문구를 쓰고, 기본 문구도 없으면 제목 줄을 그리지 않는다.
  const mainTitleState = resolveSectionTitleRenderState(
    checkedMainTitle ? mainTitle : '',
    checkedMainTitle ? mainTitleDefault : '',
    isGuestSurface
  );
  const subTitleState = resolveSectionTitleRenderState(
    checkedSubTitle ? subTitle : '',
    checkedSubTitle ? subTitleDefault : '',
    isGuestSurface
  );
  const showMainTitle = checkedMainTitle && mainTitleState.visible;
  const showSubTitle = checkedSubTitle === true && subTitleState.visible;

  return (
    <div
      className={cn('flex flex-col items-center py-8 px-5 gap-6', className)}
      {...rest}
    >
      {!noTitle && (showMainTitle || showSubTitle) && (
        <PreviewTitle
          isMainTitle={showMainTitle}
          subTitle={showSubTitle ? subTitleState.text : ''}
          mainTitle={mainTitleState.text}
          titleClassName={titleClassName}
        />
      )}
      <div
        style={
          bodyFontSize
            ? ({
                '--text-xs': bodyFontSize,
                '--text-sm': bodyFontSize,
              } as CSSProperties)
            : undefined
        }
        className={cn(
          'w-full flex flex-col items-center justify-center text-center gap-3.5',
          childClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};
