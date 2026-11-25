import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  escapeIcsText,
  foldIcsLine,
  htmlToPlainText,
  parseCalendarDate,
  resolveCalendarEvent,
} from './calendarExport';

const NOW = new Date('2026-11-25T12:42:52Z');

const lines = (content: string) => content.split('\r\n');

describe('parseCalendarDate', () => {
  it('reads a real YYYY-MM-DD date', () => {
    expect(parseCalendarDate('2026-03-09')).toEqual({
      year: 2026,
      month: 3,
      day: 9,
    });
  });

  it.each([
    ['', null],
    [undefined, null],
    [null, null],
    ['2026-3-9', null],
    ['20260309', null],
    ['2026-02-30', null],
    ['2026-13-01', null],
    ['0000-01-01', null],
  ])('rejects %p', (input, expected) => {
    expect(parseCalendarDate(input as string | undefined)).toBe(expected);
  });
});

describe('resolveCalendarEvent', () => {
  it('turns the invitation schedule into a 2-hour event in Asia/Seoul', () => {
    const event = resolveCalendarEvent({
      title: '김민수 · 이서연 결혼식',
      date: '2026-03-09',
      time: '오후 02:30',
      location: '인비아 하우스, 3층 그랜드홀, 서울 강남구',
    });

    expect(event?.start.toISOString()).toBe('2026-03-09T05:30:00.000Z');
    expect(event?.end.toISOString()).toBe('2026-03-09T07:30:00.000Z');
    expect(event?.allDay).toBe(false);
    expect(event?.title).toBe('김민수 · 이서연 결혼식');
    expect(event?.fileName).toMatch(/^invia-.*-20260309\.ics$/);
  });

  it('reads 24-hour and English times as the same instant', () => {
    const korean = resolveCalendarEvent({
      date: '2026-03-09',
      time: '오후 06:00',
    });
    const twentyFourHour = resolveCalendarEvent({
      date: '2026-03-09',
      time: '18:00',
    });
    const english = resolveCalendarEvent({
      date: '2026-03-09',
      time: '6:00 PM',
    });

    expect(korean?.start.toISOString()).toBe('2026-03-09T09:00:00.000Z');
    expect(twentyFourHour?.start.toISOString()).toBe(
      '2026-03-09T09:00:00.000Z'
    );
    expect(english?.start.toISOString()).toBe('2026-03-09T09:00:00.000Z');
  });

  it('handles midnight and noon without shifting the day', () => {
    const midnight = resolveCalendarEvent({
      date: '2026-03-09',
      time: '오전 12:00',
    });
    const noon = resolveCalendarEvent({
      date: '2026-03-09',
      time: '오후 12:00',
    });

    expect(midnight?.start.toISOString()).toBe('2026-03-08T15:00:00.000Z');
    expect(noon?.start.toISOString()).toBe('2026-03-09T03:00:00.000Z');
  });

  it('falls back to a whole-day event when the time is missing or unreadable', () => {
    const missing = resolveCalendarEvent({ date: '2026-03-09', title: '예식' });
    const broken = resolveCalendarEvent({
      date: '2026-03-09',
      time: '점심쯤',
    });

    expect(missing?.allDay).toBe(true);
    expect(missing?.start.toISOString()).toBe('2026-03-08T15:00:00.000Z');
    expect(missing?.end.toISOString()).toBe('2026-03-09T15:00:00.000Z');
    expect(broken?.allDay).toBe(true);
  });

  it('honours a custom duration', () => {
    const event = resolveCalendarEvent({
      date: '2026-03-09',
      time: '11:00',
      durationMinutes: 45,
    });

    expect(event?.end.toISOString()).toBe('2026-03-09T02:45:00.000Z');
  });

  it('uses a safe fallback title and keeps an empty location empty', () => {
    const event = resolveCalendarEvent({ date: '2026-03-09', title: '   ' });

    expect(event?.title).toBe('초대 일정');
    expect(event?.location).toBe('');
    expect(event?.fileName).toBe('invia-invitation-20260309.ics');
  });

  it('returns null for a missing or impossible date', () => {
    expect(resolveCalendarEvent({ date: '' })).toBeNull();
    expect(resolveCalendarEvent({ date: '2026-02-30' })).toBeNull();
  });
});

