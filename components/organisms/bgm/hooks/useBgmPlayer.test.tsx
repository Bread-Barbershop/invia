import { act, renderHook, waitFor } from '@testing-library/react';

import { useBgmPlayer } from './useBgmPlayer';

const SRC = '/audio/quiet-step-to-forever.mp3';

function mediaError(name: string) {
  return Object.assign(new Error(`media ${name}`), { name });
}

describe('useBgmPlayer 재생 실패 안내', () => {
  beforeEach(() => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {});
    jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('자동 재생이 막히면 blocked 상태를 남긴다', async () => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValueOnce(mediaError('NotAllowedError'));

    const { result } = renderHook(() => useBgmPlayer(SRC));

    act(() => result.current.togglePlay());

    await waitFor(() => expect(result.current.playbackError).toBe('blocked'));
    expect(result.current.isPlaying).toBe(false);
  });

  it('재생 실패는 play 상태로 남긴다', async () => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValueOnce(mediaError('NotSupportedError'));

    const { result } = renderHook(() => useBgmPlayer(SRC));

    act(() => result.current.togglePlay());

    await waitFor(() => expect(result.current.playbackError).toBe('play'));
  });

  it('다시 누르면 실패 상태를 지운다', async () => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValueOnce(mediaError('NotAllowedError'));
    jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useBgmPlayer(SRC));
    act(() => result.current.togglePlay());
    await waitFor(() => expect(result.current.playbackError).toBe('blocked'));

    act(() => result.current.togglePlay());

    expect(result.current.playbackError).toBeNull();
  });
});
