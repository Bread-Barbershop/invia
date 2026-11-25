import { useEditorStore } from './useEditorStore';

const getState = () => useEditorStore.getState();

const blockIds = () => getState().block.map(block => block.id);

const propsOf = (index: number) =>
  getState().block[index].props as unknown as Record<string, unknown>;

describe('편집기 블록 실행 취소 / 다시 실행', () => {
  beforeEach(() => {
    getState().reset();
  });

  it('블록 추가를 실행 취소하면 이전 블록 목록으로 돌아가고 다시 실행하면 되살아난다', () => {
    getState().addBlock('seminar', 'notice', 'added');

    expect(getState().canUndo).toBe(true);

    getState().undo();

    expect(getState().block).toEqual([]);
    expect(getState().canUndo).toBe(false);
    expect(getState().canRedo).toBe(true);

    getState().redo();

    expect(blockIds()).toEqual(['added']);
    expect(getState().canRedo).toBe(false);
  });

  it('블록 삭제를 실행 취소하면 삭제한 블록과 선택 상태가 돌아온다', () => {
    getState().addBlock('seminar', 'notice', 'first');
    getState().addBlock('seminar', 'notice', 'second');
    getState().selectedBlock('first');

    getState().deleteBlock('first');
    expect(blockIds()).toEqual(['second']);

    getState().undo();

    expect(blockIds()).toEqual(['first', 'second']);
    expect(getState().selectedId).toBe('first');
  });

  it('블록 내용 수정을 실행 취소하면 이전 값으로 돌아간다', () => {
    getState().addBlock('seminar', 'notice', 'block');
    getState().clearHistory();

    getState().updateBlock('block', { title: '새 제목' });
    expect(getState().block[0].props).toMatchObject({ title: '새 제목' });

    getState().undo();

    expect(propsOf(0).title).not.toBe('새 제목');

    getState().redo();

    expect(getState().block[0].props).toMatchObject({ title: '새 제목' });
  });

  it('블록 순서 이동을 실행 취소하면 원래 순서로 돌아간다', () => {
    getState().addBlock('seminar', 'notice', 'first');
    getState().addBlock('seminar', 'notice', 'second');
    getState().addBlock('seminar', 'notice', 'third');

    getState().moveBlock(2, 0);
    expect(blockIds()).toEqual(['third', 'first', 'second']);

    getState().undo();

    expect(blockIds()).toEqual(['first', 'second', 'third']);
  });

  it('실행 취소 뒤 새 편집을 하면 다시 실행 이력이 사라진다', () => {
    getState().addBlock('seminar', 'notice', 'first');
    getState().addBlock('seminar', 'notice', 'second');
    getState().undo();

    expect(getState().canRedo).toBe(true);

    getState().addBlock('seminar', 'notice', 'third');

    expect(getState().canRedo).toBe(false);
    expect(blockIds()).toEqual(['first', 'third']);
  });

  it('되돌릴 단계가 없으면 실행 취소는 아무것도 바꾸지 않는다', () => {
    getState().addBlock('seminar', 'notice', 'first');
    getState().clearHistory();

    getState().undo();

    expect(blockIds()).toEqual(['first']);
    expect(getState().canUndo).toBe(false);
  });

  it('이력은 50단계까지만 쌓인다', () => {
    for (let index = 0; index < 60; index += 1) {
      getState().addBlock('seminar', 'notice', `block-${index}`);
    }

    expect(getState().historyPast).toHaveLength(50);
  });

  it('같은 속성을 연달아 입력하면 한 번의 실행 취소로 모두 되돌린다', () => {
    jest.useFakeTimers();

    try {
      getState().addBlock('seminar', 'notice', 'block');
      getState().clearHistory();

      getState().updateBlock('block', { title: '인' });
      jest.advanceTimersByTime(800);
      getState().updateBlock('block', { title: '안' });
      jest.advanceTimersByTime(800);
      getState().updateBlock('block', { title: '안녕' });

      expect(getState().historyPast).toHaveLength(1);

      getState().undo();

      expect(propsOf(0).title).not.toBe('안녕');
      expect(getState().canUndo).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('템플릿을 새로 불러와 이력을 비우면 그 이전 상태로는 되돌아가지 않는다', () => {
    getState().addBlock('seminar', 'notice', 'previous');

    getState().setBlock([
      { id: 'loaded', type: 'seminar', component: 'notice', props: {} },
    ] as unknown as ReturnType<typeof getState>['block']);
    getState().clearHistory();

    expect(getState().canUndo).toBe(false);

    getState().undo();

    expect(blockIds()).toEqual(['loaded']);
  });

  it('편집기를 초기화하면 실행 취소 이력도 함께 비워진다', () => {
    getState().addBlock('seminar', 'notice', 'first');
    getState().addBlock('seminar', 'notice', 'second');

    getState().reset();

    expect(getState().historyPast).toEqual([]);
    expect(getState().canUndo).toBe(false);
    expect(getState().block).toEqual([]);
  });
});
