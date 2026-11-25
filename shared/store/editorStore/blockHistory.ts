import type {
  BlockHistorySnapshot,
  EditorBlock,
  HistorySlice,
} from '@/shared/types/block';

/** 실행 취소 기록을 몇 단계까지 보관할지. */
export const BLOCK_HISTORY_LIMIT = 50;

/**
 * 같은 블록의 같은 속성을 연달아 고칠 때(예: 글자 입력) 한 번의 실행 취소로 묶는 시간 창.
 * 키 입력이 이 시간 안에 이어지면 기록을 새로 쌓지 않고 직전 기록을 그대로 쓴다.
 */
export const BLOCK_HISTORY_COALESCE_MS = 1000;

export type BlockHistoryState = Omit<
  HistorySlice,
  'undo' | 'redo' | 'clearHistory'
>;

/**
 * 블록 상태를 옮기는 도중에는 기록기가 다시 동작하지 않도록 잠그는 표시.
 * 실행 취소/재실행이 블록을 바꿀 때 그 변경이 새 기록으로 쌓이면 안 된다.
 */
export const blockHistoryApplyGuard = { applying: false };

export const createBlockHistoryState = (): BlockHistoryState => ({
  historyPast: [],
  historyFuture: [],
  historyCoalesceKey: null,
  historyRecordedAt: 0,
  canUndo: false,
  canRedo: false,
});

/**
 * 블록 배열이 어떻게 바뀌었는지 성격만 판별한다.
 * - none: 실제 값 변화 없음(새 객체만 만들어진 경우)
 * - propUpdate: 한 블록의 속성 값만 바뀜 → 연속 입력으로 묶을 수 있다.
 * - structural: 추가·삭제·순서 이동·여러 블록 변경 → 한 단계로 따로 기록한다.
 */
export type BlockChangeClassification =
  | { kind: 'none' }
  | { kind: 'propUpdate'; key: string }
  | { kind: 'structural' };

const getChangedPropKeys = (
  before: EditorBlock['props'] | undefined,
  after: EditorBlock['props'] | undefined
) => {
  const beforeProps = before as Record<string, unknown> | undefined;
  const afterProps = after as Record<string, unknown> | undefined;
  const keys = new Set([
    ...Object.keys(beforeProps ?? {}),
    ...Object.keys(afterProps ?? {}),
  ]);

  return [...keys]
    .filter(key => !Object.is(beforeProps?.[key], afterProps?.[key]))
    .sort();
};

export function classifyBlockChange(
  previous: EditorBlock[],
  next: EditorBlock[]
): BlockChangeClassification {
  if (previous === next) return { kind: 'none' };
  if (previous.length !== next.length) return { kind: 'structural' };

  let changedIndex = -1;

  for (let index = 0; index < next.length; index += 1) {
    const before = previous[index];
    const after = next[index];

    if (before === after) continue;
    if (before.id !== after.id) return { kind: 'structural' };
    if (changedIndex >= 0) return { kind: 'structural' };

    changedIndex = index;
  }

  if (changedIndex < 0) return { kind: 'none' };

  const before = previous[changedIndex];
  const after = next[changedIndex];

  if (
    before.type !== after.type ||
    before.component !== after.component ||
    before.id !== after.id
  ) {
    return { kind: 'structural' };
  }

  const changedKeys = getChangedPropKeys(before.props, after.props);

  // 속성 값 자체가 그대로면 기록할 변화가 없다.
  if (changedKeys.length === 0) {
    const beforeKeys = Object.keys(before.props ?? {});
    const afterKeys = Object.keys(after.props ?? {});
    if (beforeKeys.length === afterKeys.length) return { kind: 'none' };
    return { kind: 'structural' };
  }

  return {
    kind: 'propUpdate',
    key: `update:${after.id}:${changedKeys.join(',')}`,
  };
}

/**
 * 블록이 바뀐 직후 호출해 직전 상태를 기록한다.
 * 기록할 변화가 없으면 null을 돌려준다.
 */
export function recordBlockHistory(
  history: BlockHistoryState,
  previous: BlockHistorySnapshot,
  next: BlockHistorySnapshot,
  now: number = Date.now()
): Partial<BlockHistoryState> | null {
  const change = classifyBlockChange(previous.block, next.block);

  if (change.kind === 'none') return null;

  if (
    change.kind === 'propUpdate' &&
    history.historyCoalesceKey === change.key &&
    now - history.historyRecordedAt <= BLOCK_HISTORY_COALESCE_MS
  ) {
    // 같은 블록의 같은 속성을 이어서 고치는 중 → 하나의 실행 취소 단계로 합친다.
    return {
      historyCoalesceKey: change.key,
      historyRecordedAt: now,
    };
  }

  const historyPast = [
    ...history.historyPast,
    { block: previous.block, selectedId: previous.selectedId },
  ].slice(-BLOCK_HISTORY_LIMIT);

  return {
    historyPast,
    historyFuture: [],
    historyCoalesceKey: change.kind === 'propUpdate' ? change.key : null,
    historyRecordedAt: now,
    canUndo: true,
    canRedo: false,
  };
}

export type BlockHistoryStep = {
  snapshot: BlockHistorySnapshot;
  patch: Partial<BlockHistoryState>;
};

export function takeBlockHistoryUndo(
  state: BlockHistoryState & BlockHistorySnapshot
): BlockHistoryStep | null {
  const { historyPast } = state;
  if (historyPast.length === 0) return null;

  const snapshot = historyPast[historyPast.length - 1];
  const past = historyPast.slice(0, -1);
  const future = [
    { block: state.block, selectedId: state.selectedId },
    ...state.historyFuture,
  ].slice(0, BLOCK_HISTORY_LIMIT);

  return {
    snapshot,
    patch: {
      historyPast: past,
      historyFuture: future,
      historyCoalesceKey: null,
      historyRecordedAt: 0,
      canUndo: past.length > 0,
      canRedo: true,
    },
  };
}

export function takeBlockHistoryRedo(
  state: BlockHistoryState & BlockHistorySnapshot
): BlockHistoryStep | null {
  const { historyFuture } = state;
  if (historyFuture.length === 0) return null;

  const snapshot = historyFuture[0];
  const future = historyFuture.slice(1);
  const past = [
    ...state.historyPast,
    { block: state.block, selectedId: state.selectedId },
  ].slice(-BLOCK_HISTORY_LIMIT);

  return {
    snapshot,
    patch: {
      historyPast: past,
      historyFuture: future,
      historyCoalesceKey: null,
      historyRecordedAt: 0,
      canUndo: true,
      canRedo: future.length > 0,
    },
  };
}
