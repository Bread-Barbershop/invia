import { formatInvitationCreatedDate } from './formatInvitationCreatedDate';

describe('대시보드 생성일', () => {
  it.each([
    ['2026-11-22T14:59:59.999Z', '2026년 11월 22일 생성'],
    ['2026-11-22T15:00:00Z', '2026년 11월 23일 생성'],
    ['2026-11-23T00:00:00+09:00', '2026년 11월 23일 생성'],
    ['2026-11-23', '2026년 11월 23일 생성'],
  ])('생성 시각 %s을 서울 날짜 %s로 표시한다', (createdTime, expected) => {
    expect(formatInvitationCreatedDate(createdTime)).toBe(expected);
  });

  it.each([
    undefined,
    '',
    '2026-02-30T10:00:00Z',
    '2026-11-23T10:00:00',
    '2026-11-23 garbage',
  ])('잘못되거나 없는 생성 시각 %s은 표시하지 않는다', createdTime => {
    expect(formatInvitationCreatedDate(createdTime)).toBeUndefined();
  });
});
