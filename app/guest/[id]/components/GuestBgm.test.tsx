import { act, fireEvent, render, screen } from '@testing-library/react';

import GuestBgm from './GuestBgm';

const bgm = {
  selectedBgmId: 'user-bgm',
  isLoop: true,
  volume: 0.2,
  userBgmTitle: '우리 노래',
  userBgmDuration: '03:00',
  userBgmFileId: null,
};

const libraryBgm = { ...bgm, selectedBgmId: 'quiet-step-to-forever' };

beforeEach(() => {
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
});
afterEach(() => jest.restoreAllMocks());

describe('미업로드 배경음악 미리보기', () => {
  it('미리보기에서는 로컬 음악을 사용자 조작 후 재생한다', () => {
    const { container } = render(
      <GuestBgm
        bgm={bgm}
        mode="dashboard-preview"
        localAudioSrc="blob:our-song"
      />
    );
    const audio = container.querySelector('audio');
    expect(audio).not.toHaveAttribute('src');
    fireEvent.click(screen.getByRole('button', { name: '배경음악 켜기' }));
    expect(audio).toHaveAttribute('src', 'blob:our-song');
    expect(
      screen.getByRole('button', { name: '배경음악 끄기' })
    ).toBeInTheDocument();
  });

  it('공개 모드에서는 로컬 미리보기 주소를 사용하지 않는다', () => {
    const { container } = render(
      <GuestBgm bgm={bgm} localAudioSrc="blob:our-song" />
    );
    expect(container.querySelector('audio')).not.toHaveAttribute('src');
    expect(
      screen.queryByRole('button', { name: '배경음악 켜기' })
    ).not.toBeInTheDocument();
  });
});

describe('하객의 배경음악 재생 취소', () => {
  it('음악이 준비되기 전에 끄면 준비된 뒤에도 재생하지 않는다', () => {
    const { container } = render(<GuestBgm bgm={libraryBgm} />);
    const audio = container.querySelector('audio')!;

    fireEvent.click(screen.getByRole('button', { name: '배경음악 켜기' }));
    fireEvent.click(screen.getByRole('button', { name: '배경음악 끄기' }));
    fireEvent(audio, new Event('canplay'));

    expect(audio.play).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '배경음악 켜기' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('취소한 재생이 뒤늦게 거절되어도 다시 켠 음악을 끄지 않는다', async () => {
    let rejectPlayback!: () => void;
    jest.spyOn(HTMLMediaElement.prototype, 'play').mockReturnValueOnce(
      new Promise<void>((_, reject) => {
        rejectPlayback = () =>
          reject(new DOMException('재생 취소', 'AbortError'));
      })
    );
    const { container } = render(<GuestBgm bgm={libraryBgm} />);
    const audio = container.querySelector('audio')!;

    fireEvent.click(screen.getByRole('button', { name: '배경음악 켜기' }));
    fireEvent(audio, new Event('canplay'));
    fireEvent.click(screen.getByRole('button', { name: '배경음악 끄기' }));
    fireEvent.click(screen.getByRole('button', { name: '배경음악 켜기' }));
    fireEvent(audio, new Event('canplay'));

    await act(async () => {
      rejectPlayback();
    });

    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: '배경음악 끄기' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
