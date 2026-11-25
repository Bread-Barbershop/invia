import { SHOWCASE_PHOTOS } from './showcaseImages';

import type { ShowcaseInvitation } from './showcaseInvitations';

export const bridalShowerCollection: ShowcaseInvitation[] = [
  {
    name: '샴페인 가든 브런치',
    description: '햇살 드는 정원 테이블에서 여는, 예비 신부의 다정한 아침.',
    palette: ['#FBF6EE', '#A2764F', '#4A3B32'],
    eyebrow: 'A CHAMPAGNE BRUNCH',
    heading: '은서의 아침에 초대합니다',
    date: '2027-05-16',
    time: '11:00',
    venue: '인비아 가든 · 샴페인 테라스',
    font: '고운 바탕',
    sectionStyle: 'paper',
    id: 'showcase-45',
    type: 'bridalShower',
    message: [
      '결혼을 앞둔 은서에게 가장 어울리는 건 서두르지 않는 아침이라고 생각했어요. 정원에 긴 테이블을 놓고 샴페인을 시원하게 해 두었습니다.',
      '드레스도, 정해진 순서도 없이 편하게 오세요. 함께 앉아 이야기 나누는 것만으로 충분합니다.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'calendar',
        title: '브런치 날짜',
        template: 'calendarType1',
      },
      {
        component: 'gallery',
        title: '정원의 아침',
        template: 'galleryType5',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.b1GardenTable,
          SHOWCASE_PHOTOS.b1GardenToast,
          SHOWCASE_PHOTOS.b1GardenDetail,
          SHOWCASE_PHOTOS.b1GardenBench,
        ],
      },
      {
        component: 'picture',
        title: '은서, 오늘의 주인공',
        image: SHOWCASE_PHOTOS.b1GardenBride,
        caption:
          '새 옷을 고르던 날보다 오늘 표정이 더 좋아 보여서, 셔터를 누르고 한참 웃었어요.',
      },
      {
        component: 'timeline',
        title: '아침이 흐르는 순서',
        items: [
          { time: '11:00', title: '도착과 첫 잔', description: '정원 입구에서 샴페인을 한 잔씩 들고 시작해요.' },
          { time: '11:30', title: '긴 테이블에 자리 잡기', description: '이름표는 없어요. 앉고 싶은 사람 옆에 앉으면 됩니다.' },
          { time: '12:00', title: '브런치와 질문 카드', description: '서로에게 꼭 물어보고 싶었던 질문을 하나씩 뽑아요.' },
          { time: '13:00', title: '디저트와 사진', description: '햇살이 좋은 자리에서 단체 사진을 남겨요.' },
        ],
      },
      {
        component: 'mealMenu',
        title: '브런치 메뉴',
        subtitle: 'Garden Brunch',
        style: 'bistro',
        courses: [
          {
            name: '첫 잔',
            dishes: ['샴페인 한 잔', '자몽과 로즈마리 에이드'],
          },
          {
            name: '플레이트',
            dishes: ['구운 사워도우와 아보카도', '리코타와 무화과 샐러드'],
          },
          {
            name: '디저트',
            dishes: ['레몬 마들렌', '딸기 크림 타르트'],
          },
        ],
      },
      {
        component: 'dressCode',
        title: '정원에 어울리는 차림',
        colors: ['#F3EDE2', '#B9C6B0', '#A2764F'],
        guidelines: [
          '햇살이 오래 머무는 자리예요. 모자나 얇은 스카프가 있으면 좋아요.',
          '잔디에 잠깐 서도 괜찮은 낮은 굽 신발을 추천해요.',
        ],
      },
      {
        component: 'interview',
        title: '은서에게 미리 물어봤어요',
        question: '결혼 준비에서 가장 좋았던 순간은 언제였나요?',
        answer:
          '식탁보를 고르던 날이요. 두 사람이 좋아하는 색이 이렇게 다르다는 걸 알게 됐는데, 그게 이상하게 웃겼어요.',
        image: SHOWCASE_PHOTOS.b1GardenBench,
      },
      {
        component: 'place',
        title: '샴페인 테라스로 오시는 길',
        detail: '정원 입구에서 이름을 말씀해 주시면 테라스 자리로 안내해 드려요.',
      },
      {
        component: 'transportation',
        title: '대중교통으로 오실 때',
        subwayStation: '압구정로데오역',
        subwayExit: '4번 출구',
        subwayWalk:
          '4번 출구에서 골목을 따라 6분쯤 오시면 정원 입구가 보여요. 주차는 건물 뒤편에 네 대까지 가능합니다.',
      },
      {
        component: 'faq',
        title: '오시기 전에',
        items: [
          {
            question: '선물은 꼭 챙겨야 하나요?',
            answer:
              '마음만으로 충분해요. 다만 은서가 좋아하는 책이 있다면 한 권씩 모아 선반을 채워 주고 싶습니다.',
          },
          {
            question: '아이와 함께 가도 괜찮을까요?',
            answer:
              '물론이에요. 테라스 옆 잔디에 돗자리를 펴 둘게요. 유모차를 둘 자리도 있습니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message:
          '한 사람의 새 출발을 이렇게 많이 웃으면서 축하할 수 있다는 게 참 좋습니다. 은서의 사람들 드림',
      },
    ],
  },
  {
    name: '시티 호텔 파자마 파티',
    description: '도시의 불빛 아래, 호텔 스위트에서 보내는 여자들만의 밤.',
    palette: ['#F5F0F7', '#7C5F8F', '#332B3B'],
    eyebrow: "GIRLS' NIGHT IN",
    heading: '호텔 21층, 우리만의 밤',
    date: '2027-02-27',
    time: '19:00',
    venue: '인비아 시티 호텔 · 21층 스위트',
    font: '나눔 스퀘어 네오',
    sectionStyle: 'rounded',
    id: 'showcase-46',
    type: 'bridalShower',
    message: [
      '결혼을 앞둔 친구에게 하룻밤을 통째로 내어 주기로 했어요. 조명은 낮추고, 파자마로 갈아입고, 오늘만큼은 아무 데도 가지 않습니다.',
      '늦게 도착해도 괜찮아요. 문은 자정까지 열어 둘게요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'gallery',
        title: '지난 밤의 기록',
        template: 'galleryType3',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.b2HotelBed,
          SHOWCASE_PHOTOS.b2HotelWindow,
          SHOWCASE_PHOTOS.b2HotelSnack,
          SHOWCASE_PHOTOS.b2HotelDetail,
        ],
      },
      {
        component: 'picture',
        title: '파자마 차림의 신부',
        image: SHOWCASE_PHOTOS.b2HotelBride,
        caption: '리본핀 하나만 달았는데도 오늘은 유난히 예뻐서, 다들 한참을 바라봤어요.',
      },
      {
        component: 'calendar',
        title: '우리의 밤',
        template: 'calendarType2',
      },
      {
        component: 'timeline',
        title: '밤이 흐르는 순서',
        items: [
          { time: '19:00', title: '룸 입장과 파자마 교환', description: '준비해 둔 파자마로 갈아입고 모여요.' },
          { time: '20:00', title: '룸서비스 디너', description: '바닥에 앉아서 나눠 먹어요. 테이블은 치웠어요.' },
          { time: '22:00', title: '폴라로이드와 질문 카드', description: '한 사람당 한 장씩, 지금 표정을 남겨요.' },
          { time: '00:00', title: '마지막 건배', description: '불을 끄기 전에 짧게 한 잔.' },
        ],
      },
      {
        component: 'dressCode',
        title: '파자마 드레스 코드',
        colors: ['#E8D8DC', '#7C5F8F', '#2E2833'],
        guidelines: [
          '실크 파자마나 편한 홈웨어면 충분해요. 갈아입을 옷을 꼭 챙겨 오세요.',
          '호텔 실내화와 얇은 가운은 준비해 두었어요. 양말은 각자 챙기면 더 따뜻해요.',
        ],
      },
      {
        component: 'mealMenu',
        title: '룸서비스 디너',
        subtitle: 'Room Service',
        style: 'tasting',
        courses: [
          {
            name: '함께 나눠 먹는 접시',
            dishes: ['치즈와 크래커', '올리브와 견과', '포도 한 송이'],
          },
          {
            name: '따뜻한 것',
            dishes: ['트러플 크림 파스타', '감자 수프'],
          },
          {
            name: '디저트',
            dishes: ['초콜릿 브라우니', '솜사탕 마시멜로'],
          },
        ],
      },
      {
        component: 'notice',
        title: '늦게 도착하는 친구에게',
        heading: '문은 자정까지 열어 둘게요',
        message:
          '프런트에 이름을 말하고 21층으로 올라오세요. 조용히 들어와도 괜찮으니, 도착하면 우리 자리 옆에 앉아요.',
        preset: 'time',
      },
      {
        component: 'place',
        title: '스위트로 오시는 길',
        detail: '21층 엘리베이터에서 내려 오른쪽 복도 끝, 2107호입니다.',
      },
      {
        component: 'faq',
        title: '밤을 함께하기 전에',
        items: [
          {
            question: '하룻밤 묵어도 되나요?',
            answer:
              '침대 두 개와 소파 베드가 있어요. 묵고 싶은 사람은 편하게 남아서 아침까지 같이 있어요.',
          },
          {
            question: '선물은 어떤 게 좋을까요?',
            answer:
              '편지 한 장이면 충분해요. 결혼식 날 읽을 수 있게 모아 두려고 합니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message:
          '내일부터는 각자의 집으로 돌아가지만, 오늘 밤만큼은 같이 웃는 걸로 충분해요. 민아 · 지윤 드림',
      },
    ],
  },
  {
    name: '화이트 리본 티파티',
    description: '흰 리본과 홍차 향으로 채운, 조용하고 다정한 오후.',
    palette: ['#FDFAF7', '#B98C88', '#4E4038'],
    eyebrow: 'TEA AND RIBBONS',
    heading: '리본을 묶으며, 행복을 빌어요',
    date: '2026-12-13',
    time: '14:00',
    venue: '인비아 하우스 · 화이트 룸',
    font: 'Hahmlet',
    sectionStyle: 'outlined',
    id: 'showcase-47',
    type: 'bridalShower',
    message: [
      '은서의 결혼을 앞두고 흰 리본을 한 겹씩 묶어 봅니다. 잘 묶이지 않아도 괜찮아요. 매듭마다 마음을 담으면 되니까요.',
      '따뜻한 홍차와 작은 케이크를 준비해 두었습니다. 오후 두 시, 창가 자리에서 만나요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'picture',
        title: '리본과 편지',
        image: SHOWCASE_PHOTOS.b3TeaRibbon,
        caption: '리본을 풀어 두고 한참 고민했어요. 어떤 색이 은서에게 가장 잘 어울릴까.',
      },
      {
        component: 'gallery',
        title: '티타임의 기록',
        template: 'galleryType2',
        ratio: '1:1',
        images: [
          SHOWCASE_PHOTOS.b3TeaTable,
          SHOWCASE_PHOTOS.b3TeaFriends,
          SHOWCASE_PHOTOS.b3TeaPour,
          SHOWCASE_PHOTOS.b3TeaBride,
        ],
      },
      {
        component: 'calendar',
        title: '티타임 날짜',
        template: 'calendarType3',
      },
      {
        component: 'timeline',
        title: '오후가 흐르는 순서',
        items: [
          { time: '14:00', title: '도착과 웰컴 티', description: '따뜻한 얼 그레이 한 잔으로 시작해요.' },
          { time: '14:20', title: '리본 묶기', description: '한 사람당 하나씩, 은서의 부케에 달 리본을 만들어요.' },
          { time: '15:00', title: '애프터눈 티', description: '세 단 케이크 스탠드를 천천히 비워요.' },
          { time: '16:00', title: '편지 낭독', description: '미리 써 온 편지를 한 장씩 읽어요. 손수건을 챙기세요.' },
        ],
      },
      {
        component: 'dressCode',
        title: '화이트 드레스 코드',
        colors: ['#FFFFFF', '#F3E7DF', '#B98C88'],
        guidelines: [
          '흰색이나 아이보리 계열이면 가장 잘 어울려요. 편한 원피스면 충분합니다.',
          '리본은 저희가 준비해요. 머리에 하나씩 달고 사진을 남겨요.',
        ],
      },
      {
        component: 'mealMenu',
        title: '애프터눈 티 세트',
        subtitle: 'Afternoon Tea',
        style: 'garden',
        courses: [
          {
            name: '스콘',
            dishes: ['플레인 스콘과 클로티드 크림', '딸기 잼'],
          },
          {
            name: '샌드위치',
            dishes: ['오이와 크림치즈', '훈제 연어와 딜'],
          },
          {
            name: '디저트',
            dishes: ['로즈 마들렌', '피스타치오 마카롱'],
          },
        ],
      },
      {
        component: 'faq',
        title: '티타임에 오시기 전',
        items: [
          {
            question: '편지를 미리 써 가야 하나요?',
            answer:
              '써 오시면 더 좋지만, 현장에서 카드에 짧게 적어도 괜찮아요. 펜은 준비해 두었습니다.',
          },
          {
            question: '늦게 도착하면 어떻게 하나요?',
            answer:
              '티타임은 네 시까지 이어져요. 늦으시면 메시지를 하나 남겨 주세요. 자리는 그대로 두겠습니다.',
          },
        ],
      },
      {
        component: 'place',
        title: '화이트 룸으로 오시는 길',
        detail: '정문에서 오른쪽으로 돌면 창가에 흰 문이 있어요. 문패는 리본으로 달아 두었습니다.',
      },
      {
        component: 'closingComment',
        message:
          '리본은 풀리기 위해 있는 게 아니라, 다시 묶기 위해 있는 거라고 생각합니다. 은서의 사람들 드림',
      },
    ],
  },
];
