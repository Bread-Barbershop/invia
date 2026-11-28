import type { SectionStyle } from '@/shared/data/sectionStyles';
import type { PersistedEditorBlock, ShareUrlState } from '@/shared/types/block';
import type {
  BgmData,
  BulkJson,
  MainPosterData,
  UploadTask,
} from '@/shared/types/invitationSave';

const DRAFT_DATABASE_NAME = 'invia-editor-drafts';
const DRAFT_DATABASE_VERSION = 1;
const DRAFT_STORE_NAME = 'drafts';
const DRAFT_VERSION = 1;

export const BLANK_EDITOR_DRAFT_KEY = 'editor-create';
export type EditorDraftKey =
  | typeof BLANK_EDITOR_DRAFT_KEY
  | `sample:${string}`
  | `template:${string}`;

// 로그인 전에 끊긴 작업은 일주일까지 되살린다. 그보다 오래된 초안은 새 작업으로 본다.
export const EDITOR_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// 저장 payload와 같이 섹션 스타일까지 함께 보관한다.
export type EditorDraftBulkData = BulkJson & { sectionStyle?: SectionStyle };

export type EditorDraftInput = {
  bulkData: EditorDraftBulkData;
  blocks: PersistedEditorBlock[];
  images: UploadTask[];
  shareUrl: ShareUrlState;
  bgm: BgmData;
  audioFile: File | null;
  mainPoster: MainPosterData;
};

export type EditorDraftSnapshot = EditorDraftInput & {
  version: typeof DRAFT_VERSION;
  savedAt: number;
  revision?: string;
};

type DraftDiscardResult =
  | { status: 'discarded' }
  | { status: 'changed'; draft: EditorDraftSnapshot }
  | { status: 'failed' };

const memoryDrafts = new Map<EditorDraftKey, EditorDraftSnapshot>();
let databasePromise: Promise<IDBDatabase | null> | null = null;

// 사진 File까지 그대로 담아야 하므로 localStorage 대신 구조화 복제가 되는
// IndexedDB를 쓴다. 브라우저가 막아 두면 메모리 보관으로 대신한다.
function openDatabase(): Promise<IDBDatabase | null> {
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise<IDBDatabase | null>(resolve => {
    try {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }

      const request = indexedDB.open(
        DRAFT_DATABASE_NAME,
        DRAFT_DATABASE_VERSION
      );

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(DRAFT_STORE_NAME)) {
          database.createObjectStore(DRAFT_STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch (error) {
      console.warn('[editorDraft] 저장소를 열지 못했습니다.', error);
      resolve(null);
    }
  });

  return databasePromise;
}

function readDatabaseDraft(
  database: IDBDatabase,
  key: EditorDraftKey
): Promise<EditorDraftSnapshot | null> {
  return new Promise(resolve => {
    try {
      const transaction = database.transaction(DRAFT_STORE_NAME, 'readwrite');
      const drafts = transaction.objectStore(DRAFT_STORE_NAME);
      const request = drafts.get(key);

      request.onsuccess = () => {
        const stored: unknown = request.result;
        if (!isEditorDraftSnapshot(stored)) {
          resolve(null);
        } else if (!isEditorDraftUsable(stored)) {
          // Read and remove the expired entry in the same transaction.
          drafts.delete(key);
          resolve(null);
        } else {
          resolve(stored);
        }
      };
      request.onerror = () => resolve(null);
      transaction.onabort = () => resolve(null);
    } catch (error) {
      console.warn('[editorDraft] 초안을 읽지 못했습니다.', error);
      resolve(null);
    }
  });
}

function writeDatabaseDraft(
  database: IDBDatabase,
  key: EditorDraftKey,
  snapshot: EditorDraftSnapshot
): Promise<boolean> {
  return new Promise(resolve => {
    try {
      const transaction = database.transaction(DRAFT_STORE_NAME, 'readwrite');
      transaction.objectStore(DRAFT_STORE_NAME).put(snapshot, key);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
      transaction.onabort = () => resolve(false);
    } catch (error) {
      console.warn('[editorDraft] 초안을 저장하지 못했습니다.', error);
      resolve(false);
    }
  });
}

function deleteDatabaseDraft(
  database: IDBDatabase,
  key: EditorDraftKey,
  expected?: EditorDraftSnapshot
): Promise<DraftDiscardResult> {
  return new Promise(resolve => {
    try {
      const transaction = database.transaction(DRAFT_STORE_NAME, 'readwrite');
      const drafts = transaction.objectStore(DRAFT_STORE_NAME);
      let result: DraftDiscardResult = { status: 'discarded' };

      if (expected) {
        // 같은 트랜잭션에서 확인하고 삭제해야 다른 탭의 저장이 사이에 들어올 수 없다.
        const request = drafts.get(key);
        request.onsuccess = () => {
          const stored: unknown = request.result;
          if (!isEditorDraftSnapshot(stored)) return;
          if (matchesDraft(stored, expected)) {
            drafts.delete(key);
          } else {
            result = { status: 'changed', draft: stored };
          }
        };
      } else {
        drafts.delete(key);
      }

      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => resolve({ status: 'failed' });
      transaction.onabort = () => resolve({ status: 'failed' });
    } catch (error) {
      console.warn('[editorDraft] 초안을 지우지 못했습니다.', error);
      resolve({ status: 'failed' });
    }
  });
}

function matchesDraft(
  stored: EditorDraftSnapshot,
  expected: EditorDraftSnapshot
): boolean {
  // 이전 버전에서 만든 초안에는 revision이 없어 저장 시각을 사용한다.
  return (
    stored.savedAt === expected.savedAt && stored.revision === expected.revision
  );
}

// File/Blob은 그대로 두고, 구조화 복제가 불가능한 값만 덜어낸다.
function cloneForDraft(value: unknown): unknown {
  if (value === null) return null;

  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return value;
  }
  if (type === 'bigint') return String(value);
  if (type === 'undefined' || type === 'function' || type === 'symbol') {
    return undefined;
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) return value;
  if (value instanceof Date) return new Date(value.getTime());

  if (Array.isArray(value)) {
    return value.map(item => {
      const cloned = cloneForDraft(item);
      return cloned === undefined ? null : cloned;
    });
  }

  if (type === 'object') {
    const source = value as Record<string, unknown>;
    const clonedObject: Record<string, unknown> = {};

    Object.entries(source).forEach(([key, child]) => {
      const cloned = cloneForDraft(child);
      if (cloned === undefined) return;
      clonedObject[key] = cloned;
    });

    return clonedObject;
  }

  return undefined;
}

