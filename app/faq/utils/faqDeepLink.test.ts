import {
  faqAnchorId,
  faqShareUrl,
  findFaqItemByAnchor,
  parseFaqHash,
} from './faqDeepLink';

describe('FAQ 답변 딥링크', () => {
  it('답변 id를 앵커 id로 만든다', () => {
    expect(faqAnchorId('share-link')).toBe('faq-share-link');
  });

  it.each([
    ['#faq-share-link', 'share-link'],
    ['faq-share-link', 'share-link'],
    ['  #faq-scheduled-privacy  ', 'scheduled-privacy'],
    ['#faq-drive-access-range', 'drive-access-range'],
  ])('%s 해시에서 답변 id를 읽는다', (hash, expected) => {
    expect(parseFaqHash(hash)).toBe(expected);
  });

  it.each([
    ['', '빈 해시'],
    ['#', '샵만 있는 해시'],
    ['#faq-', '답변 id가 없는 해시'],
    ['#section-2', '다른 페이지 앵커'],
    ['#faq', 'prefix만 있는 해시'],
    ['#faq-%E0%A4%A', '깨진 인코딩'],
  ])('%s는 답변 딥링크로 보지 않는다 (%s)', hash => {
    expect(parseFaqHash(hash)).toBeNull();
  });

  const items = [{ id: 'share-link' }, { id: 'google-login' }];

  it('해시가 가리키는 답변을 찾는다', () => {
    expect(findFaqItemByAnchor(items, '#faq-google-login')).toEqual({
      id: 'google-login',
    });
  });

  it('없는 답변이나 딥링크가 아닌 해시에는 null을 돌려준다', () => {
    expect(findFaqItemByAnchor(items, '#faq-delete-invitation')).toBeNull();
    expect(findFaqItemByAnchor(items, '#policy')).toBeNull();
    expect(findFaqItemByAnchor(items, '')).toBeNull();
  });

  it('공유 주소는 사이트 주소와 /faq, 앵커로 만든다', () => {
    expect(faqShareUrl('share-link', 'https://invia.co.kr')).toBe(
      'https://invia.co.kr/faq#faq-share-link'
    );
  });

  it('끝에 슬래시가 붙은 주소도 같은 공유 주소가 된다', () => {
    expect(faqShareUrl('share-link', 'https://dev.invia.co.kr/')).toBe(
      'https://dev.invia.co.kr/faq#faq-share-link'
    );
  });
});
