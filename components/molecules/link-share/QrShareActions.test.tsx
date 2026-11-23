import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { QR_DATA_URL } from './fixtures/shareLink';
import { QrShareActions } from './QrShareActions';

const filename = '민서·지훈 결혼식 - 가족용 QR.png';
const restore: Array<() => void> = [];

function setApi(target: object, name: string, value: unknown) {
  const original = Object.getOwnPropertyDescriptor(target, name);
  Object.defineProperty(target, name, { configurable: true, value });
  restore.push(() => {
    if (original) Object.defineProperty(target, name, original);
    else Reflect.deleteProperty(target, name);
  });
}

function openActions(
  allowSending = true,
  url = 'https://invia.example/i/wedding?to=family'
) {
  render(
    <QrShareActions
      dataUrl={QR_DATA_URL}
      filename={filename}
      url={url}
      shareFolderId="family"
      allowSending={allowSending}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: '공유하기' }));
}

const message = '민서 & 지훈 💐 초대합니다.';
const prepareSms = jest.fn();

beforeEach(() => {
  prepareSms
    .mockReset()
    .mockResolvedValue({ ok: true, json: async () => ({ message }) });
  setApi(globalThis, 'fetch', prepareSms);
});

afterEach(() => {
  while (restore.length) restore.pop()?.();
});

it('복사한 PNG와 기기 공유창으로 전달한 파일은 화면의 QR과 이름 및 내용이 같다', async () => {
  const share = jest.fn().mockResolvedValue(undefined);
  const write = jest.fn().mockResolvedValue(undefined);
  const item = jest.fn();
  setApi(navigator, 'clipboard', { write });
  setApi(window, 'ClipboardItem', item);
  setApi(navigator, 'canShare', () => true);
  setApi(navigator, 'share', share);
  openActions();
  fireEvent.click(screen.getByRole('button', { name: 'QR 이미지 복사' }));
  expect(await screen.findByText(/채팅창에 붙여넣어/)).toBeVisible();
  expect(write).toHaveBeenCalledWith([item.mock.instances[0]]);
  fireEvent.click(screen.getByRole('button', { name: 'QR 이미지 보내기' }));
  const file = share.mock.calls[0][0].files[0];
  expect(file).toBe(item.mock.calls[0][0]['image/png']);
  expect(file.name).toBe(filename);
  expect(file.type).toBe('image/png');
  const reader = new FileReader();
  const contents = new Promise(resolve => {
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  await expect(contents).resolves.toBe(QR_DATA_URL);
});

it('이미지 복사 권한이 거절되면 PNG를 저장해서 첨부할 수 있도록 안내한다', async () => {
  setApi(navigator, 'clipboard', {
    write: jest
      .fn()
      .mockRejectedValue(new DOMException('거부', 'NotAllowedError')),
  });
  setApi(window, 'ClipboardItem', jest.fn());
  openActions();
  fireEvent.click(screen.getByRole('button', { name: 'QR 이미지 복사' }));
  expect(await screen.findByText(/저장한 뒤 첨부/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'QR 이미지 복사' })).toBeEnabled();
});

it('공유창을 취소하면 오류 없이 다시 열 수 있다', async () => {
  const share = jest
    .fn()
    .mockRejectedValueOnce(new DOMException('취소', 'AbortError'))
    .mockResolvedValue(undefined);
  setApi(navigator, 'canShare', () => true);
  setApi(navigator, 'share', share);
  openActions();
  const button = screen.getByRole('button', { name: 'QR 이미지 보내기' });
  fireEvent.click(button);
  await waitFor(() => expect(button).toBeEnabled());
  expect(screen.queryByText(/저장한 뒤 첨부/)).not.toBeInTheDocument();
  fireEvent.click(button);
  await waitFor(() => expect(share).toHaveBeenCalledTimes(2));
});

it('PNG 공유나 복사가 불가능한 브라우저에서는 저장 후 첨부를 안내한다', () => {
  setApi(navigator, 'share', jest.fn());
  setApi(navigator, 'canShare', () => false);
  setApi(window, 'ClipboardItem', undefined);
  openActions();
  expect(screen.queryByRole('button', { name: 'QR 이미지 보내기' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'QR 이미지 복사' })).toBeNull();
  expect(screen.getByText(/원하는 앱에 첨부/)).toBeVisible();
});

it('비공개 그룹은 카카오톡과 앱 전송을 막고 QR 복사를 허용한다', () => {
  setApi(navigator, 'share', jest.fn());
  setApi(navigator, 'canShare', () => true);
  setApi(navigator, 'clipboard', { write: jest.fn() });
  setApi(window, 'ClipboardItem', jest.fn());
  openActions(false);
  expect(screen.getByRole('button', { name: /문자로 보내기/ })).toBeDisabled();
  expect(prepareSms).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: /카카오톡으로/ })).toBeDisabled();
  expect(
    screen.getByRole('button', { name: 'QR 이미지 보내기' })
  ).toBeDisabled();
  expect(screen.getByRole('button', { name: 'QR 이미지 복사' })).toBeEnabled();
});

it.each([
  ['Android', 'Linux', 5, '?'],
  ['iPhone', 'iPhone', 5, '&'],
  ['Macintosh', 'MacIntel', 5, '&'],
  ['Macintosh', 'MacIntel', 0, '?'],
])(
  '문자 앱에 %s 기기의 수신자 없는 초안과 그룹 URL을 전달한다',
  async (agent, platform, points, separator) => {
    setApi(navigator, 'userAgent', agent);
    setApi(navigator, 'platform', platform);
    setApi(navigator, 'maxTouchPoints', points);
    const url = 'https://invia.example/i/w?to=family&q=a%26b#장소';
    openActions(true, url);
    expect(
      await screen.findByRole('link', { name: '문자로 보내기' })
    ).toHaveAttribute(
      'href',
      `sms:${separator}body=${encodeURIComponent(`${message}\n${url}`)}`
    );
  }
);

it('초안 조회 실패 후 다시 시도하고 서버에서 비공개로 확인하면 문자 앱을 열 수 없다', async () => {
  prepareSms
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ status: 409 });
  openActions();
  fireEvent.click(
    await screen.findByRole('button', { name: /문자 초안 다시 준비하기/ })
  );
  expect(
    await screen.findByRole('button', { name: /공개 후 보낼 수 있어요/ })
  ).toBeDisabled();
  expect(screen.queryByRole('link', { name: '문자로 보내기' })).toBeNull();
});
