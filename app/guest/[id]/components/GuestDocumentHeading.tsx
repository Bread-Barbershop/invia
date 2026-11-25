'use client';

import { titleFromSavedInvitation } from '@/shared/utils/invitationTitle';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

/**
 * 하객 화면의 문서 제목(h1).
 *
 * 지금까지 하객 화면은 <main>만 있고 heading이 하나도 없어서,
 * 스크린리더 사용자는 "인사말·예식 일시·오시는 길" 같은 섹션 제목으로
 * 문서를 훑을 수 없었다. 쇼케이스가 이미 쓰고 있는 방식(sr-only h1)을
 * 그대로 따라, 화면 모양은 건드리지 않고 문서에 제목만 세운다.
 *
 * 제목 문자열은 브라우저 탭 제목과 같은 규칙(shared/utils/invitationTitle)을
 * 재사용해, 저장된 공유 제목 → (없으면) 신랑·신부/아이 이름 순으로 고른다.
 */
export function GuestDocumentHeading({
  payload,
}: {
  payload: Pick<NormalizedGuestPayload, 'shareUrl' | 'blocks'>;
}) {
  const title =
    titleFromSavedInvitation({
      shareUrl: payload.shareUrl,
      blocks: payload.blocks,
    }) || '초대장';

  return <h1 className="sr-only">{title}</h1>;
}
