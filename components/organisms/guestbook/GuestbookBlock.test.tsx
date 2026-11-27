import { render, screen } from '@testing-library/react';

import { GuestbookBlock } from './GuestbookBlock';

import type { EditorBlock } from '@/shared/types/block';

const block = (props: Partial<EditorBlock<'guestbook'>['props']> = {}) =>
  ({
    id: 'guestbook-block',
    type: 'wedding',
    component: 'guestbook',
    props: {
      title: '축하 메시지 남기기',
      description: '소중한 축하 메시지를 남겨주세요.',
      formUrl: '',
      buttonText: '축하 메시지 작성하기',
      ...props,
    },
  }) as EditorBlock<'guestbook'>;

const renderBlock = (props: Partial<EditorBlock<'guestbook'>['props']> = {}) => {
  const blockInfo = block(props);
  return render(<GuestbookBlock blockInfo={blockInfo} id={blockInfo.id} />);
};

describe('GuestbookBlock 입력 접근성', () => {
  it('입력마다 라벨을 명시적으로 연결한다', () => {
    renderBlock();

    for (const label of [
      '제목',
      '축하 메시지 안내 문구',
      '버튼 문구',
      'Google Forms 응답자용 링크',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(
      screen.getByLabelText('Google Forms 응답자용 링크')
    ).toHaveAttribute('id', 'guestbook-guestbook-block-formUrl');
  });

  it('링크가 없으면 오류·확인 안내를 띄우지 않는다', () => {
    renderBlock();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    const input = screen.getByLabelText('Google Forms 응답자용 링크');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('관리 링크를 넣으면 입력에 오류 상태와 오류 문구를 연결한다', () => {
    renderBlock({
      formUrl: 'https://docs.google.com/forms/d/example/edit',
    });

    const input = screen.getByLabelText('Google Forms 응답자용 링크');
    const alert = screen.getByRole('alert');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute(
      'aria-describedby',
      'guestbook-guestbook-block-form-url-error'
    );
    expect(alert).toHaveAttribute(
      'id',
      'guestbook-guestbook-block-form-url-error'
    );
    expect(alert).toHaveTextContent(
      '응답자용 Google Forms HTTPS 링크를 사용해 주세요.'
    );
    expect(input.className).toContain('border-red-500');
  });

  it('응답자용 링크를 넣으면 상태 안내를 polite 라이브 영역으로 알린다', () => {
    renderBlock({ formUrl: 'https://forms.gle/sample' });

    const input = screen.getByLabelText('Google Forms 응답자용 링크');
    const status = screen.getByRole('status');

    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAttribute(
      'aria-describedby',
      'guestbook-guestbook-block-form-url-ok'
    );
    expect(status).toHaveAttribute('id', 'guestbook-guestbook-block-form-url-ok');
    expect(status).toHaveTextContent(
      '링크 형식이 맞아요. 하객이 열 수 있는지 로그아웃 상태에서 확인해 주세요.'
    );
    expect(input.className).not.toContain('border-red-500');
    expect(
      screen.getByRole('link', { name: '응답자 화면 미리 열어보기 (새 창)' })
    ).toHaveAttribute('href', 'https://forms.gle/sample');
  });
});
