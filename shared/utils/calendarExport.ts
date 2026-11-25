import { padClockPart, parseCalendarClock } from '@/shared/utils/calendarTime';

/** Korea has no daylight saving time, so a fixed offset is exact for every date. */
export const SEOUL_UTC_OFFSET_MINUTES = 9 * 60;

export const DEFAULT_EVENT_DURATION_MINUTES = 120;

const DEFAULT_EVENT_TITLE = '초대 일정';

export interface CalendarEventInput {
  /** Event title shown in the invitation. Falls back to a generic title. */
  title?: string | null;
  /** Invitation date saved as `YYYY-MM-DD`. */
  date?: string | null;
  /** Invitation time saved as `오후 02:30`, `14:30` or `2:30 PM`. Missing -> all-day event. */
  time?: string | null;
  /** Venue name and/or address. */
  location?: string | null;
  /** Plain-text event description (the invitation's own notice copy). */
  description?: string | null;
  /** Event length when the invitation gives a start time only. */
  durationMinutes?: number;
  /** Reference instant for `DTSTAMP`; defaults to the current time. */
  now?: Date;
}

export interface ResolvedCalendarEvent {
  title: string;
  location: string;
  description: string;
  /** Calendar date of the event (local to Asia/Seoul). */
  date: string;
  /** Instant the event starts (UTC). */
  start: Date;
  /** Instant the event ends (UTC). */
  end: Date;
  /** True when the invitation has no readable time, so the event covers the whole day. */
  allDay: boolean;
  /** DTSTART value: a UTC stamp for timed events, `20260309` for all-day ones. */
  startValue: string;
  /** DTEND value matching `startValue`. */
  endValue: string;
  /** File name for the downloaded `.ics` file. */
  fileName: string;
}

