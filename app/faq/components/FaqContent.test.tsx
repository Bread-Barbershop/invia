import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FAQ_ITEMS } from '../data';
import { faqShareUrl } from '../utils/faqDeepLink';

import FaqContent from './FaqContent';

const ORIGIN = window.location.origin;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 질문 펼치기 버튼은 앞의 번호(01, 02 …)까지 이름에 들어간다. */
function questionButtonName(question: string) {
  return new RegExp(`^\\d{2}\\s*${escapeRegExp(question)}$`);
}

function findQuestionButton(question: string) {
  return screen.getByRole('button', { name: questionButtonName(question) });
}

function queryQuestionButton(question: string) {
  return screen.queryByRole('button', { name: questionButtonName(question) });
}

function copyButtonName(question: string) {
  return `‘${question}’ 답변 링크 복사`;
}

function setHash(hash: string) {
  window.history.replaceState(null, '', hash);
}

const scrollIntoView = jest.fn();

beforeAll(() => {
  Element.prototype.scrollIntoView = scrollIntoView;
});

beforeEach(() => {
  scrollIntoView.mockClear();
  window.history.replaceState(null, '', '/faq');
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
});

describe('FAQ 화면', () => {
  it('처음에는 첫 번째 질문만 펼쳐 둔다', () => {
    render(<FaqContent />);

    const expanded = screen
      .getAllByRole('button', { expanded: true })
      .map(button => button.textContent);

    expect(expanded).toHaveLength(1);
    expect(expanded[0]).toContain(FAQ_ITEMS[0].question);
  });

  it('질문을 누르면 답변이 열리고 다시 누르면 닫힌다', async () => {
    const user = userEvent.setup();
    render(<FaqContent />);

    const target = FAQ_ITEMS[1];
    const button = findQuestionButton(target.question);

    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', `${target.id}-answer`);

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('여러 질문을 한 번에 펼쳐 둘 수 있다', async () => {
    const user = userEvent.setup();
    render(<FaqContent />);

    await user.click(findQuestionButton(FAQ_ITEMS[1].question));
    await user.click(findQuestionButton(FAQ_ITEMS[2].question));

    expect(findQuestionButton(FAQ_ITEMS[0].question)).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(findQuestionButton(FAQ_ITEMS[1].question)).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(findQuestionButton(FAQ_ITEMS[2].question)).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('전체 펼치기와 접기를 오가며 모든 답변을 열고 닫는다', async () => {
    const user = userEvent.setup();
    render(<FaqContent />);

    await user.click(screen.getByRole('button', { name: '모두 펼치기' }));

    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(
      FAQ_ITEMS.length
    );

    await user.click(screen.getByRole('button', { name: '모두 접기' }));

    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: '모두 펼치기' })
    ).toBeInTheDocument();
  });

  it('카테고리를 고르면 그 카테고리 답변만 펼친다', async () => {
    const user = userEvent.setup();
    render(<FaqContent />);

    await user.click(screen.getByRole('button', { name: '계정 및 데이터' }));

    const visibleQuestions = FAQ_ITEMS.filter(
      item => item.category === 'account'
    );

    expect(queryQuestionButton(FAQ_ITEMS[0].question)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '모두 펼치기' }));

    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(
      visibleQuestions.length
    );
  });

  describe('답변 링크', () => {
    it('공유 링크로 들어오면 그 답변을 펼치고 화면을 그 답변으로 옮긴다', async () => {
      const target = FAQ_ITEMS[12];
      setHash(`#faq-${target.id}`);

      render(<FaqContent />);

      const button = findQuestionButton(target.question);

      expect(button).toHaveAttribute('aria-expanded', 'true');

      await waitFor(() => {
        expect(scrollIntoView).toHaveBeenCalled();
      });
      expect(document.getElementById(`faq-${target.id}`)).toContainElement(
        button
      );
    });

    it('공유 링크로 들어오면 검색어와 카테고리로 가려져 있어도 답변을 보여 준다', async () => {
      const user = userEvent.setup();
      render(<FaqContent />);

      await user.click(screen.getByRole('button', { name: '초대장 편집' }));
      await user.type(screen.getByRole('searchbox'), '없는검색어');
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();

      const target = FAQ_ITEMS[13];
      setHash(`#faq-${target.id}`);
      await act(async () => {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });

      expect(findQuestionButton(target.question)).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(
        screen.queryByText('검색 결과가 없습니다.')
      ).not.toBeInTheDocument();
      expect(screen.getByRole('searchbox')).toHaveValue('');
    });

    it('답변 링크 복사를 누르면 이 사이트의 답변 주소를 클립보드에 넣는다', async () => {
      const user = userEvent.setup();
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      });

      render(<FaqContent />);

      const target = FAQ_ITEMS[0];
      await user.click(
        screen.getByRole('button', { name: copyButtonName(target.question) })
      );

      expect(writeText).toHaveBeenCalledWith(faqShareUrl(target.id, ORIGIN));
      expect(await screen.findByText('링크 복사됨')).toBeInTheDocument();
      expect(
        screen.getByText(
          '이 답변 링크를 복사했어요. 붙여넣어 공유할 수 있어요.'
        )
      ).toBeInTheDocument();
    });

    it('클립보드를 쓸 수 없으면 주소창에서 복사하도록 안내한다', async () => {
      const user = userEvent.setup();
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: jest.fn().mockRejectedValue(new Error('denied')),
        },
      });
      const execCommand = jest.fn().mockReturnValue(false);
      Object.defineProperty(document, 'execCommand', {
        configurable: true,
        value: execCommand,
      });

      render(<FaqContent />);

      await user.click(
        screen.getByRole('button', {
          name: copyButtonName(FAQ_ITEMS[0].question),
        })
      );

      expect(
        await screen.findByText(
          '링크를 복사하지 못했어요. 주소창의 주소를 복사해 주세요.'
        )
      ).toBeInTheDocument();
      expect(execCommand).toHaveBeenCalledWith('copy');
      expect(
        within(screen.getAllByRole('article')[0]).getByText('답변 링크 복사')
      ).toBeInTheDocument();
    });

    it('클립보드 API가 실패해도 글자 선택 복사로 링크를 넣는다', async () => {
      const user = userEvent.setup();
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: jest.fn().mockRejectedValue(new Error('denied')),
        },
      });
      const execCommand = jest.fn().mockReturnValue(true);
      Object.defineProperty(document, 'execCommand', {
        configurable: true,
        value: execCommand,
      });

      render(<FaqContent />);

      await user.click(
        screen.getByRole('button', {
          name: copyButtonName(FAQ_ITEMS[0].question),
        })
      );

      expect(await screen.findByText('링크 복사됨')).toBeInTheDocument();
      expect(execCommand).toHaveBeenCalledWith('copy');
    });
  });

  it('검색 결과가 없으면 전체 질문 보기로 필터를 되돌린다', async () => {
    const user = userEvent.setup();
    render(<FaqContent />);

    await user.click(screen.getByRole('button', { name: '초대장 편집' }));
    await user.type(screen.getByRole('searchbox'), '존재하지않는질문');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '전체 질문 보기' }));

    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getAllByRole('article')).toHaveLength(FAQ_ITEMS.length);
  });
});
