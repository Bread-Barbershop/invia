import { fireEvent, render, screen, within } from '@testing-library/react';

import { InvitationBlocksProvider } from '@/features/invitation/blocks/InvitationBlocksProvider';
import type { InvitationBlockSource } from '@/features/invitation/blocks/InvitationBlocksProvider';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { CalendarPreview } from './CalendarPreview';

import type { EditorBlock } from '@/shared/types/block';

const calendarBlock: EditorBlock<'calendar'> = {
  id: 'calendar-1',
  component: 'calendar',
  type: 'wedding',
  props: {
    title: '',
    subTitle: 'THE WEDDING CEREMONY',
    date: '2026-03-09',
    time: '오후 02:30',
    showStringDate: true,
    template: 'calendarType3',
    showCalendar: true,
    showDday: false,
    messageJson: null,
    messageHtml: '<p>오후 2시 30분까지 도착해 주세요.</p>',
    isSubTitle: true,
  },
};

const placeBlock = {
  component: 'place',
  props: {
    placeName: '인비아 하우스',
    placeDetail: '3층 그랜드홀',
    placeAddress: '서울 강남구 테헤란로 1',
  },
};

const coupleBlock = {
  component: 'coupleIntroduction',
  props: { groom: '김민수', bride: '이서연' },
};

const renderCalendar = (
  blockInfo: EditorBlock<'calendar'> = calendarBlock,
  siblingBlocks: readonly InvitationBlockSource[] = [],
  language?: 'ko' | 'en'
) =>
  render(
    <InvitationBlocksProvider blocks={siblingBlocks}>
      <CalendarPreview
        blockInfo={blockInfo}
        className=""
        language={language}
        isGuestPage
        onClick={() => {}}
      />
    </InvitationBlocksProvider>
  );

const originalCreateObjectURL = URL.createObjectURL;

afterEach(() => {
  if (originalCreateObjectURL) {
    URL.createObjectURL = originalCreateObjectURL;
  } else {
    delete (URL as unknown as Record<string, unknown>).createObjectURL;
  }
  jest.restoreAllMocks();
});

/** Clicks the save action and returns the `.ics` content the browser received. */
const savedIcs = async () => {
  const blobs: Blob[] = [];
  URL.createObjectURL = jest.fn((blob: Blob) => {
    blobs.push(blob);
    return 'blob:invia-calendar';
  });
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  fireEvent.click(screen.getByTestId('add-to-calendar-ics'));
  const content = await readBlob(blobs[0]);
  // RFC 5545 folds long lines; unfold them to assert on whole values.
  return content.replace(/\r\n /g, '');
};

const readBlob = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

describe('CalendarPreview add-to-calendar', () => {
  beforeEach(() => useEditorStore.getState().reset());

  it('offers the calendar actions next to the schedule', () => {
    renderCalendar();

    const actions = screen.getByTestId('add-to-calendar');
    expect(within(actions).getByText('캘린더에 저장')).toBeInTheDocument();
    expect(within(actions).getByText('Google 캘린더')).toBeInTheDocument();
  });

  it('keeps Korean action labels when no language is given', () => {
    renderCalendar({
      ...calendarBlock,
      props: { ...calendarBlock.props, template: 'calendarType1' },
    });

    expect(screen.getByTestId('add-to-calendar-ics')).toHaveTextContent(
      '캘린더에 저장'
    );
    expect(
      screen.getByLabelText('예식 일시 일정을 캘린더에 저장 (.ics 파일)')
    ).toBeInTheDocument();
  });

  it('pulls the venue from the invitation place block', async () => {
    renderCalendar(calendarBlock, [coupleBlock, placeBlock]);

    expect(await savedIcs()).toContain(
      'LOCATION:인비아 하우스\\, 3층 그랜드홀\\, 서울 강남구 테헤란로 1'
    );
    const google = new URL(
      screen.getByTestId('add-to-calendar-google').getAttribute('href') ?? ''
    );
    expect(google.searchParams.get('location')).toBe(
      '인비아 하우스, 3층 그랜드홀, 서울 강남구 테헤란로 1'
    );
  });

  it('names the event after the couple when the block title is empty', async () => {
    renderCalendar(calendarBlock, [coupleBlock]);

    expect(await savedIcs()).toContain('SUMMARY:김민수·이서연 결혼식');
  });

  it('treats the section heading "예식 일시" as unnamed and uses the event name', async () => {
    renderCalendar(
      {
        ...calendarBlock,
        props: { ...calendarBlock.props, title: '예식 일시' },
      },
      [coupleBlock]
    );

    expect(await savedIcs()).toContain('SUMMARY:김민수·이서연 결혼식');
  });

  it('keeps the author’s own block title when there is one', async () => {
    renderCalendar(
      {
        ...calendarBlock,
        props: { ...calendarBlock.props, title: '저희 결혼식에 초대합니다' },
      },
      [coupleBlock]
    );

    expect(await savedIcs()).toContain('SUMMARY:저희 결혼식에 초대합니다');
  });

  it('uses the saved notice as the event description', async () => {
    renderCalendar(calendarBlock);

    expect(await savedIcs()).toContain(
      'DESCRIPTION:오후 2시 30분까지 도착해 주세요.'
    );
  });

  it('hides the actions while the date is incomplete', () => {
    renderCalendar({
      ...calendarBlock,
      props: { ...calendarBlock.props, date: '' },
    });

    expect(screen.queryByTestId('add-to-calendar')).not.toBeInTheDocument();
  });

  it('saves the schedule without a location when the invitation has no place block', async () => {
    renderCalendar(calendarBlock, [coupleBlock]);

    expect(await savedIcs()).not.toContain('LOCATION:');
  });
});
