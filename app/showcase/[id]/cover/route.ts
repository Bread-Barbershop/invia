import { NextResponse } from 'next/server';
import sharp from 'sharp';

import { getShowcaseInvitation } from '@/shared/data/showcaseInvitations';
import { getShowcaseOriginalTemplate } from '@/shared/data/showcaseOriginalTemplates';

import { SHOWCASE_OG_IMAGE_SIZE } from '../showcaseMetadata';

/** 템플릿 썸네일은 거의 바뀌지 않으므로 CDN에서 오래 재사용하고, 바뀌면 하루 안에 갱신한다. */
const CACHE_CONTROL = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';

/** 빌드 시점이 아니라 요청 시점에 원본 표지를 읽어 카드를 그린다. */
export const dynamic = 'force-dynamic';

/** 카드 안에서 표지가 차지하는 세로 비율 — 위아래 여백을 남겨 잘리지 않게 한다. */
const COVER_HEIGHT_RATIO = 0.9;

const FALLBACK_IMAGE_PATH = '/opengraph-image.png';

/**
 * `/showcase/[id]` 공유 카드 이미지 (1200×630 JPEG).
 *
 * 템플릿 표지는 750×1624 webp라 카카오톡·페이스북 미리보기가 이미지를 읽지 못한다.
 * 표지를 흐린 배경 위에 세로로 온전히 얹어 공유용 JPEG로 다시 그린다.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const design = getShowcaseInvitation(id);
  const template = getShowcaseOriginalTemplate(id);
  if (!design || !template) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const { width, height } = SHOWCASE_OG_IMAGE_SIZE;
    const source = await fetch(new URL(template.thumbnailUrl, request.url));
    if (!source.ok) {
      throw new Error(`표지 원본을 불러오지 못했습니다: ${source.status}`);
    }
    const cover = Buffer.from(await source.arrayBuffer());

    const [backdrop, foreground] = await Promise.all([
      sharp(cover)
        .resize(width, height, { fit: 'cover', position: 'attention' })
        .blur(28)
        .modulate({ brightness: 0.92 })
        .toBuffer(),
      sharp(cover)
        .resize({ height: Math.round(height * COVER_HEIGHT_RATIO), fit: 'inside' })
        .toBuffer(),
    ]);

    const image = await sharp(backdrop)
      .composite([{ input: foreground, gravity: 'center' }])
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(image), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(image.length),
        'Cache-Control': CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error(`showcase cover failed: ${design.id}`, error);
    // 이미지가 아예 빠지는 것보다 서비스 기본 OG 이미지가 낫다.
    return NextResponse.redirect(new URL(FALLBACK_IMAGE_PATH, request.url));
  }
}
