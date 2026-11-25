import { render, screen } from '@testing-library/react';

import { RsvpPreview } from './RsvpPreview';

import type { EditorBlock } from '@/shared/types/block';

const block = (props: Partial<EditorBlock<'rsvp'>['props']> = {}) =>
  ({
    id: 'rsvp-block',
    type: 'wedding',
    component: 'rsvp',
    props: {
      title: '참석 여부 안내',
      description: '참석 가능 여부를 알려주세요.',
      formUrl: 'https://forms.gle/sample',
      buttonText: '참석 여부 응답하기',
      ...props,
    },
  }) as EditorBlock<'rsvp'>;

describe('RsvpPreview 하객 안내', () => {
  it('응답 링크를 새 창에서 열고, 제출 안내를 링크 설명으로 연결한다', () => {
    render(<RsvpPreview blockInfo={block()} className="" />);

    const link = screen.getByRole('link', { name: '참석 여부 응답하기' });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleDescription(/새 창에서 Google Forms가 열립니다/);
    expect(
      screen.getByText(/응답은 주최자가 관리하는\s*설문으로 제출되며/)
    ).toHaveAttribute('id', 'rsvp-rsvp-block-form-note');
  });

  it('블록 제목을 그룹 이름으로 노출한다', () => {
    render(
      <RsvpPreview blockInfo={block({ title: '참석 여부를 알려주세요' })} className="" />
    );

    expect(
      screen.getByRole('group', { name: '참석 여부를 알려주세요' })
    ).toBeInTheDocument();
  });

  it('편집·관리 링크가 들어오면 버튼과 제출 안내를 그리지 않는다', () => {
    render(
      <RsvpPreview
        blockInfo={block({
          formUrl: 'https://docs.google.com/forms/d/example/edit',
        })}
        className=""
      />
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/새 창에서 Google Forms가 열립니다/)
    ).not.toBeInTheDocument();
  });
});
