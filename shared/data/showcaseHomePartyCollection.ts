import { SHOWCASE_PHOTOS } from './showcaseImages';

import type { ShowcaseInvitation } from './showcaseInvitations';

export const homePartyCollection: ShowcaseInvitation[] = [
  {
    name: '토요일의 긴 점심',
    description: '이사 온 집에서 처음 여는, 서두르지 않는 주말 브런치.',
    palette: ['#FAF4EA', '#6E7A56', '#3F4436'],
    eyebrow: 'HOUSEWARMING BRUNCH',
    heading: '이사 온 집에 처음 사람을 부릅니다',
    date: '2027-04-10',
    time: '11:30',
    venue: '연희동 우리 집 · 3층 거실',
    venueAddress: '서울 서대문구 연희로11길 27',
    venueLat: 37.5702,
    venueLng: 126.9291,
    font: '고운 바탕',
    sectionStyle: 'paper',
    id: 'showcase-52',
    type: 'homeParty',
    message: [
      '짐을 다 풀고 나서 이 집에서 가장 먼저 하고 싶은 일이 사람을 부르는 거였어요. 토요일 아침부터 테이블을 펴 두고 빵을 굽고 있을게요.',
      '선물은 정말 필요 없습니다. 슬리퍼는 넉넉히 준비해 두었고, 커피는 두 번 내릴 예정이에요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'countdown',
        title: '집들이까지',
        onDayMessage: '오늘, 긴 점심을 차렸습니다.',
        afterMessage: '와 주셔서 고맙습니다. 다음엔 저희가 갈게요.',
      },
      {
        component: 'calendar',
        title: '주말 점심',
        template: 'calendarType2',
      },
      {
        component: 'gallery',
        title: '이 집의 아침',
        template: 'galleryType5',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.h1BrunchTable,
          SHOWCASE_PHOTOS.h1BrunchLiving,
          SHOWCASE_PHOTOS.h1BrunchToast,
          SHOWCASE_PHOTOS.h1BrunchFriends,
        ],
      },
      {
        component: 'picture',
        title: '지영, 이 집의 주인',
        image: SHOWCASE_PHOTOS.h1BrunchHost,
        caption:
          '이사 첫날 창가에서 마신 커피가 유난히 맛있어서, 아직 커튼도 없는데 사진부터 찍었어요.',
      },
      {
        component: 'timeline',
        title: '점심이 흐르는 순서',
        items: [
          {
            time: '11:30',
            title: '도착과 첫 잔',
            description: '문을 열어 두고 기다릴게요. 커피부터 드릴게요.',
          },
          {
            time: '12:00',
            title: '긴 테이블에 앉기',
            description: '자리는 정해 두지 않았어요. 앉고 싶은 사람 옆에 앉으세요.',
          },
          {
            time: '13:00',
            title: '디저트와 책장 구경',
            description: '아직 책이 반쯤 비어 있는 책장을 구경시켜 드릴게요.',
          },
          {
            time: '15:00',
            title: '동네 한 바퀴',
            description: '원하시는 분만요. 연희동 골목은 걸어야 알 수 있어요.',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '토요일의 식탁',
        subtitle: 'Saturday Table',
        style: 'bistro',
        courses: [
          {
            name: '아침 첫 접시',
            dishes: ['구운 사워도우와 버터', '딸기 잼과 크림치즈'],
          },
          {
            name: '따뜻한 것',
            dishes: ['버섯 스크램블에그', '구운 방울토마토'],
          },
          {
            name: '디저트',
            dishes: ['레몬 마들렌', '핸드드립 커피'],
          },
        ],
      },
      {
        component: 'checklist',
        title: '빈손으로 오세요',
        description: '와 주시는 것만으로 충분합니다. 다만 몇 가지만 미리 알려 주세요.',
        items: [
          { label: '슬리퍼', note: '준비해 두었어요. 신발은 문 앞에 두시면 됩니다.' },
          {
            label: '주차',
            note: '골목 안은 주차가 어려워요. 연희공원 공영주차장에 세우시면 5분 거리예요.',
          },
          { label: '계단 세 층', note: '엘리베이터가 없는 집이에요. 무거운 짐은 내려가서 받을게요.' },
          { label: '반려동물', note: '아쉽지만 아이가 동물을 무서워해요. 이해 부탁드릴게요.' },
          {
            label: '참석 여부 알려 주기',
            note: '빵과 자리 준비 때문에 4월 4일까지 알려 주시면 좋겠습니다.',
          },
        ],
      },
      {
        component: 'eventGuide',
        title: '점심 뒤의 작은 프로그램',
        intro: '정해진 순서는 없어요. 그냥 이런 걸 같이 하려고 합니다.',
        items: [
          {
            title: '집 구경',
            description: '베란다에 난 작은 화단이 이 집에서 제일 좋은 자리예요.',
            time: '점심 뒤',
            place: '거실 · 베란다',
          },
          {
            title: '책장 채우기',
            description: '한 권씩 가져오시면 빈 칸에 꽂아 둘게요. 제목은 나중에 알려 드릴게요.',
            time: '아무 때나',
            place: '거실 책장',
          },
          {
            title: 'LP 한 장',
            description: '한 사람당 한 곡씩 신청받아 돌려 들을게요. 조용한 곡으로 부탁해요.',
            time: '디저트 시간',
            place: '거실 스피커',
          },
        ],
      },
      {
        component: 'place',
        title: '연희동 우리 집',
        detail: '초록 대문 옆 계단으로 올라오시면 됩니다. 3층 문 앞에 화분이 하나 있어요.',
      },
      {
        component: 'transportation',
        title: '오시는 길',
        subwayLine: '3호선',
        subwayStation: '홍제역',
        subwayExit: '3번 출구',
        subwayWalk:
          '홍제역 3번 출구에서 버스로 두 정거장, 내리셔서 비탈길을 7분 올라오시면 돼요. 걷기 편한 신발을 추천합니다.',
        busRoutes: '7017, 7712 · 연희동주민센터 앞 하차',
        parkingHours:
          '연희공원 공영주차장을 이용해 주세요. 주말에는 오전 11시 전에 가시면 자리가 넉넉합니다.',
        alternativeParking:
          '골목길에는 주차하실 수 없어요. 주차장에서 저에게 연락 주시면 마중 나갈게요.',
      },
      {
        component: 'notice',
        title: '오시기 전에',
        heading: '3층, 엘리베이터가 없어요',
        message:
          '계단이 조금 가파릅니다. 무거운 짐이 있으면 미리 말씀해 주세요. 도착하시면 메시지 한 줄만 남겨 주세요.',
        preset: 'time',
      },
      {
        component: 'faq',
        title: '자주 묻는 질문',
        items: [
          {
            question: '아이와 함께 가도 될까요?',
            answer:
              '물론이에요. 거실에 낮은 테이블을 하나 더 두고, 아이가 먹을 수 있는 과일도 준비할게요.',
          },
          {
            question: '무엇을 가져가면 좋을까요?',
            answer:
              '정말 아무것도 안 가져오셔도 됩니다. 굳이 챙기고 싶다면 집에서 읽던 책 한 권이면 충분해요.',
          },
          {
            question: '늦게 도착하면 어떻게 하나요?',
            answer:
              '점심은 세 시까지 이어져요. 늦으셔도 자리는 그대로 두고, 따뜻한 것만 새로 만들어 드릴게요.',
          },
        ],
      },
      {
        component: 'closingComment',
        message:
          '이 집에서 처음으로 사람을 불러 봅니다. 와 주시는 것만으로 이 집이 조금 더 집다워질 것 같아요. 지영 · 태우 올림',
      },
    ],
  },
  {
    name: '금요일 밤, 와인과 재즈',
    description: '망원동 옥탑, 조명 낮춘 방에서 LP 한 장씩 돌리는 금요일.',
    palette: ['#F6EFE4', '#B4703A', '#332B2E'],
    eyebrow: 'FRIDAY NIGHT · WINE & JAZZ',
    heading: '한 병 들고 오세요, 안주는 제가',
    date: '2027-02-19',
    time: '19:30',
    venue: '망원동 옥탑 · 소연의 집',
    venueAddress: '서울 마포구 월드컵로13길 62',
    venueLat: 37.556,
    venueLng: 126.9032,
    font: 'Hahmlet',
    sectionStyle: 'rounded',
    id: 'showcase-53',
    type: 'homeParty',
    message: [
      '좋아하는 LP를 옆에 두고 금요일 저녁에 문을 열어 두려고 합니다. 와인은 두 병 준비해 두었지만, 각자 아끼는 한 병이 있다면 들고 오세요.',
      '밤 열한 시가 넘으면 조금 조용해질 거예요. 이웃이 있는 집이라 그 점만 기억해 주세요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'picture',
        title: '소연, 오늘의 호스트',
        image: SHOWCASE_PHOTOS.h2PartyHost,
        caption:
          '이 방에서 제일 좋아하는 자리예요. 창밖 불빛이 켜질 때부터 음악을 틀어 둡니다.',
      },
      {
        component: 'gallery',
        title: '지난 겨울의 밤',
        template: 'galleryType3',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.h2PartyWine,
          SHOWCASE_PHOTOS.h2PartyRecord,
          SHOWCASE_PHOTOS.h2PartyCheese,
          SHOWCASE_PHOTOS.h2PartyTerrace,
        ],
      },
      {
        component: 'countdown',
        title: '금요일까지',
        onDayMessage: '오늘 밤, 문 열어 두었습니다.',
        afterMessage: '어제 밤은 정말 좋았어요. 다음엔 또 다른 한 병으로.',
      },
      {
        component: 'calendar',
        title: '날짜',
        template: 'calendarType3',
      },
      {
        component: 'timeline',
        title: '밤이 흐르는 순서',
        items: [
          {
            time: '19:30',
            title: '도착과 첫 잔',
            description: '현관에서 잔부터 챙겨 드릴게요. 벗기 편한 신발로 오세요.',
          },
          {
            time: '20:30',
            title: 'LP 한 장씩',
            description: '한 사람당 한 면씩 돌려요. 끝까지 듣지 않아도 괜찮습니다.',
          },
          {
            time: '22:00',
            title: '안주와 이야기',
            description: '바닥에 앉아 천천히 먹어요. 테이블은 치워 두었습니다.',
          },
          {
            time: '23:00',
            title: '옥상에서 마지막 잔',
            description: '담요를 챙겨 두었어요. 바람이 차니 겉옷을 꼭 가져오세요.',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '안주는 제가',
        subtitle: 'Small Plates',
        style: 'tasting',
        courses: [
          {
            name: '첫 잔과 함께',
            dishes: ['브리와 바게트', '올리브와 마리네이드 당근'],
          },
          {
            name: '따뜻한 안주',
            dishes: ['버터 갈릭 새우', '감자 뇨키와 로즈마리'],
          },
          {
            name: '마지막에',
            dishes: ['다크 초콜릿과 무화과', '레몬 소금 쿠키'],
          },
        ],
      },
      {
        component: 'checklist',
        title: '와서 챙겨 주세요',
        description: '가볍게 오시면 됩니다. 아래 네 가지만 기억해 주세요.',
        items: [
          {
            label: '와인 한 병',
            note: '있으면 좋고, 없어도 괜찮아요. 마트에서 고르기 어려우면 메시지 주세요.',
          },
          {
            label: '편한 옷',
            note: '바닥에 앉아요. 오래 앉아 있어도 편한 옷이 좋습니다.',
          },
          {
            label: '겉옷',
            note: '옥상에 한 번 올라갈 예정이라 밤바람을 맞아요.',
          },
          {
            label: '참석 여부 알려 주기',
            note: '안주와 잔을 맞추려고 합니다. 2월 14일까지 알려 주시면 좋겠어요.',
          },
        ],
      },
      {
        component: 'eventGuide',
        title: '밤의 작은 순서',
        intro: '정해 둔 건 없지만, 이 세 가지는 꼭 하고 싶어요.',
        items: [
          {
            title: '신청곡 한 곡',
            description: '오시기 전에 한 곡만 정해 오세요. 제 LP 중에 없으면 제가 찾아볼게요.',
            time: '20:30',
            place: '거실 턴테이블',
          },
          {
            title: '옥상 바람',
            description: '잠깐이면 돼요. 망원동 지붕들이 제일 예쁜 시간이에요.',
            time: '23:00',
            place: '옥탑 테라스',
          },
          {
            title: '조용한 마무리',
            description: '열두 시가 넘으면 음악을 줄이고 조용히 마무리합니다.',
            time: '자정 전',
            place: '',
          },
        ],
      },
      {
        component: 'place',
        title: '망원동 옥탑',
        detail:
          '엘리베이터로 4층까지 오신 뒤, 옥탑 문을 열고 한 층 더 올라오세요. 작은 조명이 달린 문이에요.',
      },
      {
        component: 'transportation',
        title: '오시는 길',
        subwayLine: '6호선',
        subwayStation: '망원역',
        subwayExit: '2번 출구',
        subwayWalk:
          '망원역 2번 출구에서 망원시장 방향으로 8분 정도 걸어오시면 됩니다. 큰길에서 한 번만 꺾으면 되는 길이에요.',
        busRoutes: '271, 5714 · 망원시장 입구 하차',
        parkingHours:
          '건물 주차는 불가능해요. 망원동 공영주차장을 이용하시고, 차는 마시지 않는 게 좋습니다.',
        alternativeParking:
          '늦게 끝나면 대리운전보다 택시를 추천해요. 골목이 좁아 대리기사님이 찾기 어렵습니다.',
      },
      {
        component: 'notice',
        title: '이웃이 있는 집입니다',
        heading: '밤 11시 이후엔 조용히',
        message:
          '아래층에 어르신이 사세요. 열두 시가 넘으면 음악을 줄이고, 옥상에서는 목소리를 조금만 낮춰 주세요.',
        preset: 'time',
      },
      {
        component: 'faq',
        title: '묻기 전에',
        items: [
          {
            question: '와인을 꼭 가져가야 하나요?',
            answer:
              '아니요. 제가 두 병 준비해 두었으니 그냥 오셔도 충분해요. 다만 아끼는 병이 있다면 같이 마셔요.',
          },
          {
            question: '담배는 피울 수 있나요?',
            answer:
              '옥상에서만 가능합니다. 실내에서는 피우지 말아 주세요. 재떨이는 문 옆에 두었어요.',
          },
          {
            question: '몇 시까지 있어도 되나요?',
            answer:
              '편한 시간까지 계셔도 되지만 열두 시가 넘으면 조금 조용히 해 주세요. 늦게 가시는 분은 미리 택시를 잡아 두세요.',
          },
        ],
      },
      {
        component: 'closingComment',
        message:
          '좋은 음악은 혼자 들을 때보다 같이 들을 때 조금 더 오래 남더라고요. 금요일에 봐요. 소연 올림',
      },
    ],
  },
  {
    name: '새 집의 첫 저녁',
    description: '잠실 24층, 이사 짐을 다 푼 집에서 여는 첫 디너.',
    palette: ['#F6F4F0', '#8A7B5C', '#2F3235'],
    eyebrow: 'HOUSEWARMING DINNER',
    heading: '새 집의 첫 저녁에 초대합니다',
    date: '2027-05-22',
    time: '18:00',
    venue: '잠실 새 아파트 · 24층 다이닝룸',
    venueAddress: '서울 송파구 올림픽로 300',
    venueLat: 37.5136,
    venueLng: 127.0999,
    font: '나눔 스퀘어 네오',
    sectionStyle: 'plain',
    id: 'showcase-54',
    type: 'homeParty',
    message: [
      '3년 만에 집을 옮겼습니다. 짐을 다 풀고 처음 맞는 주말 저녁에, 그동안 고마웠던 분들을 모시려 합니다.',
      '와서 집을 구경하고, 같이 먹고, 늦게까지 이야기해요. 주차는 미리 번호를 알려 주시면 등록해 둘게요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'picture',
        title: '서준 그리고 다인',
        image: SHOWCASE_PHOTOS.h3DinnerCouple,
        caption:
          '이사 온 날 저녁, 짐 상자에 앉아서 마신 와인이 이상하게 맛있었어요.',
      },
      {
        component: 'gallery',
        title: '새 집의 저녁',
        template: 'galleryType2',
        ratio: '1:1',
        images: [
          SHOWCASE_PHOTOS.h3DinnerTable,
          SHOWCASE_PHOTOS.h3DinnerKitchen,
          SHOWCASE_PHOTOS.h3DinnerDetail,
          SHOWCASE_PHOTOS.h3DinnerView,
        ],
      },
      {
        component: 'calendar',
        title: '첫 저녁',
        template: 'calendarType5',
      },
      {
        component: 'countdown',
        title: '집들이까지',
        onDayMessage: '오늘, 첫 저녁을 차렸습니다.',
        afterMessage: '와 주셔서 고맙습니다. 이제 이 집이 익숙해졌어요.',
      },
      {
        component: 'timeline',
        title: '저녁의 순서',
        items: [
          {
            time: '18:00',
            title: '도착과 집 구경',
            description: '들어오셔서 편하게 둘러보세요. 로비에서 24층으로 바로 올라오시면 돼요.',
          },
          {
            time: '18:40',
            title: '테이블에 앉기',
            description: '여섯 자리를 준비했어요. 자리는 이름표 없이 편하게 앉으시면 됩니다.',
          },
          {
            time: '19:00',
            title: '첫 저녁 식사',
            description: '따뜻한 것부터 천천히 내어 드릴게요.',
          },
          {
            time: '20:30',
            title: '커피와 디저트',
            description: '베란다에서 커피를 마시며 이야기 마저 나눠요.',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '첫 저녁 메뉴',
        subtitle: 'Housewarming Dinner',
        style: 'minimal',
        courses: [
          {
            name: '첫 접시',
            dishes: ['구운 채소와 리코타', '바질 오일'],
          },
          {
            name: '메인',
            dishes: ['버터 스테이크와 구운 마늘', '감자 퓌레와 아스파라거스'],
          },
          {
            name: '마지막',
            dishes: ['바스크 치즈케이크', '핸드드립 커피'],
          },
        ],
      },
      {
        component: 'checklist',
        title: '오시기 전에',
        description: '아파트라 안내가 조금 필요합니다. 다섯 가지만 미리 알려 주세요.',
        items: [
          {
            label: '주차 등록',
            note: '차량 번호를 5월 20일까지 알려 주시면 지하 주차장에 등록해 둘게요.',
          },
          {
            label: '로비 안내',
            note: '1층 로비에서 동과 호수를 말씀하시면 24층으로 올려 드려요.',
          },
          {
            label: '슬리퍼',
            note: '준비해 두었습니다. 신발은 현관 신발장에 두시면 돼요.',
          },
          {
            label: '선물은 사양합니다',
            note: '집은 이미 다 꾸몄어요. 오시는 마음만으로 충분합니다.',
          },
          {
            label: '참석 여부 알려 주기',
            note: '여섯 자리로 준비하려고 합니다. 5월 15일까지 알려 주시면 자리를 맞춰 둘게요.',
          },
        ],
      },
      {
        component: 'eventGuide',
        title: '집 구경 코스',
        intro: '짐을 풀면서 가장 공들인 세 곳이에요. 짧게 소개할게요.',
        items: [
          {
            title: '거실과 책장',
            description: '이사하면서 책을 절반쯤 정리했어요. 남은 책은 다들 좋아하실 것 같습니다.',
            time: '도착 후',
            place: '거실',
          },
          {
            title: '주방과 섬',
            description: '여기서 대부분의 시간을 보냈어요. 섬 위에 앉아 이야기해도 좋아요.',
            time: '식사 전',
            place: '주방',
          },
          {
            title: '베란다',
            description: '밤에 보면 아래 도시 불빛이 한 번에 보여요. 커피는 여기서 마셔요.',
            time: '20:30',
            place: '베란다',
          },
        ],
      },
      {
        component: 'place',
        title: '잠실 새 아파트',
        detail:
          '102동으로 오셔서 1층 로비 인터폰에서 2403호를 눌러 주세요.',
      },
      {
        component: 'transportation',
        title: '오시는 길',
        subwayLine: '2호선 · 8호선',
        subwayStation: '잠실역',
        subwayExit: '4번 출구',
        subwayWalk:
          '잠실역 4번 출구에서 큰길을 따라 6분 정도 걸어오시면 정문이 나옵니다. 저녁에는 길이 밝아 찾기 쉬워요.',
        parkingHours:
          '지하 주차장 2시간 무료입니다. 차량 번호를 미리 알려 주시면 정문에서 바로 들어가실 수 있어요.',
        alternativeParking: '방문 차량은 B2 구역에 세워 주세요. 자리가 없으면 저에게 연락 주세요.',
      },
      {
        component: 'notice',
        title: '주차와 출입 안내',
        heading: '차량 번호를 미리 알려 주세요',
        message:
          '보안 때문에 방문 차량은 미리 등록해야 합니다. 5월 20일까지 차량 번호를 메시지로 보내 주시면 제가 등록해 둘게요.',
        preset: 'parking',
      },
      {
        component: 'faq',
        title: '자주 묻는 질문',
        items: [
          {
            question: '아이와 함께 가도 되나요?',
            answer:
              '반갑습니다. 다만 집에 아이 물건은 아직 없어서, 편한 자리나 방석을 하나 챙겨 오시면 좋아요.',
          },
          {
            question: '집들이 선물은 무엇이 좋을까요?',
            answer:
              '정말 아무것도 안 하셔도 됩니다. 굳이 마음을 전하고 싶다면 집에서 쓰던 작은 그릇 하나 정도면 충분해요.',
          },
          {
            question: '몇 시쯤 일어나면 될까요?',
            answer:
              '열한 시 전후로 정리할 생각이에요. 더 있고 싶으신 분은 편하게 계셔도 됩니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message:
          '집은 사람이 오가면서 비로소 집이 되는 것 같습니다. 첫 저녁을 함께해 주셔서 고맙습니다. 서준 · 다인 올림',
      },
    ],
  },
];
