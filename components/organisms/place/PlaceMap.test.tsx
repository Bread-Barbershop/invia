import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { EditorBlock } from '@/shared/types/block';

import { Place } from './Place';
import { PlaceMap, removeNaverMarkerAreasFromTabOrder } from './PlaceMap';

const mockUpdateBlock = jest.fn();

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: unknown) =>
    (selector as CallableFunction)({
      updateBlock: mockUpdateBlock,
    }),
}));

jest.mock('@/components/molecules/selector', () => ({
  Selector: () => <div data-testid="selector" />,
}));

jest.mock('./NaverMapScript', () => ({
  NaverMapScript: () => null,
}));

describe('PlaceMap', () => {
  const mockSetOptions = jest.fn();
  const mockSetCenter = jest.fn();
  const mockSetPosition = jest.fn();
  const mockSetMap = jest.fn();
  const mockDestroy = jest.fn();
  const mockMapConstructor = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockMapConstructor.mockImplementation(() => ({
      setOptions: mockSetOptions,
      setCenter: mockSetCenter,
      destroy: mockDestroy,
    }));

    (window as unknown as { naver: unknown }).naver = {
      maps: {
        Map: mockMapConstructor,
        LatLng: jest.fn((lat, lng) => ({ lat, lng })),
        Marker: jest.fn(() => ({
          setPosition: mockSetPosition,
          setMap: mockSetMap,
        })),
      },
    };
  });

  afterEach(() => {
    delete (window as unknown as { naver?: unknown }).naver;
    jest.restoreAllMocks();
  });

  it('네이버 지도 마커의 빈 링크(area)를 탭·읽기 순서에서 뺀다', () => {
    const container = document.createElement('div');
    container.innerHTML =
      '<img usemap="#nmarker-1"><map name="nmarker-1"><area href="#" alt="마커의 경위도는 126.97,37.55 입니다."></map>';

    removeNaverMarkerAreasFromTabOrder(container);

    expect(container.querySelector('area')).toHaveAttribute('tabindex', '-1');
    expect(container.querySelector('area')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('does not render lock button when locked is false', () => {
    render(<PlaceMap lng={127.04} lat={37.54} locked={false} />);
    expect(screen.queryByTestId('map-lock-button')).not.toBeInTheDocument();
  });

  it('renders lock button with "지도 움직이기" when locked is true', () => {
    render(<PlaceMap lng={127.04} lat={37.54} locked={true} />);
    const button = screen.getByTestId('map-lock-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('지도 움직이기');
    expect(button).toHaveAttribute('aria-label', '지도 움직이기');
  });

  it('initializes Naver Map with lock options when locked is true', () => {
    render(<PlaceMap lng={127.04} lat={37.54} locked={true} />);
    expect(mockMapConstructor).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        draggable: false,
        scrollWheel: false,
        pinchZoom: false,
        disableDoubleClickZoom: true,
      })
    );
  });

  it('toggles map lock state and button text on click', () => {
    render(<PlaceMap lng={127.04} lat={37.54} locked={true} />);
    const button = screen.getByTestId('map-lock-button');

    // First click: unlock map
    fireEvent.click(button);
    expect(mockSetOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        draggable: true,
        scrollWheel: true,
        pinchZoom: true,
        disableDoubleClickZoom: false,
      })
    );
    expect(button).toHaveTextContent('지도 고정하기');
    expect(button).toHaveAttribute('aria-label', '지도 고정하기');

    // Second click: lock map again
    fireEvent.click(button);
    expect(mockSetOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        draggable: false,
        scrollWheel: false,
        pinchZoom: false,
        disableDoubleClickZoom: true,
      })
    );
    expect(button).toHaveTextContent('지도 움직이기');
    expect(button).toHaveAttribute('aria-label', '지도 움직이기');
  });

  it('주소를 다시 선택하면 기존 지도와 마커를 함께 이동한다', () => {
    const { rerender, unmount } = render(
      <PlaceMap lng={127.04} lat={37.54} locked />
    );
    rerender(<PlaceMap lng={127.05} lat={37.55} />);
    expect(mockMapConstructor).toHaveBeenCalledTimes(1);
    expect(mockSetCenter).toHaveBeenCalledWith({ lat: 37.55, lng: 127.05 });
    expect(mockSetPosition).toHaveBeenCalledWith({ lat: 37.55, lng: 127.05 });
    expect(mockSetOptions).toHaveBeenCalledWith(expect.objectContaining({ draggable: true }));
    unmount();
    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });

  it.each(['marker', 'map'] as const)(
    'continues cleanup when the SDK throws while disposing the %s',
    resource => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const failingMethod = resource === 'marker' ? mockSetMap : mockDestroy;
      failingMethod.mockImplementationOnce(() => {
        throw new TypeError(
          "Cannot read properties of null (reading 'capitalize')"
        );
      });
      const { rerender } = render(<PlaceMap lng={127.04} lat={37.54} />);

      rerender(<p>지도 설정을 계속 편집할 수 있어요.</p>);

      expect(mockSetMap).toHaveBeenCalledWith(null);
      expect(mockDestroy).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText('지도 설정을 계속 편집할 수 있어요.')
      ).toBeInTheDocument();
    }
  );

  it('shows the error within the map and retries when the coordinates change', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockMapConstructor.mockImplementationOnce(() => {
      throw new Error('Naver map initialization failed');
    });
    const { rerender } = render(<PlaceMap lng={127.04} lat={37.54} locked />);

    expect(await screen.findByRole('status')).toHaveTextContent(
      '네이버 지도를 불러오지 못했어요.'
    );
    expect(screen.queryByTestId('map-lock-button')).not.toBeInTheDocument();

    rerender(<PlaceMap lng={127.05} lat={37.55} locked />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('map-lock-button')).toBeInTheDocument();
  });

  it('reacts to prop changes for locked', () => {
    const { rerender } = render(
      <PlaceMap lng={127.04} lat={37.54} locked={true} />
    );
    expect(screen.getByTestId('map-lock-button')).toBeInTheDocument();

    rerender(<PlaceMap lng={127.04} lat={37.54} locked={false} />);
    expect(screen.queryByTestId('map-lock-button')).not.toBeInTheDocument();
    expect(mockSetOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        draggable: true,
      })
    );
  });
});

