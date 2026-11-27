/**
 * 목적:
 * 하객 초대장 오류 화면(error.tsx)이 어떤 문구와 동작을 고르는지 결정하는 순수 함수들을 검증한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) 배포 직후 청크 로딩 실패만 "stale"로 잡고, 일반 네트워크 실패는 잡지 않는지
 * 2) 오프라인일 때는 오류 종류와 상관없이 연결 안내를 먼저 보여주는지
 * 3) 자동 새로 고침을 이미 한 번 했으면 쿨다운 동안은 다시 하지 않는지
 * 4) 저장소가 막혀 있어도(사파리 프라이빗 모드) 예외 없이 안내만 하는지
 */

import {
  GUEST_ERROR_AUTO_RELOAD_COOLDOWN_MS,
  GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY,
  isChunkLoadError,
  markGuestErrorAutoReload,
  readGuestErrorAutoReloadAt,
  resolveGuestLoadErrorCopy,
  shouldAutoReloadGuestPage,
} from './guestLoadError';

function makeChunkError() {
  const error = new Error(
    'Loading chunk 4821 failed. (missing: https://dev.invia.co.kr/_next/static/chunks/4821.js)'
  );
  error.name = 'ChunkLoadError';
  return error;
}

function makeMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: jest.fn((key: string) => store.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
  };
}

describe('isChunkLoadError', () => {
  it('detects ChunkLoadError and dynamic import failures', () => {
    expect(isChunkLoadError(makeChunkError())).toBe(true);
    expect(
      isChunkLoadError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://dev.invia.co.kr/_next/static/chunks/app.js'
        )
      )
    ).toBe(true);
    expect(
      isChunkLoadError(new Error('Importing a module script failed.'))
    ).toBe(true);
    expect(isChunkLoadError('error loading dynamically imported module')).toBe(
      true
    );
  });

  it('treats ordinary network and rendering errors as not chunk errors', () => {
    expect(isChunkLoadError(new Error('NetworkError when attempting to fetch resource.'))).toBe(
      false
    );
    expect(isChunkLoadError(new TypeError('Failed to fetch'))).toBe(false);
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(
      false
    );
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
    expect(isChunkLoadError({})).toBe(false);
  });
});

describe('resolveGuestLoadErrorCopy', () => {
  it('asks the guest to check the connection while offline', () => {
    const copy = resolveGuestLoadErrorCopy({
      error: makeChunkError(),
      online: false,
      autoReloadSkipped: false,
    });

    expect(copy.mode).toBe('offline');
    expect(copy.title).toBe('인터넷 연결을 확인해 주세요');
    expect(copy.description).toContain('자동으로 다시 불러올게요');
    expect(copy.primaryAction).toBe('reset');
  });

  it('explains the automatic refresh for a stale chunk error', () => {
    const copy = resolveGuestLoadErrorCopy({
      error: makeChunkError(),
      online: true,
      autoReloadSkipped: false,
    });

    expect(copy.mode).toBe('stale');
    expect(copy.title).toBe('초대장을 새로 불러오는 중이에요');
    expect(copy.primaryLabel).toBe('새로 고침');
    expect(copy.primaryAction).toBe('reload');
    expect(copy.secondaryAction).toBeNull();
  });

  it('offers a manual refresh when the automatic refresh was already used', () => {
    const copy = resolveGuestLoadErrorCopy({
      error: makeChunkError(),
      online: true,
      autoReloadSkipped: true,
    });

    expect(copy.title).toBe('초대장을 새로 고치지 못했어요');
    expect(copy.primaryAction).toBe('reload');
    expect(copy.secondaryLabel).toBe('다시 시도하기');
    expect(copy.secondaryAction).toBe('reset');
  });

  it('keeps the generic retry screen for other errors', () => {
    const copy = resolveGuestLoadErrorCopy({
      error: new Error('boom'),
      online: true,
      autoReloadSkipped: false,
    });

    expect(copy.mode).toBe('generic');
    expect(copy.title).toBe('초대장을 불러오지 못했어요');
    expect(copy.primaryAction).toBe('reset');
    expect(copy.secondaryAction).toBe('reload');
    expect(copy.hint).toContain('새 링크를 받아 주세요');
  });
});

describe('shouldAutoReloadGuestPage', () => {
  const now = 1_700_000_000_000;

  it('reloads once for a chunk error while online', () => {
    expect(
      shouldAutoReloadGuestPage({
        error: makeChunkError(),
        online: true,
        lastAutoReloadAt: null,
        now,
      })
    ).toBe(true);
  });

  it('never reloads automatically while offline or for other errors', () => {
    expect(
      shouldAutoReloadGuestPage({
        error: makeChunkError(),
        online: false,
        lastAutoReloadAt: null,
        now,
      })
    ).toBe(false);
    expect(
      shouldAutoReloadGuestPage({
        error: new Error('boom'),
        online: true,
        lastAutoReloadAt: null,
        now,
      })
    ).toBe(false);
  });

  it('저장소의 기록을 읽을 수 없으면 자동 새로 고침을 하지 않는다', () => {
    expect(
      shouldAutoReloadGuestPage({
        error: makeChunkError(),
        online: true,
        lastAutoReloadAt: undefined,
        now,
      })
    ).toBe(false);
  });

  it('stays inside the cooldown so the page cannot reload in a loop', () => {
    expect(
      shouldAutoReloadGuestPage({
        error: makeChunkError(),
        online: true,
        lastAutoReloadAt: now - 1_000,
        now,
      })
    ).toBe(false);
    expect(
      shouldAutoReloadGuestPage({
        error: makeChunkError(),
        online: true,
        lastAutoReloadAt: now - GUEST_ERROR_AUTO_RELOAD_COOLDOWN_MS,
        now,
      })
    ).toBe(true);
  });
});

describe('auto reload storage helpers', () => {
  it('reads back the timestamp it wrote', () => {
    const storage = makeMemoryStorage();

    expect(markGuestErrorAutoReload(storage, 1_700_000_000_000)).toBe(true);

    expect(storage.setItem).toHaveBeenCalledWith(
      GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY,
      '1700000000000'
    );
    expect(readGuestErrorAutoReloadAt(storage)).toBe(1_700_000_000_000);
  });

  it('기록이 없거나 잘못된 값이면 null을 반환한다', () => {
    expect(readGuestErrorAutoReloadAt(makeMemoryStorage())).toBeNull();
    expect(
      readGuestErrorAutoReloadAt(
        makeMemoryStorage({ [GUEST_ERROR_AUTO_RELOAD_STORAGE_KEY]: 'not-a-number' })
      )
    ).toBeNull();
  });

  it('저장소에 접근할 수 없으면 undefined를 반환한다', () => {
    expect(readGuestErrorAutoReloadAt(null)).toBeUndefined();
    expect(
      readGuestErrorAutoReloadAt({
        getItem: () => {
          throw new Error('SecurityError');
        },
        setItem: () => {
          throw new Error('SecurityError');
        },
      })
    ).toBeUndefined();
  });

  it('브라우저에서 저장을 막으면 기록 실패를 반환한다', () => {
    const blocked = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };

    expect(markGuestErrorAutoReload(blocked, 1)).toBe(false);
  });

  it('기록을 다시 읽을 수 있어야 저장 성공으로 간주한다', () => {
    const storage = makeMemoryStorage();
    storage.setItem.mockImplementation(() => {});

    expect(markGuestErrorAutoReload(storage, 1)).toBe(false);
  });
});
