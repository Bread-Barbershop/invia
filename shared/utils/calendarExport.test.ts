import {
  buildCalendarEventStamp,
  buildCalendarFileName,
  buildGoogleCalendarUrl,
  buildIcsContent,
  escapeIcsText,
  foldIcsLine,
  parseCalendarTime,
} from './calendarExport';

describe('parseCalendarTime', () => {
  it('오전·오후 표기를 24시간으로 바꾼다', () => {
    expect(parseCalendarTime('오후 02:30')).toEqual({ hour: 14, minute: 30 });
    expect(parseCalendarTime('오전 09:00')).toEqual({ hour: 9, minute: 0 });
    expect(parseCalendarTime('오후 12:00')).toEqual({ hour: 12, minute: 0 });
    expect(parseCalendarTime('오전 12:10')).toEqual({ hour: 0, minute: 10 });
  });

  it('24시간 표기를 그대로 읽는다', () => {
    expect(parseCalendarTime('18:30')).toEqual({ hour: 18, minute: 30 });
  });

  it('비어 있거나 읽을 수 없는 표기는 null', () => {
    expect(parseCalendarTime(undefined)).toBeNull();
    expect(parseCalendarTime('')).toBeNull();
    expect(parseCalendarTime('저녁 7시')).toBeNull();
    expect(parseCalendarTime('오후 25:00')).toBeNull();
  });
});

describe('buildCalendarEventStamp', () => {
  it('한국 시간을 UTC로 바꾸고 2시간짜리 일정을 만든다', () => {
    expect(
      buildCalendarEventStamp({ date: '2026-03-09', time: '오후 02:30' })
    ).toEqual({
      allDay: false,
      start: '20260309T053000Z',
      end: '20260309T073000Z',
    });
  });

  it('자정을 넘기는 일정도 다음 날짜로 계산한다', () => {
    expect(
      buildCalendarEventStamp({ date: '2026-12-31', time: '오후 11:30' })
    ).toEqual({
      allDay: false,
      start: '20261231T143000Z',
      end: '20261231T163000Z',
    });
  });

  it('시간이 없으면 종일 일정으로 처리한다', () => {
    expect(buildCalendarEventStamp({ date: '2026-12-20' })).toEqual({
      allDay: true,
      start: '20261220',
      end: '20261221',
    });
  });

  it('날짜가 없으면 null', () => {
    expect(buildCalendarEventStamp({ date: '' })).toBeNull();
    expect(buildCalendarEventStamp({ date: '12월 20일' })).toBeNull();
  });
});

describe('escapeIcsText / foldIcsLine', () => {
  it('ICS 특수문자를 이스케이프한다', () => {
    expect(escapeIcsText('저녁, 와인; 이야기\\끝\n다음 줄')).toBe(
      '저녁\\, 와인\\; 이야기\\\\끝\\n다음 줄'
    );
  });

  it('75옥텟이 넘는 줄을 공백으로 이어 붙여 자른다', () => {
    const folded = foldIcsLine(`SUMMARY:${'가나다라마바사'.repeat(6)}`);
    const lines = folded.split('\r\n');

    expect(lines.length).toBeGreaterThan(1);
    lines.forEach((line, index) => {
      if (index > 0) expect(line.startsWith(' ')).toBe(true);
      expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75);
    });
    expect(folded.replace(/\r\n /g, '')).toBe(
      `SUMMARY:${'가나다라마바사'.repeat(6)}`
    );
  });
});

describe('buildIcsContent', () => {
  const now = new Date('2026-11-28T00:00:00Z');

  it('일정·장소·제목을 담은 VCALENDAR를 만든다', () => {
    const ics = buildIcsContent(
      {
        title: '예식 일정',
        date: '2026-03-09',
        time: '오후 02:30',
        location: '서울 강남구 테헤란로1길 19',
      },
      now
    );

    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
    expect(ics).toContain('BEGIN:VEVENT\r\n');
    expect(ics).toContain('DTSTAMP:20261128T000000Z');
    expect(ics).toContain('DTSTART:20260309T053000Z');
    expect(ics).toContain('DTEND:20260309T073000Z');
    expect(ics).toContain('SUMMARY:예식 일정');
    expect(ics).toContain('LOCATION:서울 강남구 테헤란로1길 19');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('같은 일정은 같은 UID를 만든다', () => {
    const event = { title: '첫돌 잔치', date: '2026-12-20', time: '오전 11:00' };
    const first = buildIcsContent(event, now)
      .split('\r\n')
      .find(line => line.startsWith('UID:'));
    const second = buildIcsContent(event, now)
      .split('\r\n')
      .find(line => line.startsWith('UID:'));

    expect(first).toBe(second);
    expect(first).toContain('@invia.co.kr');
  });

  it('날짜가 없으면 빈 문자열', () => {
    expect(buildIcsContent({ title: '일정', date: '' }, now)).toBe('');
  });
});

describe('buildGoogleCalendarUrl', () => {
  it('제목·기간·장소를 담은 템플릿 링크를 만든다', () => {
    const url = buildGoogleCalendarUrl({
      title: '예식 일정',
      date: '2026-03-09',
      time: '오후 02:30',
      location: '서울 강남구',
    });
    const params = new URL(url).searchParams;

    expect(url.startsWith('https://calendar.google.com/calendar/render?')).toBe(
      true
    );
    expect(params.get('action')).toBe('TEMPLATE');
    expect(params.get('text')).toBe('예식 일정');
    expect(params.get('dates')).toBe('20260309T053000Z/20260309T073000Z');
    expect(params.get('location')).toBe('서울 강남구');
  });

  it('날짜가 없으면 빈 문자열', () => {
    expect(buildGoogleCalendarUrl({ title: '일정', date: '' })).toBe('');
  });
});

describe('buildCalendarFileName', () => {
  it('파일 이름에 쓸 수 없는 문자를 지운다', () => {
    expect(buildCalendarFileName('예식/일정: 3월')).toBe('예식일정 3월.ics');
    expect(buildCalendarFileName('   ')).toBe('invia-invitation.ics');
  });
});
