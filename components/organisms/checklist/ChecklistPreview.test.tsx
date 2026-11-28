import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { EditorBlock } from '@/shared/types/block';

import { getChecklistStorageKey } from './checklistChecks';
import { ChecklistPreview } from './ChecklistPreview';

const checklistStorageScope = 'invitation-scope';
const block: EditorBlock<'checklist'> = {
  id: 'check-1',
  component: 'checklist',
  type: 'seminar',
  props: {
    title: '체크리스트',
    description: '아래 항목을 하나씩 확인해 주세요.',
    items: [
      { id: 'a', label: '명함', note: '네트워킹 시간에 나눠 주세요.' },
      { id: 'b', label: '필기 도구', note: '' },
    ],
  },
};

describe('체크리스트 블록', () => {
  beforeEach(() => localStorage.clear());

  it('항목과 진행률을 보여 준다', () => {
    render(<ChecklistPreview blockInfo={block} />);

    expect(screen.getByText('체크리스트')).toBeInTheDocument();
    expect(screen.getByText('아래 항목을 하나씩 확인해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('명함')).toBeInTheDocument();
    expect(
      screen.getByText('네트워킹 시간에 나눠 주세요.')
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0'
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuemax',
      '2'
    );
  });

  it('편집 화면에서는 체크할 수 없고 저장도 하지 않는다', async () => {
    const user = userEvent.setup();
    render(<ChecklistPreview blockInfo={block} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeDisabled();

    await user.click(screen.getByText('명함'));
    expect(checkboxes[0]).not.toBeChecked();
    expect(
      localStorage.getItem(getChecklistStorageKey(checklistStorageScope, block.id))
    ).toBeNull();
  });

  it('하객 화면에서는 체크 상태가 진행률에 반영되고 기기에 저장된다', async () => {
    const user = userEvent.setup();
    render(
      <ChecklistPreview
        blockInfo={block}
        isGuestPage
        checklistStorageScope={checklistStorageScope}
      />
    );

    const [first, second] = screen.getAllByRole('checkbox');
    await user.click(first);
    expect(first).toBeChecked();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '1'
    );
    expect(
      JSON.parse(
        localStorage.getItem(getChecklistStorageKey(checklistStorageScope, block.id)) ?? '[]'
      )
    ).toEqual(['a']);

    await user.click(second);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '2'
    );
    expect(screen.getByText('모두 완료했어요!')).toBeInTheDocument();

    await user.click(first);
    expect(first).not.toBeChecked();
    expect(screen.queryByText('모두 완료했어요!')).not.toBeInTheDocument();
  });

  it('저장된 체크 상태를 다시 열 때 복원한다', async () => {
    localStorage.setItem(
      getChecklistStorageKey(checklistStorageScope, block.id),
      JSON.stringify(['b'])
    );

    render(
      <ChecklistPreview
        blockInfo={block}
        isGuestPage
        checklistStorageScope={checklistStorageScope}
      />
    );

    await waitFor(() =>
      expect(screen.getAllByRole('checkbox')[1]).toBeChecked()
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '1'
    );
  });

  it('항목이 없으면 편집 화면에서만 안내 문구를 보여 준다', () => {
    const empty = { ...block, props: { ...block.props, items: [] } };
    const editor = render(<ChecklistPreview blockInfo={empty} />);
    expect(
      screen.getByText('체크할 항목을 추가해 주세요.')
    ).toBeInTheDocument();
    editor.unmount();

    render(<ChecklistPreview blockInfo={empty} isGuestPage />);
    expect(
      screen.queryByText('체크할 항목을 추가해 주세요.')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('체크리스트')).not.toBeInTheDocument();
  });
});
