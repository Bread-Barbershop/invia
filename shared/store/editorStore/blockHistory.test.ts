import type { BlockHistorySnapshot, EditorBlock } from '@/shared/types/block';

import {
  BLOCK_HISTORY_COALESCE_MS,
  BLOCK_HISTORY_LIMIT,
  classifyBlockChange,
  createBlockHistoryState,
  recordBlockHistory,
  takeBlockHistoryRedo,
  takeBlockHistoryUndo,
} from './blockHistory';

const makeBlock = (
  id: string,
  props: Record<string, unknown> = {}
): EditorBlock =>
  ({
    id,
    type: 'seminar',
    component: 'notice',
    props,
  }) as unknown as EditorBlock;

const snapshot = (
  block: EditorBlock[],
  selectedId: string | null = null
): BlockHistorySnapshot => ({ block, selectedId });

describe('블록 실행 취소 이력 계산', () => {
  describe('classifyBlockChange', () => {
    it('같은 배열이면 변화 없음으로 본다', () => {
      const block = [makeBlock('a', { title: '인사' })];

      expect(classifyBlockChange(block, block)).toEqual({ kind: 'none' });
    });

    it('블록이 추가되면 구조 변화로 본다', () => {
      const previous = [makeBlock('a')];
      const next = [makeBlock('a'), makeBlock('b')];

      expect(classifyBlockChange(previous, next)).toEqual({
        kind: 'structural',
      });
    });

    it('블록 순서가 바뀌면 구조 변화로 본다', () => {
      const previous = [makeBlock('a'), makeBlock('b')];
      const next = [makeBlock('b'), makeBlock('a')];

      expect(classifyBlockChange(previous, next)).toEqual({
        kind: 'structural',
      });
    });

    it('속성 하나만 바뀌면 연속 입력으로 묶을 수 있는 키를 만든다', () => {
      const previous = [makeBlock('a', { title: '인사' })];
      const next = [makeBlock('a', { title: '인사말' })];

      expect(classifyBlockChange(previous, next)).toEqual({
        kind: 'propUpdate',
        key: 'update:a:title',
      });
    });

    it('값이 그대로인 새 객체는 기록할 변화가 없다', () => {
      const title = '인사';
      const previous = [makeBlock('a', { title })];
      const next = [makeBlock('a', { title })];

      expect(classifyBlockChange(previous, next)).toEqual({ kind: 'none' });
    });
  });

  describe('recordBlockHistory', () => {
    it('처음 변경에서 직전 상태를 한 단계 쌓는다', () => {
      const history = createBlockHistoryState();
      const previous = snapshot([makeBlock('a', { title: '' })], 'a');
      const next = snapshot([makeBlock('a', { title: 'ㅇ' })], 'a');

      const patch = recordBlockHistory(history, previous, next, 1_000);

      expect(patch?.historyPast).toEqual([previous]);
      expect(patch?.canUndo).toBe(true);
      expect(patch?.canRedo).toBe(false);
      expect(patch?.historyCoalesceKey).toBe('update:a:title');
    });

    it('같은 블록의 같은 속성 연속 입력은 시간 창 안에서 한 단계로 합친다', () => {
      const history = createBlockHistoryState();
      const typingStart = snapshot([makeBlock('a', { title: '' })]);
      const afterFirstKey = snapshot([makeBlock('a', { title: 'ㅇ' })]);

      const first = recordBlockHistory(
        history,
        typingStart,
        afterFirstKey,
        1_000
      );

      const typingHistory = { ...history, ...first } as ReturnType<
        typeof createBlockHistoryState
      >;
      const second = recordBlockHistory(
        typingHistory,
        afterFirstKey,
        snapshot([makeBlock('a', { title: '안' })]),
        1_300
      );

      expect(second?.historyPast).toBeUndefined();
      expect(typingHistory.historyPast).toEqual([typingStart]);
      expect(second?.historyRecordedAt).toBe(1_300);
    });

    it('시간 창을 넘기면 새 단계로 쌓는다', () => {
      const history = createBlockHistoryState();
      const typingStart = snapshot([makeBlock('a', { title: '' })]);
      const afterFirstKey = snapshot([makeBlock('a', { title: 'ㅇ' })]);
      const first = recordBlockHistory(
        history,
        typingStart,
        afterFirstKey,
        1_000
      );
      const typingHistory = { ...history, ...first } as ReturnType<
        typeof createBlockHistoryState
      >;

      const second = recordBlockHistory(
        typingHistory,
        afterFirstKey,
        snapshot([makeBlock('a', { title: '안' })]),
        1_000 + BLOCK_HISTORY_COALESCE_MS + 1
      );

      expect(second?.historyPast).toEqual([typingStart, afterFirstKey]);
    });

    it('다른 블록을 고치면 앞선 입력과 합치지 않는다', () => {
      const history = createBlockHistoryState();
      const first = makeBlock('a');
      const previous = snapshot([first, makeBlock('b')]);
      const next = snapshot([first, makeBlock('b', { title: '인' })]);

      const patch = recordBlockHistory(
        {
          ...history,
          historyCoalesceKey: 'update:a:title',
          historyRecordedAt: 1_000,
        },
        previous,
        next,
        1_100
      );

      expect(patch?.historyPast).toEqual([previous]);
      expect(patch?.historyCoalesceKey).toBe('update:b:title');
    });

    it('새 변경이 생기면 다시 실행 이력을 비운다', () => {
      const history = createBlockHistoryState();
      const future = snapshot([makeBlock('gone')]);

      const patch = recordBlockHistory(
        { ...history, historyFuture: [future], canRedo: true },
        snapshot([makeBlock('a')]),
        snapshot([makeBlock('a'), makeBlock('b')]),
        1_000
      );

      expect(patch?.historyFuture).toEqual([]);
      expect(patch?.canRedo).toBe(false);
    });

    it('이력은 최대 단계까지만 보관한다', () => {
      const history = createBlockHistoryState();
      const stored = Array.from(
        { length: BLOCK_HISTORY_LIMIT },
        (_value, index) => snapshot([makeBlock(`old-${index}`)])
      );

      const patch = recordBlockHistory(
        { ...history, historyPast: stored },
        snapshot([makeBlock('previous')]),
        snapshot([makeBlock('previous'), makeBlock('next')]),
        1_000
      );

      expect(patch?.historyPast).toHaveLength(BLOCK_HISTORY_LIMIT);
      expect(patch?.historyPast?.[0].block[0].id).toBe('old-1');
      expect(patch?.historyPast?.[BLOCK_HISTORY_LIMIT - 1]).toEqual(
        snapshot([makeBlock('previous')])
      );
    });
  });

  describe('takeBlockHistoryUndo / takeBlockHistoryRedo', () => {
    const previous = snapshot([makeBlock('a', { title: '이전' })], 'a');
    const history = {
      ...createBlockHistoryState(),
      historyPast: [previous],
      canUndo: true,
    };
    const current = snapshot([makeBlock('a', { title: '지금' })], 'a');

    it('되돌릴 단계가 없으면 null을 돌려준다', () => {
      const state = {
        ...createBlockHistoryState(),
        ...snapshot([makeBlock('a')]),
      };

      expect(takeBlockHistoryUndo(state)).toBeNull();
      expect(takeBlockHistoryRedo(state)).toBeNull();
    });

    it('실행 취소는 직전 상태를 복원하고 다시 실행 이력에 지금 상태를 넣는다', () => {
      const step = takeBlockHistoryUndo({ ...history, ...current });

      expect(step?.snapshot).toEqual(previous);
      expect(step?.patch.historyPast).toEqual([]);
      expect(step?.patch.historyFuture).toEqual([current]);
      expect(step?.patch.canUndo).toBe(false);
      expect(step?.patch.canRedo).toBe(true);
    });

    it('다시 실행은 되돌린 상태를 복원하고 실행 취소 이력을 되살린다', () => {
      const undoStep = takeBlockHistoryUndo({ ...history, ...current });
      const redoState = {
        ...history,
        ...current,
        ...undoStep?.patch,
        ...previous,
      };

      const step = takeBlockHistoryRedo(redoState);

      expect(step?.snapshot).toEqual(current);
      expect(step?.patch.historyPast).toEqual([previous]);
      expect(step?.patch.canUndo).toBe(true);
    });

    it('선택한 블록 id도 함께 되돌린다', () => {
      const step = takeBlockHistoryUndo({
        ...history,
        ...snapshot(current.block, 'b'),
      });

      expect(step?.snapshot.selectedId).toBe('a');
    });
  });
});
