import sitemap from '@/app/sitemap';

describe('sitemap.xml', () => {
  const entries = sitemap();
  const urls = entries.map(entry => entry.url);

  it('공개 페이지 /, /gallery, /faq, /policy를 모두 담는다', () => {
    expect(urls).toEqual([
      'https://invia.co.kr',
      'https://invia.co.kr/gallery',
      'https://invia.co.kr/faq',
      'https://invia.co.kr/policy',
    ]);
  });

  it('/gallery는 홈 다음으로 높은 우선순위와 주간 갱신을 알린다', () => {
    const gallery = entries.find(entry => entry.url.endsWith('/gallery'));
    expect(gallery?.priority).toBe(0.8);
    expect(gallery?.changeFrequency).toBe('weekly');
  });

  it('모든 항목이 invia.co.kr 도메인을 쓴다', () => {
    urls.forEach(url => {
      expect(url.startsWith('https://invia.co.kr')).toBe(true);
    });
  });
});
