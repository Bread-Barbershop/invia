import {
  invitationActionButtonClassName,
  invitationActionNoteClassName,
} from '@/components/atoms/button/invitationActionButton.style';
import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

import { safeRsvpFormUrl } from './rsvpFormUrl';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'rsvp'>;
  titleClassName?: string;
  isGuestPage?: boolean;
}

export function RsvpPreview({
  blockInfo,
  className = '',
  titleClassName,
  isGuestPage: _isGuestPage,
  ...rest
}: Props) {
  const { title, description, formUrl, buttonText } = blockInfo.props;
  const url = safeRsvpFormUrl(formUrl);
  const noteId = `rsvp-${blockInfo.id}-form-note`;

  return (
    <MiddlePreviewWrapper
      className={className}
      titleClassName={titleClassName}
      mainTitle={title}
      mainTitleDefault="참석 여부 안내"
      role="group"
      aria-label={title?.trim() || '참석 여부 안내'}
      {...rest}
    >
      <div className="flex w-full flex-col items-center gap-4 px-2">
        {description && (
          <p className="whitespace-pre-wrap break-words text-center text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
        {url && (
          <a
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            className={invitationActionButtonClassName}
            aria-describedby={noteId}
          >
            {buttonText || '참석 여부 응답하기'}
          </a>
        )}
        {url && (
          <p id={noteId} className={invitationActionNoteClassName}>
            새 창에서 Google Forms가 열립니다. 응답은 주최자가 관리하는 설문으로
            제출되며, 스프레드시트 저장 여부는 주최자 설정에 따라 달라집니다.
          </p>
        )}
      </div>
    </MiddlePreviewWrapper>
  );
}
