import { fireEvent, render, screen } from '@testing-library/react';

import { AddToCalendarActions } from './AddToCalendarActions';

const baseProps = {
  title: '김민수 · 이서연 결혼식',
  date: '2026-03-09',
  time: '오후 02:30',
  location: '인비아 하우스, 서울 강남구',
  description: '오후 2시 30분까지 도착해 주세요.',
};

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

afterEach(() => {
  if (originalCreateObjectURL) {
    URL.createObjectURL = originalCreateObjectURL;
  } else {
    // jsdom has no object URL support; drop the stub again
    delete (URL as unknown as Record<string, unknown>).createObjectURL;
  }
  if (originalRevokeObjectURL) {
    URL.revokeObjectURL = originalRevokeObjectURL;
  } else {
    delete (URL as unknown as Record<string, unknown>).revokeObjectURL;
  }
  jest.restoreAllMocks();
});

const clickDownload = () => {
  const click = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});
  fireEvent.click(screen.getByTestId('add-to-calendar-ics'));
  // `mock.instances` holds the element the click was dispatched on.
  return click.mock.instances[0] as HTMLAnchorElement | undefined;
};

describe('AddToCalendarActions', () => {
  it('offers an .ics download and a Google Calendar link', () => {
    render(<AddToCalendarActions {...baseProps} />);

    const download = screen.getByTestId('add-to-calendar-ics');
    expect(download).toHaveTextContent('캘린더에 저장');
    expect(
      screen.getByLabelText(
        '김민수 · 이서연 결혼식 일정을 캘린더에 저장 (.ics 파일)'
      )
    ).toBe(download);

    const google = screen.getByTestId('add-to-calendar-google');
    expect(google).toHaveAttribute('target', '_blank');
    expect(google).toHaveAttribute('rel', 'noopener noreferrer');
    const url = new URL(google.getAttribute('href') ?? '');
    expect(url.origin + url.pathname).toBe(
      'https://calendar.google.com/calendar/render'
    );
    expect(url.searchParams.get('text')).toBe('김민수 · 이서연 결혼식');
    expect(url.searchParams.get('dates')).toBe(
      '20260309T053000Z/20260309T073000Z'
    );
    expect(url.searchParams.get('location')).toBe('인비아 하우스, 서울 강남구');
    expect(url.searchParams.get('details')).toBe(
      '오후 2시 30분까지 도착해 주세요.'
    );
  });

  it('downloads a real .ics file named after the event day', () => {
    const createObjectURL = jest.fn((_blob: Blob) => 'blob:invia-calendar');
    URL.createObjectURL = createObjectURL;

    render(<AddToCalendarActions {...baseProps} />);
    const anchor = clickDownload();

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(createObjectURL.mock.calls[0][0].type).toBe(
      'text/calendar;charset=utf-8'
    );
    expect(anchor?.download).toBe('invia-invitation-20260309.ics');
    expect(anchor?.href).toBe('blob:invia-calendar');
  });

  it('drops the temporary file URL after the download starts', () => {
    jest.useFakeTimers();
    URL.createObjectURL = jest.fn(() => 'blob:invia-calendar');
    const revokeObjectURL = jest.fn();
    URL.revokeObjectURL = revokeObjectURL;

    render(<AddToCalendarActions {...baseProps} />);
    clickDownload();
    expect(revokeObjectURL).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:invia-calendar');
    jest.useRealTimers();
  });

  it('falls back to a data URL when object URLs are unavailable', () => {
    render(<AddToCalendarActions {...baseProps} />);
    const anchor = clickDownload();

    const href = decodeURIComponent(anchor?.href ?? '');
    expect(href).toContain('data:text/calendar;charset=utf-8,BEGIN:VCALENDAR');
    expect(href).toContain('SUMMARY:김민수 · 이서연 결혼식');
  });

  it('shows English labels for English invitations', () => {
    render(<AddToCalendarActions {...baseProps} language="en" />);

    expect(screen.getByTestId('add-to-calendar-ics')).toHaveTextContent(
      'Save to calendar'
    );
    expect(
      screen.getByLabelText('Add 김민수 · 이서연 결혼식 to Google Calendar')
    ).toBeInTheDocument();
  });

  it('renders nothing without a usable date', () => {
    const { container } = render(
      <AddToCalendarActions {...baseProps} date="" />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('still offers the actions when the invitation has no venue', () => {
    render(<AddToCalendarActions {...baseProps} location="" />);

    const google = screen.getByTestId('add-to-calendar-google');
    expect(
      new URL(google.getAttribute('href') ?? '').searchParams.get('location')
    ).toBeNull();
  });
});
