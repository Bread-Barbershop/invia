import { FAQ_ITEMS } from './data';
import {
  filterFaqItems,
  matchesFaqQuery,
  normalizeFaqSearchText,
} from './search';

const ALL = { category: 'all' as const };
const idsOf = (query: string, category: 'all' | 'account' = 'all') =>
  filterFaqItems(FAQ_ITEMS, { category, query }).map(item => item.id);

describe('FAQ 검색', () => {
  it('본문에 없는 별칭 "드라이브"로도 저장소 관련 문항을 찾는다', () => {
    const ids = idsOf('드라이브');

    expect(ids).toEqual(
      expect.arrayContaining([
        'save-progress',
        'drive-access-range',
        'drive-storage',
        'drive-data-safety',
        'drive-storage-capacity',
      ])
    );
  });

  it('"구글 드라이브"·"Google Drive"·"drive"도 같은 문항을 찾는다', () => {
    ['구글 드라이브', '구글드라이브', 'Google Drive', 'drive'].forEach(query => {
      expect(idsOf(query)).toEqual(expect.arrayContaining(['drive-storage']));
    });
  });

  it('기존 본문 검색은 그대로 동작한다', () => {
    expect(idsOf('카카오톡')).toContain('share-link');
    expect(idsOf('로그인')).toContain('google-login');
  });

  it('여러 단어는 모두 포함하는 문항만 남긴다', () => {
    const ids = idsOf('드라이브 용량');

    expect(ids).toEqual(['drive-storage-capacity']);
  });

  it('검색어가 비어 있으면 모든 문항이 남는다', () => {
    expect(filterFaqItems(FAQ_ITEMS, { ...ALL, query: '   ' })).toHaveLength(
      FAQ_ITEMS.length
    );
  });

  it('카테고리와 검색어를 함께 적용한다', () => {
    const accountIds = idsOf('드라이브', 'account');

    expect(accountIds).toEqual(
      expect.arrayContaining(['drive-storage', 'drive-storage-capacity'])
    );
    expect(accountIds).not.toContain('save-progress');
  });

  it('대소문자·띄어쓰기·문장부호 차이를 무시한다', () => {
    expect(normalizeFaqSearchText(' Google  Drive ')).toBe('googledrive');
    expect(matchesFaqQuery(FAQ_ITEMS[0], 'INVIA')).toBe(true);
  });
});
