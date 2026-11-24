import { fireEvent, render, screen } from '@testing-library/react';

import FaqContent from './FaqContent';

jest.mock('@/features/contact/components/ContactEmailActions', () => function ContactEmailActions() {
  return <div>문의</div>;
});

describe('FAQ 검색', () => {
  it.each(['Drive 저장 공간', 'google drive 저장 공간', '구글 드라이브 저장 공간'])(
    '%s 검색으로 저장 공간 안내를 찾는다',
    query => {
      render(<FaqContent />);
      fireEvent.change(screen.getByRole('searchbox', { name: 'FAQ 검색' }), {
        target: { value: query },
      });
      expect(screen.getByText('나의 저장소 공간이 부족하면 어떻게 되나요?')).toBeInTheDocument();
    }
  );
});
