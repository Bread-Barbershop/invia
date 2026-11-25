/**
 * 초대장 갤러리 사진 저장 유틸리티.
 *
 * 흐름: 이미지를 blob으로 받아 기기 다운로드로 저장하고,
 * CORS/인증 문제로 blob 요청이 막히면(구글 드라이브·서드파티 CDN 등)
 * 같은 이미지 URL을 새 탭에서 열어 사용자가 직접 저장할 수 있게 합니다.
 */
export type PhotoSaveOutcome = 'saved' | 'opened' | 'failed';

export const PHOTO_FILE_PREFIX = 'invia-photo';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/svg+xml': 'svg',
};

const KNOWN_EXTENSIONS = new Set(Object.values(MIME_EXTENSIONS));

/**
 * 저장 파일 확장자를 정합니다. blob의 MIME 타입을 우선하고,
 * 없으면 URL 경로의 확장자를 사용하며, 판단할 수 없으면 jpg로 저장합니다.
 */
export function photoFileExtension(src: string, mimeType?: string): string {
  const normalizedMime = mimeType?.split(';')[0].trim().toLowerCase();
  if (normalizedMime && MIME_EXTENSIONS[normalizedMime]) {
    return MIME_EXTENSIONS[normalizedMime];
  }

  const pathWithoutQuery = (src ?? '').split(/[?#]/)[0];
  const match = /\.([a-zA-Z0-9]{2,5})$/.exec(pathWithoutQuery);
  const candidate = match?.[1]?.toLowerCase();

  if (candidate && KNOWN_EXTENSIONS.has(candidate)) {
    return candidate === 'jpeg' ? 'jpg' : candidate;
  }
  return 'jpg';
}

/**
 * 기기에 저장될 파일명을 만듭니다. 예: invia-photo-01.jpg
 * @param index 0부터 시작하는 사진 순번
 */
export function buildPhotoFileName(
  src: string,
  index: number,
  mimeType?: string
): string {
  const safeIndex = Number.isFinite(index) ? Math.max(0, Math.trunc(index)) : 0;
  const order = String(safeIndex + 1).padStart(2, '0');
  return `${PHOTO_FILE_PREFIX}-${order}.${photoFileExtension(src, mimeType)}`;
}

/** 이미지 URL을 blob으로 받아옵니다. CORS 거부·HTTP 오류·이미지가 아니면 throw 합니다. */
export async function fetchPhotoBlob(src: string): Promise<Blob> {
  if (!src) throw new Error('이미지 주소가 없습니다.');

  const response = await fetch(src, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`이미지를 불러오지 못했습니다. (${response.status})`);
  }

  const blob = await response.blob();
  const type = blob.type?.toLowerCase() ?? '';
  if (type && !type.startsWith('image/')) {
    throw new Error('이미지 응답이 아닙니다.');
  }
  return blob;
}

function createHiddenAnchor(href: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.style.display = 'none';
  anchor.setAttribute('data-invia-photo-action', 'true');
  document.body.appendChild(anchor);
  return anchor;
}

/** blob URL을 기기 다운로드로 저장합니다. */
function startBlobDownload(objectUrl: string, fileName: string) {
  const anchor = createHiddenAnchor(objectUrl);
  anchor.download = fileName;
  anchor.rel = 'noopener';
  anchor.click();
  anchor.remove();
}

/** blob 요청이 막혔을 때 원본 이미지를 새 탭에서 엽니다. */
function openPhotoInNewTab(src: string): PhotoSaveOutcome {
  if (typeof document === 'undefined' || !src) return 'failed';

  const anchor = createHiddenAnchor(src);
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.click();
  anchor.remove();
  return 'opened';
}

/**
 * 사진 저장을 수행합니다.
 * 1) blob 다운로드 시도 → 2) 실패하면 새 탭 열기 → 3) 그것도 불가하면 failed.
 */
export async function savePhotoToDevice(
  src: string,
  index: number
): Promise<PhotoSaveOutcome> {
  if (typeof document === 'undefined' || !src) return 'failed';

  let blob: Blob | null = null;
  try {
    blob = await fetchPhotoBlob(src);
  } catch {
    blob = null;
  }

  if (blob) {
    try {
      const objectUrl = URL.createObjectURL(blob);
      startBlobDownload(objectUrl, buildPhotoFileName(src, index, blob.type));
      // 일부 브라우저는 다운로드가 시작되기 전에 URL을 해제하면 저장을 취소합니다.
      globalThis.setTimeout(() => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // 이미 해제된 URL은 무시합니다.
        }
      }, 15000);
      return 'saved';
    } catch {
      // createObjectURL 미지원 등 → 새 탭 열기로 폴백
    }
  }

  return openPhotoInNewTab(src);
}
