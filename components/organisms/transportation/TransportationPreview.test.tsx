import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TransportationPreview } from './TransportationPreview';

import type { EditorBlock } from '@/shared/types/block';

const writeText = jest.fn().mockResolvedValue(undefined);

// userEvent.setup()이 navigator.clipboard를 자체 스텁으로 바꾸므로, 설정 이후에 다시 심습니다.
const mockClipboard = () => {
  Object.defineProperty(window, 'isSecureContext', {
    configurable: true,
    value: true,
  });
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
};

const baseProps: EditorBlock<'transportation'>['props'] = {
  title: '오시는 길',
  subwayLine: '3호선',
  subwayStation: '압구정역',
  subwayExit: '2번 출구',
  subwayWalk: '정문에서 도보 5분',
  busRoutes: '143 · 401',
  shuttleStop: '',
  shuttleInterval: '',
  parkingHours: '무료 2시간',
  alternativeParking: '',
  navigationUrl: '',
};

const makeBlock = (
  overrides: Partial<EditorBlock<'transportation'>['props']> = {}
): EditorBlock<'transportation'> => ({
  id: 'transportation-1',
  type: 'wedding',
  component: 'transportation',
  props: { ...baseProps, ...overrides },
});

const renderPreview = (
  overrides: Partial<EditorBlock<'transportation'>['props']> = {},
  isGuestPage = false
) =>
  render(
    <TransportationPreview
      blockInfo={makeBlock(overrides)}
      isGuestPage={isGuestPage}
    />
  );

describe('교통·주차 안내 미리보기', () => {
  beforeEach(() => {
    writeText.mockClear();
  });

  it('입력한 교통·주차 항목만 안내 카드로 보여준다', () => {
    renderPreview();

    expect(screen.getByRole('heading', { name: '지하철' })).toBeInTheDocument();
    expect(screen.getByText('3호선 · 압구정역 · 2번 출구')).toBeInTheDocument();
    expect(screen.getByText('143 · 401')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '셔틀버스' })
    ).not.toBeInTheDocument();
  });

  it('교통 안내를 한 번에 복사하고 상태를 알린다', async () => {
    const user = userEvent.setup();
    mockClipboard();
    renderPreview();

    await user.click(screen.getByRole('button', { name: '교통 안내 복사' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain('오시는 길');
    expect(copied).toContain('지하철: 3호선 · 압구정역 · 2번 출구 (정문에서 도보 5분)');
    expect(copied).toContain('버스: 143 · 401');
    expect(copied).toContain('자가용/주차: 무료 2시간');
    expect(screen.getByRole('status')).toHaveTextContent(
      '교통·주차 안내를 복사했어요.'
    );
  });

  it('내비게이션 링크가 없으면 하차 역으로 지도 검색을 열 수 있다', () => {
    renderPreview();

    const stationSearch = screen.getByRole('link', { name: '지도에서 찾기' });
    expect(stationSearch).toHaveAttribute(
      'href',
      `https://map.naver.com/p/search/${encodeURIComponent('압구정역')}`
    );
    expect(stationSearch).toHaveAttribute('target', '_blank');
    expect(
      screen.queryByRole('link', { name: '내비게이션 바로가기' })
    ).not.toBeInTheDocument();
  });

  it('내비게이션 링크가 있으면 그 링크를 우선 보여주고 역 검색은 숨긴다', () => {
    renderPreview({ navigationUrl: 'https://map.kakao.com/?q=압구정' });

    expect(
      screen.getByRole('link', { name: '내비게이션 바로가기' })
    ).toHaveAttribute('href', new URL('https://map.kakao.com/?q=압구정').toString());
    expect(
      screen.queryByRole('link', { name: '지도에서 찾기' })
    ).not.toBeInTheDocument();
  });

  it('안내가 비어 있으면 편집 화면에서만 입력 안내를 보여주고 복사 버튼을 만들지 않는다', () => {
    renderPreview({
      subwayLine: '',
      subwayStation: '',
      subwayExit: '',
      subwayWalk: '',
      busRoutes: '',
      parkingHours: '',
    });

    expect(
      screen.getByText('교통·주차 정보를 입력해 주세요.')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '교통 안내 복사' })
    ).not.toBeInTheDocument();
  });
});
