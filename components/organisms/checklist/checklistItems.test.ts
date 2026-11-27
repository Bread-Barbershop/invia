import {
  CHECKLIST_LIMITS,
  createChecklistItem,
  getChecklistPreset,
  normalizeChecklistItems,
} from './checklistItems';

describe('체크리스트 항목', () => {
  it('새 항목은 빈 값과 고유 id로 만든다', () => {
    const first = createChecklistItem();
    const second = createChecklistItem({ label: '명함' });

    expect(first).toMatchObject({ label: '', note: '' });
    expect(first.id).not.toBe(second.id);
    expect(second.label).toBe('명함');
  });

  it('초대장 종류별 예시는 모두 이름을 가진다', () => {
    (['wedding', 'firstBirthday', 'birthday', 'seminar', 'etc', 'bridalShower', 'exhibition'] as const).forEach(
      type => {
        const preset = getChecklistPreset(type);
        expect(preset.length).toBeGreaterThanOrEqual(2);
        expect(preset.every(item => item.label.trim().length > 0)).toBe(true);
      }
    );
  });

  it('잘못된 값은 걸러내고 12개까지만 남긴다', () => {
    expect(normalizeChecklistItems(undefined)).toEqual([]);
    expect(normalizeChecklistItems([null, 'x'])).toEqual([]);

    const items = normalizeChecklistItems(
      Array.from({ length: 15 }, (_, index) => ({ label: `준비물 ${index}` }))
    );
    expect(items).toHaveLength(CHECKLIST_LIMITS.items);
    expect(items[0]).toMatchObject({ id: '0', note: '' });
  });

  it('글자 수를 제한하고 중복 id를 구분한다', () => {
    const items = normalizeChecklistItems([
      {
        id: 'same',
        label: 'ㄱ'.repeat(200),
        note: 'ㄴ'.repeat(300),
      },
      { id: 'same', label: '두 번째' },
    ]);

    expect(items[0].label).toHaveLength(CHECKLIST_LIMITS.label);
    expect(items[0].note).toHaveLength(CHECKLIST_LIMITS.note);
    expect(items[1].id).toBe('same-');
  });
});
