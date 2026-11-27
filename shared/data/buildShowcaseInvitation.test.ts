import { existsSync } from 'node:fs';
import path from 'node:path';

import { showcaseItems } from '@/app/(home)/components/showcaseItems';
import { normalizeGuestBlock } from '@/app/guest/[id]/validation/normalizeGuestBlock';
import { parseStrictDate } from '@/shared/utils/dateValidation';

import { buildShowcaseInvitation } from './buildShowcaseInvitation';
import {
  getShowcaseInvitation,
  SHOWCASE_INVITATIONS,
} from './showcaseInvitations';

describe('첫 화면 초대장 샘플', () => {
  it('모든 카드가 고유한 본문과 일대일로 연결된다', () => {
    expect(showcaseItems).toHaveLength(52);
    expect(SHOWCASE_INVITATIONS).toHaveLength(showcaseItems.length);
    expect(new Set(SHOWCASE_INVITATIONS.map(item => item.id)).size).toBe(
      showcaseItems.length
    );
    expect(new Set(SHOWCASE_INVITATIONS.map(item => item.heading)).size).toBe(
      showcaseItems.length
    );
    for (const card of showcaseItems)
      expect(getShowcaseInvitation(card.id)).toBeDefined();
    expect(getShowcaseInvitation('unknown')).toBeUndefined();
  });

  it.each(SHOWCASE_INVITATIONS)(
    '$name 샘플의 모든 블록을 게스트 화면에서 손실 없이 표시할 수 있다',
    design => {
      const sample = buildShowcaseInvitation(design);
      expect(
        sample.blocks.find(block => block.component === 'place')?.props
      ).toMatchObject({ placeName: design.venue });
      expect(new Set(sample.blocks.map(block => block.id)).size).toBe(
        sample.blocks.length
      );
      for (const [index, block] of sample.blocks.entries()) {
        const result = normalizeGuestBlock(block, index);
        expect(result).toMatchObject({ ok: true });
      }
      for (const section of design.sections) {
        if (section.component === 'myChild' && section.birthday) {
          expect(parseStrictDate(section.birthday, '.')).not.toBeNull();
        }
      }
      const calendar = sample.blocks.find(
        block => block.component === 'calendar'
      );
      expect(calendar?.props).toMatchObject({
        date: design.date,
        showDday: false,
      });
      const greeting = sample.blocks.find(
        block => block.component === 'greeting'
      );
      expect(greeting?.props).toMatchObject({ title: design.heading });
    }
  );

  it.each(
    [
      { previousCount: 4, ids: [2, 5, 6, 17, 20, 42, 43, 44] },
      {
        previousCount: 5,
        ids: [
          0, 1, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 21, 22, 23, 24,
          41,
        ],
      },
      { previousCount: 6, ids: [3] },
    ].flatMap(({ previousCount, ids }) =>
      ids.map(id => ({ id: `showcase-${id}`, previousCount }))
    )
  )(
    '$id의 본문은 첫 판의 $previousCount개 블록에서 3개 이상 늘어난다',
    ({ id, previousCount }) => {
      const design = getShowcaseInvitation(id);
      if (!design) throw new Error(`초대장 샘플을 찾을 수 없습니다: ${id}`);
      const added =
        buildShowcaseInvitation(design).blocks.length - previousCount;
      expect(added).toBeGreaterThanOrEqual(3);
      // 본문이 길어져도 스크롤 부담이 커지지 않도록 상한을 둔다.
      expect(buildShowcaseInvitation(design).blocks.length).toBeLessThanOrEqual(
        14
      );
    }
  );

  it('표지마다 서로 다른 블록 순서를 제공한다', () => {
    const layouts = SHOWCASE_INVITATIONS.map(design => {
      const { blocks } = buildShowcaseInvitation(design);
      return blocks.map(block => block.component).join(',');
    });
    expect(new Set(layouts).size).toBe(layouts.length);
  });

  it.each(SHOWCASE_INVITATIONS)(
    '$name의 본문 사진은 로컬 파일이거나 공개 Drive 주소다',
    design => {
      const { blocks } = buildShowcaseInvitation(design);
      // 사진 블록뿐 아니라 인터뷰·연사·후원사 등 중첩된 이미지 필드도 확인한다.
      // 저장소 용량을 늘리지 않도록 본문 사진은 Drive에 두고 링크로 불러온다.
      const isHostedPhoto = (image: string) =>
        /^https:\/\/lh3\.googleusercontent\.com\/d\/[\w-]+$/.test(image);
      function checkImages(value: unknown): void {
        if (!value || typeof value !== 'object') return;
        for (const [key, child] of Object.entries(value)) {
          if (key === 'image' || key === 'images') {
            expect(Array.isArray(child)).toBe(true);
            for (const image of child as string[]) {
              expect(typeof image).toBe('string');
              if (isHostedPhoto(image)) continue;
              expect(image).toMatch(/^\/(images|samples|templates)\//);
              expect(
                existsSync(path.join(process.cwd(), 'public', image))
              ).toBe(true);
            }
          } else {
            checkImages(child);
          }
        }
      }
      checkImages(blocks);
    }
  );

  it.each(
    SHOWCASE_INVITATIONS.filter(design =>
      ['wedding', 'firstBirthday', 'birthday'].includes(design.type)
    )
  )('$name은 실제 장소 주소·좌표로 지도와 길안내를 연다', design => {
    expect(design.venueAddress).toBeTruthy();
    expect(typeof design.venueLat).toBe('number');
    expect(typeof design.venueLng).toBe('number');
    const place = buildShowcaseInvitation(design).blocks.find(
      block => block.component === 'place'
    );
    expect(place?.props).toMatchObject({
      placeName: design.venue,
      placeAddress: design.venueAddress,
      lat: design.venueLat,
      lng: design.venueLng,
      openMap: true,
      openNavi: true,
    });
  });

  it.each(
    SHOWCASE_INVITATIONS.filter(design =>
      ['firstBirthday', 'birthday'].includes(design.type)
    )
  )('$name은 오시는 길 블록으로 대중교통 안내를 제공한다', design => {
    const transport = design.sections.find(
      section => section.component === 'transportation'
    );
    expect(transport).toBeDefined();
    expect(
      transport && 'subwayStation' in transport ? transport.subwayStation : ''
    ).toBeTruthy();
  });

  it.each(SHOWCASE_INVITATIONS)(
    '$name의 카운트다운은 예식 날짜·시간과 같다',
    design => {
      const countdown = buildShowcaseInvitation(design).blocks.find(
        block => block.component === 'countdown'
      );
      if (!countdown) return;
      expect(countdown.props).toMatchObject({
        eventDateTime: `${design.date}T${design.time}`,
      });
    }
  );
});
