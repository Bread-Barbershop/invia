'use client';

import { useRef, useState } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { useToast } from '@/shared/hooks/useToast';
import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';
import { copyClipboardText } from '@/shared/utils/copyClipboardText';

import { buildStationMapSearchUrl, safeNavigationUrl } from './navigationUrl';
import styles from './transportationPreview.module.css';
import { buildTransportationSummary } from './transportationSummary';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'transportation'>;
  titleClassName?: string;
  isGuestPage?: boolean;
}

export function TransportationPreview({
  blockInfo,
  className = '',
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) {
  const props = blockInfo.props;
  const { success: successToast, error: errorToast } = useToast();
  const [copyStatus, setCopyStatus] = useState<{
    message: string;
    key: number;
  } | null>(null);
  const statusKeyRef = useRef(0);

  const sections = [
    {
      label: '지하철',
      lines: [
        [props.subwayLine, props.subwayStation, props.subwayExit].filter(Boolean).join(' · '),
        props.subwayWalk,
      ].filter(Boolean),
    },
    { label: '버스', lines: [props.busRoutes].filter(Boolean) },
    { label: '셔틀버스', lines: [props.shuttleStop, props.shuttleInterval].filter(Boolean) },
    { label: '자가용 / 주차', lines: [props.parkingHours, props.alternativeParking].filter(Boolean) },
  ].filter(section => section.lines.length > 0);
  const navigationUrl = safeNavigationUrl(props.navigationUrl);
  const stationSearchUrl = navigationUrl
    ? null
    : buildStationMapSearchUrl(props.subwayStation);
  const summaryText = buildTransportationSummary(props);

  // 같은 문구를 연달아 안내할 때도 스크린리더가 다시 읽도록 키를 갱신합니다.
  const announceCopyStatus = (message: string) => {
    statusKeyRef.current += 1;
    setCopyStatus({ message, key: statusKeyRef.current });
  };

  const handleCopySummary = async () => {
    try {
      await copyClipboardText(summaryText);
      successToast('교통 안내를 복사했어요!');
      announceCopyStatus('교통·주차 안내를 복사했어요.');
    } catch (error) {
      console.error('copy failed:', error);
      errorToast('교통 안내를 복사하지 못했어요.');
      announceCopyStatus(
        '교통 안내를 복사하지 못했어요. 화면의 안내를 직접 확인해 주세요.'
      );
    }
  };

  return (
    <MiddlePreviewWrapper
      matchBodyFontSize
      className={className}
      titleClassName={titleClassName}
      mainTitle={props.title}
      mainTitleDefault="오시는 길 안내"
      {...rest}
    >
      {sections.length === 0 && !navigationUrl && !isGuestPage ? (
        <p className="text-xs text-text-tertiary">교통·주차 정보를 입력해 주세요.</p>
      ) : (
        <div className="flex w-full flex-col gap-3 text-left">
          {sections.map(section => (
            <section
              key={section.label}
              className={cn(styles.section, 'rounded-lg p-4')}
            >
              <h3 className={cn(styles.heading, 'text-sm font-semibold')}>
                {section.label}
              </h3>
              {section.lines.map((line, index) => (
                <p
                  className={cn(
                    styles.line,
                    'mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed'
                  )}
                  key={index}
                >
                  {line}
                </p>
              ))}
            </section>
          ))}
          {(navigationUrl || stationSearchUrl || summaryText) && (
            <div className="flex w-full flex-col gap-2">
              {navigationUrl && (
                <a
                  href={navigationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    styles.navigationLink,
                    'rounded-md border px-4 py-3 text-center text-sm font-semibold'
                  )}
                >
                  내비게이션 바로가기
                </a>
              )}
              {stationSearchUrl && (
                <a
                  href={stationSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    styles.secondaryAction,
                    'rounded-md border px-4 py-3 text-center text-sm font-semibold'
                  )}
                >
                  지도에서 찾기
                </a>
              )}
              {summaryText && (
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className={cn(
                    styles.secondaryAction,
                    'cursor-pointer rounded-md border px-4 py-3 text-center text-sm font-semibold'
                  )}
                >
                  교통 안내 복사
                </button>
              )}
            </div>
          )}
          <p role="status" className="sr-only">
            {copyStatus ? (
              <span key={copyStatus.key}>{copyStatus.message}</span>
            ) : null}
          </p>
        </div>
      )}
    </MiddlePreviewWrapper>
  );
}
