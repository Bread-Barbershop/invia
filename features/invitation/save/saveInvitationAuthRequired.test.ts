/**
 * @jest-environment jsdom
 */

jest.mock('./updateFileToDrive', () => ({
  updateFileToDrive: jest.fn(),
}));
jest.mock('./uploadFileToDrive', () => ({
  uploadFileToDrive: jest.fn(),
}));
jest.mock('@sentry/nextjs', () => ({
  withScope: jest.fn(),
  captureException: jest.fn(),
}));

import {
  InvitationSaveAuthRequiredError,
  isInvitationSaveAuthRequiredError,
  saveInvitationFlow,
} from './saveInvitationFlow';

import type { BulkJson } from '@/shared/types/invitationSave';

const mockFetch = jest.fn();

const bulkData: BulkJson = {
  backgroundColor: '#ffffff',
  titleData: {
    font: 'font-lineseed',
    fontSize: '20px',
    fontWeight: '700',
    color: '#111111',
    isDefault: false,
  },
  bodyData: {
    font: 'font-lineseed',
    fontSize: '16px',
    fontWeight: '500',
    color: '#222222',
    isDefault: false,
  },
  isZoom: false,
  scrollAnimation: {
    animationType: 'fade-up',
    triggerMode: 'down-only',
    animationDurationMs: 700,
    animationEasing: 'natural',
  },
};

const shareUrl = {
  title: '초대장',
  description: '초대합니다',
  images: [],
  urlTitle: '초대장',
  urlDescription: '초대합니다',
  urlImage: [],
  showLocationButton: false,
};

const bgmData = {
  selectedBgmId: null,
  isLoop: false,
  volume: 0.2,
  userBgmTitle: null,
  userBgmDuration: null,
  userBgmFileId: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch as unknown as typeof fetch;
});

it('비로그인 상태의 저장 401은 로그인 필요 오류로 구분한다', async () => {
  mockFetch.mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ message: '재로그인이 필요합니다.' }),
  });

  await expect(
    saveInvitationFlow({
      bulkData,
      images: [],
      audio: null,
      data: [],
      shareUrl,
      bgmData,
      mainPoster: { version: '7.1.0', objects: [] },
      invitationThumbnail: {
        name: 'invitation-thumbnail.png',
        mimeType: 'image/png',
        dataUrl: '',
        width: 0,
        height: 0,
        createdAt: '',
      },
    })
  ).rejects.toBeInstanceOf(InvitationSaveAuthRequiredError);

  expect(mockFetch).toHaveBeenCalledWith(
    '/api/drive/saveInvitation',
    expect.objectContaining({ method: 'POST' })
  );
});

it('401이 아닌 저장 실패는 로그인 필요 오류로 바꾸지 않는다', async () => {
  mockFetch.mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({ message: '알 수 없는 오류' }),
  });

  const failure = await saveInvitationFlow({
    bulkData,
    images: [],
    audio: null,
    data: [],
    shareUrl,
    bgmData,
    mainPoster: { version: '7.1.0', objects: [] },
    invitationThumbnail: {
      name: 'invitation-thumbnail.png',
      mimeType: 'image/png',
      dataUrl: '',
      width: 0,
      height: 0,
      createdAt: '',
    },
  }).catch((error: unknown) => error);

  expect(isInvitationSaveAuthRequiredError(failure)).toBe(false);
});
