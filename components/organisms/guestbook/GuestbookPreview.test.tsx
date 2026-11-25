import { render, screen } from '@testing-library/react';

import { GuestbookPreview } from './GuestbookPreview';

import type { EditorBlock } from '@/shared/types/block';

const block = (props: Partial<EditorBlock<'guestbook'>['props']> = {}) =>
  ({
    id: 'guestbook-block',
    type: 'wedding',
    component: 'guestbook',
    props: {
      title: '축하 메시지 남기기',
      description: '소중한 축하 메시지를 남겨주세요.',
      formUrl: 'https://forms.gle/sample',
      buttonText: '축하 메시지 작성하기',
      ...props,
    },
  }) as EditorBlock<'guestbook'>;

describe('GuestbookPreview 하객 안내', () => {
  it('응답 링크를 새 창에서 열고, 제출 안내를 링크 설명으로 연결한다', () => {
    render(<GuestbookPreview blockInfo={block()} className="" />);

    const link = screen.getByRole('link', { name: '축하 메시지 작성하기' });

    expect(link).toHaveAttribute('href', 'https://forms.gle/sample');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleDescription(/새 창에서 Google Forms가 열립니다/);
    expect(
      screen.getByText(/축하 메시지는 주최자가 관리하는\s*설문으로 제출되며/)
    ).toHaveAttribute('id', 'guestbook-guestbook-block-form-note');
  });

  it('블록 제목을 그룹 이름으로 노출한다', () => {
    render(
      <GuestbookPreview
        blockInfo={block({ title: '마음 전하는 방명록' })}
        className=""
      />
    );

    expect(
      screen.getByRole('group', { name: '마음 전하는 방명록' })
    ).toBeInTheDocument();
  });

  it('링크가 없으면 하객 화면에서 버튼과 주최자용 안내를 숨긴다', () => {
    render(
      <GuestbookPreview
        blockInfo={block({ formUrl: '' })}
        className=""
        isGuestPage
      />
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.queryByText('구글 설문 응답 링크를 등록해 주세요.')
    ).not.toBeInTheDocument();
  });

  it('편집 미리보기에서는 링크가 없을 때 등록 안내를 보여준다', () => {
    render(<GuestbookPreview blockInfo={block({ formUrl: '' })} className="" />);

    expect(
      screen.getByText('구글 설문 응답 링크를 등록해 주세요.')
    ).toBeInTheDocument();
  });

  it('어두운 초대장 배경에서도 버튼과 안내가 어두운 표면용 스타일을 함께 쓴다', () => {
    render(<GuestbookPreview blockInfo={block()} className="" />);

    const link = screen.getByRole('link', { name: '축하 메시지 작성하기' });
    const note = screen.getByText(
      /축하 메시지는 주최자가 관리하는\s*설문으로 제출되며/
    );

    expect(link.className).toContain('[data-invitation-dark]');
    expect(note.className).toContain('[data-invitation-dark]');
  });
});
