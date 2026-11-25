import { fireEvent, render, screen } from '@testing-library/react';

import FaqContent from './FaqContent';

jest.mock('@/features/contact/components/ContactEmailActions', () => ({
  __esModule: true,
  default: () => <div>문의</div>,
}));

function searchFaq(query: string) {
  render(<FaqContent />);
  fireEvent.change(screen.getByRole('searchbox', { name: 'FAQ 검색' }), {
    target: { value: query },
  });
}

describe('FAQ 검색', () => {
  it('화면의 질문과 답변에서 검색어를 찾는다', () => {
    searchFaq('나의 저장소');

    expect(
      screen.getByRole('button', { name: /나의 저장소에 있는 모든 파일/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /초대장 데이터는 어디에 저장되나요/ })
    ).toBeInTheDocument();
  });

  it.each(['드라이브', '구글 드라이브', 'Google Drive'])(
    '질문과 답변에 없는 %s 검색에는 결과가 없다',
    query => {
      searchFaq(query);

      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
      expect(screen.queryAllByRole('article')).toHaveLength(0);
    }
  );
});
