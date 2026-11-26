import { SHOWCASE_PHOTOS } from './showcaseImages';

import type { ShowcaseInvitation } from './showcaseInvitations';

export const firstBirthdayCollection: ShowcaseInvitation[] = [
  {
    name: '비단에 담은 첫돌',
    description: '비단 조각보의 오방색 띠와 한복 사진을 담은 돌상 초대장.',
    palette: ['#F9F3E7', '#8A3932', '#302F29'],
    eyebrow: 'FIRST DOL',
    heading: '민준이의 첫 돌상',
    date: '2027-02-20',
    time: '12:00',
    venue: '예담헌 한옥스튜디오',
    venueAddress: '서울 종로구 북촌로11길 118',
    venueLat: 37.5839381,
    venueLng: 126.9848064,
    venueTel: '1544-6867',
    font: '고운 바탕',
    sectionStyle: 'paper',
    id: 'showcase-25',
    type: 'firstBirthday',
    message: [
      '민준이에게 첫 한복을 입히고 작은 상을 차립니다. 실타래와 붓 중 무엇을 먼저 잡을지, 사랑채에서 함께 지켜봐 주세요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'myChild',
        title: '오늘 한 살이 된 민준이',
        name: '민준',
        birthday: '2026.02.20',
        message:
          '옷고름을 매어 주면 손뼉부터 쳐요. 오늘은 그 작은 손으로 돌잡이도 합니다.',
        image: SHOWCASE_PHOTOS.dolHanbokChild,
      },
      {
        component: 'calendar',
        title: '첫돌 잔칫날',
        template: 'calendarType7',
      },
      {
        component: 'timeline',
        title: '사랑채의 잔치 순서',
        items: [
          {
            time: '12:00',
            title: '가족 인사와 기념사진',
          },
          {
            time: '12:20',
            title: '민준이의 돌잡이',
          },
          {
            time: '12:40',
            title: '돌상 떡을 나누는 점심',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '첫돌 상차림',
        subtitle: 'Dol Table',
        style: 'classic',
        courses: [
          {
            name: '식사',
            dishes: ['소고기 미역국', '잡채'],
          },
          {
            name: '답례떡',
            dishes: ['백설기', '수수팥떡'],
          },
        ],
      },
      {
        component: 'gallery',
        title: '비단보에 싼 첫돌 사진',
        template: 'galleryType6',
        ratio: '4:3',
        images: [SHOWCASE_PHOTOS.dolHanbokChild, SHOWCASE_PHOTOS.hanbokBojagi],
      },
      {
        component: 'place',
        title: '사랑채로 오시는 길',
        detail: '대문을 들어와 마당을 지나면 왼편 사랑채에 돌상이 있어요.',
      },
      {
        component: 'transportation',
        title: '북촌까지 오시는 길',
        subwayLine: '3호선',
        subwayStation: '안국역',
        subwayExit: '2번 출구',
        subwayWalk:
          '안국역 2번 출구에서 북촌로를 따라 도보 약 16분입니다. 재동초등학교를 지나 북촌로11길로 접어들면 왼쪽에 예담헌 대문이 보여요.',
        busRoutes: '북촌한옥마을 정류장에서 내리면 도보 5분입니다.',
        parkingHours:
          '골목 안에는 차를 세울 수 없어요. 북촌 공영주차장에 주차하시고 3분만 걸어오세요.',
      },
      {
        component: 'dressCode',
        title: '한복 입고 오셔도 좋아요',
        colors: ['#F9F3E7', '#8A3932', '#302F29'],
        guidelines: [
          '아이와 함께 오시면 편한 옷도 환영해요. 마당에서 사진 찍기 좋은 자리를 안내해 드릴게요.',
        ],
      },
      {
        component: 'account',
        title: '마음 전하실 곳',
        message: '참석이 어려우신 분들의 마음만으로도 충분히 감사합니다.',
        groups: [
          {
            name: '민준이 부모',
            accounts: [
              {
                name: '김수연',
                bank: '우리은행',
                account: '110-000-000000',
              },
            ],
          },
        ],
      },
      {
        component: 'faq',
        title: '돌잔치에 오시기 전',
        items: [
          {
            question: '한복을 입고 와도 될까요?',
            answer:
              '네, 편하게 입고 오세요. 사랑채 마당에서 사진 찍기 좋은 자리를 안내해 드릴게요.',
          },
          {
            question: '아이 의자는 있나요?',
            answer:
              '유아 의자와 기저귀 교환대가 준비되어 있어요. 잠든 아이를 눕힐 방도 하나 비워 두었습니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message:
          '돌상에 올린 실타래처럼 오래오래 이어질 인연에 감사드립니다. 민준이네 올림',
      },
    ],
  },
  {
    name: '사과밭 첫 소풍',
    description: '사과 상자 라벨과 초록 격자무늬로 꾸민 과수원 소풍.',
    palette: ['#FFF4D9', '#883529', '#334A2F'],
    eyebrow: 'ORCHARD PICNIC',
    heading: '민준이의 사과밭으로',
    date: '2027-09-11',
    time: '11:00',
    venue: '행복한사과 체험농원',
    venueAddress: '경기 용인시 처인구 삼가동 411-76',
    venueLat: 37.2348132,
    venueLng: 127.1590088,
    venueTel: '010-3060-3077',
    font: 'LINESeedKR',
    sectionStyle: 'rounded',
    id: 'showcase-26',
    type: 'firstBirthday',
    message: [
      '사과가 빨갛게 익을 무렵 민준이가 한 살이 됩니다. 나무 그늘에 돗자리를 펴고 도시락을 같이 열어요.',
    ],
    sections: [
      {
        component: 'picture',
        title: '사과나무 아래에서',
        caption: '처음 만져 본 사과를 한참이나 놓지 않던 오후예요.',
        image: SHOWCASE_PHOTOS.dolOrchardChild,
      },
      {
        component: 'greeting',
      },
      {
        component: 'calendar',
        title: '소풍 가는 날',
        template: 'calendarType2',
      },
      {
        component: 'timeline',
        title: '소풍 시간표',
        items: [
          {
            time: '11:00',
            title: '사과나무 아래 가족사진',
          },
          {
            time: '11:30',
            title: '도시락 열기와 돌잡이',
          },
          {
            time: '12:00',
            title: '축하 카드 읽기',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '소풍 바구니',
        subtitle: 'Picnic Basket',
        style: 'bistro',
        courses: [
          {
            name: '도시락',
            dishes: ['달걀 샌드위치', '구운 채소'],
          },
          {
            name: '후식',
            dishes: ['사과 콤포트'],
          },
        ],
      },
      {
        component: 'gallery',
        title: '과수원의 오후 두 장',
        template: 'galleryType6',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.dolOrchardChild,
          SHOWCASE_PHOTOS.summerWildflowers,
        ],
      },
      {
        component: 'dressCode',
        title: '잔디에 앉기 편한 옷',
        colors: ['#FFF4D9', '#883529', '#334A2F'],
        guidelines: ['편한 신발과 햇빛을 가려 줄 모자를 챙겨 주세요.'],
      },
      {
        component: 'place',
        title: '돗자리가 있는 곳',
        detail:
          '과수원 입구의 사과 바구니 앞에서 만나요. 넓은 돗자리는 저희가 펴 둘게요.',
      },
      {
        component: 'transportation',
        title: '용인 과수원까지',
        subwayLine: '경전철 에버라인',
        subwayStation: '삼가역',
        subwayExit: '1번 출구',
        subwayWalk:
          '삼가역에서 과수원까지 걷는 길이 30분쯤 됩니다. 아이와 함께라면 택시를 권해요. 5분이면 도착해요.',
        busRoutes: '신논현역에서 5001B번 버스로 삼가역 하차.',
        parkingHours:
          '과수원 앞 마당에 주차할 수 있어요. 내비게이션에 행복한사과 체험농원을 찍고 오세요.',
      },
      {
        component: 'faq',
        title: '소풍 준비물',
        items: [
          {
            question: '돗자리는 챙겨야 하나요?',
            answer:
              '큰 돗자리는 준비해 두었어요. 아이가 앉을 작은 담요만 하나 가져와 주세요.',
          },
          {
            question: '사과를 따 볼 수 있나요?',
            answer:
              '소풍 뒤에 아이 손 닿는 낮은 가지에서 한두 개씩 따 보기로 했어요. 농장 주인분이 가위 사용법을 알려 주십니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '빈 바구니에 오늘의 웃음을 가득 담아 갈게요. 민준이네 드림',
      },
    ],
  },
  {
    name: '꼬마 선장의 항해일지',
    description: '파란 항로와 출항 도장을 찍은 아기 선장의 승선권.',
    palette: ['#EFF6F5', '#204C70', '#1C384A'],
    eyebrow: 'LITTLE VOYAGER',
    heading: '첫 항해에 함께 타세요',
    date: '2027-06-12',
    time: '14:00',
    venue: '서울마리나클럽 · 요트하우스',
    venueAddress: '서울 영등포구 여의서로 160',
    venueLat: 37.5347754,
    venueLng: 126.9115319,
    venueTel: '02-2088-4015',
    font: 'SUIT',
    sectionStyle: 'outlined',
    id: 'showcase-27',
    type: 'firstBirthday',
    message: [
      '나무 배를 꼭 쥔 우리 집 꼬마 선장이 첫 항해를 시작합니다. 요트하우스에서 선원 여러분을 기다릴게요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'countdown',
        title: '출항까지 남은 날',
        onDayMessage: '오늘, 민준이가 첫 항해를 시작합니다.',
        afterMessage: '함께 타 주셔서 고마워요, 선원 여러분.',
      },
      {
        component: 'timeline',
        title: '선장의 항해일지',
        items: [
          {
            time: '14:00',
            title: '승선 기념 가족사진',
          },
          {
            time: '14:20',
            title: '꼬마 선장의 돌잡이',
          },
          {
            time: '14:45',
            title: '케이크와 간식',
          },
        ],
      },
      {
        component: 'myChild',
        title: '오늘 한 살이 된 민준이',
        name: '민준',
        birthday: '2026.06.12',
        message: '작은 배를 밀어 주면 파도 소리를 흉내 내며 방긋 웃어요.',
        image: SHOWCASE_PHOTOS.dolSailboatChild,
      },
      {
        component: 'calendar',
        title: '출항 시각',
        template: 'calendarType8',
      },
      {
        component: 'mealMenu',
        title: '승선 뒤의 간식',
        subtitle: 'Galley Snack',
        style: 'minimal',
        courses: [
          {
            name: '갑판 간식',
            dishes: ['버터 쿠키와 계절 과일'],
          },
          {
            name: '마실 것',
            dishes: ['사과 주스와 보리차'],
          },
        ],
      },
      {
        component: 'place',
        title: '승선하는 곳',
        detail: '마리나 2층 라운지에서 이름이 적힌 승선권을 드려요.',
      },
      {
        component: 'transportation',
        title: '여의도 마리나까지',
        subwayLine: '5호선·9호선',
        subwayStation: '여의도역',
        subwayExit: '3번 출구',
        subwayWalk:
          '여의도역에서 한강공원 방향으로 걸으면 30분쯤 걸어요. 행사 당일에는 여의도역 3번 출구에서 셔틀을 운행합니다.',
        shuttleStop: '여의도역 3번 출구 앞',
        shuttleInterval: '30분 간격 · 13:00~14:00',
        parkingHours:
          '마리나 주차장을 이용하시고 접수대에서 차량 번호를 말씀해 주세요.',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '함께 만드는 항해도',
        heading: '방명록에 물결을 그려 주세요',
        message:
          '푸른 잉크로 한 줄씩 남겨 주시면 민준이 항해일지에 붙여 둘게요.',
      },
      {
        component: 'account',
        title: '마음 전하실 곳',
        message: '멀리서 마음 보내 주시는 분들을 위해 계좌를 남겨 둡니다.',
        groups: [
          {
            name: '민준이 부모',
            accounts: [
              {
                name: '이현우',
                bank: '국민은행',
                account: '110-000-000000',
              },
            ],
          },
        ],
      },
      {
        component: 'faq',
        title: '승선 안내',
        items: [
          {
            question: '아이와 함께 타도 괜찮을까요?',
            answer:
              '물론입니다. 입구에서 승선권을 보여 주시면 유모차를 둘 자리와 좌석을 함께 안내해 드려요.',
          },
          {
            question: '배를 직접 탈 수 있나요?',
            answer:
              '이번 잔치는 요트하우스에서 열려요. 사진을 위한 배는 데크에 세워 두고, 아이들이 만져 볼 수 있게 해 두었습니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '민준이의 항해에 든든한 선원이 되어 주셔서 감사합니다.',
      },
    ],
  },
  {
    name: '달빛 자장가',
    description: '쪽빛 밤하늘에 별자리를 수놓고 포근한 잠자리 사진을 담았어요.',
    palette: ['#F2EFF7', '#635179', '#332B48'],
    eyebrow: 'LUNAR LULLABY',
    heading: '달님에게 들려줄 첫 생일',
    date: '2027-01-16',
    time: '17:00',
    venue: '더 루프 서울 · 달빛 라운지',
    venueAddress: '서울 중구 명동2가 2-23 8층',
    venueLat: 37.5637492,
    venueLng: 126.9854222,
    venueTel: '010-6556-0230',
    font: '고운 바탕',
    sectionStyle: 'plain',
    id: 'showcase-28',
    type: 'firstBirthday',
    message: [
      '잠들기 전에 불러 주던 노래를 오늘은 함께 흥얼거리고 싶어요. 작은 별 하나가 첫 생일을 맞는 저녁입니다.',
    ],
    sections: [
      {
        component: 'myChild',
        title: '오늘 한 살이 된 민준이',
        name: '민준',
        birthday: '2026.01.16',
        message: '별 무늬 이불 끝을 쥐면 금세 편안한 표정이 돼요.',
        image: SHOWCASE_PHOTOS.dolMoonlampChild,
      },
      {
        component: 'greeting',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '민준이에게 별을 선물해요',
        heading: '별 모양 카드에 한마디',
        message:
          '저녁 식사 전, 카드에 짧은 자장가나 덕담을 적어 주세요. 부모가 모아 한 권의 그림책으로 엮을게요.',
      },
      {
        component: 'calendar',
        title: '별이 뜰 무렵',
        template: 'calendarType4',
      },
      {
        component: 'timeline',
        title: '저녁의 순서',
        items: [
          {
            time: '17:00',
            title: '별 카드에 축하 인사 쓰기',
          },
          {
            time: '17:20',
            title: '첫 생일 촛불과 돌잡이',
          },
          {
            time: '17:45',
            title: '가족 저녁 식사',
          },
        ],
      },
      {
        component: 'mealMenu',
        title: '달빛 아래 저녁',
        subtitle: 'Moonlight Table',
        style: 'tasting',
        courses: [
          {
            name: '따뜻한 접시',
            dishes: ['단호박 수프와 구운 빵'],
          },
          {
            name: '마지막 한 입',
            dishes: ['우유 푸딩과 베리'],
          },
        ],
      },
      {
        component: 'place',
        title: '달빛 라운지 안내',
        detail: '엘리베이터로 8층에 오르면 남색 커튼이 달린 방이 있어요.',
      },
      {
        component: 'transportation',
        title: '명동 라운지까지',
        subwayLine: '4호선',
        subwayStation: '명동역',
        subwayExit: '8번 출구',
        subwayWalk: '명동역 8번 출구에서 퇴계로를 따라 도보 6분입니다.',
        busRoutes: '명동입구 정류장에서 내리면 건물이 바로 보여요.',
        parkingHours:
          '건물 주차장은 좁아요. 인근 명동 공영주차장을 권해 드리고, 접수대에 차량 번호를 말씀해 주세요.',
      },
      {
        component: 'dressCode',
        title: '밤이라 한 겹 더',
        colors: ['#F2EFF7', '#635179', '#332B48'],
        guidelines: [
          '해가 지면 쌀쌀해요. 아이는 긴팔 잠옷을 입혀 오시면 사진이 더 예뻐요.',
        ],
      },
      {
        component: 'account',
        title: '마음 전하실 곳',
        message: '오지 못하시는 분들의 마음도 별처럼 모아 두겠습니다.',
        groups: [
          {
            name: '민준이 부모',
            accounts: [
              {
                name: '김수연',
                bank: '카카오뱅크',
                account: '110-000-000000',
              },
            ],
          },
        ],
      },
      {
        component: 'faq',
        title: '달빛방 안내',
        items: [
          {
            question: '아이가 잠들면 어떻게 하나요?',
            answer:
              '방 옆에 조용한 쉼방을 준비했어요. 잠든 아이를 눕히고 어른들은 천천히 이야기 나누시면 됩니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '오늘 들려주신 목소리를 오래 기억할게요. 좋은 꿈 꾸세요.',
      },
    ],
  },
  {
    name: '한 살 사진관',
    description: '흑백 은염 인화지와 필름 가장자리로 엮은 첫돌 사진전.',
    palette: ['#F4F1EB', '#55463A', '#242424'],
    eyebrow: 'PORTRAIT STUDIO',
    heading: '한 살의 얼굴을 전시합니다',
    date: '2027-03-20',
    time: '13:00',
    venue: '크레타 스튜디오',
    venueAddress: '서울 서대문구 연희동 70-7',
    venueLat: 37.5728384,
    venueLng: 126.9381143,
    venueTel: '02-3142-0010',
    font: 'Noto Serif KR',
    sectionStyle: 'paper',
    id: 'showcase-29',
    type: 'firstBirthday',
    message: [
      '웃다가 찡그리고 다시 활짝. 고른 사진마다 다른 얼굴이라 첫돌에 맞춰 작은 사진전을 열기로 했어요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'picture',
        title: '첫 전시의 대표 사진',
        caption: '셔터 소리에 웃음이 터진 순간을 골랐습니다.',
        image: SHOWCASE_PHOTOS.dolStudioChild,
      },
      {
        component: 'gallery',
        title: '인화지 위의 한 살',
        template: 'galleryType3',
        ratio: '4:3',
        images: [
          SHOWCASE_PHOTOS.dolStudioPrints,
          SHOWCASE_PHOTOS.dolStudioFrames,
          SHOWCASE_PHOTOS.dolStudioChild,
        ],
      },
      {
        component: 'calendar',
        title: '사진관 여는 날',
        template: 'calendarType5',
      },
      {
        component: 'timeline',
        title: '사진관 예약표',
        items: [
          {
            time: '13:00',
            title: '전시 둘러보기',
          },
          {
            time: '13:30',
            title: '돌잡이와 가족사진 촬영',
          },
          {
            time: '14:00',
            title: '인화 사진 나누기',
          },
        ],
      },
      {
        component: 'dressCode',
        title: '흑백 단체사진',
        colors: ['#F4F1EB', '#55463A', '#242424'],
        guidelines: ['잔무늬가 적은 옷을 입으시면 표정이 사진에 더 잘 보여요.'],
      },
      {
        component: 'place',
        title: '스튜디오 위치',
        detail: '사진실 앞 작은 갤러리에서 먼저 인사 나눠요.',
      },
      {
        component: 'transportation',
        title: '연희동 스튜디오까지',
        subwayLine: '2호선·경의중앙선',
        subwayStation: '홍대입구역',
        subwayExit: '2번 출구',
        subwayWalk:
          '홍대입구역에서 택시로 약 5분입니다. 걷는다면 연희동 골목을 따라 40분쯤 걸려요.',
        busRoutes: '신촌역과 홍대입구역에서 연희동 방면 버스로 5분 거리입니다.',
        parkingHours:
          '스튜디오 앞에 두 대까지 세울 수 있어요. 차량 번호를 미리 알려 주시면 자리를 비워 둘게요.',
      },
      {
        component: 'myFamily',
        title: '초대장을 보낸 가족',
        members: [
          {
            relation: '엄마',
            name: '김수연',
          },
          {
            relation: '아빠',
            name: '이현우',
          },
        ],
        message: '엄마는 사진을 골랐고 아빠는 액자 뒷면에 날짜를 적었습니다.',
      },
      {
        component: 'account',
        title: '마음 전하실 곳',
        message:
          '사진전에 와 주시는 것만으로 감사합니다. 마음을 보내실 분들을 위해 계좌를 적어 둡니다.',
        groups: [
          {
            name: '민준이 부모',
            accounts: [
              {
                name: '김수연',
                bank: '신한은행',
                account: '110-000-000000',
              },
            ],
          },
        ],
      },
      {
        component: 'closingComment',
        message: '여러분의 얼굴까지 담아 첫 앨범을 완성할게요.',
      },
    ],
  },
  {
    name: '꼬마 공룡 박물관',
    description:
      '숲빛 전시 라벨과 장난감 공룡 사진으로 만든 작은 박물관 입장권.',
    palette: ['#EFF2D8', '#426143', '#243B30'],
    eyebrow: 'DINO MUSEUM',
    heading: '첫돌 박물관이 문을 열어요',
    date: '2027-04-17',
    time: '11:30',
    venue: '서대문자연사박물관',
    venueAddress: '서울 서대문구 연희로32길 51',
    venueLat: 37.5767523,
    venueLng: 126.9378581,
    venueTel: '02-330-8899',
    font: 'ONE Mobile POP',
    sectionStyle: 'rounded',
    id: 'showcase-30',
    type: 'firstBirthday',
    message: [
      '민준이의 방에 있는 공룡들이 오늘만큼은 전시실의 주인공이에요. 작은 관장님의 첫 생일에 놀러 오세요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'myChild',
        title: '오늘 한 살이 된 민준이',
        name: '민준',
        birthday: '2026.04.17',
        message: '목이 긴 초록 공룡을 가장 먼저 데려와 손님들에게 건넵니다.',
        image: SHOWCASE_PHOTOS.dolDinoChild,
      },
      {
        component: 'notice',
        preset: 'time',
        title: '전시실에서 즐겨요',
        heading: '공룡 발자국을 따라오세요',
        message:
          '1층 안내데스크에서 민준이 생일이라고 말씀해 주세요. 공룡 발자국 표지를 따라 3층 전시실로 오시면 작은 돌잡이 상이 있어요.',
      },
      {
        component: 'timeline',
        title: '박물관 관람 순서',
        items: [
          {
            time: '11:30',
            title: '입장권에 도장 찍기',
          },
          {
            time: '11:50',
            title: '공룡 발자국 따라 걷기',
          },
          {
            time: '12:20',
            title: '돌잡이와 사진',
          },
        ],
      },
      {
        component: 'calendar',
        title: '개관 일시',
        template: 'calendarType6',
      },
      {
        component: 'mealMenu',
        title: '관장님의 점심',
        subtitle: 'Dino Lunch',
        style: 'bistro',
        courses: [
          {
            name: '따뜻한 접시',
            dishes: ['단호박 수프', '미니 주먹밥'],
          },
          {
            name: '후식',
            dishes: ['공룡 모양 쿠키'],
          },
        ],
      },
      {
        component: 'place',
        title: '초록 전시실',
        detail:
          '1층 안내데스크 옆 강당에서 점심을 먹고, 전시실로 함께 올라가요.',
      },
      {
        component: 'transportation',
        title: '박물관까지',
        subwayLine: '2호선',
        subwayStation: '신촌역',
        subwayExit: '3번 출구',
        subwayWalk:
          '신촌역 3번 출구에서 7017번 버스로 박물관 입구까지 약 10분입니다. 언덕길이라 걸어오시려면 30분쯤 잡으세요.',
        parkingHours:
          '박물관 주차장이 넓어요. 주차 후 안내데스크에서 차량 번호를 등록해 주세요.',
      },
      {
        component: 'account',
        title: '마음 전하실 곳',
        message: '멀리서 축하해 주시는 분들을 위해 계좌를 남깁니다.',
        groups: [
          {
            name: '민준이 부모',
            accounts: [
              {
                name: '이현우',
                bank: '하나은행',
                account: '110-000-000000',
              },
            ],
          },
        ],
      },
      {
        component: 'faq',
        title: '전시실 안내',
        items: [
          {
            question: '아이가 뛰어다녀도 되나요?',
            answer:
              '전시실 바닥은 푹신한 매트로 깔아 두었어요. 마음껏 걸어 다녀도 괜찮습니다.',
          },
          {
            question: '관람료는 미리 내야 하나요?',
            answer:
              '저희가 미리 끊어 두었어요. 1층 안내데스크에서 이름만 말씀하시면 됩니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '작은 박물관의 첫 손님이 되어 주셔서 감사합니다.',
      },
    ],
  },
  {
    name: '첫돌 우체국',
    description: '우표 테두리와 항공우편 띠에 아이의 사진을 붙인 첫 편지.',
    palette: ['#FFF2E7', '#9B463C', '#424A58'],
    eyebrow: 'AIR MAIL',
    heading: '민준이가 띄우는 첫 편지',
    date: '2027-05-15',
    time: '12:30',
    venue: '서울중앙우체국',
    venueAddress: '서울 중구 소공로 70',
    venueLat: 37.5613017,
    venueLng: 126.9821681,
    venueTel: '02-6450-1114',
    font: '고운 바탕',
    sectionStyle: 'outlined',
    id: 'showcase-31',
    type: 'firstBirthday',
    message: [
      '받는 분 칸에 한 분씩 이름을 적었습니다. 민준이가 태어나서 처음 띄우는 생일 초대장이에요.',
    ],
    sections: [
      {
        component: 'greeting',
      },
      {
        component: 'myFamily',
        title: '초대장을 보낸 가족',
        members: [
          {
            relation: '엄마',
            name: '김수연',
          },
          {
            relation: '아빠',
            name: '이현우',
          },
        ],
        message: '엄마와 아빠가 봉투를 접고 민준이는 손도장을 보탰어요.',
      },
      {
        component: 'picture',
        title: '편지가 도착했어요',
        caption: '봉투를 한참 들여다보던 민준이의 오후.',
        image: SHOWCASE_PHOTOS.dolAirmailChild,
      },
      {
        component: 'gallery',
        title: '봉투와 편지지 두 장',
        template: 'galleryType4',
        ratio: '4:3',
        images: [SHOWCASE_PHOTOS.dolAirmailChild, SHOWCASE_PHOTOS.letterPaper],
      },
      {
        component: 'calendar',
        title: '편지를 여는 날',
        template: 'calendarType2',
      },
      {
        component: 'notice',
        preset: 'time',
        title: '한 살에게 보내는 답장',
        heading: '손편지를 남겨 주세요',
        message:
          '편지방에 놓인 엽서에 한 문장씩 적어 주세요. 두 돌이 되면 함께 읽을게요.',
      },
      {
        component: 'timeline',
        title: '편지방 일정',
        items: [
          {
            time: '12:30',
            title: '축하 엽서 접수',
          },
          {
            time: '12:50',
            title: '돌잡이와 답장 추첨',
          },
          {
            time: '13:10',
            title: '가족 식사',
          },
        ],
      },
      {
        component: 'place',
        title: '첫돌 우체통 위치',
        detail:
          '우체국 1층 로비의 빨간 우체통 옆으로 오세요. 편지방은 그 옆 문으로 들어갑니다.',
      },
      {
        component: 'transportation',
        title: '중앙우체국까지',
        subwayLine: '1호선·2호선',
        subwayStation: '시청역',
        subwayWalk:
          '시청역에서 소공로를 따라 도보 15분입니다. 시청교차로에서 횡단보도를 두 번 건너면 우체국 정문이 보여요.',
        busRoutes: '주한영국대사관 앞 정류장에서 내리면 도보 3분입니다.',
        parkingHours:
          '지하 주차장을 이용하시고 접수대에서 차량 번호를 등록해 주세요.',
      },
      {
        component: 'account',
        title: '마음 전하실 곳',
        message: '답장 대신 마음을 보내 주셔도 고맙게 받겠습니다.',
        groups: [
          {
            name: '민준이 부모',
            accounts: [
              {
                name: '김수연',
                bank: '국민은행',
                account: '110-000-000000',
              },
            ],
          },
        ],
      },
      {
        component: 'faq',
        title: '편지 쓰는 법',
        items: [
          {
            question: '편지는 언제 쓰나요?',
            answer:
              '접수대에서 엽서를 받아 자유롭게 적어 주세요. 주소를 남기시면 민준이가 자라서 한 장씩 읽어 드립니다.',
          },
        ],
      },
      {
        component: 'closingComment',
        message: '소중한 답장은 우리 가족의 보관함에 차곡차곡 모아 둘게요.',
      },
    ],
  },
];
