import { INVITATION_TEMPLATES, getInvitationTemplates } from './catalog';
import { filterInvitationTemplates } from './search';

describe('표지·템플릿 검색', () => {
  it('검색어가 비어 있으면 카탈로그 전체를 그대로 돌려준다', () => {
    expect(filterInvitationTemplates(INVITATION_TEMPLATES, '')).toBe(
      INVITATION_TEMPLATES
    );
    expect(filterInvitationTemplates(INVITATION_TEMPLATES, '   ')).toBe(
      INVITATION_TEMPLATES
    );
  });

  it('카테고리 안에서 이름 일부로 찾는다', () => {
    const results = filterInvitationTemplates(
      getInvitationTemplates('wedding'),
      '클래식'
    );

    expect(results.map(template => template.name)).toEqual(['클래식 모먼트']);
  });

  it('분류 이름으로 찾으면 그 분류의 표지만 남는다', () => {
    const results = filterInvitationTemplates(INVITATION_TEMPLATES, '돌잔치');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every(template => template.type === 'firstBirthday')).toBe(
      true
    );
  });

  it('대소문자를 구분하지 않고 표지 영문 문구도 찾는다', () => {
    const results = filterInvitationTemplates(INVITATION_TEMPLATES, 'forever');

    expect(results.length).toBeGreaterThan(0);
    expect(results.some(template => template.name === '클래식 모먼트')).toBe(
      true
    );
  });

  it('공백으로 나눈 여러 단어를 모두 만족하는 표지만 남긴다', () => {
    const results = filterInvitationTemplates(INVITATION_TEMPLATES, '생일 꽃');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every(template => template.type === 'birthday')).toBe(true);
    expect(results.every(template => template.name.includes('꽃'))).toBe(true);
  });

  it('큰 글씨 태그로 찾으면 큰 글씨 표지만 남는다', () => {
    const results = filterInvitationTemplates(INVITATION_TEMPLATES, '큰글씨');
    const largePrintTemplates = INVITATION_TEMPLATES.filter(
      template => template.largePrint
    );

    expect(largePrintTemplates.length).toBeGreaterThan(0);
    expect(results.map(template => template.id).sort()).toEqual(
      largePrintTemplates.map(template => template.id).sort()
    );
  });

  it('분류 이름 대신 쓰는 말로도 그 분류의 표지를 찾는다', () => {
    const 결과 = filterInvitationTemplates(INVITATION_TEMPLATES, '청첩장');
    const 웨딩 = INVITATION_TEMPLATES.filter(t => t.type === 'wedding');

    expect(웨딩.length).toBeGreaterThan(0);
    expect(결과.map(t => t.id).sort()).toEqual(웨딩.map(t => t.id).sort());
  });

  it('카드에 보이는 장소 이름으로도 찾는다', () => {
    const 결과 = filterInvitationTemplates(INVITATION_TEMPLATES, '야외');
    expect(결과.some(t => t.id === 'showcase-3')).toBe(true);

    const 그랜드볼룸 = filterInvitationTemplates(
      INVITATION_TEMPLATES,
      '그랜드볼룸'
    );
    expect(그랜드볼룸.map(t => t.id)).toContain('showcase-0');
    expect(그랜드볼룸.every(t => t.type === 'wedding')).toBe(true);
  });

  it('맞는 표지가 없으면 빈 배열을 돌려준다', () => {
    expect(
      filterInvitationTemplates(INVITATION_TEMPLATES, '없는검색어xyz')
    ).toEqual([]);
  });
});
