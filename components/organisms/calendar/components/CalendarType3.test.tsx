import { render, screen } from '@testing-library/react';

import { generateCalendarGrid } from '../utils/utils';

import { CalendarType3 } from './CalendarType3';

const renderType3 = (time: string, language: 'ko' | 'en' = 'ko') =>
  render(
    <CalendarType3
      currentYear={2026}
      currentMonth={3}
      calendarDays={generateCalendarGrid(2026, 2, 9)}
      headerDays={['일', '월', '화', '수', '목', '금', '토']}
      time={time}
      timeInfo={{ timeText: undefined, ampm: undefined }}
      language={language}
      monthText="3월"
      targetLabel="결혼식"
      timeLabel=""
      accentColor="#111827"
    />
  );

describe('CalendarType3 time label', () => {
  it('shows a 12-hour time with the right period for a saved Korean time', () => {
    renderType3('오후 06:00');

    expect(screen.getByText('6:00')).toBeInTheDocument();
    expect(screen.getByText('오후')).toBeInTheDocument();
    expect(screen.queryByText('06:00')).not.toBeInTheDocument();
  });

  it('converts a 24-hour time instead of printing it raw', () => {
    renderType3('18:00');

    expect(screen.getByText('6:00')).toBeInTheDocument();
    expect(screen.getByText('오후')).toBeInTheDocument();
  });

  it('keeps minutes and morning period intact', () => {
    renderType3('오전 09:30');

    expect(screen.getByText('9:30')).toBeInTheDocument();
    expect(screen.getByText('오전')).toBeInTheDocument();
  });

  it('uses AM/PM for English invitations', () => {
    renderType3('오후 06:00', 'en');

    expect(screen.getByText('PM')).toBeInTheDocument();
  });

  it('leaves the day clean when no time was saved', () => {
    renderType3('');

    expect(screen.queryByText('오후')).not.toBeInTheDocument();
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);
  });
});
