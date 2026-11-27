import { DEFAULT_DESCRIPTION, SERVICE_NAME } from '@/shared/config/seo';
import {
  getShowcaseInvitation,
  SHOWCASE_CATEGORY_LABELS,
} from '@/shared/data/showcaseInvitations';
import { getShowcaseOriginalTemplate } from '@/shared/data/showcaseOriginalTemplates';

import type { Metadata } from 'next';

/**
 * 공유 카드(카카오톡·슬랙·X)가 잘라 쓰기 좋은 1.91:1 비율.
 * `/showcase/[id]/cover`가 이 크기로 썸네일을 다시 그린다.
 */
export const SHOWCASE_OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** 템플릿 미리보기는 검색 결과에 노출하지 않는다(중복 콘텐츠 방지). */
export const SHOWCASE_ROBOTS: Metadata['robots'] = { index: false, follow: false };

/**
 * 템플릿을 찾지 못한 주소에서는 루트 레이아웃의 기본 제목·OG를 그대로 쓰도록
 * 비워 둔다. `openGraph`를 지정하지 않으면 상위 메타데이터가 유지된다.
 */
export const SHOWCASE_FALLBACK_METADATA: Metadata = {
  title: '초대장 미리보기',
  description: DEFAULT_DESCRIPTION,
  robots: SHOWCASE_ROBOTS,
};

/** 템플릿별 공유 카드 이미지 주소. 카카오톡이 webp를 읽지 못해 JPEG로 변환해 준다. */
export function getShowcaseCoverImagePath(id: string) {
  return `/showcase/${encodeURIComponent(id)}/cover`;
}

function categoryLabel(type: string) {
  const labels: Record<string, string> = SHOWCASE_CATEGORY_LABELS;
  return labels[type] ?? '모바일';
}

/**
 * `/showcase/[id]` 한 장의 메타데이터.
 * 템플릿마다 제목·설명·공유 이미지가 달라져, 링크를 공유했을 때 어떤 템플릿인지 보인다.
 */
export function buildShowcaseMetadata(id: string): Metadata {
  const design = getShowcaseInvitation(id);
  const template = getShowcaseOriginalTemplate(id);
  if (!design || !template) return SHOWCASE_FALLBACK_METADATA;

  const label = categoryLabel(design.type);
  const title = `${design.name} ${label} 초대장`;
  const description = `${design.description} · 인비아 ${label} 초대장 템플릿`;
  const image = {
    url: getShowcaseCoverImagePath(design.id),
    width: SHOWCASE_OG_IMAGE_SIZE.width,
    height: SHOWCASE_OG_IMAGE_SIZE.height,
    alt: `${design.name} ${label} 초대장 표지`,
  };

  return {
    title,
    description,
    robots: SHOWCASE_ROBOTS,
    openGraph: {
      type: 'website',
      siteName: SERVICE_NAME,
      locale: 'ko_KR',
      url: `/showcase/${design.id}`,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  };
}
