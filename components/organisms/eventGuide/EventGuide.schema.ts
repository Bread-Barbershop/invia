import {
  createEventGuideItem,
  type EventGuideItem,
} from './eventGuideItems';

export const eventGuideSchema = {
  type: null,
  fields: {
    title: { default: '이벤트 안내', required: true },
    intro: { default: '', required: false },
    items: {
      default: () =>
        [
          createEventGuideItem({
            title: '포토 타임',
            description: '함께한 순간을 사진으로 남겨 주세요.',
            time: '행사 중',
            place: '포토존',
          }),
          createEventGuideItem({
            title: '경품 추첨',
            description: '참석해 주신 분들께 소소한 선물을 드려요.',
            time: '행사 마무리',
          }),
        ] as EventGuideItem[],
      required: true,
    },
  },
} as const;
