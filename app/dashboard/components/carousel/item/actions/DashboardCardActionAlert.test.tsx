import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DashboardCardActionAlert from './DashboardCardActionAlert';

describe('카드 액션 실패 안내', () => {
  it('실패 이유를 alert로 알리고 다시 시도 버튼을 제공한다', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    render(
      <DashboardCardActionAlert
        title="초대장을 공개로 바꾸지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        actionLabel="다시 시도"
        onAction={onAction}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('초대장을 공개로 바꾸지 못했어요');
    expect(alert).toHaveTextContent('잠시 후 다시 시도해 주세요.');

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('닫기 버튼으로 안내를 접을 수 있다', async () => {
    const user = userEvent.setup();
    const onDismiss = jest.fn();
    render(
      <DashboardCardActionAlert
        title="공유 정보를 불러오지 못했어요"
        onDismiss={onDismiss}
      />
    );

    await user.click(screen.getByRole('button', { name: '안내 닫기' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('안내 안의 클릭이 카드 선택으로 번지지 않는다', async () => {
    const user = userEvent.setup();
    const onCardClick = jest.fn();
    render(
      <div onClick={onCardClick}>
        <DashboardCardActionAlert
          title="공개 상태를 바꾸지 못했어요"
          actionLabel="다시 시도"
          onAction={jest.fn()}
          onDismiss={jest.fn()}
        />
      </div>
    );

    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    await user.click(screen.getByRole('button', { name: '안내 닫기' }));

    expect(onCardClick).not.toHaveBeenCalled();
  });
});
