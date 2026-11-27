import {
  removeDeletedAudienceFromVisibility,
  type AudienceVisibility,
} from './visibility';

describe('removeDeletedAudienceFromVisibility', () => {
  it('마지막 공개 그룹을 삭제해도 비공개인 기본 초대장을 공개하지 않는다', () => {
    const visibility: AudienceVisibility = {
      published: true,
      publicSlugs: ['family'],
      revision: 'before',
      pending: false,
    };

    expect(
      removeDeletedAudienceFromVisibility(visibility, 'family', [''], 'after')
    ).toEqual({
      published: false,
      publicSlugs: [],
      revision: 'after',
      pending: false,
    });
  });

  it('전체 비공개 상태에서 남은 공개 선택을 기억한다', () => {
    const visibility: AudienceVisibility = {
      published: false,
      publicSlugs: ['', 'family', 'friends'],
      revision: 'before',
      pending: false,
    };

    expect(
      removeDeletedAudienceFromVisibility(
        visibility,
        'family',
        ['', 'friends'],
        'after'
      )
    ).toEqual({
      published: false,
      publicSlugs: ['', 'friends'],
      revision: 'after',
      pending: false,
    });
  });

  it('기본 초대장이 공개 선택에 남아 있으면 삭제 뒤에도 공개를 유지한다', () => {
    const visibility: AudienceVisibility = {
      published: true,
      publicSlugs: ['', 'family'],
      revision: 'before',
      pending: false,
    };

    expect(
      removeDeletedAudienceFromVisibility(visibility, 'family', [''], 'after')
    ).toEqual({
      published: true,
      publicSlugs: [''],
      revision: 'after',
      pending: false,
    });
  });
});
