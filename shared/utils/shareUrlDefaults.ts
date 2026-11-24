import { ShareUrlState } from '@/shared/types/block';

import { isJsonRecord } from './json';

/** 공유 썸네일 기본값 SSOT */
export const DEFAULT_TITLE = '초대장이 도착했어요.';
export const DEFAULT_DESCRIPTION =
  '일정과 장소를 초대장에서 확인해 주세요.';
export const DEFAULT_IMAGE_URL = '/opengraph-image.png';

const DRIVE_IMAGE_BASE_URL = 'https://lh3.googleusercontent.com/d/';

const normalizeSharePublicOrigin = (origin?: string) =>
  origin?.trim().replace(/\/$/, '') ?? '';

export function resolveShareTitle(title?: string | null): string {
  return title?.trim() || DEFAULT_TITLE;
}

export function readShareTitleInputs(shareUrl?: unknown) {
  const share = isJsonRecord(shareUrl) ? shareUrl : {};
  const readTitle = (value: unknown) =>
    typeof value === 'string' &&
    (share.titleFormat === 'raw' || value.trim() !== DEFAULT_TITLE)
      ? value
      : '';

  return {
    titleFormat: 'raw' as const,
    title: readTitle(share.title),
    urlTitle: readTitle(share.urlTitle),
  };
}

export function resolveInvitationShareTitles(shareUrl?: unknown) {
  const { title, urlTitle } = readShareTitleInputs(shareUrl);
  const kakao = title.trim();
  const link = urlTitle.trim();
  return {
    kakaoTitle: kakao || link || DEFAULT_TITLE,
    linkTitle: link || kakao || DEFAULT_TITLE,
  };
}

export function resolveStoredKakaoTitle(
  metadata: { title: string; titleInput?: string },
  shareUrl?: unknown
) {
  if (!isJsonRecord(shareUrl)) return metadata.title;
  if (
    typeof shareUrl.title !== 'string' &&
    typeof shareUrl.urlTitle !== 'string'
  ) {
    return metadata.title;
  }

  const legacyTitle = metadata.title.trim();
  // Older Kakao metadata can contain a custom title from kakao-share.json.
  if (
    shareUrl.titleFormat !== 'raw' &&
    metadata.titleInput === undefined &&
    legacyTitle &&
    legacyTitle !== DEFAULT_TITLE
  ) {
    return metadata.title;
  }
  return resolveInvitationShareTitles(shareUrl).kakaoTitle;
}

export function resolveShareDescription(description?: string | null): string {
  return description?.trim() || DEFAULT_DESCRIPTION;
}

export function resolveShareImageUrl(
  imageFileId?: string | null,
  origin?: string
): string {
  const normalizedFileId = imageFileId?.trim();

  if (normalizedFileId) {
    return `${DRIVE_IMAGE_BASE_URL}${normalizedFileId}`;
  }

  const publicOrigin =
    normalizeSharePublicOrigin(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeSharePublicOrigin(origin);

  return publicOrigin
    ? `${publicOrigin}${DEFAULT_IMAGE_URL}`
    : DEFAULT_IMAGE_URL;
}

export const createDefaultShareUrlState = (): ShareUrlState => ({
  titleFormat: 'raw',
  title: '',
  description: '',
  images: [],
  urlTitle: '',
  urlDescription: '',
  urlImage: [],
  showLocationButton: false,
  locationInfo: {
    lat: 0,
    lng: 0,
    placeName: '',
  },
});

export function hydrateShareUrlState(
  shareUrl?: Partial<ShareUrlState>
): ShareUrlState {
  return {
    ...createDefaultShareUrlState(),
    ...shareUrl,
    ...readShareTitleInputs(shareUrl),
  };
}
