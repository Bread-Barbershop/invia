import { act, render, screen } from '@testing-library/react';

import { useToastStore } from '@/shared/store/useToastStore';

import { ToastContainer } from './ToastContainer';

function resetToast() {
  act(() => {
    useToastStore.setState({
      message: null,
      variant: 'success',
      isVisible: false,
      options: { animation: 'slide', id: '' },
    });
  });
}

describe('토스트 안내 읽기', () => {
  beforeEach(() => {
    resetToast();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    resetToast();
  });

  it('실패 안내는 alert 영역에서 즉시 읽힌다', () => {
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().showToast('초대장 삭제에 실패했습니다.', 'error');
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      '초대장 삭제에 실패했습니다.'
    );
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('성공 안내는 polite 영역에서 읽힌다', () => {
    render(<ToastContainer />);

    act(() => {
      useToastStore.getState().showToast('초대장이 삭제되었습니다.', 'success');
    });

    expect(screen.getByRole('status')).toHaveTextContent(
      '초대장이 삭제되었습니다.'
    );
    expect(screen.queryByRole('alert')).toBeEmptyDOMElement();
  });

  it('안내가 없어도 live region은 화면에 남아 새 메시지를 기다린다', () => {
    render(<ToastContainer />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
