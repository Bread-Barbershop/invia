'use client';

import { isCalendarCardType } from '@/shared/data/template/componentTemplate';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { useTitleFontInfo } from '@/shared/hooks/useTitleFontInfo';
import { EditorBlock } from '@/shared/types/block';
import { isDarkInvitationBackground } from '@/shared/utils/invitationBackgroundColor';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { getCalendarMessageHtml } from './calendarMessage';
import styles from './calendarPreview.module.css';
import { CalendarTemplates, DDayCountdown } from './components';
import { CalendarCard } from './components/CalendarCard';
import { CalendarSaveActions } from './components/CalendarSaveActions';
import { useCalendarData } from './hooks/useCalendarData';

import type { CSSProperties } from 'react';

interface Props {
  blockInfo: EditorBlock<'calendar'>;
  className: string;
  language?: 'ko' | 'en';
  titleClassName?: string;
  isGuestPage?: boolean;
  /** 하객 화면에서 장소 블록의 장소명·주소를 일정 장소로 넘겨받는다. */
  calendarLocation?: string;
  onClick: () => void;
}

// 쇼케이스·템플릿이 쓰는 기본 섹션 제목은 일정 이름으로 쓰지 않는다.
const GENERIC_SECTION_TITLES = new Set([
  '예식 일시',
  '행사일시',
  '행사 일시',
  '일시',
  '날짜',
]);

function resolveCalendarEventTitle({
  title,
  type,
}: {
  title?: string;
  type: EditorBlock<'calendar'>['type'];
}) {
  const trimmed = title?.trim() ?? '';
  if (trimmed.length > 0 && !GENERIC_SECTION_TITLES.has(trimmed)) {
    return trimmed;
  }
  return type === 'wedding' ? '예식 일정' : '행사 일정';
}

export function CalendarPreview({
  blockInfo,
  className,
  language: requestedLanguage,
  titleClassName,
  isGuestPage = false,
  calendarLocation,
  ...rest
}: Props) {
  const {
    title,
    subTitle,
    date,
    time,
    showStringDate,
    template,
    showCalendar,
    showDday,
    isSubTitle,
  } = blockInfo.props;
  const cardType = isCalendarCardType(template) ? template : undefined;
  const language = requestedLanguage ?? (cardType ? 'ko' : 'en');
  const defaultTitle = blockInfo.type === 'wedding' ? '예식 일시' : '행사일시';
  const defaultSubTitle =
    blockInfo.type === 'wedding' ? 'THE WEDDING CEREMONY' : 'Date & Time';

  const {
    currentYear,
    currentMonth,
    calendarDays,
    stringDateFormatted,
    formattedTime,
    headerDays,
    timeInfo,
    monthText,
    targetLabel,
    timeLabel,
  } = useCalendarData({ date, time, language, template, type: blockInfo.type });

  const isDateIncomplete = !date || date.length < 10;
  const hasSavedMessage =
    blockInfo.props.messageHtml != null || blockInfo.props.messageJson != null;
  const { fontFamily, fontSize, color, isColorAutomatic } = useBodyFontInfo();
  const { mainStyle } = useTitleFontInfo();
  const automaticLightInk =
    isColorAutomatic && color && !isDarkInvitationBackground(color)
      ? color
      : undefined;

  if (isDateIncomplete && isGuestPage) return null;

  const TemplateComponent =
    CalendarTemplates[template as string] || CalendarTemplates['calendarType1'];
  return (
    <MiddlePreviewWrapper
      className={`${className} relative ${styles.preview}`}
      style={
        automaticLightInk
          ? ({
              '--calendar-automatic-body-color': automaticLightInk,
            } as CSSProperties)
          : undefined
      }
      titleClassName={titleClassName}
      noTitle={isDateIncomplete}
      checkedSubTitle={isSubTitle}
      subTitle={subTitle}
      subTitleDefault={defaultSubTitle}
      mainTitle={title}
      mainTitleDefault={defaultTitle}
      childClassName="gap-6"
      {...rest}
    >
      {isDateIncomplete ? (
        <p className="text-sm text-[color:var(--calendar-muted-text,var(--color-gray-400))] font-normal">
          날짜와 시간을 입력해 주세요
        </p>
      ) : (
        <>
          {/* String Date Display */}
          {showStringDate && !(showCalendar && cardType) && (
            <div
              className="flex flex-col items-center tracking-[-0.01rem] leading-[1.2] text-base font-normal text-[color:var(--calendar-text,var(--color-text-primary))] min-h-[40px] justify-center"
              style={{
                fontFamily,
                fontSize: `max(1rem, ${fontSize ?? '1rem'})`,
              }}
            >
              <p>{stringDateFormatted}</p>
              <p>{formattedTime}</p>
            </div>
          )}

          {showCalendar &&
            (cardType ? (
              <CalendarCard
                template={cardType}
                calendarDays={calendarDays}
                headerDays={headerDays}
                date={date}
                time={time}
                language={language}
                isWedding={blockInfo.type === 'wedding'}
                showStringDate={showStringDate}
                showDday={showDday}
              />
            ) : (
              <TemplateComponent
                currentYear={currentYear}
                currentMonth={currentMonth}
                calendarDays={calendarDays}
                headerDays={headerDays}
                time={time}
                timeInfo={timeInfo}
                language={language}
                monthText={monthText}
                targetLabel={targetLabel}
                timeLabel={timeLabel}
                accentColor={mainStyle.color}
              />
            ))}

          {(showDday || hasSavedMessage) && (
            <DDayCountdown
              date={date}
              time={time}
              showCountdown={showDday}
              seoulTime={Boolean(cardType)}
              isDefaultMessage={!hasSavedMessage}
              messageHtml={getCalendarMessageHtml(blockInfo)}
            />
          )}

          {isGuestPage && (
            <CalendarSaveActions
              title={resolveCalendarEventTitle({
                title,
                type: blockInfo.type,
              })}
              date={date}
              time={time}
              {...(calendarLocation ? { location: calendarLocation } : {})}
            />
          )}
        </>
      )}
    </MiddlePreviewWrapper>
  );
}
