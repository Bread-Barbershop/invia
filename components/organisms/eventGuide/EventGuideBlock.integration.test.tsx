import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  selectUploadData,
  useEditorStore,
} from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { eventGuideSchema } from './EventGuide.schema';
import { EventGuideBlock } from './EventGuideBlock';

jest.mock('@/shared/data/registry/registry', () => ({ blockRegistry: {} }));

function createBlock(
  overrides: Partial<EditorBlock<'eventGuide'>['props']> = {}
): EditorBlock<'eventGuide'> {
  return {
    id: 'event-guide-1',
    component: 'eventGuide',
    type: 'firstBirthday',
    props: {
      title: eventGuideSchema.fields.title.default,
      intro: '',
      items: eventGuideSchema.fields.items.default(),
      ...overrides,
    },
  };
}

function Editor() {
  const current = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'eventGuide'>;
  return <EventGuideBlock blockInfo={current} id={current.id} />;
}

function openEditor(saved = createBlock()) {
  useEditorStore.getState().setBlock([saved]);
  return render(<Editor />);
}

function savedBlock(): EditorBlock<'eventGuide'> {
  const upload = selectUploadData(useEditorStore.getState());
  return JSON.parse(JSON.stringify(upload.block[0]));
}

describe('이벤트 안내 편집', () => {
  it('기본값은 예시 항목 2개를 가진다', () => {
    expect(eventGuideSchema.fields.items.default()).toHaveLength(2);
    expect(eventGuideSchema.fields.title.default).toBe('이벤트 안내');
  });

  it('제목·안내 문구·항목을 고치면 저장 데이터에 그대로 담긴다', async () => {
    const user = userEvent.setup();
    openEditor();

    const title = screen.getByLabelText('제목');
    await user.clear(title);
    await user.type(title, '돌잔치 이벤트');
    await user.type(screen.getByLabelText('안내 문구'), '순서대로 진행돼요.');

    const nameInput = screen.getAllByLabelText('이름')[0];
    await user.clear(nameInput);
    await user.type(nameInput, '돌잡이');
    const timeInput = screen.getAllByLabelText('시간')[0];
    await user.clear(timeInput);
    await user.type(timeInput, '12:00');

    const saved = savedBlock();
    expect(saved.props.title).toBe('돌잔치 이벤트');
    expect(saved.props.intro).toBe('순서대로 진행돼요.');
    expect(saved.props.items[0]).toMatchObject({
      title: '돌잡이',
      time: '12:00',
    });
  });

  it('항목을 추가하고 삭제할 수 있다', async () => {
    const user = userEvent.setup();
    openEditor();
    expect(screen.getAllByText(/번째 이벤트$/)).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: '+ 이벤트 추가' }));
    expect(screen.getAllByText(/번째 이벤트$/)).toHaveLength(3);
    expect(savedBlock().props.items).toHaveLength(3);

    await user.click(
      screen.getByRole('button', { name: '2번째 이벤트 삭제' })
    );
    expect(screen.getAllByText(/번째 이벤트$/)).toHaveLength(2);
    expect(savedBlock().props.items).toHaveLength(2);
  });

  it('예시 적용을 확인하면 초대장 종류에 맞는 내용으로 바뀐다', async () => {
    const user = userEvent.setup();
    openEditor();

    await user.click(
      screen.getByRole('button', { name: '돌잔치 이벤트 예시 적용' })
    );
    await user.click(await screen.findByRole('button', { name: '적용하기' }));

    const saved = savedBlock();
    expect(saved.props.items.map(item => item.title)).toContain('돌잡이');
  });
});
