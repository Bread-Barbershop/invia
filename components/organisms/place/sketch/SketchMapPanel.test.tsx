import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SKETCH_MAP_VERSION, type SketchMapData } from '@/shared/map/sketch/sketchTypes';

import { PLACE_SKETCH_DEFAULTS, type PlaceSketchProps } from './sketchOptionsModel';
import { SketchMapModeTabs, SketchMapPanel } from './SketchMapPanel';

jest.mock('@/components/molecules/selector', () => ({
  Selector: ({ ariaLabel }: { ariaLabel?: string }) => (
    <div data-testid="selector" aria-label={ariaLabel} />
  ),
}));

const SKETCH: SketchMapData = {
  v: SKETCH_MAP_VERSION,
  lat: 37.5088,
  lng: 127.0606,
  radius: 500,
  density: 'standard',
  roads: [{ c: 'major', p: '100,500 900,500' }],
  areas: [],
  stations: [{ n: '언주역', code: '926', exits: ['2'], x: 640, y: 420 }],
};

function buildProps(patch: Partial<PlaceSketchProps> = {}): PlaceSketchProps {
  return { ...PLACE_SKETCH_DEFAULTS, mapStyle: 'sketch', ...patch };
}

function okResponse(data: unknown) {
  return { ok: true, status: 200, json: async () => ({ ok: true, data }) };
}

describe('SketchMapModeTabs', () => {
  it('현재 모드만 선택 상태로 표시한다', () => {
    render(<SketchMapModeTabs value="sketch" onChange={jest.fn()} />);
    expect(screen.getByRole('tab', { name: '미니멀 약도' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: '지도' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('다른 모드를 누르면 변경을 알린다', () => {
    const onChange = jest.fn();
    render(<SketchMapModeTabs value="naver" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: '미니멀 약도' }));
    expect(onChange).toHaveBeenCalledWith('sketch');
  });
});

describe('SketchMapPanel', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('주소가 없으면 안내만 하고 요청하지 않는다', () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    render(
      <SketchMapPanel
        lat={0}
        lng={0}
        venueLabel=""
        props={buildProps()}
        onChange={jest.fn()}
      />
    );

    expect(
      screen.getByText(/주소를 먼저 선택하면 예식장 주변 약도를 만들 수 있어요/)
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('좌표가 있고 약도가 없으면 자동으로 생성을 시작한다', async () => {
    const fetchMock = jest.fn().mockResolvedValue(okResponse(SKETCH));
    global.fetch = fetchMock;
    const onChange = jest.fn();

    render(
      <SketchMapPanel
        lat={37.5088}
        lng={127.0606}
        venueLabel="라움아트센터"
        props={buildProps()}
        onChange={onChange}
      />
    );

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({ sketch: SKETCH });
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/map/sketch?');
    expect(String(fetchMock.mock.calls[0][0])).toContain('density=standard');
  });

  it('이미 만든 약도가 있으면 다시 요청하지 않고 그려 준다', () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    render(
      <SketchMapPanel
        lat={37.5088}
        lng={127.0606}
        venueLabel="라움아트센터"
        props={buildProps({ sketch: SKETCH })}
        onChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole('img', { name: '라움아트센터 약도' })
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('팔레트를 고르면 변경을 알린다', () => {
    const onChange = jest.fn();
    render(
      <SketchMapPanel
        lat={37.5088}
        lng={127.0606}
        venueLabel="라움아트센터"
        props={buildProps({ sketch: SKETCH })}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '세이지 그린 팔레트' }));
    expect(onChange).toHaveBeenCalledWith({ sketchPalette: 'sage' });
  });

  it('주소가 바뀌면 다시 만들라고 안내한다', () => {
    render(
      <SketchMapPanel
        lat={37.5300}
        lng={127.0900}
        venueLabel="라움아트센터"
        props={buildProps({ sketch: SKETCH })}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText(/주소나 반경이 바뀌었어요/)).toBeInTheDocument();
  });

  it('생성에 실패하면 이유를 보여 준다', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({
        ok: false,
        message: '약도 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
      }),
    });

    render(
      <SketchMapPanel
        lat={37.5088}
        lng={127.0606}
        venueLabel="라움아트센터"
        props={buildProps()}
        onChange={jest.fn()}
      />
    );

    expect(
      await screen.findByText(/약도 데이터를 불러오지 못했어요/)
    ).toBeInTheDocument();
  });
});