describe('Place Editor mapLocked option', () => {
  beforeEach(() => {
    mockUpdateBlock.mockClear();
  });

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
      openMap: true,
      openNavi: false,
      mapLocked: false,
      lng: 127.04,
      lat: 37.54,
      ...propsPartial,
    },
  });

  it('does not render "지도 고정 (지도가 움직이지 않아요.)" when openMap is false', () => {
    render(<Place blockInfo={createBlock({ openMap: false })} id="place-block-1" />);

    expect(
      screen.queryByLabelText('지도 고정 (지도가 움직이지 않아요.)')
    ).not.toBeInTheDocument();
  });

  it('renders "지도 고정 (지도가 움직이지 않아요.)" checkbox unchecked when mapLocked is false and openMap is true', () => {
    render(<Place blockInfo={createBlock({ mapLocked: false, openMap: true })} id="place-block-1" />);

    const checkbox = screen.getByLabelText('지도 고정 (지도가 움직이지 않아요.)');
    expect(checkbox).not.toBeChecked();
  });

  it('renders "지도 고정 (지도가 움직이지 않아요.)" checkbox checked when mapLocked is true and openMap is true', () => {
    render(<Place blockInfo={createBlock({ mapLocked: true, openMap: true })} id="place-block-1" />);

    const checkbox = screen.getByLabelText('지도 고정 (지도가 움직이지 않아요.)');
    expect(checkbox).toBeChecked();
  });

  it('calls updateBlock with mapLocked when checkbox is clicked', () => {
    render(<Place blockInfo={createBlock({ mapLocked: false, openMap: true })} id="place-block-1" />);

    const checkbox = screen.getByLabelText('지도 고정 (지도가 움직이지 않아요.)');
    fireEvent.click(checkbox);

    expect(mockUpdateBlock).toHaveBeenCalledWith('place-block-1', {
      mapLocked: true,
    });
  });

  it('toggles mapLocked to false when clicked while already checked', () => {
    render(<Place blockInfo={createBlock({ mapLocked: true, openMap: true })} id="place-block-1" />);

    const checkbox = screen.getByLabelText('지도 고정 (지도가 움직이지 않아요.)');
    fireEvent.click(checkbox);

    expect(mockUpdateBlock).toHaveBeenCalledWith('place-block-1', {
      mapLocked: false,
    });
  });
});
