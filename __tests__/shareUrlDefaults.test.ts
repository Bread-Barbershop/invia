import {
  DEFAULT_IMAGE_URL,
  DEFAULT_TITLE,
  hydrateShareUrlState,
  resolveInvitationShareTitles,
  resolveShareImageUrl,
} from '@/shared/utils/shareUrlDefaults';

describe('공유 제목 상속', () => {
  it.each([
    ['', '', DEFAULT_TITLE, DEFAULT_TITLE],
    ['  카카오 제목  ', ' ', '카카오 제목', '카카오 제목'],
    ['', '링크 제목', '링크 제목', '링크 제목'],
    ['카카오 제목', '링크 제목', '카카오 제목', '링크 제목'],
    [DEFAULT_TITLE, '링크 제목', DEFAULT_TITLE, '링크 제목'],
  ])(
    '원본 입력 %j, %j를 카카오 %j, 링크 %j로 표시한다',
    (title, urlTitle, kakaoTitle, linkTitle) => {
      expect(
        resolveInvitationShareTitles({ titleFormat: 'raw', title, urlTitle })
      ).toEqual({ kakaoTitle, linkTitle });
    }
  );

  it('다시 열 때 비어 있던 제목은 이어서 상속하고 직접 입력한 같은 제목은 독립적으로 유지한다', () => {
    const legacy = hydrateShareUrlState({
      title: DEFAULT_TITLE,
      urlTitle: '처음 제목',
    });
    const explicit = hydrateShareUrlState({
      titleFormat: 'raw',
      title: '처음 제목',
      urlTitle: '처음 제목',
    });

    expect(legacy.title).toBe('');
    expect(
      resolveInvitationShareTitles({ ...legacy, urlTitle: '바뀐 제목' }).kakaoTitle
    ).toBe('바뀐 제목');
    expect(
      resolveInvitationShareTitles({ ...explicit, urlTitle: '바뀐 제목' }).kakaoTitle
    ).toBe('처음 제목');
  });
});

describe('resolveShareImageUrl', () => {
  it('returns default absolute url when imageFileId is missing', () => {
    expect(resolveShareImageUrl(undefined, 'http://localhost:3000')).toBe(
      `http://localhost:3000${DEFAULT_IMAGE_URL}`
    );
  });

  it('returns default absolute url when imageFileId is empty string', () => {
    expect(resolveShareImageUrl('', 'http://localhost:3000')).toBe(
      `http://localhost:3000${DEFAULT_IMAGE_URL}`
    );
  });

  it('returns default absolute url when imageFileId is whitespace', () => {
    expect(resolveShareImageUrl('   ', 'http://localhost:3000')).toBe(
      `http://localhost:3000${DEFAULT_IMAGE_URL}`
    );
  });

  it('returns drive url when imageFileId exists', () => {
    expect(resolveShareImageUrl('abc123', 'http://localhost:3000')).toBe(
      'https://lh3.googleusercontent.com/d/abc123'
    );
  });

  it('returns relative default url only when origin is missing', () => {
    expect(resolveShareImageUrl(undefined)).toBe(DEFAULT_IMAGE_URL);
  });
});
