'use client';

import { useMemo } from 'react';

import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  resolveCalendarEvent,
  type CalendarEventInput,
} from '@/shared/utils/calendarExport';
import { cn } from '@/shared/utils/cn';

import styles from '../calendarPreview.module.css';

interface Props {
  title: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  language?: 'ko' | 'en';
  className?: string;
}

const actionClassName = cn(
  'inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border border-[#e5e5e8] bg-transparent px-4 py-1.5',
  'text-[13px] font-medium text-[color:var(--calendar-text,var(--color-text-secondary))]',
  'transition-colors hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2',
  'focus-visible:outline-neutral-400'
);

const CALENDAR_MIME_TYPE = 'text/calendar;charset=utf-8';

/**
 * Guests usually decide on a gift, a ride and a day off right after opening the
 * invitation, so the schedule is offered as a real calendar event instead of a
 * line of text they have to copy by hand.
 */
export function AddToCalendarActions({
  title,
  date,
  time,
  location,
  description,
  language = 'ko',
  className,
}: Props) {
  const eventInput = useMemo<CalendarEventInput>(
    () => ({ title, date, time, location, description }),
    [title, date, time, location, description]
  );
  const event = useMemo(() => resolveCalendarEvent(eventInput), [eventInput]);
  const googleCalendarUrl = useMemo(
    () => buildGoogleCalendarUrl(eventInput),
    [eventInput]
  );

  if (!event) return null;

  const isEnglish = language === 'en';
  const handleSaveToCalendar = () => {
    const content = buildIcsContent(eventInput);
    if (!content) return;
    downloadTextFile(content, event.fileName);
  };

  return (
    <div
      className={cn(
        styles.addToCalendar,
        'flex flex-wrap justify-center gap-2',
        className
      )}
      data-testid="add-to-calendar"
    >
      <button
        type="button"
        onClick={handleSaveToCalendar}
        className={actionClassName}
        aria-label={
          isEnglish
            ? `Save ${event.title} to your calendar (.ics file)`
            : `${event.title} 일정을 캘린더에 저장 (.ics 파일)`
        }
        data-testid="add-to-calendar-ics"
      >
        {isEnglish ? 'Save to calendar' : '캘린더에 저장'}
      </button>
      {googleCalendarUrl && (
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClassName}
          aria-label={
            isEnglish
              ? `Add ${event.title} to Google Calendar`
              : `${event.title} 일정을 Google 캘린더에 추가`
          }
          data-testid="add-to-calendar-google"
        >
          Google 캘린더
        </a>
      )}
    </div>
  );
}

/**
 * Hands the `.ics` file to the browser's own download flow. A data URL keeps the
 * action working in environments without object URLs (tests, older webviews).
 */
function downloadTextFile(content: string, fileName: string) {
  const objectUrl = createObjectUrl(content);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (objectUrl.startsWith('blob:')) {
    // Give the browser a moment to start the download before dropping the URL.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}

export function createObjectUrl(content: string) {
  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      return URL.createObjectURL(
        new Blob([content], { type: CALENDAR_MIME_TYPE })
      );
    } catch {
      // fall through to the data URL
    }
  }
  return `data:${CALENDAR_MIME_TYPE},${encodeURIComponent(content)}`;
}
