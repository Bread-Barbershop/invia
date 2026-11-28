import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import UploadButton from './UploadButton';

const mockGetObjects = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), refresh: jest.fn() }),
}));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricViewContext: () => ({ canvas: { getObjects: mockGetObjects } }),
}));
jest.mock('./SaveModal', () => ({ SaveModal: () => null }));

const createUpload = (overrides: Record<string, unknown> = {}) => ({
  handleUpload: jest.fn(),
  isLoading: false,
  isFail: false,
  isAuthRequired: false,
  isDraftPersisted: false,
  isCleaningUp: false,
  pendingInvitation: null,
  loadingMessage: '',
  photoProgress: undefined,
  ...overrides,
});

const pressSaveShortcut = (init: {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  isComposing?: boolean;
}) => {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  act(() => {
    document.body.dispatchEvent(event);
  });
  return event;
};

beforeEach(() => {
  jest.clearAllMocks();
  useEditorStore.getState().reset();
  mockGetObjects.mockReturnValue([{ text: '고관우 · 라니' }]);
  document.body.innerHTML = '';
});

it('저장 버튼에 Ctrl+S / ⌘+S 단축키를 알려 주는 안내가 붙어 있다', () => {
  render(<UploadButton upload={createUpload()} />);
  const button = screen.getByRole('button', { name: '모두 저장하기' });

  expect(button).toHaveAttribute('aria-keyshortcuts', 'Control+S Meta+S');
  expect(button).toHaveAttribute('title', '모두 저장하기 (Ctrl+S / ⌘+S)');
  expect(button).toHaveTextContent('Ctrl+S');
});

it('Ctrl+S 로 버튼과 같은 체크리스트를 거쳐 저장한다', async () => {
  const upload = createUpload();
  mockGetObjects.mockReturnValue([
    { text: '고관우 · 라니' },
    { text: '8TH AUGUST 2026' },
  ]);
  render(<UploadButton upload={upload} />);

  const event = pressSaveShortcut({ key: 's', ctrlKey: true });

  expect(event.defaultPrevented).toBe(true);
  const dialog = await screen.findByRole('dialog', { name: '발행 전 체크리스트' });
  expect(dialog).toHaveTextContent('표지에 예시 문구가 남아 있어요');

  fireEvent.click(screen.getByRole('button', { name: '그대로 저장하기' }));
  await waitFor(() => expect(upload.handleUpload).toHaveBeenCalledTimes(1));
});

it('⌘+S 로도 체크리스트를 거쳐 저장을 시작한다', async () => {
  const upload = createUpload();
  render(<UploadButton upload={upload} />);

  pressSaveShortcut({ key: 'S', metaKey: true });

  await waitFor(() =>
    expect(upload.handleUpload).not.toHaveBeenCalled()
  );
  fireEvent.click(await screen.findByRole('button', { name: '그대로 저장하기' }));
  await waitFor(() => expect(upload.handleUpload).toHaveBeenCalledTimes(1));
});

it('체크리스트에서 돌아가기를 고르면 저장하지 않는다', async () => {
  const upload = createUpload();
  render(<UploadButton upload={upload} />);

  pressSaveShortcut({ key: 's', ctrlKey: true });

  fireEvent.click(
    await screen.findByRole('button', { name: '돌아가서 고치기' })
  );
  expect(upload.handleUpload).not.toHaveBeenCalled();
});

it('이미 저장 중이면 단축키로 다시 저장하지 않는다', () => {
  const upload = createUpload({ isLoading: true });
  render(<UploadButton upload={upload} />);

  const event = pressSaveShortcut({ key: 's', ctrlKey: true });

  expect(event.defaultPrevented).toBe(true);
  expect(
    screen.queryByRole('dialog', { name: '발행 전 체크리스트' })
  ).not.toBeInTheDocument();
  expect(upload.handleUpload).not.toHaveBeenCalled();
});

it('다른 모달이 열려 있으면 단축키로 저장하지 않는다', () => {
  const upload = createUpload();
  render(<UploadButton upload={upload} />);
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div role="dialog" aria-modal="true">블록을 삭제할까요?</div>'
  );

  pressSaveShortcut({ key: 's', ctrlKey: true });

  expect(
    screen.queryByRole('dialog', { name: '발행 전 체크리스트' })
  ).not.toBeInTheDocument();
  expect(upload.handleUpload).not.toHaveBeenCalled();
});

it('Shift·Alt 조합이나 한글 조합 중에는 저장하지 않는다', () => {
  const upload = createUpload();
  render(<UploadButton upload={upload} />);

  pressSaveShortcut({ key: 's', ctrlKey: true, shiftKey: true });
  pressSaveShortcut({ key: 's', metaKey: true, altKey: true });
  pressSaveShortcut({ key: 's', ctrlKey: true, isComposing: true });

  expect(
    screen.queryByRole('dialog', { name: '발행 전 체크리스트' })
  ).not.toBeInTheDocument();
  expect(upload.handleUpload).not.toHaveBeenCalled();
});

it('버튼 클릭도 단축키와 같은 체크리스트를 연다', async () => {
  const upload = createUpload();
  render(<UploadButton upload={upload} />);

  fireEvent.click(screen.getByRole('button', { name: '모두 저장하기' }));

  const dialog = await screen.findByRole('dialog', { name: '발행 전 체크리스트' });
  expect(dialog).toHaveTextContent('발행 전 체크리스트');
  expect(upload.handleUpload).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: '그대로 저장하기' }));
  await waitFor(() => expect(upload.handleUpload).toHaveBeenCalledTimes(1));
});
