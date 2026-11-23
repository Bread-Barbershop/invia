import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PopupOptions from './PopupOptions';

describe('항목 추가 선택창', () => {
  beforeAll(() => {
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it('공지 문구를 눌러도, 다른 항목의 라디오를 눌러도 각각 한 번 선택한다', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(
      <PopupOptions
        options={['주차 안내', '행사 시간 안내']}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByText('주차 안내'));
    expect(onSelect.mock.calls).toEqual([['주차 안내', 0]]);
    expect(screen.getByRole('radio', { name: '주차 안내' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: '행사 시간 안내' }));
    expect(onSelect.mock.calls).toEqual([
      ['주차 안내', 0],
      ['행사 시간 안내', 1],
    ]);
  });

  it('키보드로 포커스를 옮기고 스페이스 키로 항목을 선택한다', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<PopupOptions options={['주차 안내']} onSelect={onSelect} />);

    await user.tab();
    expect(screen.getByRole('radio', { name: '주차 안내' })).toHaveFocus();
    await user.keyboard('[Space]');
    expect(onSelect.mock.calls).toEqual([['주차 안내', 0]]);
  });
});
