import type { JSONContent } from '@tiptap/react';

export type AccountEntry = {
  name: string;
  bank: string;
  account: string;
  // 기존 초대장에 저장된 송금 설정입니다.
  kakao?: boolean;
  kakaoPayUrl?: string;
  tossUrl?: string;
};

export const accountSchema = {
  type: null,
  fields: {
    title: {
      default: '마음 보내실 곳',
      required: true,
    },
    checkedSubTitle: {
      default: true,
      required: true,
    },
    subTitle: {
      default: 'ACCOUNT',
      required: false,
    },
    messageJson: {
      default: null as JSONContent | null,
      required: true,
    },
    messageHtml: {
      default: null as string | null,
      required: true,
    },
    groupList: {
      default: [{ name: '' }] as {
        name: string;
      }[],
      required: true,
    },
    accountList: {
      default: [[{ name: '', bank: '', account: '' }]] as AccountEntry[][],
      required: true,
    },
  },
} as const;
