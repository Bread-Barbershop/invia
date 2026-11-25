export type CardActionFailureKind = 'visibility' | 'share';

export type CardActionFailureMessage = {
  title: string;
  description: string;
};

const RETRY_SOON = '잠시 후 다시 시도해 주세요.';
const CHECK_NETWORK = '네트워크 연결을 확인한 뒤 다시 시도해 주세요.';
const RETRY_WITH_BUTTON = '아래 버튼을 눌러 다시 시도할 수 있어요.';

// 대시보드 hook이 남기는 접두사. 화면에는 이유만 보여준다.
const VISIBILITY_ERROR_PREFIX = 'visibility update failed:';

const NETWORK_PATTERN =
  /(failed to fetch|networkerror|network error|load failed|visibility update request failed|timeout)/i;

function hasHangul(value: string) {
  return /[가-힣]/.test(value);
}

function stripTechnicalPrefix(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.toLowerCase().startsWith(VISIBILITY_ERROR_PREFIX)) {
    return trimmed.slice(VISIBILITY_ERROR_PREFIX.length).trim();
  }
  return trimmed;
}

function resolveVisibilityFailure(detail: string): CardActionFailureMessage {
  const code = detail.toLowerCase();

  if (code.includes('visibility_publish_failed')) {
    return {
      title: '초대장을 공개로 바꾸지 못했어요',
      description: '공개 링크 권한을 설정하지 못했어요. 다시 시도해 주세요.',
    };
  }

  if (code.includes('visibility_revoke_failed')) {
    return {
      title: '초대장을 비공개로 바꾸지 못했어요',
      description: '이미 보낸 링크로 초대장이 열릴 수 있어요. 다시 시도해 주세요.',
    };
  }

  if (hasHangul(detail)) {
    return { title: detail, description: RETRY_SOON };
  }

  if (NETWORK_PATTERN.test(detail)) {
    return { title: '공개 상태를 바꾸지 못했어요', description: CHECK_NETWORK };
  }

  return { title: '공개 상태를 바꾸지 못했어요', description: RETRY_SOON };
}

function resolveShareFailure(detail: string): CardActionFailureMessage {
  if (hasHangul(detail)) {
    return { title: detail, description: RETRY_WITH_BUTTON };
  }

  if (NETWORK_PATTERN.test(detail)) {
    return {
      title: '공유 정보를 불러오지 못했어요',
      description: CHECK_NETWORK,
    };
  }

  return {
    title: '공유 정보를 불러오지 못했어요',
    description: RETRY_WITH_BUTTON,
  };
}

/**
 * 카드 액션 실패 원문(서버 메시지·기술 문자열)을 화면에 보여줄 안내 문구로 바꾼다.
 * 보여줄 것이 없으면 null을 돌려주고, 호출부는 안내를 띄우지 않는다.
 */
export function resolveCardActionFailureMessage(
  kind: CardActionFailureKind,
  raw: string | null | undefined
): CardActionFailureMessage | null {
  if (!raw) return null;

  const detail = stripTechnicalPrefix(raw);
  if (!detail) return null;

  return kind === 'visibility'
    ? resolveVisibilityFailure(detail)
    : resolveShareFailure(detail);
}
