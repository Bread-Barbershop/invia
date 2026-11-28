import { act, render, screen } from '@testing-library/react';

import InvitationPreviewModal from './InvitationPreviewModal';
import { createPreviewSnapshot } from './previewSnapshot';

import type { PreviewSnapshot } from './previewSnapshot';

jest.mock('@/shared/hooks/useBackdropDismiss', () => ({
  useBackdropDismiss: () => ({}),
}));

function createSnapshot(): PreviewSnapshot {
  return createPreviewSnapshot(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  ).snapshot;
}

describe('InvitationPreviewModal 불러오기 안내', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('준비 전에는 iframe의 빈 화면을 감추고 안내만 보여 준다', () => {
    render(
      <InvitationPreviewModal
        snapshot={createSnapshot()}
        source="draft"
        onClose={jest.fn()}
      />
    );

    const frame = screen.getByTitle('초대장 미리보기');
    expect(frame).toHaveClass('invisible');
    expect(screen.getByRole('status')).toHaveTextContent(
      '초대장을 준비하고 있어요.'
    );
    // iframe 쪽 안내 문구가 겹쳐 보이지 않는다.
    expect(
      screen.queryByText('편집 화면에서 미리보기를 열어주세요.')
    ).not.toBeInTheDocument();
  });

  it('12초가 지나도 준비 중이면 늦어지는 이유와 다시 불러오기를 안내한다', () => {
    render(
      <InvitationPreviewModal
        snapshot={createSnapshot()}
        source="draft"
        onClose={jest.fn()}
      />
    );

    act(() => {
      jest.advanceTimersByTime(12_000);
    });

    expect(
      screen.getByText('처음 여는 화면이라 조금 오래 걸리고 있어요. 곧 표시돼요.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '다시 불러오기' })
    ).toBeInTheDocument();
  });

  it('끝내 준비되지 않으면 원인과 함께 실패를 알리고 다시 불러오기를 준다', () => {
    render(
      <InvitationPreviewModal
        snapshot={createSnapshot()}
        source="draft"
        onClose={jest.fn()}
      />
    );

    act(() => {
      jest.advanceTimersByTime(45_000);
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      '미리보기를 불러오지 못했어요.'
    );
    expect(screen.getByRole('alert').closest('div')).toHaveTextContent(
      '네트워크가 느리거나 처음 여는 화면이라 시간이 걸렸어요'
    );
    expect(
      screen.getByRole('button', { name: '다시 불러오기' })
    ).toBeInTheDocument();
  });
});
