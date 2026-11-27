import { render, screen } from '@testing-library/react';

import type { EditorBlock } from '@/shared/types/block';

import { EventGuidePreview } from './EventGuidePreview';

const block: EditorBlock<'eventGuide'> = {
  id: 'event-1',
  component: 'eventGuide',
  type: 'firstBirthday',
  props: {
    title: '이벤트 안내',
    intro: '함께 즐길 수 있는 순서를 준비했어요.',
    items: [
      {
        id: 'a',
        title: '돌잡이',
        description: '아기가 무엇을 집을지 함께 지켜봐 주세요.',
        time: '12:00',
        place: '메인 테이블',
      },
      {
        id: 'b',
        title: '경품 추첨',
        description: '',
        time: '',
        place: '',
      },
      { id: 'c', title: '   ', description: '', time: '', place: '' },
    ],
  },
};

describe('이벤트 안내 블록', () => {
  it('번호, 이름, 시간·장소 칩과 설명을 보여 준다', () => {
    render(<EventGuidePreview blockInfo={block} />);

    expect(screen.getByText('이벤트 안내')).toBeInTheDocument();
    expect(
      screen.getByText('함께 즐길 수 있는 순서를 준비했어요.')
    ).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('돌잡이')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('메인 테이블')).toBeInTheDocument();
    expect(
      screen.getByText('아기가 무엇을 집을지 함께 지켜봐 주세요.')
    ).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    // 이름이 비어 있는 항목은 초대장에 그리지 않는다.
    expect(screen.queryByText('03')).not.toBeInTheDocument();
  });

  it('항목이 없으면 편집 화면에서만 안내 문구를 보여 준다', () => {
    const empty = { ...block, props: { ...block.props, items: [] } };
    const editor = render(<EventGuidePreview blockInfo={empty} />);
    expect(
      screen.getByText('참여할 수 있는 이벤트를 추가해 주세요.')
    ).toBeInTheDocument();
    editor.unmount();

    render(<EventGuidePreview blockInfo={empty} isGuestPage />);
    expect(
      screen.queryByText('참여할 수 있는 이벤트를 추가해 주세요.')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('이벤트 안내')).not.toBeInTheDocument();
  });

  it('제목을 비우면 기본 제목으로 보여 준다', () => {
    render(
      <EventGuidePreview
        blockInfo={{ ...block, props: { ...block.props, title: '' } }}
      />
    );
    expect(screen.getByText('이벤트 안내')).toBeInTheDocument();
  });
});
