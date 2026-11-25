import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { savePhotoToDevice } from '@/shared/utils/photoDownload';
import { sharePhotoLink } from '@/shared/utils/photoShare';

import {
  PHOTO_ACTION_MESSAGES,
  PhotoViewerActions,
} from './PhotoViewerActions';

jest.mock('@/shared/utils/photoDownload', () => ({
  savePhotoToDevice: jest.fn(),
}));
jest.mock('@/shared/utils/photoShare', () => ({
  sharePhotoLink: jest.fn(),
}));

const mockSavePhotoToDevice = savePhotoToDevice as jest.MockedFunction<
  typeof savePhotoToDevice
>;
const mockSharePhotoLink = sharePhotoLink as jest.MockedFunction<
  typeof sharePhotoLink
>;

const renderActions = (
  overrides: Partial<React.ComponentProps<typeof PhotoViewerActions>> = {}
) =>
  render(
    <PhotoViewerActions
      imageSrc="https://cdn.example.com/wedding/photo.jpg"
      index={0}
      {...overrides}
    />
  );

describe('PhotoViewerActions (라이트박스 사진 저장·공유)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSavePhotoToDevice.mockResolvedValue('saved');
    mockSharePhotoLink.mockResolvedValue('shared');
  });

  it('사진 저장 / 공유하기 버튼을 노출한다', () => {
    renderActions();

    expect(
      screen.getByRole('button', { name: '사진 저장' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '사진 공유하기' })
    ).toBeInTheDocument();
  });

  it('저장에 성공하면 저장 안내를 보여준다', async () => {
    renderActions({ index: 2 });

    fireEvent.click(screen.getByRole('button', { name: '사진 저장' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        PHOTO_ACTION_MESSAGES.saved
      )
    );
    expect(mockSavePhotoToDevice).toHaveBeenCalledWith(
      'https://cdn.example.com/wedding/photo.jpg',
      2
    );
  });

  it('blob 요청이 막혀 새 탭에서 연 경우에도 안내를 보여준다', async () => {
    mockSavePhotoToDevice.mockResolvedValue('opened');
    renderActions();

    fireEvent.click(screen.getByRole('button', { name: '사진 저장' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        PHOTO_ACTION_MESSAGES.opened
      )
    );
  });

  it('저장에 실패하면 실패 안내를 보여준다', async () => {
    mockSavePhotoToDevice.mockResolvedValue('failed');
    renderActions();

    fireEvent.click(screen.getByRole('button', { name: '사진 저장' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        PHOTO_ACTION_MESSAGES.saveFailed
      )
    );
  });

  it('저장 중에는 버튼이 비활성화되어 중복 저장을 막는다', async () => {
    let resolveSave: (() => void) | undefined;
    mockSavePhotoToDevice.mockImplementation(
      () =>
        new Promise<'saved'>(resolve => {
          resolveSave = () => resolve('saved');
        })
    );
    renderActions();

    const saveButton = screen.getByRole('button', { name: '사진 저장' });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).toBeDisabled());
    expect(saveButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('저장 중')).toBeInTheDocument();

    fireEvent.click(saveButton);
    expect(mockSavePhotoToDevice).toHaveBeenCalledTimes(1);

    resolveSave?.();
    await waitFor(() => expect(saveButton).toBeEnabled());
  });

  it('공유 시트로 공유하면 공유 안내를 보여준다', async () => {
    renderActions({
      shareUrl: 'https://dev.invia.co.kr/inv/abc',
      shareTitle: '결혼식 초대장',
    });

    fireEvent.click(screen.getByRole('button', { name: '사진 공유하기' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        PHOTO_ACTION_MESSAGES.shared
      )
    );
    expect(mockSharePhotoLink).toHaveBeenCalledWith({
      url: 'https://dev.invia.co.kr/inv/abc',
      title: '결혼식 초대장',
    });
  });

  it('공유 시트가 없어 링크를 복사하면 복사 안내를 보여준다', async () => {
    mockSharePhotoLink.mockResolvedValue('copied');
    renderActions();

    fireEvent.click(screen.getByRole('button', { name: '사진 공유하기' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        PHOTO_ACTION_MESSAGES.copied
      )
    );
  });

  it('공유할 링크가 없으면 현재 페이지 주소를 사용한다', async () => {
    renderActions();

    fireEvent.click(screen.getByRole('button', { name: '사진 공유하기' }));

    await waitFor(() => expect(mockSharePhotoLink).toHaveBeenCalled());
    expect(mockSharePhotoLink.mock.calls[0][0].url).toBe(window.location.href);
  });

  it('공유를 취소하면 아무 안내도 남기지 않는다', async () => {
    mockSharePhotoLink.mockResolvedValue('canceled');
    renderActions();

    fireEvent.click(screen.getByRole('button', { name: '사진 공유하기' }));

    await waitFor(() => expect(mockSharePhotoLink).toHaveBeenCalled());
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('복사까지 실패하면 실패 안내를 보여준다', async () => {
    mockSharePhotoLink.mockResolvedValue('failed');
    renderActions();

    fireEvent.click(screen.getByRole('button', { name: '사진 공유하기' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        PHOTO_ACTION_MESSAGES.shareFailed
      )
    );
  });

  it('다른 사진으로 넘어가면 이전 사진의 안내를 지운다', async () => {
    const { rerender } = renderActions();
    fireEvent.click(screen.getByRole('button', { name: '사진 저장' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        PHOTO_ACTION_MESSAGES.saved
      )
    );

    rerender(
      <PhotoViewerActions
        imageSrc="https://cdn.example.com/wedding/photo2.jpg"
        index={1}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});
