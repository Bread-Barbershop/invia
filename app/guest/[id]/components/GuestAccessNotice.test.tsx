/**
 * 목적:
 * 하객이 초대장 링크를 열 수 없을 때 보는 안내 카드(GuestAccessNotice)의 문구를 검증한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) 비공개 초대장은 "공개 상태를 확인해 주세요"로 안내하는지
 * 2) 잘못된 링크는 "링크를 확인해 주세요"로 안내하는지
 * 3) 만료된 링크(kind="expired")는 "새 링크를 받아 주세요"로 안내하는지
 * 4) 어느 경우에도 제목이 문서의 h1으로 노출되는지
 */

import { render, screen } from '@testing-library/react';

import { GuestAccessNotice } from './GuestAccessNotice';

jest.mock('@/shared/assets/logo/invia-simple-logo-3d.png', () => ({
  src: '/invia-simple-logo-3d.png',
  height: 82,
  width: 82,
}));

describe('GuestAccessNotice', () => {
  it('explains a private invitation', () => {
    render(
      <GuestAccessNotice
        title="비공개 초대장이에요"
        description="초대장 주인이 공개로 전환하면 이 링크에서 다시 확인할 수 있어요."
      />
    );

    expect(screen.getByText('PRIVATE INVITATION')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '비공개 초대장이에요'
    );
    expect(
      screen.getByText('초대장을 보내준 분에게 공개 상태를 확인해 주세요.')
    ).toBeInTheDocument();
  });

  it('asks to check the link for a malformed audience link', () => {
    render(
      <GuestAccessNotice
        kind="link"
        title="초대장 링크를 확인해 주세요"
        description="이 링크로 초대장을 열 수 없어요."
      />
    );

    expect(screen.getByText('GUEST INVITATION')).toBeInTheDocument();
    expect(
      screen.getByText('초대장을 보내준 분에게 링크를 확인해 주세요.')
    ).toBeInTheDocument();
  });

  it('asks for a new link when the invitation is gone', () => {
    render(
      <GuestAccessNotice
        kind="expired"
        title="초대장을 찾을 수 없어요"
        description="링크가 만료되었거나 주소가 바뀌었을 수 있어요."
      />
    );

    expect(screen.getByText('GUEST INVITATION')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '초대장을 찾을 수 없어요'
    );
    expect(
      screen.getByText('초대장을 보내준 분에게 새 링크를 받아 주세요.')
    ).toBeInTheDocument();
  });
});
