export interface CalendarClock {
  /** 0-23 */
  hour: number;
  /** 0-59 */
  minute: number;
}

/**
 * Invitation times are saved either as a 24-hour clock ("14:30") or with a
 * Korean/English period ("오후 02:30", "2:30 PM"). Returns null when the value
 * cannot be read as a real clock time.
 */
export function parseCalendarClock(time?: string): CalendarClock | null {
  const match = time
    ?.trim()
    .match(
      /^(?:(오전|오후|am|pm)\s*)?(\d{1,2}):(\d{2})(?:\s*(오전|오후|am|pm))?$/i
    );
  if (!match) return null;
  const [, prefix, rawHour, rawMinute, suffix] = match;
  const period = (prefix || suffix)?.toLowerCase();
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  const validHour = period ? hour >= 1 && hour <= 12 : hour <= 23;
  if ((prefix && suffix) || !validHour || minute > 59) return null;
  const isPM = period === '오후' || period === 'pm';
  return { hour: period ? (hour % 12) + (isPM ? 12 : 0) : hour, minute };
}

export const padClockPart = (value: number) => String(value).padStart(2, '0');

/** "14:30" -> "2:30", "오전 09:00" -> "9:00" (12-hour digits without a period) */
export const formatClock12Digits = (clock: CalendarClock) =>
  `${clock.hour % 12 || 12}:${padClockPart(clock.minute)}`;

/** Period label for a parsed clock in the requested language. */
export const formatClockPeriod = (
  clock: CalendarClock,
  language: 'ko' | 'en' = 'ko'
) => {
  const isAM = clock.hour < 12;
  if (language === 'ko') return isAM ? '오전' : '오후';
  return isAM ? 'AM' : 'PM';
};
