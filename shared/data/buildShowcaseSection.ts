import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { blockSchema } from '@/shared/data/registry/block.schema';
import type { EditorBlock } from '@/shared/types/block';
import type { BlockType } from '@/shared/types/editor';

import type { ShowcaseInvitation } from './showcaseInvitations';
import type { ShowcaseSection } from './showcaseSections';
import type { JSONContent } from '@tiptap/core';

// 주소를 따로 지정하지 않은 예시 초대장이 쓰는 기본 예식장 주소.
const FALLBACK_VENUE_ADDRESS = '서울 강남구 테헤란로1길 19';

function richText(...paragraphs: string[]) {
  const messageJson: JSONContent = {
    type: 'doc',
    content: paragraphs.map(text => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  };
  return { messageJson, messageHtml: tiptapJsonToHtmlUniversal(messageJson) };
}

export function buildShowcaseSection(
  design: ShowcaseInvitation,
  section: ShowcaseSection,
  index: number
): EditorBlock {
  const id = `${design.id}-${section.component}-${index}`;
  function block<T extends BlockType>(
    component: T,
    props: Partial<EditorBlock<NoInfer<T>>['props']>
  ): EditorBlock<T> {
    const defaults = Object.fromEntries(
      Object.entries(blockSchema[component].fields).map(([key, field]) => [
        key,
        typeof field.default === 'function' ? field.default() : field.default,
      ])
    ) as EditorBlock<T>['props'];
    return {
      id,
      type: design.type,
      component,
      props: { ...defaults, ...props },
    };
  }

  switch (section.component) {
    case 'greeting':
      return block('greeting', {
        title: section.title ?? design.heading,
        subTitle: section.subTitle ?? design.eyebrow,
        ...(design.largePrint && { checkedSubTitle: false }),
        ...richText(...design.message),
      });
    case 'countdown':
      return block('countdown', {
        title: section.title,
        eventDateTime: section.eventDateTime ?? `${design.date}T${design.time}`,
        onDayMessage: section.onDayMessage ?? '오늘은 특별한 날입니다!',
        afterMessage: section.afterMessage ?? '함께해 주셔서 감사합니다.',
      });
    case 'calendar': {
      const [hour, minute] = design.time.split(':');
      const time = `${Number(hour) < 12 ? '오전' : '오후'} ${String(Number(hour) % 12 || 12).padStart(2, '0')}:${minute}`;
      return block('calendar', {
        title: section.title,
        subTitle: section.subTitle ?? '',
        isSubTitle: !!section.subTitle,
        date: design.date,
        time,
        template: section.template ?? 'calendarType1',
        showCalendar: !!section.template,
        showStringDate: true,
        showDday: false,
      });
    }
    case 'place': {
      const address =
        section.address ?? design.venueAddress ?? FALLBACK_VENUE_ADDRESS;
      const lat = section.lat ?? design.venueLat;
      const lng = section.lng ?? design.venueLng;
      const hasCoordinates = typeof lat === 'number' && typeof lng === 'number';
      const tel = section.tel ?? design.venueTel;
      return block('place', {
        title: section.title,
        subTitle: section.subTitle ?? 'LOCATION',
        checkedSubTitle: !!section.subTitle,
        placeName: design.venue,
        placeAddress: address,
        placeDetail: section.detail ?? '',
        ...(hasCoordinates && {
          lat,
          lng,
          openMap: true,
          openNavi: section.openNavi ?? true,
        }),
        ...(tel && { placeTel: tel, checkedPlaceTel: true }),
      });
    }
    case 'account': {
      const message = section.message ? richText(section.message) : null;
      return block('account', {
        title: section.title,
        checkedSubTitle: false,
        ...(message
          ? message
          : { messageJson: null, messageHtml: null }),
        groupList: section.groups.map(group => ({ name: group.name })),
        accountList: section.groups.map(group =>
          group.accounts.map(account => ({ ...account }))
        ),
      });
    }
    case 'myFamilyWedding':
      return block('myFamilyWedding', {
        title: section.title ?? '',
        ...(section.groomFamilySuffix && {
          groomFamilySuffix: section.groomFamilySuffix,
        }),
        ...(section.brideFamilySuffix && {
          brideFamilySuffix: section.brideFamilySuffix,
        }),
        groomFamily: section.groomFamily.map((member, i) => ({
          id: `${id}-groom-${i}`,
          relation: member.relation,
          name: member.name,
          flower: false,
        })),
        brideFamily: section.brideFamily.map((member, i) => ({
          id: `${id}-bride-${i}`,
          relation: member.relation,
          name: member.name,
          flower: false,
        })),
      });
    case 'closingComment':
      return block('closingComment', richText(section.message));
    case 'coupleIntroduction':
      return block('coupleIntroduction', {
        title: section.title,
        checkedSubTitle: false,
        groom: '박민성',
        bride: '김아현',
        showTitle: true,
        showContent: true,
        showProfileImage: false,
        ...richText(section.story),
      });
    case 'picture': {
      const caption = section.caption && richText(section.caption);
      return block('picture', {
        title: section.title,
        isTitle: true,
        image: [section.image],
        isContents: !!caption,
        contentsJson: caption ? caption.messageJson : null,
        contentsHtml: caption ? caption.messageHtml : null,
      });
    }
    case 'gallery':
      return block('gallery', {
        title: section.title,
        subTitle: section.subTitle ?? 'GALLERY',
        isSubTitle: !!section.subTitle,
        template: section.template,
        ratio: section.ratio,
        images: [...section.images],
        isPopupViewer: true,
        isAutoPlay: false,
      });
    case 'interview':
      return block('interview', {
        title: section.title,
        checkedSubTitle: false,
        questions: [
          {
            id: `${id}-question`,
            question: section.question,
            answer: richText(section.answer),
            image: [section.image],
          },
        ],
      });
    case 'timeline':
      return block('timeline', {
        title: section.title,
        items: section.items.map((item, i) => ({
          id: `${id}-${i}`,
          time: item.time,
          title: item.title,
          description: item.description ?? '',
        })),
      });
    case 'mealMenu':
      return block('mealMenu', {
        title: section.title,
        subtitle: section.subtitle,
        menuStyle: section.style,
        note: section.note ?? '',
        courses: section.courses.map((course, i) => ({
          id: `${id}-course-${i}`,
          name: course.name,
          dishes: course.dishes.map((dish, j) => ({
            id: `${id}-dish-${i}-${j}`,
            ...(typeof dish === 'string'
              ? { name: dish, description: '' }
              : { name: dish.name, description: dish.description ?? '' }),
          })),
        })),
      });
    case 'dressCode':
      return block('dressCode', {
        title: section.title,
        colors: [...section.colors],
        guidelines: [...section.guidelines],
      });
    case 'wreath':
      return block('wreath', {
        title: section.title,
        mode: 'decline',
        declineMessage: section.declineMessage,
      });
    case 'faq':
      return block('faq', {
        title: section.title,
        items: section.items.map(item => ({ ...item })),
      });
    case 'notice':
      return block('notice', {
        title: section.title,
        checkedSubTitle: false,
        noticeList: [
          {
            id: `${id}-notice`,
            presetId: section.preset,
            notice: section.heading,
            content: richText(section.message),
            image: section.image ? [section.image] : [],
          },
        ],
      });
    case 'transportation':
    case 'afterParty': {
      const { component, ...props } = section;
      return block(component, props);
    }
    case 'speakerInformation':
      return block('speakerInformation', {
        title: section.title,
        checkedSubTitle: false,
        speakers: [
          {
            id: `${id}-speaker`,
            name: section.name,
            image: [section.image],
            ...richText(section.bio),
          },
        ],
      });
    case 'organizerInformation':
      return block('organizerInformation', {
        title: section.title,
        checkedSubTitle: false,
        organizer: section.organizer,
        image: [section.image],
        ...richText(section.message),
      });
    case 'sponsorshipInfomation':
      return block('sponsorshipInfomation', {
        title: section.title,
        isSubTitle: false,
        images: [...section.images],
      });
    case 'myChild':
      return block('myChild', {
        title: section.title,
        checkedSubTitle: !!section.subTitle,
        subTitle: section.subTitle ?? 'MY CHILD',
        name: section.name,
        birthday: section.birthday,
        image: [section.image],
        ...richText(section.message),
      });
    case 'myFamily':
      return block('myFamily', {
        title: section.title,
        checkedSubTitle: false,
        checkedMessage: true,
        family: section.members.map((member, i) => ({
          id: `${id}-member-${i}`,
          ...member,
          image: [],
          flower: false,
        })),
        ...richText(section.message),
      });
  }
}
