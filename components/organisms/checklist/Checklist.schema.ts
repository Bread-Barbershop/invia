import { createChecklistItem, type ChecklistItem } from './checklistItems';

export const checklistSchema = {
  type: null,
  fields: {
    title: { default: '체크리스트', required: true },
    description: { default: '아래 항목을 하나씩 확인해 주세요.', required: false },
    items: {
      default: () =>
        [
          createChecklistItem({
            label: '초대장 링크 저장',
            note: '당일 입장할 때 필요해요.',
          }),
          createChecklistItem({
            label: '주차 등록',
            note: '차량 번호를 미리 알려 주세요.',
          }),
        ] as ChecklistItem[],
      required: true,
    },
  },
} as const;
