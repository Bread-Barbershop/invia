import {
  createEventGuideItem,
  EVENT_GUIDE_LIMITS,
  getEventGuidePreset,
  normalizeEventGuideItems,
} from './eventGuideItems';

describe('이벤트 안내 항목', () => {
  it('새 항목은 빈 값과 고유 id로 만든다', () => {
    const first = createEventGuideItem();
    const second = createEventGuideItem({ title: '돌잡이' });

    expect(first).toMatchObject({
      title: '',
      description: '',
      time: '',
      place: '',
    });
    expect(first.id).not.toBe(second.id);
    expect(second.title).toBe('돌잡이');
  });

  it('초대장 종류별 예시는 2개 이상이고 모두 이름을 가진다', () => {
    (['wedding', 'firstBirthday', 'birthday', 'seminar', 'etc', 'bridalShower'] as const).forEach(
      type => {
        const preset = getEventGuidePreset(type);
        expect(preset.length).toBeGreaterThanOrEqual(2);
        expect(preset.every(item => item.title.trim().length > 0)).toBe(true);
        expect(new Set(preset.map(item => item.id)).size).toBe(preset.length);
      }
    );
  });

  it('잘못된 값은 걸러내고 8개까지만 남긴다', () => {
    expect(normalizeEventGuideItems(null)).toEqual([]);
    expect(normalizeEventGuideItems([null, 'x', 1])).toEqual([]);

    const items = normalizeEventGuideItems(
      Array.from({ length: 12 }, (_, index) => ({
        id: `item-${index}`,
        title: `이벤트 ${index}`,
      }))
    );
    expect(items).toHaveLength(EVENT_GUIDE_LIMITS.items);
    expect(items[0]).toMatchObject({
      id: 'item-0',
      title: '이벤트 0',
      description: '',
      time: '',
      place: '',
    });
  });

  it('긴 문장은 항목별 글자 수로 자르고 중복 id를 구분한다', () => {
    const items = normalizeEventGuideItems([
      {
        id: 'same',
        title: 'ㄱ'.repeat(100),
        description: 'ㄴ'.repeat(300),
        time: 'ㄷ'.repeat(40),
        place: 'ㄹ'.repeat(40),
      },
      { id: 'same', title: '두 번째' },
      { title: 'id 없음' },
    ]);

    expect(items[0].title).toHaveLength(EVENT_GUIDE_LIMITS.itemTitle);
    expect(items[0].description).toHaveLength(
      EVENT_GUIDE_LIMITS.description
    );
    expect(items[0].time).toHaveLength(EVENT_GUIDE_LIMITS.time);
    expect(items[0].place).toHaveLength(EVENT_GUIDE_LIMITS.place);
    expect(items[1].id).toBe('same-');
    expect(items[2].id).toBe('2');
  });
});
