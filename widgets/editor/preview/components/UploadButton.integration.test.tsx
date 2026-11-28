import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { rememberSavedAudioFile } from '@/features/invitation/save/savedAudioFiles';
import { updateFileToDrive } from '@/features/invitation/save/updateFileToDrive';
import { uploadFileToDrive } from '@/features/invitation/save/uploadFileToDrive';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { getFileKey } from '@/shared/utils/fileUtils';

import { mockBgmSaveApi } from '../hooks/fixtures/bgmSave';
import { useInvitationUpload } from '../hooks/useInvitationUpload';
import UploadButton from './UploadButton';

jest.mock('@/features/invitation/save/uploadFileToDrive');
jest.mock('@/features/invitation/save/updateFileToDrive');
jest.mock('@/shared/assets/logo/invia-simple-logo-3d.png', () => '/test-logo.png');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));
jest.mock('./SaveLottie', () => ({ SaveLottie: () => null }));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricViewContext: () => ({ canvas: { getObjects: () => [] } }),
  useFabricContext: () => ({
    exportIntersectedJSON: () => null,
    exportCanvasPreview: () => null,
  }),
}));

function EditorSaveButton() {
  return <UploadButton upload={useInvitationUpload()} />;
}

// 저장 버튼 → 발행 전 체크리스트 → 저장 순서로 실제 저장을 시작한다.
const startSave = () => {
  fireEvent.click(screen.getByRole('button', { name: '모두 저장하기' }));
  fireEvent.click(screen.getByRole('button', { name: '그대로 저장하기' }));
};

const originalFetch = global.fetch;
const tick = (ms: number) => act(() => jest.advanceTimersByTimeAsync(ms));

