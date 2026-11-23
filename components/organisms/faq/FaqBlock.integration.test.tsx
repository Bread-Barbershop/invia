import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { FaqBlock } from './FaqBlock';

function FaqEditor() {
  const block = useEditorStore(state => state.block[0]) as EditorBlock<'faq'>;
  return <FaqBlock blockInfo={block} id={block.id} />;
}

describe('FAQ 질문 카드', () => {
  it('가운데 질문을 삭제하면 남은 질문과 답변을 유지하고 번호를 다시 매긴다', async () => {
    const user = userEvent.setup();
    useEditorStore.setState({
      block: [
        {
          id: 'faq',
          type: 'wedding',
          component: 'faq',
          props: {
            title: '자주 묻는 질문',
            items: [
              {
                question: '주차는 어디에서 하나요?',
                answer: '지하 1층입니다.',
              },
              { question: '셔틀이 있나요?', answer: '역에서 출발합니다.' },
              { question: '식사는 몇 시인가요?', answer: '오후 1시입니다.' },
            ],
          },
        },
      ],
    });
    render(<FaqEditor />);

    const second = screen.getByRole('region', { name: '2번째 질문' });
    await user.click(
      within(second).getByRole('button', { name: '2번째 질문 삭제' })
    );

    const first = within(screen.getByRole('region', { name: '1번째 질문' }));
    const remaining = within(
      screen.getByRole('region', { name: '2번째 질문' })
    );
    expect(first.getByLabelText('질문')).toHaveValue('주차는 어디에서 하나요?');
    expect(first.getByLabelText('답변')).toHaveValue('지하 1층입니다.');
    expect(remaining.getByLabelText('질문')).toHaveValue('식사는 몇 시인가요?');
    expect(remaining.getByLabelText('답변')).toHaveValue('오후 1시입니다.');
    expect(
      remaining.getByRole('button', { name: '2번째 질문 삭제' })
    ).toHaveTextContent('삭제');
    expect(screen.queryByRole('region', { name: '3번째 질문' })).toBeNull();
  });
});
