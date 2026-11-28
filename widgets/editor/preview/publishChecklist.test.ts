import {
  buildPublishChecklist,
  publishChecklistSummary,
  type PublishChecklistBlock,
} from './publishChecklist';

const NOW = new Date('2026-11-28T22:00:00+09:00');

const block = (
  component: string,
  props: Record<string, unknown> = {},
  id = component
): PublishChecklistBlock => ({ id, component, type: 'wedding', props });

const completeBlocks = () => [
  block('greeting', { messageHtml: '<p>저희 결혼식에 초대합니다.</p>' }),
  block('calendar', { date: '2027-05-22', time: '오후 2:00' }),
  block('place', {
    placeName: '서원 예식당',
    placeAddress: '서울 종로구 사직로 9길 1',
    lat: 37.57,
    lng: 126.97,
  }),
  block('phone', {
    groups: [{ id: 'g1', name: '신랑', contacts: [{ id: 'c1', label: '신랑', number: '010-1234-5678' }] }],
  }),
  block('account', {
    accountList: [[{ name: '고관우', bank: '국민은행', account: '123-456-789' }]],
  }),
];

const baseInput = {
  blocks: completeBlocks(),
  title: '고관우 · 라니 결혼식',
  posterObjectCount: 12,
  posterExampleTexts: [] as string[],
  now: NOW,
};

const ids = (input: Parameters<typeof buildPublishChecklist>[0]) =>
  buildPublishChecklist(input).items.map(item => item.id);

describe('buildPublishChecklist', () => {
  it('필수·권장 항목을 모두 채우면 준비 완료로 본다', () => {
    const result = buildPublishChecklist(baseInput);

    expect(result.items).toEqual([]);
    expect(result.isReady).toBe(true);
    expect(result.requiredCount).toBe(0);
    expect(publishChecklistSummary(result)).toContain('바로 저장할 수 있어요');
  });

  it('표지가 비어 있고 예시 문구가 남아 있으면 필수 항목 두 개로 알린다', () => {
    const result = buildPublishChecklist({
      ...baseInput,
      posterObjectCount: 0,
      posterExampleTexts: ['8/11', '15:00', '서울 강남구 테헤란로 1길 19 0층 000홀', '베니 케이크'],
    });

    expect(result.items.map(item => item.id)).toEqual([
      'poster-empty',
      'poster-example',
    ]);
    expect(result.requiredCount).toBe(2);
    const example = result.items[1];
    expect(example.title).toContain('예시 문구');
    expect(example.detail).toContain('“8/11”');
    expect(example.detail).toContain('외 1개');
    expect(example.target).toBe('poster');
  });

  it('제목이 비면 공유 설정으로 이동할 항목을 만든다', () => {
    const [item] = buildPublishChecklist({ ...baseInput, title: '   ' }).items;

    expect(item).toMatchObject({
      id: 'title-missing',
      severity: 'required',
      target: 'shareUrl',
    });
  });

  it('일정 블록의 날짜가 비었는지, 템플릿 기본 날짜가 그대로인지 구분한다', () => {
    const empty = buildPublishChecklist({
      ...baseInput,
      blocks: [block('calendar', { date: '', time: '' })],
    }).items.find(item => item.id === 'calendar-date-missing');
    expect(empty).toMatchObject({
      severity: 'required',
      blockId: 'calendar',
      target: 'block',
    });

    const sample = buildPublishChecklist({
      ...baseInput,
      blocks: [block('calendar', { date: '2026-12-05', time: '오후 01:00' })],
    }).items.find(item => item.id === 'calendar-date-sample');
    expect(sample?.detail).toContain('2026-12-05');
  });

  it('장소가 비었는지, 예시 주소가 남았는지, 지도 좌표가 없는지 순서대로 본다', () => {
    expect(
      ids({
        ...baseInput,
        blocks: [block('place', { placeName: '', placeAddress: '' })],
      })
    ).toContain('place-empty');

    expect(
      ids({
        ...baseInput,
        blocks: [
          block('place', {
            placeName: '행사 장소',
            placeAddress: '서울 강남구 테헤란로 1길 19 0층 000홀',
          }),
        ],
      })
    ).toContain('place-example');

    expect(
      ids({
        ...baseInput,
        blocks: [
          block('place', {
            placeName: '서원 예식당',
            placeAddress: '서울 종로구 사직로 9길 1',
          }),
        ],
      })
    ).toContain('place-coordinates');
  });

  it('인사말·연락처·계좌가 비면 권장 항목으로 알린다', () => {
    const result = buildPublishChecklist({
      ...baseInput,
      blocks: [
        block('greeting', { messageHtml: '<p></p>' }),
        block('phone', { groups: [{ id: 'g1', name: '신랑', contacts: [] }] }),
        block('account', { accountList: [[{ name: '', bank: '', account: '' }]] }),
      ],
    });

    expect(result.items.map(item => item.id)).toEqual(
      expect.arrayContaining(['greeting-empty', 'phone-empty', 'account-empty'])
    );
    expect(result.items.every(item => item.severity === 'recommended')).toBe(
      true
    );
    expect(result.requiredCount).toBe(0);
  });

  it('블록이 하나도 없으면 본문·일정·장소 안내를 한 번만 보여 준다', () => {
    const result = buildPublishChecklist({
      ...baseInput,
      blocks: [],
      posterObjectCount: 5,
    });

    expect(result.items.map(item => item.id)).toEqual([
      'no-blocks',
    ]);
    expect(result.items[0].target).toBeUndefined();
  });

  it('일정·장소 블록이 없으면 추가를 권한다', () => {
    const result = buildPublishChecklist({
      ...baseInput,
      blocks: [block('greeting', { messageHtml: '<p>안녕하세요</p>' })],
    });

    expect(result.items.map(item => item.id)).toEqual([
      'no-calendar',
      'no-place',
    ]);
  });

  it('표지 정보를 알 수 없으면 표지 항목은 건너뛴다', () => {
    const result = buildPublishChecklist({
      ...baseInput,
      posterObjectCount: undefined,
    });

    expect(result.items.some(item => item.id.startsWith('poster'))).toBe(false);
  });

  it('요약 문구에 남은 항목 수를 담는다', () => {
    const result = buildPublishChecklist({
      ...baseInput,
      title: '',
      posterExampleTexts: ['8/11'],
    });

    expect(publishChecklistSummary(result)).toBe(
      '꼭 확인할 항목 2개가 남아 있어요.'
    );
  });
});
