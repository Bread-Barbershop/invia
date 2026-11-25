import { act, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import EditorSaveStatus from './EditorSaveStatus';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

function renderStatus(pathname: string) {
  mockedUsePathname.mockReturnValue(pathname);
  return render(<EditorSaveStatus />);
}

describe('편집기 저장 상태 표시', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    mockedUsePathname.mockReset();
  });

  it('저장한 적 없는 새 편집기에서는 아직 저장 전으로 안내한다', () => {
    renderStatus('/editor');

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('아직 저장 전');
    expect(status).toHaveAttribute('data-save-state', 'unsaved');
  });

  it('기존 초대장을 여는 화면에서는 저장됨으로 시작한다', () => {
    renderStatus('/editor/3f2a9c');

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('저장됨');
    expect(status).toHaveAttribute('data-save-state', 'saved');
  });

  it('블록을 고치면 저장하지 않은 변경사항으로 바뀐다', () => {
    renderStatus('/editor/3f2a9c');

    act(() => {
      useEditorStore.getState().setIsDirty(true);
    });

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('저장하지 않은 변경사항');
    expect(status).toHaveAttribute('data-save-state', 'dirty');
    expect(status).toHaveAttribute(
      'title',
      '고친 내용이 아직 저장되지 않았어요. 창을 닫으면 사라질 수 있어요.'
    );
  });

  it('저장이 끝나면 다시 저장됨으로 돌아온다', () => {
    renderStatus('/editor/3f2a9c');

    act(() => {
      useEditorStore.getState().setIsDirty(true);
    });
    act(() => {
      useEditorStore.getState().setInvitationUuid('saved-uuid');
      useEditorStore.getState().setIsDirty(false);
    });

    expect(screen.getByRole('status')).toHaveTextContent('저장됨');
  });

  it('새 편집기에서 첫 저장이 끝나면 저장됨으로 바뀐다', () => {
    renderStatus('/editor');

    act(() => {
      useEditorStore.getState().setIsDirty(true);
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      '저장하지 않은 변경사항'
    );

    act(() => {
      useEditorStore.getState().setInvitationUuid('new-uuid');
      useEditorStore.getState().setIsDirty(false);
    });

    expect(screen.getByRole('status')).toHaveTextContent('저장됨');
  });

  it('화면 낭독기가 상태 변화를 읽도록 live region으로 표시한다', () => {
    renderStatus('/editor');

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });
});
