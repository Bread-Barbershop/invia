import { copyTextToClipboard } from './copyTextToClipboard';
import { canUseWebShare, sharePhotoLink } from './photoShare';

const mockExecCommand = (result: boolean) => {
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    writable: true,
    value: jest.fn(() => result),
  });
};

const defineNavigatorValue = (key: string, value: unknown) => {
  Object.defineProperty(navigator, key, {
    configurable: true,
    writable: true,
    value,
  });
};

describe('canUseWebShare', () => {
  afterEach(() => {
    defineNavigatorValue('share', undefined);
  });

  it('navigator.share가 있으면 true, 없으면 false', () => {
    defineNavigatorValue('share', undefined);
    expect(canUseWebShare()).toBe(false);

    defineNavigatorValue('share', jest.fn());
    expect(canUseWebShare()).toBe(true);
  });
});

describe('sharePhotoLink', () => {
  const writeText = jest.fn();

  beforeEach(() => {
    writeText.mockReset();
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: true,
    });
    defineNavigatorValue('clipboard', { writeText });
    defineNavigatorValue('share', undefined);
  });

  afterEach(() => {
    defineNavigatorValue('share', undefined);
    defineNavigatorValue('clipboard', undefined);
    jest.restoreAllMocks();
  });

  it('Web Share API가 있으면 OS 공유 시트로 초대장 링크를 공유한다', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    defineNavigatorValue('share', share);

    await expect(
      sharePhotoLink({
        url: 'https://dev.invia.co.kr/abc',
        title: '민성 · 아현 결혼식',
      })
    ).resolves.toBe('shared');

    expect(share).toHaveBeenCalledWith({
      url: 'https://dev.invia.co.kr/abc',
      title: '민성 · 아현 결혼식',
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it('공유 시트를 열었다가 닫으면(cancel) 실패 안내 없이 canceled를 돌려준다', async () => {
    const abort = Object.assign(new Error('canceled'), { name: 'AbortError' });
    defineNavigatorValue(
      'share',
      jest.fn().mockImplementation(() => {
        // 공유 시트가 뜨면 페이지 포커스가 잠시 벗어난다.
        window.dispatchEvent(new Event('blur'));
        return Promise.reject(abort);
      })
    );

    await expect(
      sharePhotoLink({ url: 'https://dev.invia.co.kr/abc' })
    ).resolves.toBe('canceled');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('공유 시트가 뜨지 않고 abort되면(데스크톱 등) 링크 복사로 폴백한다', async () => {
    const abort = Object.assign(new Error('canceled'), { name: 'AbortError' });
    defineNavigatorValue('share', jest.fn().mockRejectedValue(abort));
    writeText.mockResolvedValue(undefined);

    await expect(
      sharePhotoLink({ url: 'https://dev.invia.co.kr/abc' })
    ).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('https://dev.invia.co.kr/abc');
  });

  it('Web Share API가 없으면 링크를 클립보드에 복사한다', async () => {
    writeText.mockResolvedValue(undefined);

    await expect(
      sharePhotoLink({ url: 'https://dev.invia.co.kr/abc' })
    ).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('https://dev.invia.co.kr/abc');
  });

  it('공유 시트가 오류로 끝나면 링크 복사로 폴백한다', async () => {
    defineNavigatorValue(
      'share',
      jest.fn().mockRejectedValue(new Error('not allowed'))
    );
    writeText.mockResolvedValue(undefined);

    await expect(
      sharePhotoLink({ url: 'https://dev.invia.co.kr/abc' })
    ).resolves.toBe('copied');
  });

  it('클립보드 복사까지 실패하면 failed를 돌려준다', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    mockExecCommand(false);

    await expect(
      sharePhotoLink({ url: 'https://dev.invia.co.kr/abc' })
    ).resolves.toBe('failed');
  });
});

describe('copyTextToClipboard', () => {
  afterEach(() => {
    defineNavigatorValue('clipboard', undefined);
    jest.restoreAllMocks();
  });

  it('Clipboard API를 사용할 수 없으면 textarea 폴백으로 복사한다', async () => {
    defineNavigatorValue('clipboard', undefined);
    mockExecCommand(true);
    const appendChild = jest.spyOn(document.body, 'appendChild');

    await expect(
      copyTextToClipboard('https://dev.invia.co.kr/abc')
    ).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(
      appendChild.mock.calls.some(
        ([node]) => node instanceof HTMLTextAreaElement
      )
    ).toBe(true);
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('빈 문자열은 복사하지 않는다', async () => {
    await expect(copyTextToClipboard('')).resolves.toBe(false);
  });
});
