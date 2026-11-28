import { SHOWCASE_PHOTOS } from './showcaseImages';

import type { ShowcaseInvitation } from './showcaseInvitations';

export const familyCelebrationCollection: ShowcaseInvitation[] = [
  {
    id: 'showcase-41',
    type: 'birthday',
    name: '생신 꽃편지',
    description: '꽃을 곁들인 편지로 어머니의 생신 모임에 가족을 초대해요.',
    palette: ['#FFF8F1', '#773845', '#352B29'],
    font: '고운 바탕',
    sectionStyle: 'paper',
    eyebrow: '가족이 보내는 편지',
    heading: '어머니께 드리는 꽃편지',
    message: [
      '어머니의 생신을 맞아 자녀와 손주들이 모입니다.',
      '따뜻한 밥 한 끼와 반가운 이야기로 생신상을 함께 채워 주세요.',
    ],
    date: '2027-05-08',
    time: '12:00',
    venue: '수담 한정식 · 강남',
    venueAddress: '서울 강남구 봉은사로 418',
    venueLat: 37.5106038,
    venueLng: 127.045939,
    venueTel: '02-558-4900',
    sections: [
      { component: 'greeting' },
      {
        component: 'picture',
        title: '생신상을 차렸어요',
        image: SHOWCASE_PHOTOS.flowerLetter,
        caption: '어머니께서 좋아하시는 꽃을 놓았습니다.',
      },
      {
        component: 'gallery',
        title: '꽃과 편지 두 장',
        template: 'galleryType2',
        ratio: '4:3',
        images: [SHOWCASE_PHOTOS.flowerLetter, SHOWCASE_PHOTOS.flowerAlbum],
      },
      {
        component: 'calendar',
        title: '함께하는 날',
        template: 'calendarType7',
      },
      {
        component: 'mealMenu',
        title: '어머니의 생신상',
        subtitle: '온 식구가 나누는 점심',
        style: 'garden',
        courses: [
          { name: '생신상', dishes: ['들깨미역국', '소갈비찜', '잡채'] },
          { name: '다과상', dishes: ['쑥설기', '따뜻한 대추차'] },
        ],
      },
      {
        component: 'timeline',
        title: '꽃편지를 읽는 시간',
        items: [
          { time: '12:00', title: '어머니와 함께 점심 식사' },
          { time: '13:00', title: '손주들의 편지 낭독' },
          { time: '13:20', title: '꽃다발을 들고 가족사진' },
        ],
      },
      {
        component: 'place',
        title: '식사 장소',
        detail:
          '예약한 단체실로 안내해 드릴게요. 들어오시면 이름을 말씀해 주세요.',
      },
      {
        component: 'transportation',
        title: '강남까지 오는 길',
        subwayLine: '9호선',
        subwayStation: '삼성중앙역',
        subwayExit: '7번 출구',
        subwayWalk: '삼성중앙역 7번 출구에서 봉은사로를 따라 도보 13분입니다.',
        busRoutes: '봉은사로 정류장에서 내리면 건물이 바로 보여요.',
        parkingHours:
          '건물 뒤편 주차장을 이용하시고 식사하시는 동안 차량 번호를 말씀해 주세요.',
      },
      {
        component: 'account',
        title: '마음 전하실 곳',
        message:
          '오지 못하시는 분들의 마음도 어머니께 그대로 전해 드리겠습니다.',
        groups: [
          {
            name: '생신을 준비하는 자녀',
            accounts: [
              { name: '김수연', bank: '국민은행', account: '110-000-000000' },
            ],
          },
        ],
      },
      {
        component: 'notice',
        preset: 'party',
        title: '꽃편지에 한 줄',
        heading: '어머니와의 추억을 적어 주세요',
        message:
          '자리마다 작은 꽃카드를 놓아둘게요. 어머니와 함께 웃었던 날을 적어 주시면 손주들이 모아 읽어 드릴게요.',
        image: SHOWCASE_PHOTOS.flowerAlbum,
      },
      { component: 'closingComment', message: '사랑을 담아, 자녀와 손주 올림' },
    ],
  },
  {
    id: 'showcase-42',
    type: 'birthday',
    name: '칠순 감사연',
    description: '짙은 쪽빛과 한지빛 글씨로 아버지의 칠순 식사를 안내해요.',
    largePrint: true,
    palette: ['#FCF8ED', '#203C50', '#192C35'],
    font: '고운 바탕',
    sectionStyle: 'plain',
    eyebrow: '가족 초대',
    heading: '아버지의 칠순에 모십니다',
    message: [
      '아버지 김정호 님의 칠순을 맞아 감사의 자리를 마련했습니다.',
      '함께 식사하시며 따뜻한 축하를 나눠 주세요.',
    ],
    date: '2027-05-15',
    time: '12:00',
    venue: '모악정',
    venueAddress: '서울 서초구 서초대로 272',
    venueLat: 37.4927146,
    venueLng: 127.0115793,
    venueTel: '02-584-1132',
    sections: [
      { component: 'greeting' },
      { component: 'calendar', title: '잔치 일시', template: 'calendarType9' },
      { component: 'place', title: '식사 장소', detail: '1층 소나무실' },
      {
        component: 'transportation',
        title: '오시는 길',
        subwayLine: '2호선',
        subwayStation: '서초역',
        subwayWalk:
          '서초역에서 사임당로12길로 들어와 도보 16분입니다. 어르신과 함께라면 서초역에서 택시를 타시는 편이 편해요.',
        parkingHours:
          '건물 뒤편 주차장에 세우실 수 있습니다. 돌아가실 때 소나무실 입구에서 주차 확인을 받아 주세요.',
      },
      {
        component: 'timeline',
        title: '칠순 잔치 순서',
        items: [
          { time: '12:00', title: '아버지께 큰절과 감사 편지' },
          { time: '12:15', title: '축하 떡을 자르고 점심 식사' },
          { time: '13:10', title: '아버지와 기념사진' },
        ],
      },
      {
        component: 'picture',
        title: '아버지께 드리는 편지',
        image: SHOWCASE_PHOTOS.seventiethTea,
        caption:
          '아버지, 비 오는 날이면 정류장에서 우산을 들고 기다려 주셨지요. 이제는 저희가 마중 나갈게요. 칠순을 축하드립니다.',
      },
      {
        component: 'mealMenu',
        title: '칠순 잔치상',
        subtitle: 'Family Table',
        style: 'classic',
        courses: [
          {
            name: '첫 접시',
            dishes: ['전복 죽과 계절 나물'],
          },
          {
            name: '식사',
            dishes: ['한우 갈비찜과 솥밥'],
          },
        ],
      },
      {
        component: 'account',
        title: '마음 전하실 곳',
        message:
          '축하의 마음을 보내 주시는 분들을 위해 아버지 계좌를 적어 둡니다.',
        groups: [
          {
            name: '김정호',
            accounts: [
              { name: '김정호', bank: '농협', account: '110-000-000000' },
            ],
          },
        ],
      },
      {
        component: 'notice',
        preset: 'shooting',
        title: '옛 사진을 찾습니다',
        heading: '아버지와 함께 찍은 한 장',
        message:
          '함께 찍은 옛 사진이 있다면 가져와 주세요. 식사 자리에서 사진을 돌려 보며 그날 이야기를 듣고 싶습니다.',
      },
      {
        component: 'closingComment',
        message: '기쁜 날 함께해 주셔서 고맙습니다. 김정호의 가족 올림',
      },
    ],
  },
  {
    id: 'showcase-43',
    type: 'birthday',
    name: '팔순 가족 잔치',
    description:
      '할머니와 할아버지의 팔순 잔치를 햇살 드는 정원 식탁으로 꾸몄어요.',
    largePrint: true,
    palette: ['#FAF8EE', '#294D36', '#25382C'],
    font: 'SUIT',
    sectionStyle: 'plain',
    eyebrow: '팔순 초대',
    heading: '두 분의 여든을 축하합니다',
    message: [
      '할머니와 할아버지의 팔순을 함께 축하하려고 합니다.',
      '두 분께 오래 기억될 하루가 되도록 얼굴을 보여 주세요.',
    ],
    date: '2027-06-05',
    time: '13:00',
    venue: '삼청각',
    venueAddress: '서울 성북구 대사관로 3',
    venueLat: 37.5973507,
    venueLng: 126.9841808,
    venueTel: '02-765-3000',
    sections: [
      {
        component: 'calendar',
        title: '모이는 시간',
        template: 'calendarType9',
      },
      {
        component: 'place',
        title: '모이는 곳',
        detail: '일주문을 지나 유하정으로 오시면 안내해 드릴게요.',
      },
      { component: 'greeting' },
      {
        component: 'gallery',
        title: '두 분을 위해 차린 정원 식탁',
        template: 'galleryType6',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.gardenLongTable,
          SHOWCASE_PHOTOS.gardenSetting,
          SHOWCASE_PHOTOS.gardenWateringCan,
          SHOWCASE_PHOTOS.summerField,
        ],
      },
      {
        component: 'mealMenu',
        title: '정원의 점심',
        subtitle: 'Garden Lunch',
        style: 'garden',
        courses: [
          {
            name: '첫 접시',
            dishes: ['제철 채소 샐러드'],
          },
          {
            name: '메인',
            dishes: ['정원 허브를 곁들인 구운 닭'],
          },
        ],
      },
      {
        component: 'transportation',
        title: '삼청각으로 오시는 길',
        subwayLine: '4호선',
        subwayStation: '한성대입구역',
        subwayWalk:
          '한성대입구역에서 택시로 약 10분입니다. 행사 당일에는 20분 간격으로 셔틀을 운영해요.',
        shuttleStop: '한성대입구역 6번 출구 앞',
        shuttleInterval: '20분 간격 · 12:20~13:00',
        parkingHours:
          '삼청각 주차장에 세우실 수 있습니다. 오시는 차량 번호를 미리 알려 주시면 자리를 잡아 둘게요.',
      },
      {
        component: 'timeline',
        title: '세대가 함께하는 오후',
        items: [
          { time: '13:00', title: '할머니, 할아버지와 점심 식사' },
          { time: '14:00', title: '손주들의 축하 노래' },
          { time: '14:20', title: '정원에서 삼대 가족사진' },
        ],
      },
      {
        component: 'dressCode',
        title: '정원을 걷기 좋은 차림',
        colors: ['#FAF8EE', '#294D36', '#25382C'],
        guidelines: [
          '잔디와 흙길을 걸으시니 굽 낮은 신발이 편해요. 두 분께는 따로 담요를 준비해 두겠습니다.',
        ],
      },
      {
        component: 'account',
        title: '마음 전하실 곳',
        message: '두 분께 보내 주시는 마음은 잔치 뒤에 그대로 전해 드립니다.',
        groups: [
          {
            name: '가족 대표',
            accounts: [
              {
                name: '가족 대표',
                bank: '신한은행',
                account: '110-000-000000',
              },
            ],
          },
        ],
      },
      {
        component: 'notice',
        preset: 'shooting',
        title: '가족사진 찍는 곳',
        heading: '두 분을 모시고 정원으로',
        message:
          '축하 노래가 끝나면 정원 앞 나무 그늘로 모여 주세요. 비가 오면 밖으로 나가지 않고 유하정에서 함께 찍겠습니다.',
      },
      {
        component: 'faq',
        title: '정원 잔치에 오시기 전',
        items: [
          {
            question: '주차는 어디에 하나요?',
            answer:
              '삼청각 주차장에 세우시고, 입구 안내 직원에게 팔순 잔치라고 말씀해 주세요. 잔치 동안 무료입니다.',
          },
          {
            question: '어르신이 계단을 오르기 어려우시면요?',
            answer:
              '유하정까지 차로 바로 올라갈 수 있어요. 미리 알려 주시면 입구에서 안내해 드리겠습니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '할머니, 할아버지, 오래오래 건강하세요. 손주들 올림',
      },
    ],
  },
  {
    id: 'showcase-44',
    type: 'wedding',
    name: '정갈한 혼례 초대',
    description: '두 사람의 이름과 예식 일시를 큰 한글로 또렷하게 전해요.',
    largePrint: true,
    palette: ['#FFFAF3', '#5B3846', '#332C30'],
    font: '고운 바탕',
    sectionStyle: 'plain',
    eyebrow: '결혼식 초대',
    heading: '저희 결혼합니다',
    message: [
      '민서와 지훈, 두 사람이 부부가 되는 날입니다.',
      '귀한 걸음으로 저희의 시작을 함께해 주세요.',
    ],
    date: '2027-06-12',
    time: '14:00',
    venue: '남산골한옥마을 · 전통혼례관',
    venueAddress: '서울 중구 퇴계로34길 28',
    venueLat: 37.5595424,
    venueLng: 126.9947383,
    sections: [
      { component: 'calendar', title: '예식 일시', template: 'calendarType9' },
      {
        component: 'countdown',
        title: '예식까지 남은 날',
        onDayMessage: '오늘, 민서와 지훈이 부부가 됩니다.',
        afterMessage: '함께해 주셔서 감사합니다.',
      },
      { component: 'greeting' },
      {
        component: 'picture',
        title: '두 사람의 약속',
        image: SHOWCASE_PHOTOS.hanbokBojagi,
        caption:
          '저녁이면 마주 앉아 그날 있었던 일을 묻는 부부가 되겠습니다. 민서와 지훈 드림',
      },
      { component: 'place', title: '오시는 곳' },
      {
        component: 'transportation',
        title: '한옥마을로 오시는 길',
        subwayStation: '충무로역',
        subwayExit: '3번 출구',
        subwayWalk:
          '충무로역 3번 출구에서 퇴계로34길로 들어와 도보 약 10분입니다. 한옥마을 정문에서 예식홀까지 안내해 드립니다.',
        busRoutes: '한옥마을 정문 앞에 버스 정류장이 있습니다.',
        parkingHours:
          '한옥마을 공영 주차장을 이용하시고, 접수대에서 차량 번호를 등록해 주세요.',
      },
      {
        component: 'timeline',
        title: '예식 순서',
        items: [
          { time: '14:00', title: '두 사람의 입장과 혼인 서약' },
          { time: '14:30', title: '양가 가족과 하객 기념사진' },
          { time: '15:00', title: '연회장에서 식사' },
        ],
      },
      {
        component: 'wreath',
        title: '화환 대신 마음으로',
        declineMessage:
          '작은 예식이라 축하 화환은 정중히 사양합니다. 오시는 길에 편한 마음으로 와 주세요.',
      },
      {
        component: 'myFamilyWedding',
        title: '두 사람을 키운 가족',
        groomFamilySuffix: '의 아들 민서',
        brideFamilySuffix: '의 딸 지훈',
        groomFamily: [
          { relation: '아버지', name: '정우석' },
          { relation: '어머니', name: '한미경' },
        ],
        brideFamily: [
          { relation: '아버지', name: '이재훈' },
          { relation: '어머니', name: '박선희' },
        ],
      },
      {
        component: 'notice',
        title: '한복으로 오시는 길',
        heading: '편한 신발을 함께 준비해 주세요',
        message:
          '예식홀까지 마당을 지나 걸어요. 한복을 입으셨다면 가벼운 신발을 하나 더 가져오시면 편합니다.',
        preset: 'clothes',
      },
      {
        component: 'faq',
        title: '예식 당일 안내',
        items: [
          {
            question: '식권은 어디에서 받나요?',
            answer:
              '예식 전 2층 접수대에서 받아 주세요. 촬영을 마치고 1층 연회장으로 오시면 됩니다.',
          },
          {
            question: '가족사진은 어디에서 기다리면 될까요?',
            answer:
              '행진이 끝난 뒤 예식홀 앞줄에 앉아 계시면 양가 가족부터 안내해 드립니다.',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '예식 뒤의 식사',
        subtitle: 'Wedding Table',
        style: 'classic',
        courses: [
          {
            name: '첫 접시',
            dishes: ['은행과 잣을 곁들인 죽'],
          },
          {
            name: '식사',
            dishes: ['한우 갈비찜과 제철 나물'],
          },
        ],
      },
      {
        component: 'closingComment',
        message: '축하해 주시는 마음을 소중히 간직하겠습니다. 민서와 지훈 드림',
      },
    ],
  },
  {
    id: 'showcase-52',
    type: 'birthday',
    name: '어머니의 일흔 번째 겨울',
    description: '겨울 한옥의 긴 식탁에 가족이 모여 어머니의 칠순을 축하해요.',
    palette: ['#F7F1E7', '#6E3A44', '#2C2623'],
    font: 'Noto Serif KR',
    sectionStyle: 'paper',
    eyebrow: 'A LETTER FOR MOTHER',
    heading: '어머니의 일흔 번째 겨울',
    message: [
      '어머니가 일흔이 되셨습니다.',
      '젊은 날의 어머니는 늘 남의 식탁부터 챙기셨습니다. 명절이면 손님상부터 차리고, 마지막에 남은 밥을 드시던 분이었지요. 그런 어머니가 어느새 일흔입니다.',
      '12월 19일 토요일 낮, 삼청동의 조용한 한옥에서 어머니를 모시고 식사 한 끼를 하려 합니다. 말수 적으신 분이라 크게 기대하시지는 않겠지만, 그날만큼은 자리 가득 앉은 얼굴들을 보고 오래 웃으셨으면 합니다.',
      '바쁘시더라도 오셔서 어머니 옆자리를 함께 지켜 주세요. 오시는 길과 주차 안내는 아래에 적어 두었습니다.',
      '정은재 · 정은서 올림',
    ],
    date: '2026-12-19',
    time: '12:00',
    venue: '소담재',
    venueAddress: '서울특별시 종로구 삼청로 22-5',
    venueLat: 37.5778861,
    venueLng: 126.9799995,
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'myFamily',
        title: '함께 모이는 사람들',
        members: [
          { relation: '어머니', name: '정순희' },
          { relation: '아들', name: '정은재' },
          { relation: '딸', name: '정은서' },
          { relation: '손녀', name: '정서윤' },
        ],
        message:
          '그날 스무 명 남짓이 한 상에 둘러앉습니다. 아이들은 마당에서 잠깐 뛰어도 좋습니다.',
      },
      {
        component: 'gallery',
        title: '겨울의 마당',
        subTitle: 'WINTER AT HOME',
        template: 'galleryType6',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.chilsunYard,
          SHOWCASE_PHOTOS.chilsunSetting,
          SHOWCASE_PHOTOS.chilsunHanok,
        ],
      },
      {
        component: 'picture',
        title: '어머니의 손',
        image: SHOWCASE_PHOTOS.chilsunHands,
        caption:
          '평생 남의 밥부터 챙기시던 손입니다. 이제는 저희가 그 손을 잡으려 합니다.',
      },
      {
        component: 'calendar',
        title: '잔치 일시',
        template: 'calendarType9',
      },
      {
        component: 'timeline',
        title: '그날의 순서',
        items: [
          { time: '12:00', title: '도착과 인사' },
          { time: '12:30', title: '식사' },
          { time: '13:40', title: '가족 사진' },
          { time: '14:30', title: '차와 이야기' },
        ],
      },
      {
        component: 'mealMenu',
        title: '칠순 잔치상',
        subtitle: 'FAMILY TABLE',
        style: 'classic',
        note: '어르신을 위해 순한 간으로 준비했습니다. 못 드시는 음식이 있으면 미리 알려 주세요.',
        courses: [
          {
            name: '첫 접시',
            dishes: [
              { name: '전복 죽', description: '겨울 나물 세 가지와 함께' },
            ],
          },
          {
            name: '식사',
            dishes: [{ name: '한우 갈비찜', description: '솥밥과 된장국, 김치' }],
          },
          {
            name: '마무리',
            dishes: [{ name: '유자차와 약과', description: '곶감 한 접시' }],
          },
        ],
      },
      {
        component: 'place',
        title: '오시는 곳',
        detail: '· 골목 안쪽, 솔문이 있는 집',
      },
      {
        component: 'transportation',
        title: '오시는 길',
        subwayLine: '3호선',
        subwayStation: '안국역',
        subwayExit: '1번 출구',
        subwayWalk:
          '안국역 1번 출구에서 삼청로를 따라 걸어 12분입니다. 어르신과 함께라면 안국역에서 택시를 타시는 편이 편해요.',
        busRoutes: '간선 109 · 151 · 162 · 1711, 지선 7025 (삼청동 정류장 하차)',
        parkingHours:
          '골목 안에는 차를 세울 수 없습니다. 삼청공원 공영주차장(도보 5분)을 이용해 주세요. 주차권은 식당에서 준비해 두겠습니다.',
      },
      {
        component: 'notice',
        title: '알려 드립니다',
        heading: '따뜻하게 입고 와 주세요',
        message:
          '한옥이라 바닥이 차갑습니다. 방석은 넉넉히 준비해 두지만, 따뜻한 양말이나 슬리퍼를 챙기시면 더 편합니다. 아이들 옷은 여분을 두시면 마당에서 놀다 젖어도 괜찮습니다.',
        preset: 'clothes',
        image: SHOWCASE_PHOTOS.chilsunYard,
      },
      {
        component: 'closingComment',
        message: '그날, 어머니 옆자리에서 함께 웃어 주세요.',
      },
    ],
  },
];
