import type { InvitationType } from '@/shared/types/block';

export type ChecklistItem = {
  id: string;
  label: string;
  note: string;
};

export const CHECKLIST_LIMITS = {
  title: 40,
  description: 120,
  label: 60,
  note: 120,
  items: 12,
} as const;

type ChecklistItemInput = Partial<Omit<ChecklistItem, 'id'>>;

const PRESETS: Partial<
  Record<InvitationType, Omit<ChecklistItem, 'id'>[]>
> = {
  wedding: [
    { label: '초대장 링크 저장', note: '당일 입장할 때 필요해요.' },
    { label: '주차 등록', note: '차량 번호를 미리 알려 주세요.' },
    {
      label: '예식 시간 확인',
      note: '예식 30분 전까지 도착해 주세요.',
    },
  ],
  firstBirthday: [
    { label: '카메라', note: '아기의 첫 생일을 남겨 주세요.' },
    { label: '아이 간식', note: '아이가 좋아하는 간식을 챙겨 주세요.' },
    { label: '여벌 옷', note: '음식이 묻어도 걱정 없도록요.' },
  ],
  birthday: [
    { label: '초대장 링크 저장', note: '당일 입장할 때 필요해요.' },
    { label: '카메라', note: '오늘의 주인공을 사진으로 남겨 주세요.' },
  ],
  seminar: [
    { label: '명함', note: '네트워킹 시간에 나눠 주세요.' },
    { label: '필기 도구', note: '노트와 펜을 준비해 주세요.' },
    { label: '주차 등록', note: '차량 번호를 미리 알려 주세요.' },
  ],
  etc: [
    { label: '초대장 링크 저장', note: '당일 입장할 때 필요해요.' },
    { label: '편한 복장', note: '오래 머물러도 편하게요.' },
  ],
  bridalShower: [
    { label: '초대장 링크 저장', note: '당일 입장할 때 필요해요.' },
    { label: '드레스코드 확인', note: '파티 분위기에 맞는 옷차림을 준비해 주세요.' },
    { label: '카메라', note: '주인공과의 특별한 순간을 남겨 주세요.' },
  ],
  exhibition: [
    { label: '초대장 링크 저장', note: '오프닝 날 입장 확인에 필요해요.' },
    { label: '편한 신발', note: '서서 둘러보는 시간이 길어요.' },
    { label: '빈손으로 오세요', note: '음료와 다과는 저희가 준비합니다.' },
  ],
};

export function createChecklistItem(
  value: ChecklistItemInput = {}
): ChecklistItem {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return { id, label: '', note: '', ...value };
}

export function getChecklistPreset(
  type: InvitationType
): ChecklistItem[] {
  return (PRESETS[type] ?? PRESETS.etc ?? []).map(item =>
    createChecklistItem(item)
  );
}

export function normalizeChecklistItems(value: unknown): ChecklistItem[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null
    )
    .slice(0, CHECKLIST_LIMITS.items)
    .map((item, index) => {
      let id =
        typeof item.id === 'string' && item.id.length > 0
          ? item.id
          : String(index);
      while (ids.has(id)) id += '-';
      ids.add(id);
      return {
        id,
        label:
          typeof item.label === 'string'
            ? item.label.slice(0, CHECKLIST_LIMITS.label)
            : '',
        note:
          typeof item.note === 'string'
            ? item.note.slice(0, CHECKLIST_LIMITS.note)
            : '',
      };
    });
}
