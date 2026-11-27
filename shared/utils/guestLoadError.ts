/**
 * 하객 초대장 화면이 오류로 멈췄을 때(error.tsx) 어떤 안내 문구를 보여줄지 결정한다.
 *
 * 하객은 대부분 카카오톡 인앱 브라우저로 초대장 링크를 연다. 그래서
 * 1) 오프라인/신호 약함: 연결이 돌아오면 하객이 버튼을 누르지 않아도 다시 시도한다.
 * 2) 배포 직후 청크 로딩 실패: 예전 청크 주소가 사라져 생기는 오류라서, 새 HTML을 받도록
 *    한 번 자동으로 새로 고침한다(같은 오류가 반복되면 무한 새로 고침이 되므로 쿨다운을 둔다).
 * 3) 그 밖의 오류: 다시 시도 / 새로 고침 버튼을 준다.
 */

export type GuestLoadErrorMode = 'offline' | 'stale' | 'generic';

export type GuestLoadErrorAction = 'reset' | 'reload';

export type GuestLoadErrorCopy = {
  mode: GuestLoadErrorMode;
  eyebrow: string;
  title: string;
  description: string;
  hint: string;
  primaryLabel: string;
  primaryAction: GuestLoadErrorAction;
  secondaryLabel: string | null;
  secondaryAction: GuestLoadErrorAction | null;
};

/** 하객 화면을 실제로 새로 고친다. 테스트에서는 이 함수만 대체한다. */
export function reloadGuestPage(): void {
  if (typeof window === 'undefined') return;
  window.location.reload();
}

/** 자동 새로 고침 전에 안내 문구를 읽을 수 있게 잠깐 기다린다. */
export const GUEST_ERROR_AUTO_RELOAD_DELAY_MS = 1_200;

/** 자동 새로 고침은 이 간격 안에서 한 번만 한다(무한 새로 고침 방지). */
export const GUEST_ERROR_AUTO_RELOAD_COOLDOWN_MS = 60_000;

export const GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY =
  'invia:guest-error-auto-reload-at';

/** 배포 직후 사라진 청크를 받으려다 나는 오류들의 메시지 패턴. */
const CHUNK_LOAD_ERROR_PATTERNS: readonly RegExp[] = [
  /chunkloaderror/i,
  /loading chunk [\w.-]+ failed/i,
  /failed to load chunk/i,
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
];

const OFFLINE_COPY: GuestLoadErrorCopy = {
  mode: 'offline',
  eyebrow: 'GUEST INVITATION',
  title: '인터넷 연결을 확인해 주세요',
  description:
    '지금 오프라인 상태예요. 연결이 돌아오면 초대장을 자동으로 다시 불러올게요.',
  hint: '와이파이나 데이터를 켠 뒤 잠시만 기다려 주세요.',
  primaryLabel: '다시 시도하기',
  primaryAction: 'reset',
  secondaryLabel: '새로 고침',
  secondaryAction: 'reload',
};

const STALE_AUTO_COPY: GuestLoadErrorCopy = {
  mode: 'stale',
  eyebrow: 'GUEST INVITATION',
  title: '초대장을 새로 불러오는 중이에요',
  description: '잠깐만 기다려 주세요. 화면을 자동으로 다시 열고 있어요.',
  hint: '몇 초 안에 그대로라면 아래 버튼을 눌러 주세요.',
  primaryLabel: '새로 고침',
  primaryAction: 'reload',
  secondaryLabel: null,
  secondaryAction: null,
};

const STALE_RETRY_COPY: GuestLoadErrorCopy = {
  mode: 'stale',
  eyebrow: 'GUEST INVITATION',
  title: '초대장을 새로 고치지 못했어요',
  description: '아래 버튼을 눌러 초대장을 새로 고쳐 주세요.',
  hint: '잠시 후 다시 시도해 주세요. 계속되면 초대장을 보내준 분에게 새 링크를 받아 주세요.',
  primaryLabel: '새로 고침',
  primaryAction: 'reload',
  secondaryLabel: '다시 시도하기',
  secondaryAction: 'reset',
};

const GENERIC_COPY: GuestLoadErrorCopy = {
  mode: 'generic',
  eyebrow: 'GUEST INVITATION',
  title: '초대장을 불러오지 못했어요',
  description: '일시적인 문제로 화면을 열지 못했어요. 잠시 후 다시 시도해 주세요.',
  hint: '같은 문제가 계속되면 초대장을 보내준 분에게 새 링크를 받아 주세요.',
  primaryLabel: '다시 시도하기',
  primaryAction: 'reset',
  secondaryLabel: '새로 고침',
  secondaryAction: 'reload',
};

/**
 * 던져진 오류가 "배포 직후 청크 로딩 실패"인지 확인한다.
 * 네트워크 요청 실패(Failed to fetch) 일반과는 구분한다.
 */
export function isChunkLoadError(error: unknown): boolean {
  const parts: string[] = [];

  if (typeof error === 'string') {
    parts.push(error);
  } else if (error && typeof error === 'object') {
    const { name, message } = error as { name?: unknown; message?: unknown };
    if (typeof name === 'string') parts.push(name);
    if (typeof message === 'string') parts.push(message);
  }

  if (parts.length === 0) return false;

  const haystack = parts.join(' ');
  return CHUNK_LOAD_ERROR_PATTERNS.some((pattern) => pattern.test(haystack));
}

type GuestLoadErrorCopyInput = {
  error: unknown;
  online: boolean;
  /** 이미 자동 새로 고침을 한 번 해서 이번에는 자동으로 하지 않는 상태인지 */
  autoReloadSkipped: boolean;
};

export function resolveGuestLoadErrorCopy({
  error,
  online,
  autoReloadSkipped,
}: GuestLoadErrorCopyInput): GuestLoadErrorCopy {
  if (!online) return OFFLINE_COPY;
  if (!isChunkLoadError(error)) return GENERIC_COPY;
  return autoReloadSkipped ? STALE_RETRY_COPY : STALE_AUTO_COPY;
}

type ShouldAutoReloadInput = {
  error: unknown;
  online: boolean;
  lastAutoReloadAt: number | null | undefined;
  now: number;
};

export function shouldAutoReloadGuestPage({
  error,
  online,
  lastAutoReloadAt,
  now,
}: ShouldAutoReloadInput): boolean {
  if (!online || lastAutoReloadAt === undefined) return false;
  if (!isChunkLoadError(error)) return false;
  if (lastAutoReloadAt === null) return true;
  return now - lastAutoReloadAt >= GUEST_ERROR_AUTO_RELOAD_COOLDOWN_MS;
}

type GuestErrorStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** 읽을 수 없는 저장소(undefined)와 기록이 없는 저장소(null)를 구분한다. */
export function readGuestErrorAutoReloadAt(
  storage: GuestErrorStorage | null | undefined
): number | null | undefined {
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return undefined;
  }
}

/** 기록을 다시 읽을 수 있어야 다음 페이지에서 자동 새로 고침을 제한할 수 있다. */
export function markGuestErrorAutoReload(
  storage: GuestErrorStorage | null | undefined,
  now: number
): boolean {
  if (!storage) return false;
  try {
    const timestamp = String(now);
    storage.setItem(GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY, timestamp);
    return storage.getItem(GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY) === timestamp;
  } catch {
    return false;
  }
}
