export const FAQ_CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'getting-started', label: '시작하기' },
  { id: 'editing', label: '초대장 편집' },
  { id: 'publishing', label: '공개 및 공유' },
  { id: 'account', label: '계정 및 데이터' },
] as const;

export type FaqCategoryId = (typeof FAQ_CATEGORIES)[number]['id'];
export type FaqItemCategoryId = Exclude<FaqCategoryId, 'all'>;

export type FaqItem = {
  id: string;
  category: FaqItemCategoryId;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'free-service',
    category: 'getting-started',
    question: 'Invia는 무료로 사용할 수 있나요?',
    answer:
      '네. 현재 초대장 제작, 저장, 공개, 공유는 모두 무료예요. Google 계정으로 로그인하면 초대장을 만들 수 있어요.',
  },
  {
    id: 'supported-devices',
    category: 'getting-started',
    question: '모바일에서도 초대장을 만들거나 볼 수 있나요?',
    answer:
      '초대장 편집은 PC 브라우저 창 너비 1,340px 이상에서 할 수 있어요. 공유받은 초대장을 열거나 홈과 갤러리에서 템플릿을 둘러보는 일은 모바일과 PC에서 모두 가능해요.',
  },
  {
    id: 'start-with-template',
    category: 'getting-started',
    question: '템플릿으로 어떻게 시작하고 표지는 어떻게 바꾸나요?',
    answer:
      '편집기에서 행사 유형을 고르고 ‘템플릿 사용하기’를 열어 포스터와 페이지 구성을 선택하세요. 표지만 바꾸려면 미리보기에서 포스터를 선택해 글과 사진을 수정하세요. 포스터 사진을 선택한 뒤 ‘사진 편집’을 누르면 사진을 자르거나 배경에 적용할 수 있어요.',
  },
  {
    id: 'organize-pages',
    category: 'editing',
    question: '초대장에 항목을 추가하거나 순서를 바꿀 수 있나요?',
    answer:
      '‘+페이지 추가’에서 공지사항, 사진, 행사 장소 등 필요한 항목을 검색해 넣으세요. 추가한 항목은 선택해서 내용을 바꾸고, ‘순서’ 목록에서 끌어 옮겨 배치를 바꿀 수 있어요.',
  },
  {
    id: 'customize-page-style',
    category: 'editing',
    question: '항목마다 카드 모양이나 등장 효과를 다르게 설정할 수 있나요?',
    answer:
      '공지사항처럼 설정을 지원하는 항목을 선택하면 편집 화면 제목 바로 아래에서 ‘이 블록의 카드 스타일’과 ‘이 블록의 등장 효과’를 바꿀 수 있어요. ‘전체 스타일’에서는 초대장에 공통으로 적용할 카드 스타일과 스크롤 애니메이션을 설정할 수 있어요.',
  },
  {
    id: 'preview-unsaved-invitation',
    category: 'editing',
    question: '저장하거나 공개하기 전에 하객 화면을 볼 수 있나요?',
    answer:
      '편집기의 ‘미리보기’에서는 저장 전 변경사항까지 반영한 하객 화면을 확인할 수 있어요. 미리보기를 열어도 저장하거나 공개하지 않아요. 마이페이지에서 미리보면 마지막으로 저장한 내용이 보여요.',
  },
  {
    id: 'save-progress',
    category: 'editing',
    question: '작성 중인 초대장은 어떻게 저장하나요?',
    answer:
      '편집기에서 ‘모두 저장하기’를 누르면 현재 작업이 로그인한 Google 계정의 Drive에 저장돼요. 마이페이지에서는 마지막으로 저장한 내용을 다시 열 수 있으니, 편집기를 닫기 전에 저장이 완료됐는지 확인해 주세요.',
  },
  {
    id: 'edit-after-public',
    category: 'editing',
    question: '공개한 뒤에도 내용을 수정할 수 있나요?',
    answer:
      '네. 마이페이지에서 초대장의 편집 화면을 열고 ‘모두 저장하기’를 누르면 같은 링크에 변경한 내용이 반영돼요. 하객 그룹이 있는 초대장은 편집할 대상을 먼저 선택하세요.',
  },
  {
    id: 'duplicate-invitation',
    category: 'editing',
    question: '만들어 둔 초대장을 복사해서 쓸 수 있나요?',
    answer:
      '마이페이지의 초대장 카드에서 ‘초대장 복사’를 선택하세요. 복사본은 비공개로 만들어지고 원본과 별도로 편집할 수 있어요.',
  },
  {
    id: 'share-link',
    category: 'publishing',
    question: '초대장 링크나 QR 코드는 어떻게 공유하나요?',
    answer:
      '마이페이지에서 ‘링크·QR 공유하기’를 열거나, 저장 완료 화면에서 ‘링크 공유하기’를 누르세요. ‘링크 복사하기’로 주소를 복사하거나 ‘QR 저장하기’로 PNG 파일을 받을 수 있어요. 비공개 또는 공개 준비 중에는 카카오톡·문자 전송을 사용할 수 없고, 받은 링크와 QR로도 초대장을 열 수 없어요. 공개 준비가 끝나면 기기와 브라우저에 따라 전송할 수 있어요.',
  },
  {
    id: 'visibility-toggle',
    category: 'publishing',
    question: '초대장을 공개 또는 비공개로 바꿀 수 있나요?',
    answer:
      '네. 마이페이지의 초대장 카드에서 공개 상태를 바꿀 수 있어요. 하객 그룹이 있다면 ‘공개 범위 설정’을 열어 주세요. 맨 위 스위치를 끄고 ‘적용’을 누르면 모든 하객 링크가 닫혀요. 다시 켜고 적용하면 이전 그룹별 설정이 복원돼요. 일부만 공개하려면 원하는 그룹만 켜고 ‘적용’을 누르세요.',
  },
  {
    id: 'audience-invitations',
    category: 'publishing',
    question: '가족과 직장 동료에게 다른 초대장을 보낼 수 있나요?',
    answer:
      '기본 초대장을 먼저 저장하세요. 편집기의 ‘하객별 구분’에서 복사할 초대장을 고르고 대상 이름과 링크 영문명을 입력해 그룹을 추가할 수 있어요. 그룹별로 내용을 편집하고 저장한 뒤, 공개한 그룹의 ‘링크 복사’를 눌러 전용 주소를 보내세요.',
  },
  {
    id: 'scheduled-privacy',
    category: 'publishing',
    question: '행사가 끝나면 연락처나 계좌번호를 자동으로 가릴 수 있나요?',
    answer:
      '편집기의 ‘초대장 설정’에서 ‘일정이 끝나면 개인정보 가리기’를 켜고, 일정이 끝나는 날과 가릴 항목을 선택한 뒤 ‘적용’하고 저장하세요. 설정한 날짜의 다음 날 00:00부터 한국 시간 기준으로 전화번호, 계좌번호 등 선택한 정보가 하객 화면에서 가려져요.',
  },
  {
    id: 'google-login',
    category: 'account',
    question: '왜 Google 로그인이 필요한가요?',
    answer:
      'Google 로그인은 내 초대장을 Google Drive에 저장하고 마이페이지에서 다시 불러오는 데 필요해요. 공유받은 초대장을 보는 하객은 Google 계정으로 로그인할 필요가 없어요.',
  },
  {
    id: 'drive-access-range',
    category: 'account',
    question: 'Invia가 제 Google Drive의 모든 파일에 접근하나요?',
    answer:
      'Invia는 Google Drive 전체 권한을 요청하지 않아요. Invia에서 만든 파일과 폴더 또는 사용자가 Invia에 공유해 접근을 허용한 파일에 한해 Google Drive의 제한된 권한을 사용해요.',
  },
  {
    id: 'drive-storage',
    category: 'account',
    question: '초대장 데이터는 어디에 저장되나요?',
    answer:
      '편집 내용과 업로드한 사진·음원 같은 파일은 저장할 때 로그인한 Google 계정의 Drive에 저장돼요. 마이페이지에서도 해당 계정으로 로그인해 저장한 초대장을 열 수 있어요.',
  },
  {
    id: 'drive-data-safety',
    category: 'account',
    question: 'Google Drive에서 Invia가 만든 파일을 직접 수정해도 되나요?',
    answer:
      'Invia가 만든 Drive 폴더나 파일을 직접 수정·이동·삭제하면 공유 링크나 편집 기능이 제대로 작동하지 않을 수 있어요. 내용 변경은 편집기에서, 초대장 삭제는 마이페이지에서 해 주세요.',
  },
  {
    id: 'drive-storage-capacity',
    category: 'account',
    question: 'Google Drive 저장 공간이 부족하면 어떻게 되나요?',
    answer:
      'Drive 저장 공간이 부족하면 새 초대장이나 사진·음원을 저장하지 못할 수 있어요. 로그인한 Google 계정의 저장 공간을 확보한 뒤 편집기에서 다시 저장해 주세요.',
  },
  {
    id: 'delete-invitation',
    category: 'account',
    question: '만든 초대장을 삭제할 수 있나요?',
    answer:
      '마이페이지에서 삭제할 초대장 카드의 삭제 버튼을 누르세요. 기본 초대장과 모든 하객 그룹이 함께 삭제되며, 이미 보낸 링크로도 초대장을 열 수 없어요. 잠시 열람을 막으려면 비공개로 전환하세요.',
  },
];
