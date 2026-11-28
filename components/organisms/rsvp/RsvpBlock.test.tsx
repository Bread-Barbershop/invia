import { render, screen } from '@testing-library/react';

import { RsvpBlock } from './RsvpBlock';

import type { EditorBlock } from '@/shared/types/block';

const block = (props: Partial<EditorBlock<'rsvp'>['props']> = {}) =>
  ({
    id: 'rsvp-block',
    type: 'wedding',
    component: 'rsvp',
    props: {
      title: '참석 여부 안내',
      description: '참석 가능 여부를 알려주세요.',
      formUrl: '',
      buttonText: '참석 여부 응답하기',
      ...props,
    },
  }) as EditorBlock<'rsvp'>;

const renderBlock = (props: Partial<EditorBlock<'rsvp'>['props']> = {}) => {
  const blockInfo = block(props);
  return render(<RsvpBlock blockInfo={blockInfo} id={blockInfo.id} />);
};

describe('RsvpBlock 입력 접근성', () => {
  it('입력마다 라벨을 명시적으로 연결한다', () => {
    renderBlock();

    for (const label of [
      '제목',
      '참석 안내 문구',
      '버튼 문구',
      'Google 설문 응답 링크',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByLabelText('Google 설문 응답 링크')).toHaveAttribute(
      'id',
      'rsvp-rsvp-block-formUrl'
    );
  });

  it('관리 링크를 넣으면 입력에 오류 상태와 오류 문구를 연결한다', () => {
    renderBlock({
      formUrl: 'https://docs.google.com/forms/d/example/edit',
    });

    const input = screen.getByLabelText('Google 설문 응답 링크');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute(
      'aria-describedby',
      'rsvp-rsvp-block-form-url-error'
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      '응답자용 Google Forms HTTPS 링크를 입력해 주세요.'
    );
    expect(input.className).toContain('border-red-500');
  });

  it('응답자용 링크를 넣으면 상태 안내를 polite 라이브 영역으로 알린다', () => {
    renderBlock({ formUrl: 'https://forms.gle/sample' });

    const input = screen.getByLabelText('Google 설문 응답 링크');
    const status = screen.getByRole('status');

    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAttribute(
      'aria-describedby',
      'rsvp-rsvp-block-form-url-ok'
    );
    expect(status).toHaveTextContent(
      '링크 형식이 맞아요. 하객이 열 수 있는지 로그아웃 상태에서 확인해 주세요.'
    );
    expect(
      screen.getByRole('link', { name: '응답자 화면 미리 열어보기 (새 창)' })
    ).toHaveAttribute('href', 'https://forms.gle/sample');
  });

  it('링크가 비어 있으면 하객 노출 조건을 안내한다', () => {
    renderBlock();

    expect(
      screen.getByText(
        '응답 링크를 입력하면 하객에게 참석 여부 블록이 표시됩니다.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
