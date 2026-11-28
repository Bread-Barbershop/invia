'use client';

import { ImageOff } from 'lucide-react';
import { useState } from 'react';

import { Image } from '@/components/atoms/image';
import { cn } from '@/shared/utils/cn';

interface Props {
  src: string;
  alt: string;
  className?: string;
  /** 화면 밖 사진은 lazy, 라이트박스의 현재·인접 사진은 eager */
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  errorLabel?: string;
}

/**
 * 갤러리 사진 한 장.
 * - below-the-fold 사진은 지연 로딩 + 비동기 디코딩으로 첫 화면 그리기 부담을 줄입니다.
 * - 로드에 실패하면 깨진 이미지 대신 같은 크기의 안내 블록을 보여 레이아웃이 흔들리지 않게 합니다.
 */
export function GalleryImage({
  src,
  alt,
  className,
  loading = 'lazy',
  fetchPriority,
  errorLabel = '사진을 불러오지 못했어요',
}: Props) {
  // 같은 슬롯에 다른 사진이 들어오면(캐러셀 재사용) 오류 상태를 자동으로 벗어납니다.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasFailed = failedSrc === src;

  if (hasFailed) {
    return (
      <div
        role="img"
        aria-label={errorLabel}
        className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#F2F1EF] text-[11px] text-text-secondary"
      >
        <ImageOff className="h-4 w-4 opacity-50" aria-hidden />
        <span>{errorLabel}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={cn('object-cover select-none pointer-events-none', className)}
      draggable={false}
      onError={() => setFailedSrc(src)}
    />
  );
}

export default GalleryImage;
