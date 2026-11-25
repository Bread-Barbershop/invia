import { render, screen } from '@testing-library/react';
import React from 'react';

import { GuestDocumentHeading } from './GuestDocumentHeading';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

type PayloadInput = Pick<NormalizedGuestPayload, 'shareUrl' | 'blocks'>;

function buildPayload(overrides: Partial<PayloadInput> = {}): PayloadInput {
  return { blocks: [], ...overrides };
}

function shareUrl(urlTitle: string) {
  return {
    titleFormat: 'raw' as const,
    title: '',
    description: '',
    images: [],
    urlTitle,
    urlDescription: '',
    urlImage: [],
    showLocationButton: false,
  };
}

describe('GuestDocumentHeading (하객 화면 h1)', () => {
  it('저장된 공유 제목이 있으면 그 문구를 문서 제목으로 쓴다', () => {
    render(
      <GuestDocumentHeading
        payload={buildPayload({ shareUrl: shareUrl('민수 ♥ 서연 결혼합니다') })}
      />
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('민수 ♥ 서연 결혼합니다');
    expect(heading).toHaveClass('sr-only');
  });

  it('공유 제목이 비어 있으면 신랑·신부 이름으로 제목을 만든다', () => {
    render(
      <GuestDocumentHeading
        payload={buildPayload({
          blocks: [
            {
              id: 'couple',
              type: 'wedding',
              component: 'coupleIntroduction',
              props: { groom: '김민수', bride: '이서연' },
            },
          ],
        })}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '김민수·이서연 결혼식'
    );
  });

  it('돌잔치 초대장은 아이 이름으로 제목을 만든다', () => {
    render(
      <GuestDocumentHeading
        payload={buildPayload({
          blocks: [
            {
              id: 'child',
              type: 'firstBirthday',
              component: 'myChild',
              props: { name: '하준' },
            },
          ],
        })}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '하준 돌잔치'
    );
  });

  it('아무 힌트도 없으면 "초대장"으로 두어 heading 없는 문서를 만들지 않는다', () => {
    render(<GuestDocumentHeading payload={buildPayload()} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '초대장'
    );
  });
});
