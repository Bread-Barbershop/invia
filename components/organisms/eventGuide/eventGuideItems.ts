import type { InvitationType } from '@/shared/types/block';

export type EventGuideItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  place: string;
};

export const EVENT_GUIDE_LIMITS = {
  title: 40,
  intro: 120,
  itemTitle: 40,
  description: 160,
  time: 24,
  place: 24,
  items: 8,
} as const;

type EventGuideItemInput = Partial<Omit<EventGuideItem, 'id'>>;

const PRESETS: Record<InvitationType, Omit<EventGuideItem, 'id'>[]> = {
  wedding: [
    {
      title: '포토부스',
      description: '예식 전후로 자유롭게 사진을 남겨 주세요.',
      time: '예식 전후',
      place: '포토존',
    },
    {
      title: '부케 토스',
      description: '행운을 나누는 순간에 함께해 주세요.',
      time: '피로연',
      place: '',
    },
    {
      title: '경품 추첨',
      description: '참석해 주신 분들께 소소한 선물을 드려요.',
      time: '피로연 마무리',
      place: '',
    },
  ],
  firstBirthday: [
    {
      title: '돌잡이',
      description: '아기가 무엇을 집을지 함께 지켜봐 주세요.',
      time: '12:00',
      place: '메인 테이블',
    },
    {
      title: '포토 타임',
      description: '가족과 함께 사진을 남겨 주세요.',
      time: '식사 후',
      place: '포토존',
    },
    {
      title: '경품 추첨',
      description: '작은 선물을 준비했어요.',
      time: '행사 마무리',
      place: '',
    },
  ],
  birthday: [
    {
      title: '게임 타임',
      description: '다 같이 즐길 수 있는 게임을 준비했어요.',
      time: '식사 후',
      place: '',
    },
    {
      title: '포토 타임',
      description: '오늘의 주인공과 사진을 남겨 주세요.',
      time: '행사 중',
      place: '포토존',
    },
    {
      title: '경품 추첨',
      description: '참석해 주신 분들께 선물을 드려요.',
      time: '행사 마무리',
      place: '',
    },
  ],
  seminar: [
    {
      title: '네트워킹 타임',
      description: '참가자들과 자유롭게 이야기를 나눠 보세요.',
      time: '세션 사이',
      place: '로비',
    },
    {
      title: '질의응답 이벤트',
      description: '질문을 남겨 주신 분께 기념품을 드려요.',
      time: '마지막 세션',
      place: '',
    },
    {
      title: '경품 추첨',
      description: '현장에서 추첨으로 진행합니다.',
      time: '폐회 전',
      place: '',
    },
  ],
  etc: [
    {
      title: '포토 타임',
      description: '함께한 순간을 사진으로 남겨 주세요.',
      time: '행사 중',
      place: '포토존',
    },
    {
      title: '경품 추첨',
      description: '참석해 주신 분들께 소소한 선물을 드려요.',
      time: '행사 마무리',
      place: '',
    },
  ],
  bridalShower: [
    {
      title: '포토 타임',
      description: '함께 사진을 남기며 소중한 추억을 만들어요.',
      time: '파티 중',
      place: '포토존',
    },
    {
      title: '선물 전달 & 축하',
      description: '주인공을 위한 따뜻한 축하와 선물을 전해요.',
      time: '파티 중',
      place: '',
    },
  ],
};

export function createEventGuideItem(
  value: EventGuideItemInput = {}
): EventGuideItem {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return {
    id,
    title: '',
    description: '',
    time: '',
    place: '',
    ...value,
  };
}

export function getEventGuidePreset(type: InvitationType): EventGuideItem[] {
  return (PRESETS[type] ?? PRESETS.etc).map(item =>
    createEventGuideItem(item)
  );
}

export function normalizeEventGuideItems(value: unknown): EventGuideItem[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null
    )
    .slice(0, EVENT_GUIDE_LIMITS.items)
    .map((item, index) => {
      let id =
        typeof item.id === 'string' && item.id.length > 0
          ? item.id
          : String(index);
      while (ids.has(id)) id += '-';
      ids.add(id);
      return {
        id,
        title:
          typeof item.title === 'string'
            ? item.title.slice(0, EVENT_GUIDE_LIMITS.itemTitle)
            : '',
        description:
          typeof item.description === 'string'
            ? item.description.slice(0, EVENT_GUIDE_LIMITS.description)
            : '',
        time:
          typeof item.time === 'string'
            ? item.time.slice(0, EVENT_GUIDE_LIMITS.time)
            : '',
        place:
          typeof item.place === 'string'
            ? item.place.slice(0, EVENT_GUIDE_LIMITS.place)
            : '',
      };
    });
}
