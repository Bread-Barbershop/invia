import {
  invitationActionButtonClassName,
  invitationActionNoteClassName,
} from '@/components/atoms/button/invitationActionButton.style';
import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

import { safeRsvpFormUrl } from '../rsvp/rsvpFormUrl';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'guestbook'>;
  titleClassName?: string;
  isGuestPage?: boolean;
}

export function GuestbookPreview({
  blockInfo,
  titleClassName,
  className = '',
  isGuestPage = false,
  ...rest
}: Props) {
  const { title, description, formUrl, buttonText } = blockInfo.props;
  const url = safeRsvpFormUrl(formUrl);
  const noteId = `guestbook-${blockInfo.id}-form-note`;
  return (
    <MiddlePreviewWrapper
      className={className}
      titleClassName={titleClassName}
      mainTitle={title}
      mainTitleDefault="축하 메시지 남기기"
      role="group"
      aria-label={title?.trim() || '축하 메시지 남기기'}
      {...rest}
    >
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
          {buttonText || '축하 메시지 작성하기'}
        </a>
      )}
      {url && (
        <p id={noteId} className={invitationActionNoteClassName}>
          새 창에서 Google Forms가 열립니다. 축하 메시지는 주최자가 관리하는
          설문으로 제출되며, 스프레드시트 저장 여부는 주최자 설정에 따라
          달라집니다.
        </p>
      )}
      {!url && !isGuestPage && (
        <p className="text-xs text-text-tertiary">
          구글 설문 응답 링크를 등록해 주세요.
        </p>
      )}
    </MiddlePreviewWrapper>
  );
}
