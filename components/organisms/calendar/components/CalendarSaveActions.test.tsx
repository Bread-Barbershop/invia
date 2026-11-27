import { render, screen } from '@testing-library/react';

import { CalendarSaveActions } from './CalendarSaveActions';

const createObjectURL = jest.fn(() => 'blob:mock-calendar');
const revokeObjectURL = jest.fn();

beforeAll(() => {
  Object.assign(URL, { createObjectURL, revokeObjectURL });
});

beforeEach(() => {
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
});

describe('CalendarSaveActions', () => {
  const event = {
    title: '예식 일정',
    date: '2026-03-09',
    time: '오후 02:30',
    location: '서울 강남구 테헤란로1길 19',
  };

  it('.ics 저장과 Google 캘린더 링크를 함께 보여준다', () => {
    render(<CalendarSaveActions {...event} />);

    expect(
      screen.getByRole('button', { name: '캘린더에 저장' })
    ).toBeInTheDocument();

    const googleLink = screen.getByRole('link', { name: 'Google 캘린더' });
    expect(googleLink).toHaveAttribute('target', '_blank');
    expect(googleLink.getAttribute('href')).toContain(
      'calendar.google.com/calendar/render'
    );
    expect(googleLink.getAttribute('href')).toContain(
      '20260309T053000Z%2F20260309T073000Z'
    );
  });

  it('캘린더에 저장을 누르면 .ics 파일을 내려받는다', () => {
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    render(<CalendarSaveActions {...event} />);
    screen.getByRole('button', { name: '캘린더에 저장' }).click();

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const anchor = clickSpy.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('예식 일정.ics');

    clickSpy.mockRestore();
  });

  it('날짜가 없으면 아무 버튼도 그리지 않는다', () => {
    const { container } = render(
      <CalendarSaveActions title="일정" date="" />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
