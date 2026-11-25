import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SKETCH_MAP_VERSION, type SketchMapData } from '@/shared/map/sketch/sketchTypes';
import type { EditorBlock } from '@/shared/types/block';

jest.mock('@/components/organisms/wrapper/MiddlePreviewWrapper', () => ({
  MiddlePreviewWrapper: ({ children }: { children: ReactNode }) => (
    <div data-testid="middle-preview-wrapper">{children}</div>
  ),
}));

jest.mock('@/shared/hooks/useBodyFontInfo', () => ({
  useBodyFontInfo: () => ({ fontFamily: 'sans-serif' }),
}));

jest.mock('./NaverMapScript', () => ({
  NaverMapScript: () => null,
}));

jest.mock('./PlaceMap', () => ({
  PlaceMap: () => null,
}));

jest.mock('./Navigation', () => ({
  Navigation: () => <div>길찾기</div>,
}));

import { PlacePreview } from './PlacePreview';

describe('PlacePreview', () => {
  const SKETCH: SketchMapData = {
    v: SKETCH_MAP_VERSION,
    lat: 37.54,
    lng: 127.04,
    radius: 500,
    density: 'standard',
    roads: [{ c: 'major', p: '100,500 900,500' }],
    areas: [],
    stations: [{ n: '언주역', code: '926', exits: ['2'], x: 640, y: 420 }],
  };

  const createBlock = (
    propsPartial: Partial<EditorBlock<'place'>['props']> = {}
  ): EditorBlock<'place'> => ({
    id: 'place-block-1',
    type: 'birthday',
    component: 'place',
    props: {
      title: '행사 장소',
      subTitle: 'LOCATION',
      country: '국내',
      placeName: '서울숲',
      placeDetail: '중앙광장',
      placeAddress: '서울특별시 성동구 뚝섬로 273',
      placeTel: '01012345678',
      checkedSubTitle: true,
      checkedPlaceTel: false,
      openMap: false,
      openNavi: false,
      mapLocked: false,
      lng: 127.04,
      lat: 37.54,
      ...propsPartial,
    },
  });

  it.each([[0, 0], [181, 37], [127, NaN]])('미확정 좌표(%s, %s)에는 길찾기를 숨긴다', (lng, lat) => {
    render(<PlacePreview blockInfo={createBlock({ lng, lat, openMap: true, openNavi: true })} className="" />);
    expect(screen.queryByText('길찾기')).not.toBeInTheDocument();
  });

  it('does not render TEL when checkedPlaceTel is false by default', () => {
    render(<PlacePreview blockInfo={createBlock()} className="test-place" />);
    expect(screen.queryByText(/TEL\./i)).not.toBeInTheDocument();
  });

  it('renders TEL when checkedPlaceTel is true and placeTel is provided', () => {
    render(
      <PlacePreview
        blockInfo={createBlock({ checkedPlaceTel: true, placeTel: '01012345678' })}
        className="test-place"
      />
    );
    expect(screen.getByText('TEL. 010-1234-5678')).toBeInTheDocument();
  });

  it('does not render TEL when checkedPlaceTel is true but placeTel is empty', () => {
    render(
      <PlacePreview
        blockInfo={createBlock({ checkedPlaceTel: true, placeTel: '' })}
        className="test-place"
      />
    );
    expect(screen.queryByText(/TEL\./i)).not.toBeInTheDocument();
  });

  it('미니멀 약도 모드에서는 저장된 약도를 SVG로 그린다', () => {
    render(
      <PlacePreview
        blockInfo={createBlock({
          openMap: true,
          mapStyle: 'sketch',
          sketch: SKETCH,
          placeName: '라움아트센터',
        })}
        className="test-place"
      />
    );

    expect(
      screen.getByRole('img', { name: '라움아트센터 약도' })
    ).toBeInTheDocument();
    expect(screen.getByText('언주역')).toBeInTheDocument();
  });

  it('약도 모드라도 지도를 끄면 약도를 그리지 않는다', () => {
    render(
      <PlacePreview
        blockInfo={createBlock({
          openMap: false,
          mapStyle: 'sketch',
          sketch: SKETCH,
        })}
        className="test-place"
      />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
