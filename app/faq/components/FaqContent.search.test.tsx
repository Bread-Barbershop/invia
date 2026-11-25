import { fireEvent, render, screen } from '@testing-library/react';

import FaqContent from './FaqContent';

jest.mock('@/features/contact/components/ContactEmailActions', () => function ContactEmailActions() {
  return <div>문의</div>;
});

function searchFaq(query: string) {
  render(<FaqContent />);
  fireEvent.change(screen.getByRole('searchbox', { name: 'FAQ 검색' }), {
    target: { value: query },
  });
}

describe('FAQ 드라이브 검색', () => {
  it.each(['드라이브', '구글 드라이브', 'Google Drive'])(
    '%s 검색으로 저장 위치 안내를 찾는다',
    query => {
      searchFaq(query);

      expect(
        screen.getByRole('button', {
          name: /초대장 데이터는 어디에 저장되나요/,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: /Invia가 제 Google Drive의 모든 파일에 접근하나요/,
        })
      ).toBeInTheDocument();
    }
  );

  it('드라이브 검색으로 저장 위치 관련 문답 6개를 보여준다', () => {
    searchFaq('드라이브');

    expect(screen.getAllByRole('article')).toHaveLength(6);
  });
});