describe('buildIcsContent', () => {
  const content = buildIcsContent({
    title: '김민수 · 이서연 결혼식',
    date: '2026-03-09',
    time: '오후 02:30',
    location: '인비아 하우스, 서울 강남구',
    description: '오후 2시 30분까지 도착해 주세요.',
    now: NOW,
  }) as string;

  it('produces a single VEVENT calendar with CRLF line endings', () => {
    expect(content.endsWith('\r\n')).toBe(true);
    expect(content).not.toMatch(/[^\r]\n/);
    expect(lines(content)).toEqual(
      expect.arrayContaining([
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'DTSTAMP:20261125T124252Z',
        'DTSTART:20260309T053000Z',
        'DTEND:20260309T073000Z',
        'END:VEVENT',
        'END:VCALENDAR',
      ])
    );
  });

  it('escapes commas in text properties and keeps a stable UID', () => {
    const reimported = buildIcsContent({
      title: '김민수 · 이서연 결혼식',
      date: '2026-03-09',
      time: '오후 02:30',
      location: '인비아 하우스, 서울 강남구',
      now: new Date('2026-11-25T13:00:00Z'),
    });

    const uid = lines(content).find(line => line.startsWith('UID:'));
    expect(uid).toBeDefined();
    expect(lines(reimported as string)).toContain(uid);
    expect(lines(content)).toContain('LOCATION:인비아 하우스\\, 서울 강남구');
  });

  it('writes all-day events with DATE values', () => {
    const allDay = buildIcsContent({
      title: '예식',
      date: '2026-03-09',
      now: NOW,
    }) as string;

    expect(lines(allDay)).toContain('DTSTART;VALUE=DATE:20260309');
    expect(lines(allDay)).toContain('DTEND;VALUE=DATE:20260310');
  });

  it('omits optional properties that are empty', () => {
    const minimal = buildIcsContent({
      title: '예식',
      date: '2026-03-09',
      time: '11:00',
      now: NOW,
    }) as string;

    expect(minimal).not.toContain('LOCATION:');
    expect(minimal).not.toContain('DESCRIPTION:');
  });

  it('returns null when the date is unusable', () => {
    expect(buildIcsContent({ date: '' })).toBeNull();
  });

  it('folds long Korean lines within 75 octets', () => {
    const longTitle = '아주 긴 초대장 제목입니다 '.repeat(6).trim();
    const folded = buildIcsContent({
      title: longTitle,
      date: '2026-03-09',
      time: '11:00',
      now: NOW,
    }) as string;

    for (const line of folded.split('\r\n')) {
      // 75 octets per line, or 76 allowing the leading folding space
      expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(76);
    }
    const unfolded = folded.replace(/\r\n /g, '');
    expect(unfolded).toContain(`SUMMARY:${escapeIcsText(longTitle)}`);
  });
});

describe('escapeIcsText', () => {
  it('escapes separators, backslashes and newlines', () => {
    expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
  });

  it('turns empty input into an empty value', () => {
    expect(escapeIcsText(undefined)).toBe('');
  });
});

describe('foldIcsLine', () => {
  it('leaves short lines untouched', () => {
    expect(foldIcsLine('SUMMARY:짧은 제목')).toBe('SUMMARY:짧은 제목');
  });

  it('never splits a multi-byte character in half', () => {
    const folded = foldIcsLine(`DESCRIPTION:${'가'.repeat(60)}`);
    for (const line of folded.split('\r\n')) {
      expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(76);
      expect(line).not.toContain('\uFFFD');
    }
    expect(folded.replace(/\r\n /g, '')).toBe(`DESCRIPTION:${'가'.repeat(60)}`);
  });
});

describe('buildGoogleCalendarUrl', () => {
  it('matches the event title, window and location', () => {
    const url = new URL(
      buildGoogleCalendarUrl({
        title: '김민수 · 이서연 결혼식',
        date: '2026-03-09',
        time: '오후 02:30',
        location: '인비아 하우스, 서울 강남구',
        description: '오후 2시 30분까지 도착해 주세요.',
      }) as string
    );

    expect(url.origin + url.pathname).toBe(
      'https://calendar.google.com/calendar/render'
    );
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('text')).toBe('김민수 · 이서연 결혼식');
    expect(url.searchParams.get('dates')).toBe(
      '20260309T053000Z/20260309T073000Z'
    );
    expect(url.searchParams.get('location')).toBe('인비아 하우스, 서울 강남구');
    expect(url.searchParams.get('details')).toBe(
      '오후 2시 30분까지 도착해 주세요.'
    );
  });

  it('uses plain dates for an all-day event', () => {
    const url = new URL(
      buildGoogleCalendarUrl({ title: '예식', date: '2026-03-09' }) as string
    );

    expect(url.searchParams.get('dates')).toBe('20260309/20260310');
  });

  it('returns null when the date is unusable', () => {
    expect(buildGoogleCalendarUrl({ date: 'nope' })).toBeNull();
  });
});

describe('htmlToPlainText', () => {
  it('keeps the notice copy without markup', () => {
    expect(
      htmlToPlainText(
        '<p>오후 2시 30분까지<br />도착해 주세요.</p><p>주차는 2시간 무료입니다.</p>'
      )
    ).toBe('오후 2시 30분까지\n도착해 주세요.\n주차는 2시간 무료입니다.');
  });

  it('decodes the entities a saved notice can contain', () => {
    expect(htmlToPlainText('A&amp;B &lt;3 &quot;축하&quot;')).toBe(
      'A&B <3 "축하"'
    );
  });

  it('returns an empty string for empty input', () => {
    expect(htmlToPlainText(null)).toBe('');
  });
});
