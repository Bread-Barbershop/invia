'use client';

import { CalendarPlus, ExternalLink } from 'lucide-react';

import {
  buildCalendarFileName,
  buildGoogleCalendarUrl,
  buildIcsContent,
  downloadCalendarFile,
} from '@/shared/utils/calendarExport';

import styles from './calendarSaveActions.module.css';

interface Props {
  title: string;
  date: string;
  time?: string;
  location?: string;
}

/**
 * 초대장을 받은 하객이 일정을 자기 캘린더에 저장하는 버튼.
 * .ics 파일(애플·삼성·아웃룩 캘린더)과 Google 캘린더 링크를 함께 제공한다.
 */
export function CalendarSaveActions({ title, date, time, location }: Props) {
  const event = { title, date, time, location };
  const googleCalendarUrl = buildGoogleCalendarUrl(event);

  if (!googleCalendarUrl) return null;

  const handleSaveIcs = () => {
    const content = buildIcsContent(event);
    if (!content) return;
    downloadCalendarFile(content, buildCalendarFileName(title));
  };

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.action}
        onClick={handleSaveIcs}
      >
        <CalendarPlus aria-hidden="true" className={styles.icon} />
        캘린더에 저장
      </button>
      <a
        className={styles.action}
        href={googleCalendarUrl}
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink aria-hidden="true" className={styles.icon} />
        Google 캘린더
      </a>
    </div>
  );
}