interface ParsedDate {
  year: number;
  month: number;
  day: number;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Reads `YYYY-MM-DD` and rejects dates that do not exist (e.g. 2026-02-30). */
export function parseCalendarDate(date?: string | null): ParsedDate | null {
  const match = date?.trim().match(DATE_PATTERN);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2999) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

const toUtcInstant = (
  { year, month, day }: ParsedDate,
  minutesFromLocalMidnight: number
) =>
  new Date(
    Date.UTC(year, month - 1, day) +
      minutesFromLocalMidnight * 60_000 -
      SEOUL_UTC_OFFSET_MINUTES * 60_000
  );

/** `20260309` for the event day, used by all-day ICS values and Google dates. */
export const formatDateCompact = ({ year, month, day }: ParsedDate) =>
  `${year}${padClockPart(month)}${padClockPart(day)}`;

const addDays = (
  { year, month, day }: ParsedDate,
  days: number
): ParsedDate => {
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
};

/** RFC 5545 UTC timestamp: `20260309T050000Z`. */
export const formatIcsUtc = (instant: Date) =>
  `${instant.getUTCFullYear()}${padClockPart(
    instant.getUTCMonth() + 1
  )}${padClockPart(instant.getUTCDate())}T${padClockPart(
    instant.getUTCHours()
  )}${padClockPart(instant.getUTCMinutes())}${padClockPart(
    instant.getUTCSeconds()
  )}Z`;

/** RFC 5545 text escaping for property values such as SUMMARY or LOCATION. */
export function escapeIcsText(value?: string | null) {
  return (value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

/** RFC 5545 requires content lines of at most 75 octets, folded with CRLF + space. */
export function foldIcsLine(line: string) {
  const limit = 75;
  const parts: string[] = [];
  let current = '';
  let currentBytes = 0;
  for (const char of line) {
    const charBytes = utf8ByteLength(char);
    const budget = parts.length === 0 ? limit : limit - 1; // continuation lines start with a space
    if (currentBytes + charBytes > budget && current) {
      parts.push(current);
      current = char;
      currentBytes = charBytes;
      continue;
    }
    current += char;
    currentBytes += charBytes;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

function utf8ByteLength(value: string) {
  let bytes = 0;
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/** Turns saved notice HTML into plain text for a calendar description. */
export function htmlToPlainText(html?: string | null) {
  if (!html) return '';
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const normalizeDuration = (minutes?: number) =>
  typeof minutes === 'number' && Number.isFinite(minutes) && minutes > 0
    ? Math.round(minutes)
    : DEFAULT_EVENT_DURATION_MINUTES;

const normalizeText = (value?: string | null) => (value ?? '').trim();

const slugifyFileName = (title: string) => {
  const ascii = title
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 40);
  return /[a-z0-9]/.test(ascii) ? ascii : 'invitation';
};

/**
 * Resolves the invitation's schedule into a calendar event.
 * Returns null when the date is missing or cannot be a real date.
 */
export function resolveCalendarEvent(
  input: CalendarEventInput
): ResolvedCalendarEvent | null {
  const parsedDate = parseCalendarDate(input.date);
  if (!parsedDate) return null;

  const clock = parseCalendarClock(input.time ?? undefined);
  const title = normalizeText(input.title) || DEFAULT_EVENT_TITLE;
  const location = normalizeText(input.location);
  const description = normalizeText(input.description);
  const allDay = !clock;
  const durationMinutes = normalizeDuration(input.durationMinutes);
  const start = toUtcInstant(
    parsedDate,
    clock ? clock.hour * 60 + clock.minute : 0
  );
  const end = new Date(
    start.getTime() + (allDay ? 24 * 60 : durationMinutes) * 60_000
  );
  const startDate = formatDateCompact(parsedDate);
  const nextDate = formatDateCompact(addDays(parsedDate, 1));

  return {
    title,
    location,
    description,
    date: `${parsedDate.year}-${padClockPart(parsedDate.month)}-${padClockPart(
      parsedDate.day
    )}`,
    start,
    end,
    allDay,
    startValue: allDay ? startDate : formatIcsUtc(start),
    endValue: allDay ? nextDate : formatIcsUtc(end),
    fileName: `invia-${slugifyFileName(title)}-${startDate}.ics`,
  };
}

/** Stable UID so re-importing the file updates the same event instead of duplicating it. */
const buildEventUid = (event: ResolvedCalendarEvent) =>
  `invia-${fnv1a(
    `${event.title}|${event.date}|${formatIcsUtc(event.start)}`
  ).toString(36)}@invia.co.kr`;

function fnv1a(value: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Builds a single-event RFC 5545 calendar, or null when the date is unusable. */
export function buildIcsContent(input: CalendarEventInput): string | null {
  const event = resolveCalendarEvent(input);
  if (!event) return null;
  const stamp = formatIcsUtc(input.now ?? new Date());
  const dateValue = event.allDay
    ? `DTSTART;VALUE=DATE:${event.startValue}`
    : `DTSTART:${event.startValue}`;
  const endValue = event.allDay
    ? `DTEND;VALUE=DATE:${event.endValue}`
    : `DTEND:${event.endValue}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//invia//Calendar Export//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${buildEventUid(event)}`,
    `DTSTAMP:${stamp}`,
    dateValue,
    endValue,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];
  if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  if (event.description)
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

const GOOGLE_CALENDAR_ENDPOINT =
  'https://calendar.google.com/calendar/render?action=TEMPLATE';

/**
 * Google Calendar "add event" template link matching the downloaded `.ics`.
 * Timed events use UTC instants; all-day events use plain calendar dates.
 */
export function buildGoogleCalendarUrl(
  input: CalendarEventInput
): string | null {
  const event = resolveCalendarEvent(input);
  if (!event) return null;
  const params = new URLSearchParams({
    text: event.title,
    dates: `${event.startValue}/${event.endValue}`,
    ctz: 'Asia/Seoul',
  });
  if (event.location) params.set('location', event.location);
  if (event.description) params.set('details', event.description);
  return `${GOOGLE_CALENDAR_ENDPOINT}&${params.toString()}`;
}
