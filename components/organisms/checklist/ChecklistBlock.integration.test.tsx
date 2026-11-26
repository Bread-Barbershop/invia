import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  selectUploadData,
  useEditorStore,
} from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { checklistSchema } from './Checklist.schema';
import { ChecklistBlock } from './ChecklistBlock';

jest.mock('@/shared/data/registry/registry', () => ({ blockRegistry: {} }));

function createBlock(
  overrides: Partial<EditorBlock<'checklist'>['props']> = {}
): EditorBlock<'checklist'> {
  return {
    id: 'checklist-1',
    component: 'checklist',
    type: 'seminar',
    props: {
      title: checklistSchema.fields.title.default,
      description: checklistSchema.fields.description.default,
      items: checklistSchema.fields.items.default(),
      ...overrides,
    },
  };
}

function Editor() {
  const current = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'checklist'>;
  return <ChecklistBlock blockInfo={current} id={current.id} />;
}

function openEditor(saved = createBlock()) {
  useEditorStore.getState().setBlock([saved]);
  return render(<Editor />);
}

function savedBlock(): EditorBlock<'checklist'> {
  const upload = selectUploadData(useEditorStore.getState());
  return JSON.parse(JSON.stringify(upload.block[0]));
}

describe('체크리스트 편집', () => {
  it('기본값은 제목·안내 문구·항목 2개를 가진다', () => {
    expect(checklistSchema.fields.title.default).toBe('체크리스트');
    expect(checklistSchema.fields.description.default).toBe(
      '아래 항목을 하나씩 확인해 주세요.'
    );
    expect(checklistSchema.fields.items.default()).toHaveLength(2);
  });

  it('제목과 항목을 고치면 저장 데이터에 그대로 담긴다', async () => {
    const user = userEvent.setup();
    openEditor();

    const title = screen.getByLabelText('제목');
    await user.clear(title);
    await user.type(title, '세미나 준비물');

    const label = screen.getAllByLabelText('항목')[0];
    await user.clear(label);
    await user.type(label, '명함');
    const note = screen.getAllByLabelText('설명 (선택)')[0];
    await user.clear(note);
    await user.type(note, '네트워킹 시간에 나눠 주세요.');

    const saved = savedBlock();
    expect(saved.props.title).toBe('세미나 준비물');
    expect(saved.props.items[0]).toMatchObject({
      label: '명함',
      note: '네트워킹 시간에 나눠 주세요.',
    });
  });

  it('항목을 추가하고 삭제할 수 있다', async () => {
    const user = userEvent.setup();
    openEditor();

    await user.click(screen.getByRole('button', { name: '+ 항목 추가' }));
    expect(savedBlock().props.items).toHaveLength(3);

    await user.click(
      screen.getByRole('button', { name: '3번째 항목 삭제' })
    );
    expect(savedBlock().props.items).toHaveLength(2);
  });

  it('예시 적용을 확인하면 행사 종류에 맞는 준비물로 바뀐다', async () => {
    const user = userEvent.setup();
    openEditor();

    await user.click(
      screen.getByRole('button', { name: '세미나 준비물 예시 적용' })
    );
    await user.click(await screen.findByRole('button', { name: '적용하기' }));

    expect(savedBlock().props.items.map(item => item.label)).toContain('명함');
  });
});
