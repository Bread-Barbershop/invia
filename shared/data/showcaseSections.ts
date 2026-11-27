import type { FaqItem } from '@/components/organisms/faq/Faq.schema';
import type {
  GalleryVariant,
  RatioType,
} from '@/components/organisms/gallery/types/galleryType';
import type { MealMenuStyle } from '@/components/organisms/mealMenu/mealMenuContent';
import type { NoticePresetId } from '@/components/organisms/notice/noticeList';
import type { CalendarCardType } from '@/shared/data/template/componentTemplate';

export type ShowcaseSection =
  | { component: 'greeting'; title?: string; subTitle?: string }
  | {
      component: 'calendar';
      title: string;
      subTitle?: string;
      template?: `calendarType${1 | 2 | 3 | 4 | 5}` | CalendarCardType;
    }
  | {
      component: 'countdown';
      title: string;
      eventDateTime?: string;
      onDayMessage?: string;
      afterMessage?: string;
    }
  | {
      component: 'place';
      title: string;
      subTitle?: string;
      detail?: string;
      address?: string;
      lat?: number;
      lng?: number;
      tel?: string;
      openNavi?: boolean;
    }
  | {
      component: 'account';
      title: string;
      message?: string;
      groups: {
        name: string;
        accounts: { name: string; bank: string; account: string }[];
      }[];
    }
  | {
      component: 'myFamilyWedding';
      title?: string;
      groomFamilySuffix?: string;
      brideFamilySuffix?: string;
      groomFamily: { relation: string; name: string }[];
      brideFamily: { relation: string; name: string }[];
    }
  | { component: 'closingComment'; message: string }
  | { component: 'coupleIntroduction'; title: string; story: string }
  | { component: 'picture'; title: string; image: string; caption?: string }
  | {
      component: 'gallery';
      title: string;
      subTitle?: string;
      images: string[];
      template: GalleryVariant;
      ratio: RatioType;
    }
  | {
      component: 'interview';
      title: string;
      question: string;
      answer: string;
      image: string;
    }
  | {
      component: 'timeline';
      title: string;
      items: { time: string; title: string; description?: string }[];
    }
  | {
      component: 'mealMenu';
      title: string;
      subtitle: string;
      style: MealMenuStyle;
      courses: {
        name: string;
        dishes: (string | { name: string; description?: string })[];
      }[];
      note?: string;
    }
  | {
      component: 'dressCode';
      title: string;
      colors: string[];
      guidelines: string[];
    }
  | { component: 'wreath'; title: string; declineMessage: string }
  | { component: 'faq'; title: string; items: FaqItem[] }
  | {
      component: 'notice';
      title: string;
      heading: string;
      message: string;
      preset: NoticePresetId;
      image?: string;
    }
  | {
      component: 'transportation';
      title: string;
      subwayLine?: string;
      subwayStation?: string;
      subwayExit?: string;
      subwayWalk?: string;
      busRoutes?: string;
      shuttleStop?: string;
      shuttleInterval?: string;
      parkingHours?: string;
      alternativeParking?: string;
      navigationUrl?: string;
    }
  | {
      component: 'afterParty';
      title: string;
      venue: string;
      dateTime: string;
      description: string;
    }
  | {
      component: 'speakerInformation';
      title: string;
      name: string;
      bio: string;
      image: string;
    }
  | {
      component: 'organizerInformation';
      title: string;
      organizer: string;
      message: string;
      image: string;
    }
  | { component: 'sponsorshipInfomation'; title: string; images: string[] }
  | {
      component: 'myChild';
      title: string;
      subTitle?: string;
      name: string;
      birthday: string;
      message: string;
      image: string;
    }
  | {
      component: 'myFamily';
      title: string;
      members: { relation: string; name: string }[];
      message: string;
    }
  | {
      component: 'checklist';
      title: string;
      description?: string;
      items: { label: string; note?: string }[];
    }
  | {
      component: 'eventGuide';
      title: string;
      intro?: string;
      items: {
        title: string;
        description?: string;
        time?: string;
        place?: string;
      }[];
    };