function isEditorDraftSnapshot(value: unknown): value is EditorDraftSnapshot {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as {
    version?: unknown;
    savedAt?: unknown;
    blocks?: unknown;
    bulkData?: unknown;
  };

  return (
    candidate.version === DRAFT_VERSION &&
    typeof candidate.savedAt === 'number' &&
    Array.isArray(candidate.blocks) &&
    typeof candidate.bulkData === 'object' &&
    candidate.bulkData !== null
  );
}

export function isEditorDraftUsable(
  snapshot: EditorDraftSnapshot,
  {
    now = Date.now(),
    maxAgeMs = EDITOR_DRAFT_MAX_AGE_MS,
  }: { now?: number; maxAgeMs?: number } = {}
): boolean {
  const age = now - snapshot.savedAt;

  return age >= 0 && age <= maxAgeMs;
}

export function createEditorDraftSnapshot(
  input: EditorDraftInput,
  savedAt = Date.now()
): EditorDraftSnapshot {
  return {
    version: DRAFT_VERSION,
    savedAt,
    revision:
      globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    bulkData: cloneForDraft(input.bulkData) as EditorDraftBulkData,
    blocks: cloneForDraft(input.blocks) as PersistedEditorBlock[],
    images: cloneForDraft(input.images) as UploadTask[],
    shareUrl: cloneForDraft(input.shareUrl) as ShareUrlState,
    bgm: cloneForDraft(input.bgm) as BgmData,
    audioFile: input.audioFile,
    mainPoster: cloneForDraft(input.mainPoster) as MainPosterData,
  };
}

export async function saveEditorDraft(
  key: EditorDraftKey,
  input: EditorDraftInput
): Promise<boolean> {
  let snapshot: EditorDraftSnapshot;
  try {
    snapshot = createEditorDraftSnapshot(input);
  } catch (error) {
    console.warn('[editorDraft] 초안을 복제하지 못했습니다.', error);
    return false;
  }
  memoryDrafts.set(key, snapshot);

  const database = await openDatabase();
  if (!database) return false;

  const persisted = await writeDatabaseDraft(database, key, snapshot);
  if (persisted && memoryDrafts.get(key) === snapshot) {
    memoryDrafts.delete(key);
  }

  return persisted;
}

export async function loadEditorDraft(
  key: EditorDraftKey
): Promise<EditorDraftSnapshot | null> {
  const memoryDraft = memoryDrafts.get(key);
  if (memoryDraft) {
    if (isEditorDraftUsable(memoryDraft)) return memoryDraft;
    memoryDrafts.delete(key);
  }

  const database = await openDatabase();
  return database ? readDatabaseDraft(database, key) : null;
}

export async function discardEditorDraft(
  key: EditorDraftKey,
  expected: EditorDraftSnapshot
): Promise<DraftDiscardResult> {
  const database = await openDatabase();
  const memoryDraft = memoryDrafts.get(key);
  if (memoryDraft && !matchesDraft(memoryDraft, expected)) {
    return { status: 'changed', draft: memoryDraft };
  }

  const result: DraftDiscardResult = database
    ? await deleteDatabaseDraft(database, key, expected)
    : { status: 'discarded' };
  const latestMemoryDraft = memoryDrafts.get(key);
  if (latestMemoryDraft && latestMemoryDraft !== memoryDraft) {
    return { status: 'changed', draft: latestMemoryDraft };
  }

  if (result.status !== 'failed') memoryDrafts.delete(key);
  return result;
}

export async function clearEditorDraft(key: EditorDraftKey): Promise<void> {
  memoryDrafts.delete(key);

  const database = await openDatabase();
  if (!database) return;

  await deleteDatabaseDraft(database, key);
}
