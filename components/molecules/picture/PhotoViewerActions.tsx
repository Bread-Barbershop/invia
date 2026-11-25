'use client';

import { Check, Download, Loader2, Share2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/utils/cn';
import { savePhotoToDevice } from '@/shared/utils/photoDownload';
import { sharePhotoLink } from '@/shared/utils/photoShare';

export const PHOTO_ACTION_MESSAGES = {
  saved: '사진을 저장했어요',
  opened: '새 탭에서 열었어요',
  saveFailed: '사진을 저장하지 못했어요',
  shared: '사진을 공유했어요',
  copied: '링크를 복사했어요',
  shareFailed: '링크를 복사하지 못했어요',
} as const;

type Status = {
  tone: 'success' | 'error';
  message: string;
  /** 안내 문구가 만들어진 사진 순번 (다른 사진으로 넘어가면 숨깁니다) */
  index: number;
} | null;

interface Props {
  /** 현재 보고 있는 사진 URL */
  imageSrc: string;
  /** 현재 사진의 0부터 시작하는 순번 (저장 파일명에 사용) */
  index: number;
  /** 공유할 초대장 링크 (없으면 현재 페이지 주소) */
  shareUrl?: string;
  /** 공유 시트 제목 (없으면 문서 제목) */
  shareTitle?: string;
  className?: string;
}

const STATUS_VISIBLE_MS = 2500;

const actionButtonClassName = cn(
  'inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-1.5 rounded-full',
  'border border-white/15 bg-black/45 px-3.5 py-1.5 text-[11px] font-medium text-white/90',
  'shadow-sm backdrop-blur-sm transition-all duration-150',
  'hover:bg-black/70 hover:text-white active:scale-95',
  'disabled:cursor-default disabled:opacity-60 disabled:active:scale-100'
);

/**
 * 갤러리 라이트박스 하단의 사진 저장 / 공유 액션.
 * 결과는 토스트 없이 라이트박스 안의 짧은 상태 문구로 알립니다.
 */
export function PhotoViewerActions({
  imageSrc,
  index,
  shareUrl,
  shareTitle,
  className,
}: Props) {
  const [status, setStatus] = useState<Status>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const isSharingRef = useRef(false);

  // 다른 사진으로 넘어가면 이전 사진의 안내 문구는 보이지 않게 합니다.
  const visibleStatus = status && status.index === index ? status : null;

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), STATUS_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleSave = useCallback(async () => {
    if (isSavingRef.current || !imageSrc) return;
    isSavingRef.current = true;
    setIsSaving(true);
    setStatus(null);

    try {
      const outcome = await savePhotoToDevice(imageSrc, index);
      if (outcome === 'saved') {
        setStatus({
          tone: 'success',
          message: PHOTO_ACTION_MESSAGES.saved,
          index,
        });
      } else if (outcome === 'opened') {
        setStatus({
          tone: 'success',
          message: PHOTO_ACTION_MESSAGES.opened,
          index,
        });
      } else {
        setStatus({
          tone: 'error',
          message: PHOTO_ACTION_MESSAGES.saveFailed,
          index,
        });
      }
    } catch {
      setStatus({
        tone: 'error',
        message: PHOTO_ACTION_MESSAGES.saveFailed,
        index,
      });
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [imageSrc, index]);

  const handleShare = useCallback(async () => {
    if (isSharingRef.current) return;
    isSharingRef.current = true;
    setStatus(null);

    try {
      const url =
        shareUrl ?? (typeof window !== 'undefined' ? window.location.href : '');
      const title =
        shareTitle ??
        (typeof document !== 'undefined' ? document.title : undefined);

      const outcome = await sharePhotoLink({ url, title });
      if (outcome === 'shared') {
        setStatus({
          tone: 'success',
          message: PHOTO_ACTION_MESSAGES.shared,
          index,
        });
      } else if (outcome === 'copied') {
        setStatus({
          tone: 'success',
          message: PHOTO_ACTION_MESSAGES.copied,
          index,
        });
      } else if (outcome === 'failed') {
        setStatus({
          tone: 'error',
          message: PHOTO_ACTION_MESSAGES.shareFailed,
          index,
        });
      }
    } catch {
      setStatus({
        tone: 'error',
        message: PHOTO_ACTION_MESSAGES.shareFailed,
        index,
      });
    } finally {
      isSharingRef.current = false;
    }
  }, [index, shareTitle, shareUrl]);

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="사진 저장"
          aria-busy={isSaving}
          disabled={isSaving || !imageSrc}
          onClick={handleSave}
          className={actionButtonClassName}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : visibleStatus?.message === PHOTO_ACTION_MESSAGES.saved ? (
            <Check className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Download className="h-3.5 w-3.5" aria-hidden />
          )}
          <span>{isSaving ? '저장 중' : '사진 저장'}</span>
        </button>

        <button
          type="button"
          aria-label="사진 공유하기"
          onClick={handleShare}
          className={actionButtonClassName}
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          <span>공유하기</span>
        </button>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          'min-h-[16px] text-center text-[11px] leading-4 transition-opacity duration-200',
          visibleStatus?.tone === 'error' ? 'text-red-200' : 'text-white/80',
          visibleStatus ? 'opacity-100' : 'opacity-0'
        )}
      >
        {visibleStatus?.message ?? ''}
      </p>
    </div>
  );
}

export default PhotoViewerActions;
