import { fireEvent, render, screen } from '@testing-library/react';

import { getInvitationTemplates } from '@/shared/data/invitationTemplates/catalog';

import { PosterPanel } from './PosterPanel';

const mockApplyTemplate = jest.fn();
jest.mock('@/widgets/editor/preview/hooks/useInvitationTemplate', () => ({
  useInvitationTemplate: () => ({
    applyTemplate: mockApplyTemplate,
    isApplying: false,
  }),
}));

describe('카테고리별 실제 편집 가능한 표지 목록', () => {
  it('카탈로그 전체를 제공하고 웨딩 표지와 생일 표지를 선택해 표지만 적용한다', () => {
    render(<PosterPanel />);
    expect(screen.getAllByRole('button', { name: /표지 적용$/ })).toHaveLength(
      getInvitationTemplates('all').length
    );

    fireEvent.click(
      screen.getByRole('button', { name: '결혼식', exact: true })
    );
    expect(screen.getAllByRole('button', { name: /표지 적용$/ })).toHaveLength(
      getInvitationTemplates('wedding').length
    );
    for (const [name, id] of [
      ['알파인 프로미스', 'showcase-23'],
      ['브릭 시티 웨딩', 'showcase-24'],
      ['정갈한 혼례 초대', 'showcase-44'],
    ]) {
      fireEvent.click(
        screen.getByRole('button', { name: `${name} 표지 적용` })
      );
      expect(mockApplyTemplate).toHaveBeenCalledWith(id, { posterOnly: true });
      mockApplyTemplate.mockClear();
    }

    fireEvent.click(screen.getByRole('button', { name: '생일', exact: true }));
    expect(screen.getAllByRole('button', { name: /표지 적용$/ })).toHaveLength(
      getInvitationTemplates('birthday').length
    );
    expect(
      screen.queryByRole('button', { name: '클래식 모먼트 표지 적용' })
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: '마이 데이 포토 표지 적용' })
    );
    expect(mockApplyTemplate).toHaveBeenCalledWith('showcase-18', {
      posterOnly: true,
    });
  });

  it('표지 이름·분위기로 검색하고 결과 수와 빈 상태를 보여준다', () => {
    render(<PosterPanel />);

    expect(
      screen.getByText(`총 ${getInvitationTemplates('all').length}개`)
    ).toBeInTheDocument();

    const searchInput = screen.getByLabelText('표지 검색');
    fireEvent.change(searchInput, { target: { value: '클래식' } });

    expect(screen.getAllByRole('button', { name: /표지 적용$/ })).toHaveLength(
      1
    );
    expect(screen.getByText('검색 결과 1개')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '클래식 모먼트 표지 적용' })
    ).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '없는검색어xyz' } });

    expect(screen.getByText('검색 결과가 없어요')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /표지 적용$/ })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '검색 초기화' }));

    expect(screen.getAllByRole('button', { name: /표지 적용$/ })).toHaveLength(
      getInvitationTemplates('all').length
    );
    expect(screen.getByLabelText('표지 검색')).toHaveValue('');
  });

  it('검색어는 고른 분류 안에서만 적용된다', () => {
    render(<PosterPanel />);

    fireEvent.click(
      screen.getByRole('button', { name: '세미나' })
    );
    fireEvent.change(screen.getByLabelText('표지 검색'), {
      target: { value: '웨딩' },
    });

    expect(
      screen.queryByRole('button', { name: /표지 적용$/ })
    ).not.toBeInTheDocument();
    expect(screen.getByText('검색 결과가 없어요')).toBeInTheDocument();
  });
});
