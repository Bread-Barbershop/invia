import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccountsPerGroupPreview } from './AccountsPerGroupPreview';

import type { AccountEntry } from '../Account.schema';

jest.mock('@/shared/assets/icons/copy.svg', () => () => null);

const writeText = jest.fn().mockResolvedValue(undefined);

// userEvent.setup()이 navigator.clipboard를 자체 스텁으로 바꾸므로, 설정 이후에 다시 심습니다.
const mockClipboard = () => {
  Object.defineProperty(window, 'isSecureContext', {
    configurable: true,
    value: true,
  });
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
};

const accounts: AccountEntry[] = [
  {
    name: '김하객',
    bank: '국민은행',
    account: '123-456-789012',
    kakao: true,
  },
];

const renderAccounts = (options?: {
  hideActions?: boolean;
  accountList?: AccountEntry[];
}) =>
  render(
    <AccountsPerGroupPreview
      isOpenAccount
      accountList={options?.accountList ?? accounts}
      hideActions={options?.hideActions}
    />
  );

describe('계좌 목록 미리보기', () => {
  beforeEach(() => {
    writeText.mockClear();
  });

  it('복사 버튼이 예금주·은행이 담긴 이름을 갖는다', () => {
    renderAccounts();

    expect(
      screen.getByRole('button', { name: '김하객 국민은행 계좌번호 복사' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: '김하객 국민은행 계좌번호 복사 후 카카오톡 열기',
      })
    ).not.toBeInTheDocument();
  });

  it('기존에 저장된 송금 링크가 있어도 계좌번호 복사만 제공한다', () => {
    renderAccounts({
      accountList: [
        {
          ...accounts[0],
          kakaoPayUrl: 'https://qr.kakaopay.com/sample',
          tossUrl: 'https://toss.me/sample',
        },
      ],
    });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /계좌번호 복사$/ })).toBeVisible();
  });

  it('복사하면 클립보드에 은행과 계좌번호를 넣고 상태를 알린다', async () => {
    const user = userEvent.setup();
    mockClipboard();
    renderAccounts();

    await user.click(
      screen.getByRole('button', { name: '김하객 국민은행 계좌번호 복사' })
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('국민은행 123-456-789012');
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      '김하객 국민은행 123-456-789012 계좌번호를 복사했어요.'
    );
  });

  it('복사에 실패하면 다시 시도할 방법을 안내한다', async () => {
    const user = userEvent.setup();
    mockClipboard();
    writeText.mockRejectedValueOnce(new Error('denied'));
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    renderAccounts();

    await user.click(
      screen.getByRole('button', { name: '김하객 국민은행 계좌번호 복사' })
    );

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        '계좌번호를 복사하지 못했어요. 번호를 길게 눌러 직접 복사해 주세요.'
      );
    });
    consoleError.mockRestore();
  });

  it('계좌를 목록으로 노출하고 계좌별 이름을 붙인다', () => {
    renderAccounts();

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', {
        name: '김하객 국민은행 계좌번호 123-456-789012',
      })
    ).toBeInTheDocument();
  });

  it('개인정보 보호로 동작을 숨기면 복사 버튼을 만들지 않는다', () => {
    renderAccounts({ hideActions: true });

    expect(
      screen.queryByRole('button', { name: '김하객 국민은행 계좌번호 복사' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('123-456-789012')).toBeInTheDocument();
  });
});
