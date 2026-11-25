'use client';

import { createContext, useContext } from 'react';

import type { ReactNode } from 'react';

/**
 * 초대장 섹션 제목(PreviewTitle)을 어떤 heading 레벨로 렌더할지 정하는 값.
 *
 * - 하객 화면·쇼케이스처럼 초대장 한 장이 문서(document)로 읽히는 화면에서는 2 (h2).
 * - 편집 미리보기처럼 다른 화면 안에 얹힌 조각일 때는 값이 없고, PreviewTitle은 지금처럼 <p>로 남는다.
 *
 * 시각 스타일(클래스·인라인 스타일)은 어느 경우에도 동일하게 적용되므로 레이아웃은 바뀌지 않는다.
 */
export type PreviewTitleHeadingLevel = 2 | 3;

const PreviewTitleHeadingContext =
  createContext<PreviewTitleHeadingLevel | null>(null);

export function PreviewTitleHeadingProvider({
  level,
  children,
}: {
  level: PreviewTitleHeadingLevel;
  children: ReactNode;
}) {
  return (
    <PreviewTitleHeadingContext.Provider value={level}>
      {children}
    </PreviewTitleHeadingContext.Provider>
  );
}

export function usePreviewTitleHeadingLevel() {
  return useContext(PreviewTitleHeadingContext);
}
