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
const DRAFT_KEY = 'editor-create';
const DRAFT_VERSION = 1;

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
};

let memoryDraft: EditorDraftSnapshot | null = null;
let databasePromise: Promise<IDBDatabase | null> | null = null;

// 사진 File까지 그대로 담아야 하므로 localStorage 대신 구조화 복제가 되는
// IndexedDB를 쓴다. 브라우저가 막아 두면 메모리 보관으로 대신한다.
function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise<IDBDatabase | null>(resolve => {
    try {
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

function readDatabaseDraft(database: IDBDatabase): Promise<unknown> {
  return new Promise(resolve => {
    try {
      const transaction = database.transaction(DRAFT_STORE_NAME, 'readonly');
      const request = transaction.objectStore(DRAFT_STORE_NAME).get(DRAFT_KEY);

      request.onsuccess = () => resolve(request.result ?? null);
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
  snapshot: EditorDraftSnapshot
): Promise<boolean> {
  return new Promise(resolve => {
    try {
      const transaction = database.transaction(DRAFT_STORE_NAME, 'readwrite');
      transaction.objectStore(DRAFT_STORE_NAME).put(snapshot, DRAFT_KEY);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
      transaction.onabort = () => resolve(false);
    } catch (error) {
      console.warn('[editorDraft] 초안을 저장하지 못했습니다.', error);
      resolve(false);
    }
  });
}

function deleteDatabaseDraft(database: IDBDatabase): Promise<void> {
  return new Promise(resolve => {
    try {
      const transaction = database.transaction(DRAFT_STORE_NAME, 'readwrite');
      transaction.objectStore(DRAFT_STORE_NAME).delete(DRAFT_KEY);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();
    } catch (error) {
      console.warn('[editorDraft] 초안을 지우지 못했습니다.', error);
      resolve();
    }
  });
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
  input: EditorDraftInput
): Promise<EditorDraftSnapshot | null> {
  const snapshot = createEditorDraftSnapshot(input);
  memoryDraft = snapshot;

  const database = await openDatabase();
  if (!database) return snapshot;

  const saved = await writeDatabaseDraft(database, snapshot);

  return saved ? snapshot : null;
}

export async function loadEditorDraft(): Promise<EditorDraftSnapshot | null> {
  const stored = memoryDraft ?? (await readStoredDraft());
  if (!stored) return null;

  memoryDraft = stored;

  if (!isEditorDraftUsable(stored)) {
    await clearEditorDraft();
    return null;
  }

  return stored;
}

export async function clearEditorDraft(): Promise<void> {
  memoryDraft = null;

  const database = await openDatabase();
  if (!database) return;

  await deleteDatabaseDraft(database);
}

async function readStoredDraft(): Promise<EditorDraftSnapshot | null> {
  const database = await openDatabase();
  if (!database) return null;

  const stored = await readDatabaseDraft(database);

  return isEditorDraftSnapshot(stored) ? stored : null;
}
