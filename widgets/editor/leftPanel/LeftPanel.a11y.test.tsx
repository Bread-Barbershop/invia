import { render, screen } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import LeftPanel from './LeftPanel';

jest.mock('@/shared/store/editorStore/useEditorStore');
jest.mock('./components/BulkEdit', () => ({
  __esModule: true,
  default: () => <div data-testid="bulk-edit">BulkEdit</div>,
}));
jest.mock('./components/Edit', () => ({
  __esModule: true,
  default: () => <div data-testid="edit">Edit</div>,
}));

const mockIsEdit = (isEdit: boolean) => {
  (useEditorStore as unknown as jest.Mock).mockReturnValue({
    isEdit,
    setIsEdit: jest.fn(),
  });
};

describe('LeftPanel 키보드 접근성', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('전체 스타일 접기/펼치기 버튼에 포커스 링을 준다', () => {
    mockIsEdit(false);
    render(<LeftPanel />);

    const toggle = screen.getByRole('button', { name: '전체 스타일' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveClass(
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-primary'
    );
  });

  it('상세 편집으로 닫는 버튼에 포커스 링을 준다', () => {
    mockIsEdit(true);
    render(<LeftPanel />);

    expect(screen.getByRole('button', { name: '상세 편집' })).toHaveClass(
      'focus-visible:outline-2',
      'focus-visible:outline-primary'
    );
  });
});
