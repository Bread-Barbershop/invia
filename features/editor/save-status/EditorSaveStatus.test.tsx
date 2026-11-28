import { act, render, screen } from '@testing-library/react';
import { useParams, useSearchParams } from 'next/navigation';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import EditorSaveStatus from './EditorSaveStatus';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockedUseParams = jest.mocked(useParams);
const mockedUseSearchParams = jest.mocked(useSearchParams);

function setRoute(folderId?: string, query = '') {
  mockedUseParams.mockReturnValue(folderId ? { id: folderId } : {});
  mockedUseSearchParams.mockReturnValue(
    new URLSearchParams(query) as ReturnType<typeof useSearchParams>
  );
}

function loadInvitation() {
  useEditorStore.setState({
    invitationFolderId: 'saved-folder',
    invitationUuid: 'saved-uuid',
  });
}

function renderLoadedInvitation() {
  setRoute('saved-folder', 'uuid=saved-uuid');
  loadInvitation();
  return render(<EditorSaveStatus />);
}

describe('편집기 저장 상태 표시', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    setRoute();
  });

  it('저장한 적 없는 새 편집기에서는 아직 저장 전으로 안내한다', () => {
    render(<EditorSaveStatus />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('아직 저장 전');
    expect(status).toHaveAttribute('data-save-state', 'unsaved');
  });

  it('기존 초대장이 열리면 저장됨을 표시한다', () => {
    setRoute('saved-folder', 'uuid=saved-uuid');
    render(<EditorSaveStatus />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    act(loadInvitation);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('저장됨');
    expect(status).toHaveAttribute('data-save-state', 'saved');
  });

  it.each([
    ['saved-folder', ''],
    ['saved-folder', 'uuid=another-uuid'],
    ['saved-folder', 'uuid=saved-uuid&uuid=another-uuid'],
    ['another-folder', 'uuid=saved-uuid'],
  ])(
    '열린 초대장과 편집 링크가 다르면 저장 상태를 표시하지 않는다 (%s, %s)',
    (folderId, query) => {
      const { rerender } = renderLoadedInvitation();
      setRoute(folderId, query);
      rerender(<EditorSaveStatus />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    }
  );

  it('블록을 고치면 저장하지 않은 변경사항으로 바뀐다', () => {
    renderLoadedInvitation();

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
    renderLoadedInvitation();

    act(() => {
      useEditorStore.getState().setIsDirty(true);
    });
    act(() => {
      useEditorStore.getState().setIsDirty(false);
    });

    expect(screen.getByRole('status')).toHaveTextContent('저장됨');
  });

  it('새 편집기에서 첫 저장이 끝나면 저장됨으로 바뀐다', () => {
    render(<EditorSaveStatus />);

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
    render(<EditorSaveStatus />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });
});
