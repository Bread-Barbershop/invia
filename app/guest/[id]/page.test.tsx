/**
 * @jest-environment node
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const notFoundMock = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

const loadGuestPayloadMock = jest.fn();

jest.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

jest.mock('@/app/api/drive/_lib/audienceLinkStore', () => ({
  readAudienceVisibility: async () => null,
}));

jest.mock('@/app/guest/[id]/server/loadGuestPayload', () => ({
  loadGuestPayload: (id: string) => loadGuestPayloadMock(id),
}));

jest.mock('@/app/guest/[id]/components/GuestInvitationView', () => ({
  __esModule: true,
  default: ({ payload }: { payload: unknown; mode?: string }) => (
    <div data-testid="guest-invitation-view">
      {JSON.stringify(payload)}
    </div>
  ),
}));

import GuestPage, { generateMetadata } from './page';

describe('GuestPage (/guest/[id])', () => {
  const payload = {
    mainPoster: {
      version: '1.0.0',
      objects: [],
      thumbnailFileId: null,
    },
    blocks: [],
    bgm: {
      selectedBgmId: null,
      volume: 0.2,
      isLoop: true,
      userBgmTitle: null,
      userBgmDuration: null,
      userBgmFileId: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders guest invitation view when payload is loaded successfully without poster preload link', async () => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'ok',
      payload,
      warnings: [],
    });

    const pageElement = await GuestPage({
      params: Promise.resolve({ id: 'guest-file-123' }),
    });
    const html = renderToStaticMarkup(pageElement);

    expect(html).toContain('data-testid="guest-invitation-view"');
    expect(html).not.toContain('rel="preload"');
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it('renders a single preload link for the main poster image when thumbnailFileId is present', async () => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'ok',
      payload: {
        ...payload,
        mainPoster: {
          thumbnailFileId: 'poster-file-12345',
        },
      },
      warnings: [],
    });

    const pageElement = await GuestPage({
      params: Promise.resolve({ id: 'guest-file-123' }),
    });
    const html = renderToStaticMarkup(pageElement);

    expect(html).toContain('rel="preload"');
    expect(html).toContain('as="image"');
    expect(html).toContain(
      'https://lh3.googleusercontent.com/d/poster-file-12345'
    );
    expect(html.toLowerCase()).toContain('fetchpriority="high"');

    // Preload link should appear exactly once (no duplicate preload)
    const matches = html.match(/rel="preload"/g);
    expect(matches).toHaveLength(1);
  });

  it('calls notFound when payload status is not-found', async () => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'not-found',
    });

    await expect(
      GuestPage({
        params: Promise.resolve({ id: 'non-existing-id' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it('renders private notice when payload status is private', async () => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'private',
    });

    const pageElement = await GuestPage({
      params: Promise.resolve({ id: 'private-id' }),
    });
    const html = renderToStaticMarkup(pageElement);

    expect(html).toContain('비공개');
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it.each([
    { title: '', fields: [], expected: '한 해의 마지막 식탁' },
    { title: '직접 쓴 제목', fields: [], expected: '직접 쓴 제목' },
    { title: '', fields: ['name'], expected: '초대장이 도착했어요.' },
  ])('공유 제목과 개인정보 설정에 맞는 행사 제목을 표시한다 ($expected)', async ({ title, fields, expected }) => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'ok', warnings: [], payload: {
        ...payload,
        blocks: [{ component: 'closingComment', props: { eventName: '한 해의 마지막 식탁' } }],
        activePrivacyFields: fields,
        shareUrl: { urlTitle: title },
      },
    });
    const metadata = await generateMetadata({ params: Promise.resolve({ id: 'guest-file-123' }) });
    expect(metadata.title).toBe(expected);
    expect(metadata.openGraph?.title).toBe(expected);
  });

  it('generates metadata from the resolved guest payload', async () => {
    loadGuestPayloadMock.mockResolvedValue({
      status: 'ok',
      payload,
      warnings: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: 'guest-file-123' }),
    });

    expect(metadata.title).toBe('초대장이 도착했어요.');
    expect(metadata.description).toBe('일정과 장소를 초대장에서 확인해 주세요.');
  });

  it('기본 문구를 링크 제목으로 직접 입력한 경우 카카오 제목과 독립적으로 표시한다', async () => {
    const linkTitle = '소중한 분들을 초대합니다.';
    loadGuestPayloadMock.mockResolvedValue({
      status: 'ok',
      payload: {
        ...payload,
        shareUrl: { titleFormat: 'raw', title: '카카오 제목', urlTitle: linkTitle },
      },
      warnings: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: 'guest-file-123' }),
    });

    expect(metadata).toMatchObject({
      title: linkTitle,
      openGraph: { title: linkTitle },
    });
  });
});
