import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GroupPreview } from './GroupPreview';

jest.mock('@/shared/assets/icons/copy.svg', () => () => null);

const renderGroup = () =>
  render(
    <GroupPreview group={{ name: '신부 측' }}>
      {({ isOpenAccount, panelId, headerId }) => (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          data-testid="account-panel"
        >
          {isOpenAccount ? '계좌 목록 열림' : '계좌 목록 닫힘'}
        </div>
      )}
    </GroupPreview>
  );

describe('계좌 그룹 아코디언', () => {
  it('접힌 상태를 aria-expanded=false 로 알리고 패널 id를 aria-controls 로 연결한다', () => {
    renderGroup();

    const trigger = screen.getByRole('button', {
      name: '신부 측 계좌번호 펼치기',
    });
    const panel = screen.getByTestId('account-panel');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(panel.id).not.toBe('');
    expect(panel).toHaveAttribute('aria-labelledby', trigger.id);
    expect(trigger.id).not.toBe('');
  });

  it('누르면 펼침 상태와 안내 문구가 함께 바뀐다', async () => {
    const user = userEvent.setup();
    renderGroup();

    const trigger = screen.getByRole('button', {
      name: '신부 측 계좌번호 펼치기',
    });
    expect(screen.getByTestId('account-panel')).toHaveTextContent(
      '계좌 목록 닫힘'
    );

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: '신부 측 계좌번호 접기' })
    ).toBe(trigger);
    expect(screen.getByTestId('account-panel')).toHaveTextContent(
      '계좌 목록 열림'
    );
  });

  it('그룹명이 비어 있으면 기본 이름으로 안내한다', () => {
    render(
      <GroupPreview group={{ name: '  ' }}>
        {() => <div />}
      </GroupPreview>
    );

    expect(
      screen.getByRole('button', { name: '그룹명 계좌번호 펼치기' })
    ).toBeInTheDocument();
  });
});
