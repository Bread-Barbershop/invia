import { render, screen } from '@testing-library/react';

import { SKETCH_PALETTES } from '@/shared/map/sketch/palettes';
import { SKETCH_MAP_VERSION, type SketchMapData } from '@/shared/map/sketch/sketchTypes';

import { SketchMapSvg, formatExits, resolveScaleBar } from './SketchMapSvg';

const data: SketchMapData = {
  v: SKETCH_MAP_VERSION,
  lat: 37.5088,
  lng: 127.0606,
  radius: 500,
  density: 'standard',
  roads: [
    { c: 'major', p: '120,500 500,500 880,500' },
    { c: 'medium', p: '500,100 500,900' },
    { c: 'minor', p: '300,300 700,300' },
  ],
  areas: [
    { k: 'park', p: '200,200 300,200 300,300 200,200', a: 1 },
    { k: 'water', p: '100,700 900,760', a: 0 },
  ],
  stations: [
    { n: '언주역', code: '926', exits: ['2', '5'], x: 640, y: 420 },
  ],
};

describe('SketchMapSvg', () => {
  const palette = SKETCH_PALETTES.ivory;

  it('약도를 이미지로 노출하고 접근성 이름을 붙인다', () => {
    render(
      <SketchMapSvg data={data} palette={palette} ariaLabel="라움 약도" />
    );
    expect(screen.getByRole('img', { name: '라움 약도' })).toBeInTheDocument();
  });

  it('도로를 등급별 그룹으로 그린다', () => {
    const { container } = render(<SketchMapSvg data={data} palette={palette} />);
    expect(
      container.querySelector('[data-sketch-road="major"] path')
    ).not.toBeNull();
    expect(
      container.querySelector('[data-sketch-road="medium"] path')
    ).not.toBeNull();
    expect(
      container.querySelector('[data-sketch-road="minor"] path')
    ).not.toBeNull();
  });

  it('주요 도로는 팔레트 색으로 굵게 그린다', () => {
    const { container } = render(<SketchMapSvg data={data} palette={palette} />);
    const majorInk = container.querySelector(
      '[data-sketch-road="major"] path:not([stroke-width="11"])'
    );
    expect(majorInk?.getAttribute('stroke')).toBe(palette.major);
    expect(Number(majorInk?.getAttribute('stroke-width'))).toBeGreaterThan(
      Number(
        container
          .querySelector('[data-sketch-road="minor"] path')
          ?.getAttribute('stroke-width')
      )
    );
  });

  it('지하철역 이름·번호·출구를 표시한다', () => {
    render(<SketchMapSvg data={data} palette={palette} />);
    expect(screen.getByText('언주역')).toBeInTheDocument();
    expect(screen.getByText('926')).toBeInTheDocument();
    expect(screen.getByText('2·5번 출구')).toBeInTheDocument();
  });

  it('지하철역 표시를 끄면 역 정보를 그리지 않는다', () => {
    render(
      <SketchMapSvg data={data} palette={palette} showStations={false} />
    );
    expect(screen.queryByText('언주역')).not.toBeInTheDocument();
  });

  it('장소 이름은 옵션에 따라 표시한다', () => {
    const { rerender } = render(
      <SketchMapSvg
        data={data}
        palette={palette}
        venueLabel="라움아트센터"
      />
    );
    expect(screen.getByText('라움아트센터')).toBeInTheDocument();

    rerender(
      <SketchMapSvg
        data={data}
        palette={palette}
        venueLabel="라움아트센터"
        showVenueLabel={false}
      />
    );
    expect(screen.queryByText('라움아트센터')).not.toBeInTheDocument();
  });

  it('축척·방위는 옵션으로 끌 수 있다', () => {
    const { container, rerender } = render(
      <SketchMapSvg data={data} palette={palette} />
    );
    expect(container.querySelector('[data-sketch-scale]')).not.toBeNull();

    rerender(<SketchMapSvg data={data} palette={palette} showScale={false} />);
    expect(container.querySelector('[data-sketch-scale]')).toBeNull();
  });

  it('OpenStreetMap 출처를 항상 남긴다', () => {
    render(<SketchMapSvg data={data} palette={palette} />);
    expect(screen.getByText('© OpenStreetMap')).toBeInTheDocument();
  });
});

describe('formatExits', () => {
  it('출구 번호를 가운뎃점으로 묶는다', () => {
    expect(formatExits(['2', '5'])).toBe('2·5번 출구');
    expect(formatExits([])).toBe('');
  });
});

describe('resolveScaleBar', () => {
  it('반경이 500m일 때 150m 축척 막대를 만든다', () => {
    expect(resolveScaleBar(1)).toEqual({ length: 150, label: '150 m' });
  });

  it('1km 이상이면 km 단위로 표기한다', () => {
    expect(resolveScaleBar(6).label).toBe('1 km');
  });
});
