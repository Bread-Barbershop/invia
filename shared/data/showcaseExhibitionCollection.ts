import { SHOWCASE_PHOTOS } from './showcaseImages';

import type { ShowcaseInvitation } from './showcaseInvitations';

// 전시·팝업 오프닝 — 미술관·갤러리·브랜드 쇼룸이 여는 자리를 위한 초대장.
// 오프닝 날의 초대와 전시 기간 안내를 함께 담습니다.
export const exhibitionCollection: ShowcaseInvitation[] = [
  {
    name: '연무장길 오프닝 나이트',
    description: '성수동 골목의 작은 쇼룸에서 여는 첫 팝업, 오프닝 저녁의 초대.',
    palette: ['#F2F0EA', '#1F3A8A', '#1B1B1B'],
    eyebrow: 'SPACE ONDO · SEONGSU',
    heading: '연무장길의 저녁을 엽니다',
    date: '2027-04-17',
    time: '18:00',
    venue: '스페이스 온도 · 연무장길',
    venueAddress: '서울 성동구 연무장길 43',
    venueLat: 37.5429398,
    venueLng: 127.0540477,
    font: '나눔 스퀘어 네오',
    sectionStyle: 'outlined',
    id: 'showcase-55',
    type: 'exhibition',
    message: [
      '성수동 연무장길에 작은 쇼룸을 냈습니다. 2주짜리 첫 팝업이고, 첫날 저녁에만 문을 늦게 닫습니다.',
      '만든 그릇과 옷을 탁자 위에 올려 두고, 오는 분들과 차를 마시려고 합니다. 예약 없이 들러 주세요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'countdown',
        title: '오프닝까지',
        onDayMessage: '오늘 저녁, 문을 엽니다.',
        afterMessage: '전시는 4월 30일까지 이어집니다.',
      },
      {
        component: 'calendar',
        title: '오프닝 일시',
        template: 'calendarType8',
      },
      {
        component: 'gallery',
        title: '문을 열기 전의 공간',
        subTitle: 'BEFORE THE DOORS OPEN',
        template: 'galleryType2',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.exPopupSpace,
          SHOWCASE_PHOTOS.exPopupTable,
          SHOWCASE_PHOTOS.exPopupStreet,
          SHOWCASE_PHOTOS.exPopupGuests,
        ],
      },
      {
        component: 'picture',
        title: '만든 사람, 오세린',
        image: SHOWCASE_PHOTOS.exPopupHost,
        caption:
          '이사를 열두 번 다니며 모은 그릇으로 가게를 열었습니다. 오프닝 날 첫 잔은 제가 직접 따릅니다.',
      },
      {
        component: 'timeline',
        title: '오프닝 저녁의 순서',
        items: [
          {
            time: '18:00',
            title: '문 열기, 첫 잔',
            description: '따뜻한 차와 차가운 샴페인 중에 골라 주세요.',
          },
          {
            time: '18:40',
            title: '짧은 인사',
            description: '왜 이 자리를 열었는지 오 분만 이야기합니다.',
          },
          {
            time: '19:10',
            title: '포장 시연',
            description: '그릇을 신문지로 싸는 법을 보여 드립니다.',
          },
          {
            time: '20:00',
            title: '음악과 와인',
            description: '레코드를 틀어 두고 문 닫을 때까지 천천히.',
          },
        ],
      },
      {
        component: 'eventGuide',
        title: '그날의 작은 프로그램',
        intro: '자리마다 하나씩. 원하는 것만 하셔도 됩니다.',
        items: [
          {
            title: '엽서 쓰기',
            description: '앉아서 한 장 써 보세요. 우표는 저희가 붙여 드립니다.',
            time: '18:00 — 21:00',
            place: '창가 자리',
          },
          {
            title: '그릇 들어 보기',
            description: '무게와 손에 닿는 감촉을 직접 확인해 보세요.',
            time: '상시',
            place: '가운데 탁자',
          },
          {
            title: '아카이브 코너',
            description: '지난 3년의 작업 사진과 실패한 시편 몇 점을 걸어 두었습니다.',
            time: '상시',
            place: '안쪽 벽',
          },
        ],
      },
      {
        component: 'place',
        title: '스페이스 온도',
        detail: '연무장길 43 · 1층, 골목 안쪽 흰 간판',
      },
      {
        component: 'transportation',
        title: '오시는 길',
        subwayLine: '2호선',
        subwayStation: '성수역',
        subwayExit: '2번 출구',
        subwayWalk:
          '2번 출구에서 연무장길을 따라 도보 9분입니다. 골목이 좁아 차로 오시면 입구를 지나치기 쉬워요.',
        busRoutes: '성수동주민센터 정류장 하차 · 2413, 2224',
        parkingHours: '건물 주차 공간은 없습니다.',
        alternativeParking: '연무장길 공영주차장(도보 3분, 유료)',
      },
      {
        component: 'notice',
        title: '전시 기간',
        heading: '2027. 04. 17 — 04. 30 · 수–일 12:00–20:00',
        message:
          '월요일과 화요일은 쉽니다. 오프닝 날만 저녁 아홉 시까지 문을 열어 둡니다.',
        preset: 'time',
        image: SHOWCASE_PHOTOS.exPopupSpace,
      },
      {
        component: 'checklist',
        title: '오실 때',
        description: '가볍게 오셔도 됩니다. 아래 세 가지만 기억해 주세요.',
        items: [
          {
            label: '초대장 링크 저장',
            note: '오프닝 날 입장 확인에 필요해요.',
          },
          {
            label: '빈손으로 오세요',
            note: '잔과 그릇은 저희가 준비합니다.',
          },
          {
            label: '편한 신발',
            note: '공간이 좁아 서서 둘러보는 시간이 길어요.',
          },
        ],
      },
      {
        component: 'faq',
        title: '자주 묻는 질문',
        items: [
          {
            question: '예약 없이 가도 되나요?',
            answer:
              '네. 오프닝 날은 마흔 명까지 들어옵니다. 자리가 없으면 잠깐 밖에서 기다리셔도 좋아요.',
          },
          {
            question: '주차할 곳이 있나요?',
            answer:
              '건물에는 없습니다. 연무장길 공영주차장이 도보 3분 거리에 있어요.',
          },
          {
            question: '그릇을 살 수 있나요?',
            answer:
              '전시 기간 내내 구매할 수 있습니다. 포장은 현장에서 해 드려요.',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '2주 동안 초인종을 달아 둡니다. 언제든 문을 여세요. — 오세린',
      },
    ],
  },
  {
    name: '손의 시간, 도자',
    description: '북촌 한옥 갤러리에서 여는 도예 개인전, 오프닝의 차 한 잔.',
    palette: ['#EFEBE2', '#6B5A45', '#2A2724'],
    eyebrow: 'A CERAMIC SOLO SHOW',
    heading: '손이 지나간 자리에 그릇이 남습니다',
    date: '2027-03-13',
    time: '16:00',
    venue: '갤러리 결 · 북촌',
    venueAddress: '서울 종로구 북촌로5길 10',
    venueLat: 37.5794441,
    venueLng: 126.9844313,
    font: '고운 바탕',
    sectionStyle: 'paper',
    id: 'showcase-56',
    type: 'exhibition',
    message: [
      '흙을 만지기 시작한 지 스무 해가 됐습니다. 이번 전시에는 최근 3년의 그릇 스물한 점과, 만들다 만 것 몇 점을 함께 걸었습니다.',
      '오프닝 날 오후에는 차를 우려 놓고 기다립니다. 그릇에 손을 얹어 보고, 무게를 느껴 보세요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'speakerInformation',
        title: '작가 김도현',
        name: '김도현',
        bio: '북촌에서 흙을 만진 지 스무 해. 물레 위에서 흔들린 선을 지우지 않고 그대로 굽는 작업을 합니다.',
        image: SHOWCASE_PHOTOS.exPotteryArtist,
      },
      {
        component: 'gallery',
        title: '전시작 스물한 점 중 네 점',
        subTitle: 'FOUR OF TWENTY-ONE',
        template: 'galleryType5',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.exPotteryWall,
          SHOWCASE_PHOTOS.exPotteryDetail,
          SHOWCASE_PHOTOS.exPotteryTea,
          SHOWCASE_PHOTOS.exPotteryCourtyard,
        ],
      },
      {
        component: 'interview',
        title: '작가에게 묻다',
        question: '그릇을 만들 때 가장 오래 걸리는 일은 무엇인가요?',
        answer:
          '말리는 시간이요. 흙은 재촉하면 금이 갑니다. 저는 그동안 다른 일을 합니다. 밀린 편지를 쓰거나, 마당을 쓸지요.',
        image: SHOWCASE_PHOTOS.exPotteryDetail,
      },
      {
        component: 'calendar',
        title: '오프닝 일시',
        subTitle: 'OPENING',
        template: 'calendarType7',
      },
      {
        component: 'countdown',
        title: '오프닝까지',
        onDayMessage: '오늘 오후 네 시, 문을 엽니다.',
        afterMessage: '전시는 4월 4일까지 이어집니다.',
      },
      {
        component: 'timeline',
        title: '오프닝의 오후',
        items: [
          {
            time: '16:00',
            title: '문 열기',
            description: '마당에 차를 올려 두었습니다.',
          },
          {
            time: '16:30',
            title: '작가의 말',
            description: '스물한 점 중 세 점을 골라 이야기합니다.',
          },
          {
            time: '17:10',
            title: '차와 다과',
            description: '전시에 쓰인 그릇으로 차를 따릅니다.',
          },
          {
            time: '18:00',
            title: '자유 관람',
            description: '여섯 시까지 문을 열어 둡니다.',
          },
        ],
      },
      {
        component: 'eventGuide',
        title: '전시 기간의 프로그램',
        intro:
          '예약 없이 오셔도 됩니다. 아래 시간에 맞추면 작가를 만날 수 있어요.',
        items: [
          {
            title: '작가의 도슨트',
            description: '작업 순서대로 직접 설명합니다.',
            time: '3. 20 · 3. 27 오후 2시',
            place: '안쪽 방',
          },
          {
            title: '차 시음',
            description: '전시에 쓰인 그릇으로 차를 따릅니다.',
            time: '매주 토요일 오후 5시',
            place: '마당',
          },
          {
            title: '흙 만져 보기',
            description: '작은 흙 덩이를 손에 쥐고 말려 보세요.',
            time: '상시',
            place: '마당 옆 탁자',
          },
        ],
      },
      {
        component: 'place',
        title: '갤러리 결',
        detail: '북촌로5길 10 · 한옥 두 채, 안쪽 마당',
      },
      {
        component: 'transportation',
        title: '오시는 길',
        subwayLine: '3호선',
        subwayStation: '안국역',
        subwayExit: '2번 출구',
        subwayWalk:
          '2번 출구에서 북촌로를 따라 도보 10분입니다. 오르막이 조금 있으니 편한 신발을 권합니다.',
        busRoutes: '북촌한옥마을 정류장 하차 · 1020, 7025',
        parkingHours: '골목 안에는 주차할 수 없습니다.',
        alternativeParking: '북촌 공영주차장(도보 5분, 유료)',
      },
      {
        component: 'notice',
        title: '관람 안내',
        heading: '11:00 — 18:00 · 월요일 휴관',
        message:
          '입장은 무료입니다. 작품 보호를 위해 음료는 마당에서만 드실 수 있어요.',
        preset: 'time',
        image: SHOWCASE_PHOTOS.exPotteryCourtyard,
      },
      {
        component: 'checklist',
        title: '관람 전에',
        description: '한옥이라 문턱이 높습니다. 아래만 챙겨 주세요.',
        items: [
          {
            label: '초대장 링크 저장',
            note: '오프닝 날 입장 확인에 필요해요.',
          },
          {
            label: '편한 신발',
            note: '신발은 문 앞에서 벗고 들어옵니다.',
          },
          {
            label: '차 한 잔의 여유',
            note: '마당에서 쉬어 가세요.',
          },
        ],
      },
      {
        component: 'faq',
        title: '자주 묻는 질문',
        items: [
          {
            question: '예약하고 가야 하나요?',
            answer: '필요 없습니다. 다만 여섯 명 이상 단체는 미리 알려 주세요.',
          },
          {
            question: '아이와 함께 가도 되나요?',
            answer:
              '괜찮습니다. 다만 그릇이 놓인 탁자와는 조금 거리를 두어 주세요.',
          },
          {
            question: '작품을 살 수 있나요?',
            answer:
              '전시 기간에는 판매하지 않고, 끝난 뒤에 문의를 받습니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message:
          '그릇은 오래 쓰라고 만듭니다. 이번 그릇이 어느 집 식탁에 오래 남기를 바랍니다. — 김도현',
      },
    ],
  },
  {
    name: '한남동 살롱 북토크',
    description: '한남동 작은 살롱에서 열리는 아트 북토크와 소규모 전시.',
    palette: ['#241C18', '#C08552', '#F2E4D2'],
    eyebrow: 'SALON EVENING · HANNAM',
    heading: '책을 읽는 저녁, 열 명의 살롱',
    date: '2027-02-06',
    time: '19:30',
    venue: '살롱 오후 · 한남동',
    venueAddress: '서울 용산구 이태원로54길 12',
    venueLat: 37.5365561,
    venueLng: 127.0014816,
    font: 'Hahmlet',
    sectionStyle: 'rounded',
    id: 'showcase-57',
    type: 'exhibition',
    message: [
      '한남동 주택가 이층, 열 명이 겨우 앉는 방에서 한 달에 한 번 책 이야기를 합니다. 이번이 열 번째 저녁입니다.',
      '이번 책은 사진집 한 권입니다. 큐레이터가 열 장을 골라 벽에 걸어 두고, 읽은 사람과 읽지 않은 사람이 같이 이야기합니다.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'countdown',
        title: '살롱까지',
        onDayMessage: '오늘 저녁 일곱 시 반, 문을 엽니다.',
        afterMessage: '다음 살롱은 3월 첫 주에 안내드립니다.',
      },
      {
        component: 'calendar',
        title: '저녁 일시',
        subTitle: 'SALON EVENING',
        template: 'calendarType6',
      },
      {
        component: 'gallery',
        title: '살롱의 저녁',
        subTitle: 'THE SALON',
        template: 'galleryType5',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.exSalonRoom,
          SHOWCASE_PHOTOS.exSalonBooks,
          SHOWCASE_PHOTOS.exSalonAudience,
          SHOWCASE_PHOTOS.exSalonWindow,
        ],
      },
      {
        component: 'picture',
        title: '이번 책을 고른 사람',
        image: SHOWCASE_PHOTOS.exSalonHost,
        caption:
          '큐레이터 문주. 사진집 한 권을 고르는 데만 세 주가 걸렸습니다.',
      },
      {
        component: 'timeline',
        title: '저녁의 순서',
        items: [
          {
            time: '19:00',
            title: '도착, 와인 한 잔',
            description: '자리는 오는 순서대로 안내해 드립니다.',
          },
          {
            time: '19:30',
            title: '열 장의 사진',
            description: '벽에 걸린 열 장을 함께 봅니다.',
          },
          {
            time: '20:20',
            title: '이야기',
            description: '읽은 사람과 읽지 않은 사람의 질문을 섞습니다.',
          },
          {
            time: '21:00',
            title: '늦게까지',
            description: '문은 열어 두지만, 이야기는 자유롭게.',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '살롱의 작은 상',
        subtitle: 'Salon Table',
        style: 'bistro',
        courses: [
          {
            name: '첫 잔',
            dishes: ['레드 와인 한 잔', '탄산수와 레몬'],
          },
          {
            name: '곁들임',
            dishes: ['치즈 세 점', '올리브와 호두', '바게트'],
          },
          {
            name: '마무리',
            dishes: ['다크 초콜릿', '레몬 마들렌'],
          },
        ],
        note: '술을 드시지 않는 분께는 따뜻한 차를 준비합니다.',
      },
      {
        component: 'eventGuide',
        title: '자리 안내',
        intro: '열 자리뿐이라 미리 정해 두지 않습니다. 오는 순서대로 앉아 주세요.',
        items: [
          {
            title: '이번 책',
            description: '살롱에 다섯 권을 두었습니다. 미리 읽고 오시면 더 좋습니다.',
            time: '언제든',
            place: '서가 앞',
          },
          {
            title: '앞자리 세 개',
            description: '책을 읽고 오신 분께 남겨 둡니다.',
            time: '19:00',
            place: '창가',
          },
          {
            title: '첫 잔',
            description: '첫 잔은 저희가 따릅니다.',
            time: '19:00 — 19:30',
            place: '주방 옆',
          },
        ],
      },
      {
        component: 'place',
        title: '살롱 오후',
        detail: '이태원로54길 12 · 2층, 초록 문',
      },
      {
        component: 'transportation',
        title: '오시는 길',
        subwayLine: '6호선',
        subwayStation: '한강진역',
        subwayExit: '3번 출구',
        subwayWalk:
          '3번 출구에서 이태원로54길로 접어들어 도보 9분입니다. 주택가라 문패를 확인하고 이층으로 올라오세요.',
        busRoutes: '한남동주민센터 정류장 하차 · 110B, 140',
        parkingHours: '골목 주차는 어렵습니다.',
        alternativeParking: '한남동 공영주차장(도보 6분, 유료)',
      },
      {
        component: 'notice',
        title: '저녁 안내',
        heading: '2027. 02. 06 토요일 19:30 · 열 자리',
        message:
          '늦게 오셔도 괜찮습니다. 다만 첫 잔은 시작 시간에 맞춰 따릅니다.',
        preset: 'time',
        image: SHOWCASE_PHOTOS.exSalonRoom,
      },
      {
        component: 'checklist',
        title: '오실 때',
        description: '가볍게 오세요. 책은 읽지 않으셔도 됩니다.',
        items: [
          {
            label: '초대장 링크 저장',
            note: '초록 문을 찾지 못하시면 연락 주세요.',
          },
          {
            label: '와인 한 병 (선택)',
            note: '마시고 싶은 술이 있으면 들고 오세요.',
          },
          {
            label: '편한 옷',
            note: '앉아서 오래 이야기합니다.',
          },
        ],
      },
      {
        component: 'faq',
        title: '자주 묻는 질문',
        items: [
          {
            question: '혼자 가도 괜찮을까요?',
            answer:
              '그런 분이 절반입니다. 두 명씩 앉도록 자리를 안내해 드려요.',
          },
          {
            question: '책을 읽지 않고 가도 되나요?',
            answer:
              '괜찮습니다. 앞의 이십 분 동안 열 장의 사진을 같이 봅니다.',
          },
          {
            question: '아이를 데려가도 되나요?',
            answer:
              '이번 저녁은 성인만 모십니다. 다음 달 낮 살롱에서 다시 안내드릴게요.',
          },
        ],
      },
      {
        component: 'closingComment',
        message:
          '책을 읽는 시간은 혼자지만, 다 읽고 나서의 저녁은 같이 보내면 좋겠습니다. — 문주',
      },
    ],
  },
];
