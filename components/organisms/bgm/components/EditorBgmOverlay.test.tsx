import { render, screen } from '@testing-library/react';

import { useEditorBgmPlayer } from '../context/EditorBgmPlayerContext';

import { EditorBgmOverlay } from './EditorBgmOverlay';

jest.mock('../context/EditorBgmPlayerContext', () => ({
  useEditorBgmPlayer: jest.fn(),
}));

const mockedUseEditorBgmPlayer = jest.mocked(useEditorBgmPlayer);

function playerValue(
  overrides: Partial<ReturnType<typeof useEditorBgmPlayer>> = {}
) {
  return {
    hasSelectedBgm: true,
    isPlaying: false,
    playbackError: null,
    sourceKey: 'quiet-step-to-forever',
    togglePlay: jest.fn(),
    ...overrides,
  } as ReturnType<typeof useEditorBgmPlayer>;
}

describe('EditorBgmOverlay 재생 실패 안내', () => {
  it('실패 상태가 없으면 토글과 안내 문구만 보여 준다', () => {
    mockedUseEditorBgmPlayer.mockReturnValue(playerValue());

    render(<EditorBgmOverlay />);

    expect(
      screen.getByRole('button', { name: '배경음악' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('재생이 차단되면 다시 눌러 달라고 안내한다', () => {
    mockedUseEditorBgmPlayer.mockReturnValue(
      playerValue({ playbackError: 'blocked' })
    );

    render(<EditorBgmOverlay />);

    expect(screen.getByRole('status')).toHaveTextContent(
      '브라우저가 재생을 막았어요. 음악 버튼을 다시 눌러 주세요.'
    );
  });
});
