import { fireEvent, render, screen, within } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import RightPanel from './RightPanel';
import { useComponentType } from './hooks/useComponentType';

jest.mock('@/shared/store/editorStore/useEditorStore');
jest.mock('./hooks/useComponentType');
jest.mock('./components/TypePanel', () => ({
  __esModule: true,
  default: () => <div data-testid="type-panel">TypePanel</div>,
}));
jest.mock('./components/PosterPanel', () => ({
  __esModule: true,
  PosterPanel: () => <div data-testid="poster-panel">PosterPanel</div>,
}));

const TYPE_ARRAY = ['type1', 'type2'];
const EMPTY_ARRAY: string[] = [];

const mockStore = (
  state: { block?: unknown[]; selectedId?: string | null } = {}
) => {
  (useEditorStore as unknown as jest.Mock).mockReturnValue({
    block: [],
    selectedId: 'component-1',
    ...state,
  });
};

const mockTypes = (typeArray: string[]) => {
  (useComponentType as unknown as jest.Mock).mockReturnValue({ typeArray });
};

describe('RightPanel 키보드 접근성', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore();
    mockTypes(TYPE_ARRAY);
  });

  it('블록 설정 영역으로 이름을 갖고 스킵 링크의 목적지가 된다', () => {
    render(<RightPanel />);

    const region = screen.getByRole('region', { name: '블록 설정' });
    expect(region).toHaveAttribute('id', 'editor-block-panel');
    expect(region).toHaveAttribute('tabindex', '-1');
  });

  it('포스터·타입을 탭으로 읽고 선택 상태를 알린다', () => {
    render(<RightPanel />);

    const tablist = screen.getByRole('tablist', { name: '블록 설정 보기' });
    const tabs = within(tablist).getAllByRole('tab');

    expect(tabs.map(tab => tab.textContent)).toEqual(['포스터', '타입']);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(
      screen.getByRole('tabpanel', { name: '타입' })
    ).toBeInTheDocument();
  });

  it('선택된 탭만 Tab 키 순서에 두고 나머지는 방향키로 찾게 한다', () => {
    render(<RightPanel />);

    const posterTab = screen.getByRole('tab', { name: '포스터' });
    const typeTab = screen.getByRole('tab', { name: '타입' });

    expect(typeTab).toHaveAttribute('tabindex', '0');
    expect(posterTab).toHaveAttribute('tabindex', '-1');
  });

  it('포스터 탭을 누르면 패널이 포스터로 바뀐다', () => {
    render(<RightPanel />);

    fireEvent.click(screen.getByRole('tab', { name: '포스터' }));

    expect(screen.getByRole('tab', { name: '포스터' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tabpanel', { name: '포스터' })).toBeInTheDocument();
  });

  it('방향키로 탭을 옮기면 선택과 포커스가 함께 따라간다', () => {
    render(<RightPanel />);

    const typeTab = screen.getByRole('tab', { name: '타입' });
    typeTab.focus();

    fireEvent.keyDown(typeTab, { key: 'ArrowLeft' });

    const posterTab = screen.getByRole('tab', { name: '포스터' });
    expect(posterTab).toHaveAttribute('aria-selected', 'true');
    expect(posterTab).toHaveFocus();

    fireEvent.keyDown(posterTab, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: '타입' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: '타입' })).toHaveFocus();
  });

  it('Home·End로 처음과 끝 탭으로 간다', () => {
    render(<RightPanel />);

    const typeTab = screen.getByRole('tab', { name: '타입' });
    typeTab.focus();

    fireEvent.keyDown(typeTab, { key: 'Home' });
    expect(screen.getByRole('tab', { name: '포스터' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('tab', { name: '포스터' }), {
      key: 'End',
    });
    expect(screen.getByRole('tab', { name: '타입' })).toHaveFocus();
  });

  it('탭에 키보드 포커스 링을 준다', () => {
    render(<RightPanel />);

    ['포스터', '타입'].forEach(name => {
      expect(screen.getByRole('tab', { name })).toHaveClass(
        'focus-visible:outline-2',
        'focus-visible:outline-offset-2',
        'focus-visible:outline-primary'
      );
    });
  });

  it('갤러리·캘린더에서는 포스터 탭을 선택할 수 없다', () => {
    mockStore({
      block: [{ id: 'component-1', component: 'gallery' }],
      selectedId: 'component-1',
    });
    render(<RightPanel />);

    const posterTab = screen.getByRole('tab', { name: '포스터' });
    expect(posterTab).toBeDisabled();

    fireEvent.click(posterTab);

    expect(screen.getByRole('tab', { name: '타입' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByTestId('type-panel')).toBeInTheDocument();
  });

  it('타입이 없는 블록에서는 타입 탭이 비활성이고 방향키가 포스터로 가지 않는다', () => {
    mockStore({ selectedId: 'mainPoster' });
    mockTypes(EMPTY_ARRAY);
    render(<RightPanel />);

    const posterTab = screen.getByRole('tab', { name: '포스터' });
    const typeTab = screen.getByRole('tab', { name: '타입' });
    expect(typeTab).toBeDisabled();

    posterTab.focus();
    fireEvent.keyDown(posterTab, { key: 'ArrowRight' });

    expect(posterTab).toHaveAttribute('aria-selected', 'true');
    expect(posterTab).toHaveFocus();
  });
});
