/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from '@testing-library/react';

import useDashboardInvitations from '@/app/dashboard/hooks/useDashboardInvitations';
import type { InviteListItem } from '@/app/dashboard/types';
import {
  DASHBOARD_PENDING_INVITATION_KEY,
  type DashboardPendingInvitation,
} from '@/shared/constants/dashboardPendingInvitation';

import {
  clonedInvitation,
  sourceInvitation,
} from '../components/carousel/fixtures/dashboardCopyInvitations';

const pushMock = jest.fn();
const replaceMock = jest.fn();
const refreshMock = jest.fn();
const successToastMock = jest.fn();
const errorToastMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({
    success: successToastMock,
    error: errorToastMock,
  }),
}));

describe('useDashboardInvitations', () => {
  const mockFetch = jest.fn();
  const flushPromises = () =>
    act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
    global.fetch = mockFetch as unknown as typeof fetch;
    window.sessionStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    window.sessionStorage.clear();
  });

  it('loadInvitation이 유효하지 않은 요청을 반환하면 홈으로 이동한다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        message: '유효한 요청이 아닙니다.',
      }),
    });

    const { result } = renderHook(() => useDashboardInvitations());

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/');
    });

    expect(refreshMock).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.invites).toEqual([]);
  });

  it('초기 목록의 guestUrl을 대시보드 공유 URL로 노출한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        workspaceFolderId: 'workspace-folder-1',
        invites: [
          {
            folderId: 'folder-1',
            name: 'Invitation 1',
            createdTime: '2026-03-21T10:00:00.000Z',
            invitationUuid: 'uuid-1',
            dataJsonFileId: 'data-json-file-id-1',
            guestUrl: '/guest/data-json-file-id-1',
            published: true,
            readiness: 'ready',
          },
          {
            folderId: 'folder-2',
            name: 'Invitation 2',
            createdTime: '2026-03-20T10:00:00.000Z',
            invitationUuid: 'uuid-2',
            guestUrl: null,
            published: false,
            readiness: 'idle',
          },
        ],
        nextPageToken: null,
      }),
    });

    const { result } = renderHook(() => useDashboardInvitations());

    await waitFor(() => {
      expect(result.current.invites).toHaveLength(2);
    });

    expect(result.current.getGuestUrl('folder-1')).toBe(
      'http://localhost/guest/data-json-file-id-1'
    );
    expect(result.current.getGuestUrl('folder-2')).toBeNull();
  });

  it('Drive 목록에서 확인되기 전까지 복사본을 보존하고 이후에는 최신 목록을 따른다', async () => {
    function listResponse(invites: InviteListItem[]) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ invites }),
      };
    }

    const listWithoutClone = listResponse([sourceInvitation]);
    let deliverStaleList!: () => void;
    const staleList = new Promise(resolve => {
      deliverStaleList = () => resolve(listWithoutClone);
    });
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, invite: clonedInvitation }),
      })
      .mockResolvedValueOnce(listWithoutClone)
      .mockReturnValueOnce(staleList)
      .mockResolvedValueOnce(listResponse([clonedInvitation, sourceInvitation]))
      .mockResolvedValueOnce(listWithoutClone);

    const { result } = renderHook(() =>
      useDashboardInvitations([sourceInvitation], { loadOnMount: false })
    );
    await act(async () => {
      await result.current.handleClone(sourceInvitation.folderId, 'copy-request');
    });
    await act(() => result.current.loadInvitations());
    expect(result.current.invites.map(invite => invite.folderId)).toContain(
      clonedInvitation.folderId
    );

    let staleLoad!: Promise<void>;
    act(() => {
      staleLoad = result.current.loadInvitations();
    });
    await act(() => result.current.loadInvitations());
    await act(async () => {
      deliverStaleList();
      await staleLoad;
    });
    expect(result.current.invites.map(invite => invite.folderId)).toContain(
      clonedInvitation.folderId
    );

    await act(() => result.current.loadInvitations());
    expect(result.current.invites.map(invite => invite.folderId)).toEqual([
      sourceInvitation.folderId,
    ]);
  });

  it('더 최신 목록이 적용되면 느린 카드 새로고침의 카드와 공유 결과를 버린다', async () => {
    const initialInvite: InviteListItem = {
      ...sourceInvitation,
      folderId: 'folder-epoch',
      name: 'Initial invitation',
      dataJsonFileId: 'data-initial',
      guestUrl: '/guest/initial',
      published: true,
      readiness: 'ready',
    };
    const newerInvite: InviteListItem = {
      ...initialInvite,
      name: 'New list invitation',
      dataJsonFileId: 'data-new-list',
      guestUrl: '/guest/new-list',
    };
    const staleRefreshInvite: InviteListItem = {
      ...initialInvite,
      name: 'Stale refresh invitation',
      dataJsonFileId: 'data-stale-refresh',
      guestUrl: '/guest/stale-refresh',
    };
    const listResponse = (invites: InviteListItem[]) => ({
      ok: true,
      status: 200,
      json: async () => ({ invites }),
    });
    let finishRefresh!: () => void;
    mockFetch
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishRefresh = () => resolve(listResponse([staleRefreshInvite]));
          })
      )
      .mockResolvedValueOnce(listResponse([newerInvite]));

    const { result } = renderHook(() =>
      useDashboardInvitations([initialInvite], { loadOnMount: false })
    );
    let refresh!: Promise<boolean>;
    act(() => {
      refresh = result.current.refreshInvitation(initialInvite.folderId);
    });

    await act(() => result.current.loadInvitations());
    expect(result.current.invites[0].name).toBe('New list invitation');

    await act(async () => {
      finishRefresh();
      await expect(refresh).resolves.toBe(false);
    });

    expect(result.current.invites[0]).toMatchObject({
      name: 'New list invitation',
      dataJsonFileId: 'data-new-list',
      guestUrl: '/guest/new-list',
    });
    expect(result.current.getGuestUrl(initialInvite.folderId)).toBe(
      'http://localhost/guest/new-list'
    );
  });

  it('공개 토글 후 guestReadiness가 준비될 때까지 폴링한다', async () => {
    jest.useFakeTimers();

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: jest.fn().mockResolvedValue({
          ok: true,
          published: true,
          ready: false,
          guestUrl: '/guest/data-json-file-id-1',
          dataJsonFileId: 'data-json-file-id-1',
          warning: 'guest_not_ready_after_visibility_change',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          ok: true,
          published: true,
          ready: true,
          guestUrl: '/guest/data-json-file-id-1',
          dataJsonFileId: 'data-json-file-id-1',
        }),
      });

    const { result } = renderHook(() =>
      useDashboardInvitations(
        [
          {
            folderId: 'folder-1',
            name: 'Invitation 1',
            invitationUuid: 'uuid-1',
            guestUrl: '/guest/data-json-file-id-1',
            published: false,
            readiness: 'idle',
          },
        ],
        { loadOnMount: false }
      )
    );

    await act(async () => {
      await result.current.handleToggleVisibility('folder-1', true);
    });

    expect(result.current.invites[0]).toMatchObject({
      published: true,
      readiness: 'checking',
      isPending: true,
    });
    expect(result.current.isGuestReadinessPolling('folder-1')).toBe(true);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });

    await waitFor(() => {
      expect(result.current.isGuestReadinessPolling('folder-1')).toBe(false);
    });

    expect(result.current.invites[0]).toMatchObject({
      published: true,
      readiness: 'ready',
      guestUrl: '/guest/data-json-file-id-1',
      dataJsonFileId: 'data-json-file-id-1',
    });
    expect(result.current.getGuestUrl('folder-1')).toBe(
      'http://localhost/guest/data-json-file-id-1'
    );
    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/drive/guestReadiness?dataJsonFileId=data-json-file-id-1',
      {
        method: 'GET',
        cache: 'no-store',
        signal: expect.any(AbortSignal),
      }
    );
  });

  it('공개 전환 실패는 카드 안내로 전달하고 토스트를 띄우지 않는다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ ok: false, error: 'visibility_publish_failed' }),
    });
    const { result } = renderHook(() =>
      useDashboardInvitations([sourceInvitation], { loadOnMount: false })
    );

    await act(() =>
      result.current.handleToggleVisibility(sourceInvitation.folderId, true)
    );

    expect(result.current.getVisibilityError(sourceInvitation.folderId)).toEqual({
      title: '초대장을 공개로 바꾸지 못했어요',
      description: '공개 링크 권한을 설정하지 못했어요. 다시 시도해 주세요.',
    });
    expect(errorToastMock).not.toHaveBeenCalled();
  });

  it('sessionStorage handoff 초대장을 Drive 목록과 readiness가 준비될 때까지 pending으로 유지한다', async () => {
    jest.useFakeTimers();

    const pendingInvitation: DashboardPendingInvitation = {
      invitationFolderId: 'folder-pending',
      invitationUuid: 'uuid-pending',
      dataJsonFileId: 'data-json-file-id-pending',
      guestUrl: '/guest/data-json-file-id-pending',
      thumbnailFileId: 'thumbnail-file-id-pending',
      createdAt: '2026-06-10T10:00:00.000Z',
      published: true,
      ready: false,
    };

    window.sessionStorage.setItem(
      DASHBOARD_PENDING_INVITATION_KEY,
      JSON.stringify(pendingInvitation)
    );

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          workspaceFolderId: 'workspace-folder-1',
          invites: [],
          nextPageToken: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          workspaceFolderId: 'workspace-folder-1',
          invites: [
            {
              folderId: 'folder-pending',
              name: 'Invitation Pending',
              createdTime: '2026-06-10T10:00:00.000Z',
              invitationUuid: 'uuid-pending',
              dataJsonFileId: 'data-json-file-id-pending',
              guestUrl: '/guest/data-json-file-id-pending',
              published: true,
              readiness: 'ready',
              thumbnailUrl: null,
              hasKakaoShareData: true,
            },
          ],
          nextPageToken: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          ok: true,
          published: true,
          ready: true,
          guestUrl: '/guest/data-json-file-id-pending',
          dataJsonFileId: 'data-json-file-id-pending',
        }),
      });

    const { result } = renderHook(() =>
      useDashboardInvitations([], { loadOnMount: false })
    );

    await flushPromises();

    expect(
      window.sessionStorage.getItem(DASHBOARD_PENDING_INVITATION_KEY)
    ).toBeNull();
    expect(result.current.invites[0]).toMatchObject({
      folderId: 'folder-pending',
      dataJsonFileId: 'data-json-file-id-pending',
      guestUrl: '/guest/data-json-file-id-pending',
      readiness: 'pending',
      isPending: true,
      published: true,
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });
    await flushPromises();

    expect(result.current.invites[0]).toMatchObject({
      folderId: 'folder-pending',
      readiness: 'ready',
      isPending: false,
      published: true,
    });
    expect(result.current.getGuestUrl('folder-pending')).toBe(
      'http://localhost/guest/data-json-file-id-pending'
    );
    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/drive/guestReadiness?dataJsonFileId=data-json-file-id-pending',
      {
        method: 'GET',
        cache: 'no-store',
        signal: expect.any(AbortSignal),
      }
    );
  });
});
