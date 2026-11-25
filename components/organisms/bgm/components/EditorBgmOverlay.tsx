'use client';

import { useState } from 'react';

import { BGM_PLAYBACK_ERROR_MESSAGE } from '../bgmPlaybackMessages';
import { useEditorBgmPlayer } from '../context/EditorBgmPlayerContext';

import { BgmPlaybackHint } from './BgmPlaybackHint';
import { BgmPlaybackNotice } from './BgmPlaybackNotice';
import BgmToggleButton from './BgmToggleButton';

export function EditorBgmOverlay() {
  const { hasSelectedBgm, isPlaying, playbackError, sourceKey, togglePlay } =
    useEditorBgmPlayer();

  if (!hasSelectedBgm || !sourceKey) return null;

  return (
    <EditorBgmOverlayForSource
      key={sourceKey}
      isPlaying={isPlaying}
      playbackError={playbackError}
      onToggle={togglePlay}
    />
  );
}

function EditorBgmOverlayForSource({
  isPlaying,
  playbackError,
  onToggle,
}: {
  isPlaying: boolean;
  playbackError: 'load' | 'blocked' | 'play' | null;
  onToggle: () => void;
}) {
  const [isHintDismissed, setIsHintDismissed] = useState(false);

  const handleToggle = () => {
    setIsHintDismissed(true);
    onToggle();
  };

  return (
    <>
      <BgmPlaybackHint isDismissed={isHintDismissed} />
      <BgmToggleButton isOn={isPlaying} onToggle={handleToggle} />
      {playbackError && (
        <BgmPlaybackNotice
          message={BGM_PLAYBACK_ERROR_MESSAGE[playbackError]}
        />
      )}
    </>
  );
}
