import type { SketchMapData } from '@/shared/map/sketch/sketchTypes';

export const placeSchema = {
  type: null,
  fields: {
    title: {
      default: '행사 장소',
      required: true,
    },
    subTitle: {
      default: 'LOCATION',
      required: true,
    },
    country: {
      default: '국내',
      required: true,
    },
    placeName: {
      default: '',
      required: true,
    },
    placeDetail: {
      default: '',
      required: true,
    },
    placeAddress: {
      default: '',
      required: true,
    },
    placeTel: {
      default: '',
      required: true,
    },
    checkedSubTitle: {
      default: true,
      required: true,
    },
    checkedPlaceTel: {
      default: false,
      required: true,
    },
    openMap: {
      default: false,
      required: true,
    },
    openNavi: {
      default: false,
      required: true,
    },
    mapLocked: {
      default: false,
      required: true,
    },
    lng: {
      default: 0,
      required: true,
    },
    lat: {
      default: 0,
      required: true,
    },
    /** 'naver'(인터랙티브 지도) 또는 'sketch'(미니멀 약도) */
    mapStyle: {
      default: 'naver',
      required: false,
    },
    /** 생성된 약도 형상 데이터. 초대장 data.json에 함께 저장된다. */
    sketch: {
      default: null as SketchMapData | null,
      required: false,
    },
    sketchPalette: {
      default: 'ivory',
      required: false,
    },
    sketchRadius: {
      default: 500,
      required: false,
    },
    sketchDensity: {
      default: 'standard',
      required: false,
    },
    sketchShowStations: {
      default: true,
      required: false,
    },
    sketchShowLabel: {
      default: true,
      required: false,
    },
    sketchShowScale: {
      default: true,
      required: false,
    },
  },
} as const;
