import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { TimelineBlock } from './TimelineBlock';
import { TimelinePreview } from './TimelinePreview';

const reception = {
  id: 'meal',
  time: '13:00',
  title: '피로연',
  description: '연회장에서 점심 식사',
};
const photo = {
  id: 'photo',
  time: '12:30',
  title: '단체 사진',
  description: '예식홀에서 가족과 함께 촬영',
};

function EditorAndGuest() {
  const block = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'timeline'>;
  return (
    <>
      <TimelineBlock blockInfo={block} id={block.id} />
      <section aria-label="하객 화면">
        <TimelinePreview blockInfo={block} isGuestPage />
      </section>
    </>
  );
}

describe('식순 카드 순서 변경', () => {
  beforeEach(() => useEditorStore.getState().reset());

  it('시간·제목·설명을 함께 옮기고 하객 화면에 같은 순서를 표시한다', async () => {
    const user = userEvent.setup();
    useEditorStore.getState().addBlock('wedding', 'timeline', 'block', {
      items: [reception, photo],
    });
    render(<EditorAndGuest />);

    const editor = within(
      screen.getByRole('region', { name: '식순 및 타임라인' })
    );
    const handle = editor.getByRole('button', { name: '2번째 순서 변경' });
    handle.focus();
    await user.keyboard('{ArrowUp}{ArrowUp}');

    const block = useEditorStore.getState().block[0] as EditorBlock<'timeline'>;
    expect(block.props.items).toEqual([photo, reception]);
    expect(
      editor.getByRole('button', { name: '1번째 순서 변경' })
    ).toHaveFocus();
    const first = within(editor.getAllByRole('listitem')[0]);
    expect(first.getByLabelText('시간')).toHaveValue(photo.time);
    expect(first.getByLabelText('일정 제목')).toHaveValue(photo.title);
    expect(first.getByLabelText('상세 설명')).toHaveValue(photo.description);
    const guest = within(screen.getByRole('region', { name: '하객 화면' }));
    const guestRows = guest.getAllByRole('listitem');
    expect(guestRows[0]).toHaveTextContent(
      photo.time + photo.title + photo.description
    );
    expect(guestRows[1]).toHaveTextContent(
      reception.time + reception.title + reception.description
    );

    await user.keyboard('{ArrowDown}');
    expect(guest.getAllByRole('listitem')[0]).toHaveTextContent(
      reception.title
    );
  });
});
