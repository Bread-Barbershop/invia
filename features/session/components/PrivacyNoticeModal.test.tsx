import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import PrivacyNoticeModal from './PrivacyNoticeModal';

describe('PrivacyNoticeModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.getElementById('app-root')?.remove();
  });

  function renderAppRoot() {
    const appRoot = document.createElement('div');
    appRoot.id = 'app-root';
    document.body.appendChild(appRoot);
    return appRoot;
  }

  it('renders modal with Google Drive link and folder info under item 3 when open is true', () => {
    render(<PrivacyNoticeModal open={true} onClose={mockOnClose} />);

    expect(
      screen.getByRole('heading', { name: '안심하고 이용하세요' })
    ).toBeInTheDocument();

    // Check item 3 main text
    expect(
      screen.getByText(/Google Drive 계정에 직접 업로드/i)
    ).toBeInTheDocument();

    // Check callout box content
    expect(
      screen.getByText(/‘나의 모바일 청첩장’/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/우리 청첩장이 안전하게 저장돼요/i)
    ).toBeInTheDocument();

    // Check external link
    const driveLink = screen.getByRole('link', {
      name: /Google Drive\(내 드라이브\) 바로가기/i,
    });
    expect(driveLink).toBeInTheDocument();
    expect(driveLink).toHaveAttribute(
      'href',
      'https://drive.google.com/drive/my-drive'
    );
    expect(driveLink).toHaveAttribute('target', '_blank');
    expect(driveLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('알겠어요 버튼을 누르면 닫기 콜백을 호출한다', () => {
    render(<PrivacyNoticeModal open={true} onClose={mockOnClose} />);

    const confirmButton = screen.getByRole('button', { name: '알겠어요' });
    fireEvent.click(confirmButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('바깥 오버레이를 누르면 확인 없이 안내를 닫는다', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(
      <PrivacyNoticeModal open onClose={mockOnClose} onConfirm={onConfirm} />
    );
    const backdrop = screen.getByRole('dialog').parentElement!;

    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('알겠어요 버튼은 별도로 지정한 확인 콜백을 호출한다', () => {
    const onConfirm = jest.fn();
    render(
      <PrivacyNoticeModal open onClose={mockOnClose} onConfirm={onConfirm} />
    );

    fireEvent.click(screen.getByRole('button', { name: '알겠어요' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<PrivacyNoticeModal open={true} onClose={mockOnClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not render modal when open is false', () => {
    render(<PrivacyNoticeModal open={false} onClose={mockOnClose} />);

    expect(
      screen.queryByRole('heading', { name: /안심하고 이용하세요/i })
    ).not.toBeInTheDocument();
  });

  it('renders mobile variant title correctly', () => {
    render(
      <PrivacyNoticeModal
        open={true}
        onClose={mockOnClose}
        variant="mobileHome"
      />
    );

    expect(
      screen.getByRole('heading', { name: '안심하고 이용하세요.' })
    ).toBeInTheDocument();
  });

  it('대화상자의 이름과 설명으로 안내 제목·첫 문단을 연결한다', () => {
    render(<PrivacyNoticeModal open onClose={mockOnClose} />);

    const dialog = screen.getByRole('dialog', {
      name: '안심하고 이용하세요',
    });
    const descriptionId = dialog.getAttribute('aria-describedby');

    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId!)).toHaveTextContent(
      '이 모바일 청첩장 프로젝트는 누구나 쉽게 사용할 수 있도록 무료로 제공되고 있어요.'
    );
  });

  it('열리면 대화상자로 포커스를 옮기고, 닫으면 열기 전 위치로 돌려준다', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            개인정보 걱정 없어요
          </button>
          <PrivacyNoticeModal open={open} onClose={() => setOpen(false)} />
        </>
      );
    }

    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', {
      name: '개인정보 걱정 없어요',
    });
    await user.click(trigger);

    const dialog = screen.getByRole('dialog', {
      name: '안심하고 이용하세요',
    });
    await waitFor(() => expect(dialog).toHaveFocus());

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it.each([
    { key: 'Tab', shiftKey: false },
    { key: 'Shift+Tab', shiftKey: true },
  ])('$key으로 안내창에 진입하고 포커스를 순환한다', ({ shiftKey }) => {
    render(<PrivacyNoticeModal open onClose={mockOnClose} />);

    const dialog = screen.getByRole('dialog');
    const first = screen.getByRole('region', { name: '개인정보 안내 내용' });
    const last = screen.getByRole('button', { name: '알겠어요' });
    // jsdom에는 레이아웃이 없으므로 실제 화면에 보이는 두 경계를 지정한다.
    jest.spyOn(first, 'offsetParent', 'get').mockReturnValue(dialog);
    jest.spyOn(last, 'offsetParent', 'get').mockReturnValue(dialog);
    const destination = shiftKey ? last : first;
    const boundary = shiftKey ? first : last;
    const pressTab = () =>
      fireEvent.keyDown(document.activeElement ?? dialog, { key: 'Tab', shiftKey });

    expect(dialog).toHaveFocus();
    expect(pressTab()).toBe(false);
    expect(destination).toHaveFocus();

    boundary.focus();
    expect(pressTab()).toBe(false);
    expect(destination).toHaveFocus();
  });

  it('긴 안내문을 키보드로 스크롤할 수 있도록 이름 있는 포커스 영역으로 만든다', () => {
    render(<PrivacyNoticeModal open onClose={mockOnClose} />);

    const content = screen.getByRole('region', {
      name: '개인정보 안내 내용',
    });

    expect(content).toHaveAttribute('tabindex', '0');
  });

  it('열린 동안 뒤 화면(app-root)을 보조기기에서 감추고, 닫으면 되돌린다', async () => {
    const appRoot = renderAppRoot();
    const { rerender } = render(
      <PrivacyNoticeModal open onClose={mockOnClose} />
    );

    expect(appRoot).toHaveAttribute('aria-hidden', 'true');
    expect(appRoot).toHaveAttribute('inert');

    rerender(<PrivacyNoticeModal open={false} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(appRoot).not.toHaveAttribute('aria-hidden');
      expect(appRoot).not.toHaveAttribute('inert');
    });
  });
});
