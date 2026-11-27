import { DEFAULT_DESCRIPTION } from '@/shared/config/seo';
import { SHOWCASE_INVITATIONS } from '@/shared/data/showcaseInvitations';

import {
  buildShowcaseMetadata,
  getShowcaseCoverImagePath,
  SHOWCASE_FALLBACK_METADATA,
  SHOWCASE_OG_IMAGE_SIZE,
} from './showcaseMetadata';

const findDesign = (id: string) => {
  const design = SHOWCASE_INVITATIONS.find(invitation => invitation.id === id);
  if (!design) throw new Error(`테스트 기준 템플릿이 없습니다: ${id}`);
  return design;
};

describe('buildShowcaseMetadata', () => {
  it('템플릿 이름과 카테고리로 그 템플릿만의 제목·설명을 만든다', () => {
    const design = findDesign('showcase-0');
    const metadata = buildShowcaseMetadata(design.id);

    expect(metadata.title).toBe(`${design.name} 웨딩 초대장`);
    expect(metadata.description).toContain(design.description);
  });

  it('공유 카드에 이 템플릿의 표지 이미지와 주소를 넣는다', () => {
    const design = findDesign('showcase-1');
    const metadata = buildShowcaseMetadata(design.id);
    const coverPath = getShowcaseCoverImagePath(design.id);

    expect(coverPath).toBe('/showcase/showcase-1/cover');
    expect(metadata.openGraph?.url).toBe(`/showcase/${design.id}`);
    expect(metadata.openGraph?.title).toBe(`${design.name} 웨딩 초대장`);
    expect(metadata.openGraph?.images).toEqual([
      {
        url: coverPath,
        width: SHOWCASE_OG_IMAGE_SIZE.width,
        height: SHOWCASE_OG_IMAGE_SIZE.height,
        alt: `${design.name} 웨딩 초대장 표지`,
      },
    ]);
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: `${design.name} 웨딩 초대장`,
      images: [coverPath],
    });
  });

  it('검색 노출은 막아 둔 채로 공유 정보만 채운다', () => {
    const metadata = buildShowcaseMetadata('showcase-0');

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('모르는 주소에서는 기본 제목·설명을 쓰고 OG는 루트 값을 그대로 둔다', () => {
    const metadata = buildShowcaseMetadata('showcase-없는-템플릿');

    expect(metadata).toEqual(SHOWCASE_FALLBACK_METADATA);
    expect(metadata.title).toBe('초대장 미리보기');
    expect(metadata.description).toBe(DEFAULT_DESCRIPTION);
    expect(metadata.openGraph).toBeUndefined();
    expect(metadata.twitter).toBeUndefined();
  });

  it('공유 카드 이미지의 대체 텍스트도 같은 제목을 따른다', () => {
    const design = findDesign('showcase-21');
    const metadata = buildShowcaseMetadata(design.id);

    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        alt: `${design.name} 돌잔치 초대장 표지`,
      }),
    ]);
  });

  it('이름에 이미 카테고리나 “초대”가 있으면 같은 말을 두 번 쓰지 않는다', () => {
    const titleOf = (name: string) => {
      const design = SHOWCASE_INVITATIONS.find(
        invitation => invitation.name === name
      );
      if (!design) throw new Error(`테스트 기준 템플릿이 없습니다: ${name}`);
      return buildShowcaseMetadata(design.id).title;
    };

    expect(titleOf('브릭 시티 웨딩')).toBe('브릭 시티 웨딩 초대장');
    expect(titleOf('프리즘 광학 세미나')).toBe('프리즘 광학 세미나 초대장');
    expect(titleOf('별 아래 생일 캠프')).toBe('별 아래 생일 캠프 초대장');
    expect(titleOf('민준이의 첫 초대')).toBe('민준이의 첫 초대장');
    expect(titleOf('정갈한 혼례 초대')).toBe('정갈한 혼례 초대장');
    expect(titleOf('클래식 모먼트')).toBe('클래식 모먼트 웨딩 초대장');
  });

  it('공개된 템플릿 전부 자기 이름이 들어간 메타데이터를 만든다', () => {
    SHOWCASE_INVITATIONS.forEach(design => {
      const metadata = buildShowcaseMetadata(design.id);

      expect(metadata).not.toEqual(SHOWCASE_FALLBACK_METADATA);
      expect(metadata.title).toContain(design.name);
      expect(metadata.openGraph?.images).toHaveLength(1);
    });
  });

  it('템플릿마다 공유 카드 주소가 서로 다르다', () => {
    const paths = SHOWCASE_INVITATIONS.map(design =>
      getShowcaseCoverImagePath(design.id)
    );

    expect(new Set(paths).size).toBe(SHOWCASE_INVITATIONS.length);
  });
});
