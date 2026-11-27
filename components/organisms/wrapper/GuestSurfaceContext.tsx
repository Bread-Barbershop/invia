'use client';

import { createContext, useContext } from 'react';

import type { ReactNode } from 'react';

/**
 * 하객이 실제로 보는 초대장 표면(하객 페이지·쇼케이스·대시보드/드래프트 미리보기)인지 알려 준다.
 *
 * 편집기 화면과 하객 화면은 같은 블록 프리뷰 컴포넌트를 공유한다. 편집기에서는 입력을 돕는
 * 안내문("제목을 입력해 주세요")이 필요하지만, 하객 화면에서는 작성자가 비워 둔 값을
 * 기본 문구로 채우거나 아예 그리지 않아야 한다. 그 차이를 이 컨텍스트 하나로 전달한다.
 */
const GuestSurfaceContext = createContext(false);

export function GuestSurfaceProvider({ children }: { children: ReactNode }) {
  return (
    <GuestSurfaceContext.Provider value={true}>
      {children}
    </GuestSurfaceContext.Provider>
  );
}

export function useIsGuestSurface() {
  return useContext(GuestSurfaceContext);
}
