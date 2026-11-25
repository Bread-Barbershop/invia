const STORAGE_PREFIX = 'invia:checklist:';

const EMPTY_CHECKED_IDS: string[] = [];
const listeners = new Map<string, Set<() => void>>();
const snapshots = new Map<string, { raw: string | null; value: string[] }>();
const sessionOverrides = new Map<string, string[]>();

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getChecklistStorageKey(blockId: string) {
  return `${STORAGE_PREFIX}${blockId}`;
}

function readRaw(blockId: string): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(getChecklistStorageKey(blockId));
  } catch {
    return null;
  }
}

function parseIds(raw: string | null): string[] {
  if (!raw) return EMPTY_CHECKED_IDS;
  try {
    const parsed: unknown = JSON.parse(raw);
    const ids = Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
    return ids.length ? ids : EMPTY_CHECKED_IDS;
  } catch {
    return EMPTY_CHECKED_IDS;
  }
}

function notify(blockId: string) {
  listeners.get(blockId)?.forEach(listener => listener());
}

export function subscribeCheckedItemIds(
  blockId: string,
  onChange: () => void
): () => void {
  const set = listeners.get(blockId) ?? new Set<() => void>();
  set.add(onChange);
  listeners.set(blockId, set);
  return () => {
    set.delete(onChange);
    if (set.size === 0) listeners.delete(blockId);
  };
}

/**
 * useSyncExternalStore용 스냅샷. 같은 저장값이면 같은 배열을 돌려줘
 * 렌더링이 반복되지 않게 한다.
 */
export function getCheckedItemIdsSnapshot(blockId: string): string[] {
  const override = sessionOverrides.get(blockId);
  if (override) return override;
  const raw = readRaw(blockId);
  const cached = snapshots.get(blockId);
  if (cached && cached.raw === raw) return cached.value;
  const value = parseIds(raw);
  snapshots.set(blockId, { raw, value });
  return value;
}

export function getEmptyCheckedItemIdsSnapshot(): string[] {
  return EMPTY_CHECKED_IDS;
}

export function setCheckedItemIds(blockId: string, ids: string[]) {
  const raw = JSON.stringify(ids);
  const storage = getStorage();
  let stored = false;
  if (storage) {
    try {
      storage.setItem(getChecklistStorageKey(blockId), raw);
      stored = true;
    } catch {
      // 저장 공간을 쓸 수 없으면 이번 화면에서만 체크 상태를 유지한다.
    }
  }
  if (stored) {
    sessionOverrides.delete(blockId);
    snapshots.set(blockId, { raw, value: ids });
  } else {
    sessionOverrides.set(blockId, ids);
  }
  notify(blockId);
}
