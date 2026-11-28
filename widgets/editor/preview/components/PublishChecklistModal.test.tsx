import { fireEvent, render, screen } from '@testing-library/react';

import { buildPublishChecklist } from '../publishChecklist';

import { PublishChecklistModal } from './PublishChecklistModal';

const renderModal = (
  input: Parameters<typeof buildPublishChecklist>[0],
  overrides: Partial<Parameters<typeof PublishChecklistModal>[0]> = {}
) => {
  const result = buildPublishChecklist(input);
  const props = {
    result,
    onFix: jest.fn(),
    onSave: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };
  render(<PublishChecklistModal {...props} />);
  return props;
};

const readyInput = {
  blocks: [
    {
      id: 'calendar',
      component: 'calendar',
      props: { date: '2027-05-22', time: '오후 2:00' },
    },
    {
      id: 'place',
      component: 'place',
      props: {
        placeName: '서원 예식당',
        placeAddress: '서울 종로구 사직로 9길 1',
        lat: 37.5,
        lng: 127,
      },
    },
  ],
  title: '고관우 · 라니 결혼식',
  posterObjectCount: 8,
  posterExampleTexts: [] as string[],
};

describe('PublishChecklistModal', () => {
  it('남은 항목을 필수와 권장으로 나눠 보여 주고 그대로 저장을 허용한다', () => {
    const props = renderModal({
      ...readyInput,
      posterExampleTexts: ['8/11', '15:00'],
      blocks: [],
    });

    const dialog = screen.getByRole('dialog', { name: '발행 전 체크리스트' });
    expect(dialog).toHaveTextContent('꼭 확인해 주세요');
    expect(dialog).toHaveTextContent('표지에 예시 문구가 남아 있어요');
    expect(dialog).toHaveTextContent('채우면 더 좋아요');
    expect(dialog).toHaveTextContent('본문 블록이 아직 없어요');

    fireEvent.click(screen.getByRole('button', { name: '그대로 저장하기' }));
    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  it('항목을 누르면 해당 위치로 이동하도록 알린다', () => {
    const props = renderModal({
      ...readyInput,
      title: '',
      blocks: [
        {
          id: 'place-1',
          component: 'place',
          props: { placeName: '', placeAddress: '' },
        },
      ],
    });

    fireEvent.click(
      screen.getByRole('button', { name: /초대장 제목이 없어요/ })
    );
    expect(props.onFix).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'title-missing', target: 'shareUrl' })
    );

    fireEvent.click(
      screen.getByRole('button', { name: /장소를 아직 입력하지 않았어요/ })
    );
    expect(props.onFix).toHaveBeenCalledWith(
      expect.objectContaining({ blockId: 'place-1', target: 'block' })
    );
  });

  it('모두 채워지면 초록 체크와 저장 버튼을 보여 준다', () => {
    const props = renderModal(readyInput);

    const dialog = screen.getByRole('dialog', { name: '발행 전 체크리스트' });
    expect(dialog).toHaveTextContent('모두 준비됐어요');
    expect(dialog).toHaveTextContent('바로 저장할 수 있어요');

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));
    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  it('닫기·돌아가기·Escape 로 저장하지 않고 닫는다', () => {
    const props = renderModal({ ...readyInput, posterObjectCount: 0 });

    fireEvent.click(screen.getByRole('button', { name: '돌아가서 고치기' }));
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(props.onClose).toHaveBeenCalledTimes(3);
    expect(props.onSave).not.toHaveBeenCalled();
  });
});
