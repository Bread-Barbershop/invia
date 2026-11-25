// app/guest/[id]/components/GuestBgm.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  BGM_PLAYBACK_ERROR_MESSAGE,
  isAutoplayBlockedError,
} from '@/components/organisms/bgm/bgmPlaybackMessages';
import { BgmPlaybackHint } from '@/components/organisms/bgm/components/BgmPlaybackHint';
import { BgmPlaybackNotice } from '@/components/organisms/bgm/components/BgmPlaybackNotice';
import BgmToggleButton from '@/components/organisms/bgm/components/BgmToggleButton';
import { BGM_LIST } from '@/components/organisms/bgm/data/bgmList';

import type { GuestBgm as GuestBgmData } from '../types/guestTypes';

interface GuestBgmProps {
  bgm: GuestBgmData;
  mode?: 'guest' | 'dashboard-preview';
  previewFolderId?: string;
  localAudioSrc?: string | null;
}

const USER_BGM_ID = 'user-bgm';
const PREVIEW_CONTROL_TOP = '!top-[var(--phone-frame-bgm-top,2rem)]';
const PREVIEW_NOTICE_OFFSET =
  '!top-[calc(var(--phone-frame-bgm-top,2rem)+2.5rem)] !right-[var(--phone-frame-bgm-right,2rem)]';

function driveAudioUrl(fileId: string) {
  return `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download`;
}

function proxyAudioUrl(fileId: string) {
  return `/api/drive/guestBgm?fileId=${encodeURIComponent(fileId)}`;
}

function previewAudioUrl(fileId: string, folderId?: string) {
  // 미리보기에서는 비공개 사용자 BGM도 재생해야 하므로 초대장 범위가 검증되는 프록시를 사용한다.
  const params = new URLSearchParams({
    kind: 'audio',
    fileId,
  });

  if (folderId) {
    params.set('folderId', folderId);
  }

  return `/api/drive/previewAsset?${params.toString()}`;
}

function clampVolume(volume: number) {
  if (Number.isNaN(volume)) return 0.2;
  return Math.min(1, Math.max(0, volume));
}

