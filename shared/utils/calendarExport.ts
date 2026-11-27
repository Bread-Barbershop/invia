/**
 * 하객이 초대장의 일정을 자기 캘린더에 저장할 수 있도록 .ics 파일과
 * Google 캘린더 링크를 만든다.
 *
 * 초대장의 날짜/시간은 한국 시간(Asia/Seoul) 기준으로 입력되며, 서머타임이
 * 없으므로 고정 +9시간 오프셋으로 UTC 타임스탬프를 만든다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DEFAULT_DURATION_MINUTES = 120;
const DEFAULT_EVENT_TITLE = '초대 일정';
const FALLBACK_FILE_NAME = 'invia-invitation.ics';

export type CalendarExportEvent = {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** '오후 2:30' · '오전 09:00' · '14:30' 등 */
  time?: string;
  location?: string;
  description?: string;
};

export type CalendarEventStamp = {
  allDay: boolean;
  start: string;
  end: string;
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function parseDateParts(date: string) {
  const match = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/** '오후 2:30' 형태와 24시간 표기를 모두 읽어 24시간 시각으로 돌려준다. */
export function parseCalendarTime(time?: string) {
  const match = time
    ?.trim()
    .match(/^(?:(오전|오후|am|pm)\s*)?(\d{1,2}):(\d{2})(?:\s*(오전|오후|am|pm))?$/i);
  if (!match) return null;

  const [, prefix, rawHour, rawMinute, suffix] = match;
  if (prefix && suffix) return null;

  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (minute > 59) return null;

  const period = (prefix ?? suffix)?.toLowerCase();
  if (!period) return hour <= 23 ? { hour, minute } : null;
  if (hour < 1 || hour > 12) return null;

  const isPm = period === '오후' || period === 'pm';
  return { hour: (hour % 12) + (isPm ? 12 : 0), minute };
}

function toUtcStamp(utc: Date) {
  return (
    `${utc.getUTCFullYear()}${pad(utc.getUTCMonth() + 1)}${pad(utc.getUTCDate())}` +
    `T${pad(utc.getUTCHours())}${pad(utc.getUTCMinutes())}00Z`
  );
}

function toDateStamp({
  year,
  month,
  day,
}: {
  year: number;
  month: number;
  day: number;
}) {
  return `${year}${pad(month)}${pad(day)}`;
}

function nextDateStamp({
  year,
  month,
  day,
}: {
  year: number;
  month: number;
  day: number;
}) {
  const next = new Date(Date.UTC(year, month - 1, day) + 24 * 60 * 60 * 1000);
  return (
    `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}` +
    pad(next.getUTCDate())
  );
}

/**
 * 캘린더에 넣을 시작/종료 시각을 만든다.
 * 시간이 없거나 읽을 수 없으면 종일 일정으로 처리하고, 날짜가 없으면 null.
 */
export function buildCalendarEventStamp(
  event: Pick<CalendarExportEvent, 'date' | 'time'>
): CalendarEventStamp | null {
  const parts = parseDateParts(event.date);
  if (!parts) return null;

  const clock = parseCalendarTime(event.time);
  if (!clock) {
    return {
      allDay: true,
      start: toDateStamp(parts),
      end: nextDateStamp(parts),
    };
  }

  const startMs =
    Date.UTC(parts.year, parts.month - 1, parts.day, clock.hour, clock.minute) -
    KST_OFFSET_MS;
  const endMs = startMs + DEFAULT_DURATION_MINUTES * 60 * 1000;

  return {
    allDay: false,
    start: toUtcStamp(new Date(startMs)),
    end: toUtcStamp(new Date(endMs)),
  };
}

export function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/** RFC 5545는 한 줄을 75옥텟으로 제한하며, 넘치면 다음 줄을 공백으로 시작한다. */
export function foldIcsLine(line: string, limit = 75) {
  const encoder = new TextEncoder();
  const byteLength = (value: string) => encoder.encode(value).length;

  const folded: string[] = [];
  let current = '';
  let currentLimit = limit;

  for (const char of line) {
    if (byteLength(current + char) > currentLimit) {
      folded.push(current);
      current = char;
      currentLimit = limit - 1; // 이어지는 줄은 공백 한 칸으로 시작한다.
      continue;
    }
    current += char;
  }
  folded.push(current);

  return folded.join('\r\n ');
}

function formatUtcDateTime(date: Date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}T${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function hashText(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  }
  return hash.toString(36);
}

function resolveEventTitle(event: CalendarExportEvent) {
  const title = event.title.trim();
  return title.length > 0 ? title : DEFAULT_EVENT_TITLE;
}

function buildEventUid(event: CalendarExportEvent, stamp: CalendarEventStamp) {
  return `${stamp.start}-${hashText(resolveEventTitle(event))}@invia.co.kr`;
}

export function buildIcsContent(
  event: CalendarExportEvent,
  now: Date = new Date()
) {
  const stamp = buildCalendarEventStamp(event);
  if (!stamp) return '';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//INVIA//Invitation//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${buildEventUid(event, stamp)}`,
    `DTSTAMP:${formatUtcDateTime(now)}`,
    stamp.allDay ? `DTSTART;VALUE=DATE:${stamp.start}` : `DTSTART:${stamp.start}`,
    stamp.allDay ? `DTEND;VALUE=DATE:${stamp.end}` : `DTEND:${stamp.end}`,
    `SUMMARY:${escapeIcsText(resolveEventTitle(event))}`,
    ...(event.location?.trim()
      ? [`LOCATION:${escapeIcsText(event.location.trim())}`]
      : []),
    ...(event.description?.trim()
      ? [`DESCRIPTION:${escapeIcsText(event.description.trim())}`]
      : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return `${lines.map(line => foldIcsLine(line)).join('\r\n')}\r\n`;
}

export function buildGoogleCalendarUrl(event: CalendarExportEvent) {
  const stamp = buildCalendarEventStamp(event);
  if (!stamp) return '';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: resolveEventTitle(event),
    dates: `${stamp.start}/${stamp.end}`,
  });
  if (event.location?.trim()) params.set('location', event.location.trim());
  if (event.description?.trim()) params.set('details', event.description.trim());

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildCalendarFileName(title: string) {
  const base = title
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);

  return base.length > 0 ? `${base}.ics` : FALLBACK_FILE_NAME;
}

/** 만든 .ics 내용을 파일로 내려받는다. */
export function downloadCalendarFile(content: string, fileName: string) {
  if (!content) return;
  if (
    typeof document === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return;
  }

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
