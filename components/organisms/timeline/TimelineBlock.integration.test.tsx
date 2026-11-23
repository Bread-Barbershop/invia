import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { TimelineBlock } from './TimelineBlock';

const block: EditorBlock<'timeline'> = {
  id: 'timeline',
  type: 'wedding',
  component: 'timeline',
  props: {
    title: '우리 결혼식',
    items: [{ id: 'song', time: '13:10', title: '축가', description: '친구 축가' }],
  },
};

describe('식순 예시 적용', () => {
  beforeEach(() => useEditorStore.setState({ block: [block] }));
  afterEach(() => useEditorStore.getState().reset());

  async function openConfirm() {
    const user = userEvent.setup();
    render(<TimelineBlock blockInfo={block} id={block.id} />);
    const trigger = screen.getByRole('button', { name: '결혼식 식순 예시 적용' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: /예시 식순/ });
    return { user, dialog, trigger };
  }

  it('적용하기를 눌러야 기존 순서가 결혼식 예시로 교체된다', async () => {
    const { user, dialog } = await openConfirm();
    expect(useEditorStore.getState().block[0]).toEqual(block);
    await user.click(within(dialog).getByRole('button', { name: '적용하기' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(useEditorStore.getState().block[0].props).toMatchObject({
      title: '우리 결혼식',
      items: [{ title: '하객 맞이' }, { title: '결혼식' }, { title: '피로연' }],
    });
  });

  it.each(['취소', 'Esc'])('%s로 닫으면 기존 식순과 버튼 포커스를 유지한다', async action => {
    const { user, dialog, trigger } = await openConfirm();
    if (action === 'Esc') await user.keyboard('{Escape}');
    else await user.click(within(dialog).getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(useEditorStore.getState().block[0]).toEqual(block);
    expect(trigger).toHaveFocus();
  });
});
