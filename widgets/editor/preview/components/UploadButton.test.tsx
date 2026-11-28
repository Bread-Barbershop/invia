import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import business from '@/public/templates/json/seminar_01.v1.json';
import classic from '@/public/templates/json/wedding_10.v1.json';

import UploadButton from './UploadButton';

const mockGetObjects = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, refresh: jest.fn() }),
}));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricViewContext: () => ({ canvas: { getObjects: mockGetObjects } }),
}));
jest.mock('./SaveModal', () => ({ SaveModal: () => null }));

const upload = {
  handleUpload: jest.fn(),
  isLoading: false,
  isFail: false,
  isAuthRequired: false,
  isDraftPersisted: false,
  isCleaningUp: false,
  pendingInvitation: null,
  loadingMessage: '',
  photoProgress: undefined,
};

beforeEach(() => {
  jest.clearAllMocks();
  useEditorStore.getState().reset();
});

const openChecklist = () => {
  fireEvent.click(screen.getByRole('button', { name: '모두 저장하기' }));
  return screen.getByRole('dialog', { name: '발행 전 체크리스트' });
};

it.each([
  ['클래식 모먼트', classic],
  ['볼드 비즈니스', business],
] as const)(
  '%s 표지의 실제 예시가 남으면 저장 전에 체크리스트로 알리고 돌아갈 수 있다',
  async (_, template) => {
    mockGetObjects.mockReturnValue(template.objects);
    render(<UploadButton upload={upload} />);

    const dialog = openChecklist();

    expect(dialog).toHaveTextContent('표지에 예시 문구가 남아 있어요');
    fireEvent.click(screen.getByRole('button', { name: '돌아가서 고치기' }));

    expect(upload.handleUpload).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('dialog', { name: '발행 전 체크리스트' })
    ).not.toBeInTheDocument();
  }
);

it('편집한 문구와 장식 제목만 있으면 예시 문구 항목 없이 저장할 수 있다', async () => {
  mockGetObjects.mockReturnValue([
    { text: 'WEDDING DAY' },
    { text: '고관우 · 라니' },
    { text: '2027-05-22' },
  ]);
  render(<UploadButton upload={upload} />);

  const dialog = openChecklist();

  expect(dialog).not.toHaveTextContent('예시 문구');
  fireEvent.click(screen.getByRole('button', { name: '그대로 저장하기' }));
  await waitFor(() => expect(upload.handleUpload).toHaveBeenCalledTimes(1));
});

it('일부만 수정해도 남은 예시를 표시하고 그대로 저장을 허용한다', async () => {
  mockGetObjects.mockReturnValue([
    { text: '고관우 · 라니' },
    { text: '8TH AUGUST 2026' },
    { text: 'Speaker — Andrew Jackson', visible: false },
    { text: 'MINSUNG PARK', isOnScreen: () => false },
  ]);
  render(<UploadButton upload={upload} />);

  const dialog = openChecklist();
  const exampleItem = screen.getByRole('button', { name: /예시 문구가 남아 있어요/ });

  expect(exampleItem).toHaveTextContent('8TH AUGUST 2026');
  expect(exampleItem).not.toHaveTextContent('Andrew');
  expect(exampleItem).not.toHaveTextContent('MINSUNG');
  expect(exampleItem).not.toHaveTextContent('고관우');
  expect(dialog).toHaveTextContent('꼭 확인해 주세요');

  fireEvent.click(screen.getByRole('button', { name: '그대로 저장하기' }));
  await waitFor(() => expect(upload.handleUpload).toHaveBeenCalledTimes(1));
});

it('체크리스트 항목을 누르면 저장하지 않고 해당 위치를 선택한다', async () => {
  mockGetObjects.mockReturnValue([{ text: '8/11' }]);
  useEditorStore.setState({
    block: [
      {
        id: 'place-1',
        type: 'wedding',
        component: 'place',
        props: { placeName: '', placeAddress: '' },
      },
    ],
  });
  render(<UploadButton upload={upload} />);

  openChecklist();
  fireEvent.click(screen.getByRole('button', { name: /장소를 아직 입력하지/ }));

  expect(upload.handleUpload).not.toHaveBeenCalled();
  expect(useEditorStore.getState().selectedId).toBe('place-1');
  expect(
    screen.queryByRole('dialog', { name: '발행 전 체크리스트' })
  ).not.toBeInTheDocument();
});

it('표지 항목을 누르면 포스터를 선택한다', () => {
  mockGetObjects.mockReturnValue([]);
  render(<UploadButton upload={upload} />);

  openChecklist();
  fireEvent.click(screen.getByRole('button', { name: /표지가 아직 비어 있어요/ }));

  expect(useEditorStore.getState().selectedId).toBe('mainPoster');
});

it('모든 항목을 채우면 초록 체크 상태로 바로 저장할 수 있다', async () => {
  mockGetObjects.mockReturnValue([{ text: '고관우 · 라니' }]);
  useEditorStore.setState({
    shareUrl: {
      ...useEditorStore.getState().shareUrl,
      title: '고관우 · 라니 결혼식',
    },
    block: [
      {
        id: 'calendar-1',
        type: 'wedding',
        component: 'calendar',
        props: { date: '2027-05-22', time: '오후 2:00' },
      },
      {
        id: 'place-1',
        type: 'wedding',
        component: 'place',
        props: {
          placeName: '서원 예식당',
          placeAddress: '서울 종로구 사직로 9길 1',
          lat: 37.5,
          lng: 127,
        },
      },
    ],
  } as never);
  render(<UploadButton upload={upload} />);

  const dialog = openChecklist();
  expect(dialog).toHaveTextContent('모두 준비됐어요');

  fireEvent.click(screen.getByRole('button', { name: '저장하기' }));
  await waitFor(() => expect(upload.handleUpload).toHaveBeenCalledTimes(1));
});
