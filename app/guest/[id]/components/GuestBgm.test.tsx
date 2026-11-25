import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import GuestBgm from './GuestBgm';

const bgm = {
  selectedBgmId: 'user-bgm',
  isLoop: true,
  volume: 0.2,
  userBgmTitle: '우리 노래',
  userBgmDuration: '03:00',
  userBgmFileId: null,
};

const libraryBgm = {
  ...bgm,
  selectedBgmId: 'quiet-step-to-forever',
};

function muteMediaElement() {
  jest
    .spyOn(HTMLMediaElement.prototype, 'pause')
    .mockImplementation(() => {});
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  jest
    .spyOn(HTMLMediaElement.prototype, 'play')
    .mockResolvedValue(undefined);
}

function autocreateError(name: string) {
  return Object.assign(new Error(`media ${name}`), { name });
}

describe('미업로드 배경음악 미리보기', () => {
  beforeEach(muteMediaElement);
  afterEach(() => jest.restoreAllMocks());

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
    fireEvent.click(screen.getByRole('button', { name: '배경음악' }));
    expect(audio).toHaveAttribute('src', 'blob:our-song');
    expect(screen.getByRole('button', { name: '배경음악' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('공개 모드에서는 로컬 미리보기 주소를 사용하지 않는다', () => {
    const { container } = render(
      <GuestBgm bgm={bgm} localAudioSrc="blob:our-song" />
    );
    expect(container.querySelector('audio')).not.toHaveAttribute('src');
    expect(
      screen.queryByRole('button', { name: '배경음악' })
    ).not.toBeInTheDocument();
  });
});

describe('하객 배경음악 토글 접근성', () => {
  beforeEach(muteMediaElement);
  afterEach(() => jest.restoreAllMocks());

  it('44px 터치 영역과 눌림 상태를 노출한다', () => {
    render(<GuestBgm bgm={libraryBgm} />);

    const button = screen.getByRole('button', { name: '배경음악' });
    expect(button).toHaveClass('h-11', 'w-11');
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('하객 배경음악 재생 실패 안내', () => {
  beforeEach(muteMediaElement);
  afterEach(() => jest.restoreAllMocks());

  it('음원을 불러오지 못하면 안내하고 재생 상태를 되돌린다', () => {
    const { container } = render(<GuestBgm bgm={libraryBgm} />);
    const button = screen.getByRole('button', { name: '배경음악' });

    fireEvent.click(button);
    fireEvent.error(container.querySelector('audio')!);

    expect(screen.getByRole('status')).toHaveTextContent(
      '음악을 불러오지 못했어요'
    );
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('브라우저가 자동 재생을 막으면 다시 눌러 달라고 안내한다', async () => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValue(autocreateError('NotAllowedError'));

    const { container } = render(<GuestBgm bgm={libraryBgm} />);
    fireEvent.click(screen.getByRole('button', { name: '배경음악' }));
    fireEvent(container.querySelector('audio')!, new Event('canplay'));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        '음악 버튼을 다시 눌러 주세요'
      )
    );
  });

  it('재생 자체가 실패하면 재시도를 안내한다', async () => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValue(autocreateError('NotSupportedError'));

    const { container } = render(<GuestBgm bgm={libraryBgm} />);
    fireEvent.click(screen.getByRole('button', { name: '배경음악' }));
    fireEvent(container.querySelector('audio')!, new Event('canplay'));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        '음악을 재생하지 못했어요'
      )
    );
  });

  it('다시 누르면 이전 안내를 지우고 새로 시도한다', async () => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValueOnce(autocreateError('NotAllowedError'));

    const { container } = render(<GuestBgm bgm={libraryBgm} />);
    const button = screen.getByRole('button', { name: '배경음악' });

    fireEvent.click(button);
    fireEvent(container.querySelector('audio')!, new Event('canplay'));
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());

    fireEvent.click(button);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('사용자 음원의 공개 링크가 막히면 프록시로 재시도하고 안내하지 않는다', () => {
    const userBgm = { ...bgm, userBgmFileId: 'file-1' };
    const { container } = render(<GuestBgm bgm={userBgm} />);
    const audio = container.querySelector('audio')!;

    fireEvent.click(screen.getByRole('button', { name: '배경음악' }));
    expect(audio.src).toContain('drive.usercontent.google.com');

    fireEvent.error(audio);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(audio.src).toContain('/api/drive/guestBgm?fileId=file-1');
  });

  it('프록시까지 실패하면 안내한다', () => {
    const userBgm = { ...bgm, userBgmFileId: 'file-1' };
    const { container } = render(<GuestBgm bgm={userBgm} />);
    const audio = container.querySelector('audio')!;

    fireEvent.click(screen.getByRole('button', { name: '배경음악' }));
    fireEvent.error(audio);
    fireEvent.error(audio);

    expect(screen.getByRole('status')).toHaveTextContent(
      '음악을 불러오지 못했어요'
    );
  });

  it('안내는 8초 뒤 스스로 사라진다', () => {
    jest.useFakeTimers();
    const { container } = render(<GuestBgm bgm={libraryBgm} />);

    fireEvent.click(screen.getByRole('button', { name: '배경음악' }));
    fireEvent.error(container.querySelector('audio')!);
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(8000);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it('다른 곡으로 바뀌면 이전 곡의 안내를 숨긴다', () => {
    const { container, rerender } = render(<GuestBgm bgm={libraryBgm} />);

    fireEvent.click(screen.getByRole('button', { name: '배경음악' }));
    fireEvent.error(container.querySelector('audio')!);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(
      <GuestBgm bgm={{ ...libraryBgm, selectedBgmId: 'before-the-first-light' }} />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