function GuestBgm({
  bgm,
  mode = 'guest',
  previewFolderId,
  localAudioSrc,
}: GuestBgmProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOn, setIsOn] = useState(false);
  const [isHintDismissed, setIsHintDismissed] = useState(false);
  const [isPosterReady, setIsPosterReady] = useState(false);
  const [directFailedUserBgmFileId, setDirectFailedUserBgmFileId] = useState<
    string | null
  >(null);
  const [requestedAudioKey, setRequestedAudioKey] = useState<string | null>(
    null
  );
  const [playbackError, setPlaybackError] = useState<{
    message: string;
    audioKey: string | null;
  } | null>(null);

  const isUserBgm = bgm.selectedBgmId === USER_BGM_ID;
  const shouldUseProxyForUserBgm =
    isUserBgm &&
    bgm.userBgmFileId !== null &&
    (mode === 'dashboard-preview' ||
      directFailedUserBgmFileId === bgm.userBgmFileId);

  const selectedAudioKey = useMemo(() => {
    if (!bgm.selectedBgmId) return null;

    if (isUserBgm) {
      if (mode === 'dashboard-preview' && localAudioSrc?.startsWith('blob:'))
        return `${USER_BGM_ID}:${localAudioSrc}`;
      if (!bgm.userBgmFileId) return null;
      return `${USER_BGM_ID}:${bgm.userBgmFileId}`;
    }

    return bgm.selectedBgmId;
  }, [bgm.selectedBgmId, bgm.userBgmFileId, isUserBgm, mode, localAudioSrc]);

  const selectedAudioSrc = useMemo(() => {
    if (!bgm.selectedBgmId) return null;

    if (isUserBgm) {
      if (mode === 'dashboard-preview' && localAudioSrc?.startsWith('blob:'))
        return localAudioSrc;
      if (!bgm.userBgmFileId) return null;
      if (mode === 'dashboard-preview') {
        // 공개 Drive URL 실패를 기다리지 않고 처음부터 인증 프록시로 요청한다.
        return previewAudioUrl(bgm.userBgmFileId, previewFolderId);
      }

      return shouldUseProxyForUserBgm
        ? proxyAudioUrl(bgm.userBgmFileId)
        : driveAudioUrl(bgm.userBgmFileId);
    }

    return BGM_LIST.find(item => item.id === bgm.selectedBgmId)?.src ?? null;
  }, [
    bgm.selectedBgmId,
    bgm.userBgmFileId,
    isUserBgm,
    mode,
    previewFolderId,
    shouldUseProxyForUserBgm,
    localAudioSrc,
  ]);

  const src =
    selectedAudioKey !== null && requestedAudioKey === selectedAudioKey
      ? selectedAudioSrc
      : null;

  // 곡이 바뀌면 이전 곡의 실패 안내는 의미가 없으므로 바로 숨긴다.
  const visiblePlaybackError =
    playbackError && playbackError.audioKey === selectedAudioKey
      ? playbackError.message
      : null;

  useEffect(() => {
    if (!playbackError) return;

    const timer = window.setTimeout(() => setPlaybackError(null), 8000);
    return () => window.clearTimeout(timer);
  }, [playbackError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = bgm.isLoop;
    audio.volume = clampVolume(bgm.volume);
  }, [bgm.isLoop, bgm.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!src) {
      audio.pause();
      if (audio.hasAttribute('src')) {
        audio.removeAttribute('src');
        audio.load();
      }
      return;
    }

    audio.pause();
    audio.src = src;
    audio.load();
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = () => {
      if (isUserBgm && bgm.userBgmFileId && !shouldUseProxyForUserBgm) {
        // 공개 Drive 링크가 막힌 경우엔 조용히 인증 프록시로 한 번 더 시도한다.
        setDirectFailedUserBgmFileId(bgm.userBgmFileId);
        return;
      }

      setIsOn(false);
      setPlaybackError({
        message: BGM_PLAYBACK_ERROR_MESSAGE.load,
        audioKey: selectedAudioKey,
      });
    };

    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('error', handleError);
    };
  }, [
    bgm.userBgmFileId,
    isUserBgm,
    selectedAudioKey,
    shouldUseProxyForUserBgm,
  ]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!src || !isOn) {
      audio.pause();
      return;
    }

    const tryPlay = () => {
      void audio
        .play()
        .then(() => setPlaybackError(null))
        .catch((error: unknown) => {
          setIsOn(false);
          setPlaybackError({
            message: isAutoplayBlockedError(error)
              ? BGM_PLAYBACK_ERROR_MESSAGE.blocked
              : BGM_PLAYBACK_ERROR_MESSAGE.play,
            audioKey: selectedAudioKey,
          });
        });
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      tryPlay();
      return;
    }

    audio.addEventListener('canplay', tryPlay, { once: true });
    return () => {
      audio.removeEventListener('canplay', tryPlay);
    };
  }, [isOn, selectedAudioKey, src]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  useEffect(() => {
    const handlePosterReady = () => setIsPosterReady(true);

    window.addEventListener('guest-main-poster-ready', handlePosterReady, {
      once: true,
    });

    return () => {
      window.removeEventListener('guest-main-poster-ready', handlePosterReady);
    };
  }, []);

  const handleToggle = () => {
    if (!selectedAudioKey) return;

    setIsHintDismissed(true);
    setPlaybackError(null);
    setRequestedAudioKey(selectedAudioKey);
    setIsOn(prev => !prev);
  };
  const isDashboardPreview = mode === 'dashboard-preview';

  return (
    <>
      <audio ref={audioRef} preload="none" />
      {selectedAudioSrc && (
        <>
          {isPosterReady && (
            <BgmPlaybackHint
              className={
                isDashboardPreview
                  ? `${PREVIEW_CONTROL_TOP} !right-[calc(var(--phone-frame-bgm-right,2rem)+40px)] !bg-white/72 !text-text-plain
                    in-[.phone-preview-frame]:h-auto! in-[.phone-preview-frame]:min-h-8
                    in-[.phone-preview-frame]:max-w-[calc(100%-var(--phone-frame-bgm-right)-48px)]
                    in-[.phone-preview-frame]:px-[min(0.75rem,3%)]! in-[.phone-preview-frame]:py-1`
                  : ''
              }
              isDismissed={isHintDismissed}
            />
          )}
          <BgmToggleButton
            className={
              isDashboardPreview
                ? `${PREVIEW_CONTROL_TOP} !right-[var(--phone-frame-bgm-right,2rem)]`
                : ''
            }
            isOn={isOn}
            onToggle={handleToggle}
          />
          {visiblePlaybackError && (
            <BgmPlaybackNotice
              className={isDashboardPreview ? PREVIEW_NOTICE_OFFSET : ''}
              message={visiblePlaybackError}
            />
          )}
        </>
      )}
    </>
  );
}

export default GuestBgm;
