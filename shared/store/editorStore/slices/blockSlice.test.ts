import { useEditorStore } from '../useEditorStore';

describe('duplicateBlock', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it('원본 바로 뒤에 같은 블록을 복제하고 새 id를 돌려준다', () => {
    const { addBlock, duplicateBlock } = useEditorStore.getState();
    addBlock('wedding', 'greeting', 'greeting-1');
    addBlock('wedding', 'transportation', 'transportation-1');

    const newId = duplicateBlock('greeting-1');

    const { block } = useEditorStore.getState();
    expect(newId).toEqual(expect.any(String));
    expect(newId).not.toBe('greeting-1');
    expect(block.map(item => item.id)).toEqual([
      'greeting-1',
      newId,
      'transportation-1',
    ]);
    expect(block[1].component).toBe('greeting');
    expect(block[1].type).toBe('wedding');
  });

  it('props를 깊은 복사해 원본을 편집해도 복제본이 바뀌지 않는다', () => {
    const { addBlock, duplicateBlock, updateBlock } =
      useEditorStore.getState();
    addBlock('wedding', 'transportation', 'source', {
      title: '오시는 길 안내',
      subwayLine: '2호선',
    });

    const newId = duplicateBlock('source') as string;
    updateBlock('source', { title: '바뀐 제목' });

    const blocks = useEditorStore.getState().block;
    const source = blocks.find(item => item.id === 'source');
    const copy = blocks.find(item => item.id === newId);

    expect(source).toMatchObject({
      id: 'source',
      props: { title: '바뀐 제목' },
    });
    expect(copy).toMatchObject({
      id: newId,
      props: { title: '오시는 길 안내', subwayLine: '2호선' },
    });
  });

  it('없는 블록 id면 아무것도 바꾸지 않고 null을 돌려준다', () => {
    const { addBlock, duplicateBlock } = useEditorStore.getState();
    addBlock('wedding', 'greeting', 'greeting-1');

    const newId = duplicateBlock('missing');

    expect(newId).toBeNull();
    expect(useEditorStore.getState().block).toHaveLength(1);
  });

  it('여러 번 복제해도 블록과 id가 겹치지 않는다', () => {
    const { addBlock, duplicateBlock } = useEditorStore.getState();
    addBlock('etc', 'divider', 'divider');

    const first = duplicateBlock('divider') as string;
    const second = duplicateBlock(first) as string;

    const ids = useEditorStore.getState().block.map(item => item.id);
    expect(second).not.toBe(first);
    expect(new Set(ids).size).toBe(3);
    expect(ids).toHaveLength(3);
  });
});
