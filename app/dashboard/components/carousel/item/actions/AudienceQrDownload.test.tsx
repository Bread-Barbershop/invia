import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { baseGroup, workGroup } from '../../fixtures/shareAudiences';
import AudienceQrDownload from './AudienceQrDownload';
import { buildQrArchive } from './qrArchive';

jest.mock('./qrArchive', () => ({ buildQrArchive: jest.fn() }));

const groups = [baseGroup, workGroup].map(group => ({
  ...group,
  visibility: 'public' as const,
  url: group.slug ? '/i/invite?to=work' : '/i/invite',
  downloadName: group.name + ' QR.png',
}));
const build = jest.mocked(buildQrArchive);

describe('QR 일괄 다운로드', () => {
  beforeEach(() => build.mockReset());

  it('중복 클릭으로 작업을 추가하지 않고 창이 닫히면 진행 중인 다운로드를 취소한다', async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    build.mockReturnValue(
      new Promise<Blob>(resolve => {
        finish = () => resolve(new Blob());
      })
    );
    const { unmount } = render(
      <AudienceQrDownload eventTitle="칠순" options={groups} />
    );
    await user.dblClick(
      screen.getByRole('button', { name: 'QR 2개 한 번에 받기' })
    );
    expect(build).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: 'QR ZIP 만드는 중…' })
    ).toBeDisabled();
    const signal = build.mock.calls[0][1];
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => finish());
  });

  it('일부 QR 생성이 실패하면 파일을 내려보내지 않고 처음부터 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    build.mockRejectedValue(new Error('PNG failed'));
    const clickLink = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    try {
      render(<AudienceQrDownload eventTitle="칠순" options={groups} />);
      const button = screen.getByRole('button', {
        name: 'QR 2개 한 번에 받기',
      });
      await user.click(button);
      expect(await screen.findByRole('alert')).toHaveTextContent('다시 시도');
      await user.click(button);
      expect(build).toHaveBeenCalledTimes(2);
      expect(clickLink).not.toHaveBeenCalled();
    } finally {
      clickLink.mockRestore();
    }
  });
});
