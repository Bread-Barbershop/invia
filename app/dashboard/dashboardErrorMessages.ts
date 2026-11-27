export const DASHBOARD_LOAD_ERROR_FALLBACK = '초대장 목록을 불러오지 못했습니다.';

export const DASHBOARD_LOAD_ERROR_DESCRIPTION =
  '네트워크 연결과 로그인 상태를 확인한 뒤 다시 시도해 주세요.';

/**
 * 훅이 만든 오류 문구를 안내 카드의 설명으로 바꾼다.
 * 기본 문구는 제목(`초대장을 불러오지 못했어요`)과 겹치므로 다음 행동을 안내한다.
 */
export function getDashboardLoadErrorDescription(message: string | null) {
  if (!message || message === DASHBOARD_LOAD_ERROR_FALLBACK) {
    return DASHBOARD_LOAD_ERROR_DESCRIPTION;
  }

  return message;
}