describe('모두 저장하기 진행 단계', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(uploadFileToDrive).mockReset();
    jest.mocked(updateFileToDrive).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { name: 'data.json', fileId: 'data' };
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
    act(() => {
      useEditorStore.getState().reset();
      useBgmStore.getState().reset();
    });
    jest.useRealTimers();
  });

  it('기존 세션이 남아 있어도 OAuth 팝업 인증이 끝난 뒤에만 저장을 다시 시도한다', async () => {
    const prepareUrl = '/api/drive/saveInvitation';
    let saveAttempts = 0;
    global.fetch = jest.fn(async (input, init) => {
      if (input === '/api/auth/session') {
        return {
          ok: true,
          json: async () => ({ isLoggedIn: true }),
        } as Response;
      }
      if (input === prepareUrl) {
        saveAttempts += 1;
        if (saveAttempts === 1) return { ok: false, status: 401 } as Response;
      }
      return mockBgmSaveApi(input, init);
    });
    const popupFrame = document.body.appendChild(
      document.createElement('iframe')
    );
    const popup = popupFrame.contentWindow;
    jest.spyOn(window, 'open').mockReturnValue(popup);

    try {
      render(<EditorSaveButton />);
      startSave();
      await tick(0);

      const saveDialog = screen.getByRole('dialog', {
        name: '저장을 위해 Google 로그인이 필요해요',
      });
      fireEvent.click(
        within(saveDialog).getByRole('button', { name: /계속하기/ })
      );
      fireEvent.click(screen.getByRole('button', { name: '알겠어요' }));
      const loginButtons = screen
        .getAllByRole('button', { name: /계속하기/ })
        .filter(button => !saveDialog.contains(button));
      expect(loginButtons).toHaveLength(1);
      fireEvent.click(loginButtons[0]);

      fireEvent.focus(window);
      await tick(0);
      expect(saveAttempts).toBe(1);

      fireEvent(
        window,
        new MessageEvent('message', {
          origin: window.location.origin,
          source: window,
          data: { type: 'GOOGLE_OAUTH_SUCCESS' },
        })
      );
      await tick(0);
      expect(saveAttempts).toBe(1);

      fireEvent(
        window,
        new MessageEvent('message', {
          origin: window.location.origin,
          source: popup,
          data: { type: 'GOOGLE_OAUTH_SUCCESS' },
        })
      );
      await tick(100);

      expect(saveAttempts).toBe(2);
      expect(
        screen.getByText('성공적으로 저장되었습니다!')
      ).toBeInTheDocument();
    } finally {
      popupFrame.remove();
    }
  });

  it('새 사진과 음원을 전송하는 시점에 문구를 바꾸고 사진 수량을 별도로 표시한다', async () => {
    global.fetch = jest.fn(async (input, init) => {
      if (input === '/api/drive/saveInvitation') {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return mockBgmSaveApi(input, init);
    });
    const cached = new File([], 'saved.jpg');
    const fast = new File([], 'fast.jpg');
    const slow = new File([], 'slow.jpg');
    const retry = new File([], 'retry.jpg');
    const audio = new File([], 'music.mp3');
    const file = ['/images/sample.webp', cached, fast, slow, retry];
    useEditorStore.setState({
      images: [{ id: 'gallery', file }],
      hashFiles: [`${await getFileKey(cached, 'gallery')}::saved-id`],
    });
    useBgmStore.setState({ userFile: audio, selectedBgmId: 'user-bgm' });
    let failOnce = true;
    const upload = jest
      .mocked(uploadFileToDrive)
      .mockImplementation(async item => {
        await new Promise(resolve =>
          setTimeout(resolve, item === slow ? 3000 : 100)
        );
        if (item === retry && failOnce) {
          failOnce = false;
          throw new Error('Drive upload failed: 503');
        }
        return { fileId: item.name, name: item.name };
      });
    render(<EditorSaveButton />);

    startSave();
    await tick(0);
    expect(screen.getByRole('status')).toHaveTextContent(
      '초대장을 저장할 준비를 하고 있어요.'
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    await tick(50);
    const bar = screen.getByRole('progressbar', { name: '사진 업로드' });
    expect(bar).toHaveAttribute('max', '3');
    expect(bar).toHaveAttribute('value', '0');
    expect(screen.getByText('사진을 업로드하는 중이에요.')).toBeInTheDocument();

    await tick(100);
    expect(screen.getByText('3장 중 1장 완료')).toBeInTheDocument();
    expect(bar).toHaveAttribute('value', '1');
    expect(bar).toHaveAttribute('aria-valuetext', '3장 중 1장 완료');
    await tick(2900);
    expect(
      screen.getByText('사진을 다시 업로드하는 중이에요.')
    ).toBeInTheDocument();
    expect(bar).toHaveAttribute('value', '2');
    expect(upload.mock.calls.map(([item]) => item)).toEqual([
      fast,
      slow,
      retry,
      retry,
    ]);
    await tick(100);
    expect(screen.getByRole('status')).toHaveTextContent(
      '배경음악을 업로드하는 중이에요.'
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText(/3장 중/)).not.toBeInTheDocument();
    expect(upload).toHaveBeenLastCalledWith(audio, 'invitation-audio', 'test');
    await tick(100);
    expect(screen.getByRole('status')).toHaveTextContent(
      '마지막으로 초대장을 저장하는 중이에요.'
    );
    expect(
      screen.queryByText('배경음악을 업로드하는 중이에요.')
    ).not.toBeInTheDocument();
    await tick(100);
    expect(screen.getByText('성공적으로 저장되었습니다!')).toBeInTheDocument();
  });

  it.each([null, 'user-bgm'])(
    '선택 상태가 %s이고 전송할 음원이 없으면 바로 초대장을 저장한다',
    async selectedBgmId => {
      global.fetch = jest.fn(mockBgmSaveApi);
      const audio = new File([], 'music.mp3');
      if (selectedBgmId === 'user-bgm') {
        rememberSavedAudioFile(audio, 'invitation-audio', 'saved-audio');
      }
      useBgmStore.setState({ userFile: audio, selectedBgmId });
      render(<EditorSaveButton />);

      startSave();
      await tick(0);

      expect(screen.getByRole('status')).toHaveTextContent(
        '마지막으로 초대장을 저장하는 중이에요.'
      );
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(uploadFileToDrive).not.toHaveBeenCalled();
      await tick(100);
    }
  );
});
