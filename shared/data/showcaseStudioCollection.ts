import { SHOWCASE_PHOTOS } from './showcaseImages';

import type { ShowcaseInvitation } from './showcaseInvitations';

// 사진전·공방 원데이처럼 공간을 여는 초대장. 전시·오프닝·작가 소개 블록을 함께 씁니다.
export const studioCollection: ShowcaseInvitation[] = [
  {
    name: '빛이 머문 방',
    description: '동네 사진 스튜디오에서 여는 작은 전시, 오프닝 날의 차 한 잔까지.',
    palette: ['#F2EDE4', '#8A6A4F', '#2A2724'],
    eyebrow: 'A SMALL WINTER EXHIBITION',
    heading: '빛이 머문 방',
    date: '2026-12-05',
    time: '17:00',
    venue: '스튜디오 모눈',
    font: 'Noto Serif KR',
    sectionStyle: 'paper',
    id: 'showcase-51',
    type: 'seminar',
    message: [
      '12월 5일부터 20일까지, 망원동의 작은 스튜디오에서 사진전을 엽니다. 두 해 동안 아무 일도 일어나지 않는 오후의 빛을 찍었습니다.',
      '오프닝 날에는 차 한 잔과 함께 몇 장을 골라 이야기하니, 편한 시간에 잠깐 들러 주세요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'speakerInformation',
        title: '사진가 윤슬',
        name: '윤슬',
        bio: '빛이 스치는 순간을 오래 들여다보는 사진가. 이번 전시에서 스물두 장을 처음 보여 줍니다.',
        image: SHOWCASE_PHOTOS.exhibitionArtist,
      },
      {
        component: 'organizerInformation',
        title: '전시를 여는 곳',
        organizer: '스튜디오 모눈',
        message:
          '망원동 골목의 작은 사진 스튜디오. 한 달에 한 번 문을 열고 누구나 들어와 앉아 갈 수 있는 전시를 합니다.',
        image: SHOWCASE_PHOTOS.exhibitionStudio,
      },
      {
        component: 'gallery',
        title: '전시작 열두 점 중 네 점',
        template: 'galleryType1',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.exhibitionChair,
          SHOWCASE_PHOTOS.exhibitionSea,
          SHOWCASE_PHOTOS.exhibitionShadows,
          SHOWCASE_PHOTOS.exhibitionCup,
        ],
      },
      {
        component: 'interview',
        title: '작가에게 묻다',
        question: '어떤 순간을 찍나요?',
        answer:
          '아무 일도 일어나지 않는 시간이요. 창가에 앉아 빛이 바뀌는 걸 한참 보다가, 그게 다 지나간 뒤에 한 장을 찍습니다.',
        image: SHOWCASE_PHOTOS.exhibitionShadows,
      },
      {
        component: 'calendar',
        title: '오프닝의 저녁',
        template: 'calendarType8',
      },
      {
        component: 'timeline',
        title: '오프닝 순서',
        items: [
          {
            time: '17:00',
            title: '문을 열고, 차를 따릅니다',
            description: '따뜻한 차 한 잔을 들고 천천히 둘러보세요.',
          },
          {
            time: '17:30',
            title: '작가 토크',
            description: '스물두 장 중 세 장을 골라, 왜 그 순간이었는지 이야기합니다.',
          },
          {
            time: '18:10',
            title: '티타임',
            description: '따뜻한 차와 다과를 나눕니다.',
          },
          {
            time: '19:30',
            title: '자유 관람',
            description: '늦게 오시는 분들을 위해 20시까지 문을 열어 둡니다.',
          },
        ],
      },
      {
        component: 'place',
        title: '스튜디오 모눈',
        detail: '· 1층, 골목 안쪽 빨간 문',
      },
      {
        component: 'transportation',
        title: '오시는 길',
        subwayLine: '6호선',
        subwayStation: '망원역',
        subwayExit: '2번 출구',
        subwayWalk: '큰길에서 골목으로 한 번만 들어오면 됩니다. 도보 7분.',
        busRoutes: '망원초등학교 정류장 하차 · 7011, 6712',
        parkingHours: '건물 주차 공간은 없습니다.',
        alternativeParking: '망원동 공영주차장(도보 4분, 유료)',
      },
      {
        component: 'notice',
        title: '관람 안내',
        heading: '화–일 13:00–19:00, 월요일은 쉽니다',
        message:
          '입장은 무료입니다. 작품 보호를 위해 플래시 촬영은 자제해 주세요.',
        preset: 'time',
        image: SHOWCASE_PHOTOS.exhibitionRoom,
      },
      {
        component: 'faq',
        title: '자주 묻는 질문',
        items: [
          {
            question: '예약하고 가야 하나요?',
            answer:
              '예약은 필요 없습니다. 다만 오프닝 날 저녁에는 자리가 좁을 수 있어요.',
          },
          {
            question: '작품을 살 수 있나요?',
            answer:
              '현장에서 안내드립니다. 전시가 끝난 뒤에도 남은 작품은 스튜디오에서 볼 수 있어요.',
          },
          {
            question: '아이와 함께 가도 될까요?',
            answer:
              '괜찮습니다. 다만 벽에 걸린 작품과 가까이 서는 건 조심해 주세요.',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '겨울 저녁, 잠깐 들러 빛을 보고 가세요. — 윤슬',
      },
    ],
  },
];
