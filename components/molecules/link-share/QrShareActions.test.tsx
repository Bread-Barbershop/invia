import { fireEvent, render, screen } from '@testing-library/react';

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
  const copyQr = jest.fn();
  render(
    <QrShareActions
      dataUrl={QR_DATA_URL}
      filename={filename}
      url={url}
      shareFolderId="family"
      allowSending={allowSending}
      onCopyQr={copyQr}
      copyDisabled={false}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: '공유하기' }));
  return copyQr;
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

it('펼친 메뉴에서 카카오톡, 문자, QR 복사와 PNG 저장을 차례로 제공한다', async () => {
  const copyQr = openActions();
  const kakao = screen.getByRole('button', { name: '카카오톡으로 보내기' });
  const sms = await screen.findByRole('link', { name: '문자로 보내기' });
  const copy = screen.getByRole('button', { name: 'QR 이미지 복사' });
  const save = screen.getByRole('link', { name: 'QR 이미지 저장' });

  expect(kakao.compareDocumentPosition(sms)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(sms.compareDocumentPosition(copy)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(copy.compareDocumentPosition(save)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  fireEvent.click(copy);
  expect(copyQr).toHaveBeenCalledTimes(1);
  expect(save).toHaveAttribute('href', QR_DATA_URL);
  expect(save).toHaveAttribute('download', filename);
});

it('비공개 그룹은 전송을 막고 QR 복사와 저장을 허용한다', () => {
  openActions(false);

  expect(screen.getByRole('button', { name: /문자로 보내기/ })).toBeDisabled();
  expect(prepareSms).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: /카카오톡으로/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'QR 이미지 복사' })).toBeEnabled();
  expect(screen.getByRole('link', { name: 'QR 이미지 저장' })).toHaveAttribute(
    'download',
    filename
  );
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
