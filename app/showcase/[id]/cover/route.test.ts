/**
 * @jest-environment node
 */
import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

import { getShowcaseOriginalTemplate } from '@/shared/data/showcaseOriginalTemplates';

import { GET } from './route';

const readCover = (id: string) => {
  const template = getShowcaseOriginalTemplate(id);
  if (!template) throw new Error(`테스트 기준 템플릿이 없습니다: ${id}`);
  const file = path.join(process.cwd(), 'public', template.thumbnailUrl);
  return fs.readFileSync(file);
};

const callRoute = (id: string) =>
  GET(new Request(`https://invia.co.kr/showcase/${id}/cover`), {
    params: Promise.resolve({ id }),
  });

describe('/showcase/[id]/cover', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('표지를 1200×630 JPEG 공유 카드로 다시 그린다', async () => {
    const cover = readCover('showcase-0');
    global.fetch = jest.fn(
      async () => new Response(cover, { status: 200 })
    ) as unknown as typeof fetch;

    const response = await callRoute('showcase-0');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/jpeg');
    expect(response.headers.get('cache-control')).toContain('s-maxage');

    const image = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
    expect(image.format).toBe('jpeg');
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
  });

  it('모르는 템플릿 주소는 404로 답한다', async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;

    const response = await callRoute('showcase-없는-템플릿');

    expect(response.status).toBe(404);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('원본 표지를 못 불러오면 서비스 기본 OG 이미지로 넘긴다', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    global.fetch = jest.fn(
      async () => new Response('not found', { status: 404 })
    ) as unknown as typeof fetch;

    const response = await callRoute('showcase-0');

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://invia.co.kr/opengraph-image.png'
    );
  });
});
