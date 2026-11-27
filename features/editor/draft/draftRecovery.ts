import type { EditorDraftSnapshot } from './editorDraft';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// 날짜 차이는 시간이 아니라 달력 날짜(자정 기준)로 센다. 오늘 밤 11시에 저장하고
// 새벽 1시에 돌아와도 사용자에게는 '어제' 저장한 초안이다.
function calendarDayIndex(time: number): number {
  const date = new Date(time);
  return Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() /
      DAY_MS
  );
}

function formatClock(time: number): string {
  const date = new Date(time);
  const hours = date.getHours();
  const meridiem = hours >= 12 ? '오후' : '오전';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${meridiem} ${displayHours}:${minutes}`;
}

/**
 * 초안을 언제 저장했는지 사람이 바로 읽을 수 있는 문장으로 만든다.
 * 시계 오차로 저장 시각이 미래로 보이면 '방금 전'으로 다룬다.
 */
export function describeEditorDraftSavedAt(
  savedAt: number,
  now: number = Date.now()
): string {
  const age = now - savedAt;

  if (age < MINUTE_MS) return '방금 전 저장';
  if (age < HOUR_MS) return `${Math.floor(age / MINUTE_MS)}분 전 저장`;

  const dayDiff = calendarDayIndex(now) - calendarDayIndex(savedAt);
  if (dayDiff <= 0) return `오늘 ${formatClock(savedAt)} 저장`;
  if (dayDiff === 1) return `어제 ${formatClock(savedAt)} 저장`;

  const savedDate = new Date(savedAt);
  const monthDay = `${savedDate.getMonth() + 1}월 ${savedDate.getDate()}일`;
  const yearPrefix =
    savedDate.getFullYear() === new Date(now).getFullYear()
      ? ''
      : `${savedDate.getFullYear()}년 `;

  return `${yearPrefix}${monthDay} ${formatClock(savedAt)} 저장`;
}

/**
 * 대화상자에 한 줄로 보여 줄 초안 요약. 사진·블록 수가 0이면 굳이 말하지 않는다.
 */
export function summarizeEditorDraft(
  draft: EditorDraftSnapshot,
  now: number = Date.now()
): string {
  const parts: string[] = [];
  const photoCount = Array.isArray(draft.images) ? draft.images.length : 0;
  const blockCount = Array.isArray(draft.blocks) ? draft.blocks.length : 0;

  if (photoCount > 0) parts.push(`사진 ${photoCount}장`);
  if (blockCount > 0) parts.push(`블록 ${blockCount}개`);
  parts.push(describeEditorDraftSavedAt(draft.savedAt, now));

  return parts.join(' · ');
}
