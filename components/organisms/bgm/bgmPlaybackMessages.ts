// 배경음악 재생 실패를 하객에게 같은 문구로 안내하기 위한 공용 메시지.
export type BgmPlaybackError = 'load' | 'blocked' | 'play';

export const BGM_PLAYBACK_ERROR_MESSAGE: Record<BgmPlaybackError, string> = {
  load: '음악을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
  blocked: '브라우저가 재생을 막았어요. 음악 버튼을 다시 눌러 주세요.',
  play: '음악을 재생하지 못했어요. 잠시 후 다시 시도해 주세요.',
};

// iOS 사파리 저전력 모드·자동 재생 정책은 NotAllowedError로 재생을 거절한다.
export function isAutoplayBlockedError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  return (error as { name?: unknown }).name === 'NotAllowedError';
}
