import { parseStrictDate } from '@/shared/utils/dateValidation';

const seoulDate = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'long',
  timeZone: 'Asia/Seoul',
});
const createdTimePattern =
  /^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/i;

export function formatInvitationCreatedDate(createdTime?: string) {
  if (!createdTime || !createdTimePattern.test(createdTime)) return undefined;
  if (!parseStrictDate(createdTime.slice(0, 10))) return undefined;

  const timestamp = Date.parse(createdTime);
  return Number.isFinite(timestamp)
    ? `${seoulDate.format(timestamp)} 생성`
    : undefined;
}
