import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SERVICE_NAME,
  WEBSITE_JSON_LD,
  serializeJsonLd,
} from '@/shared/config/seo';

describe('SEO 메타데이터', () => {
  it('타이틀·설명·서비스 이름에 인비아(Invia)가 함께 들어간다', () => {
    [DEFAULT_TITLE, DEFAULT_DESCRIPTION, SERVICE_NAME].forEach(text => {
      expect(text).toContain('인비아');
      expect(text).toContain('Invia');
    });
  });

  it('타이틀과 설명에 "무료 모바일 청첩장" 키워드를 담는다', () => {
    expect(DEFAULT_TITLE).toContain('무료 모바일 청첩장');
    expect(DEFAULT_DESCRIPTION).toContain('무료 모바일 청첩장');
  });

  it('설명이 현재 열린 초대장 카테고리를 빠짐없이 알린다', () => {
    ['청첩장', '돌잔치', '생일', '세미나', '브라이덜샤워'].forEach(category => {
      expect(DEFAULT_DESCRIPTION).toContain(category);
    });
  });

  it('"개인정보 없이"처럼 오해를 부르는 문구는 쓰지 않는다', () => {
    expect(DEFAULT_DESCRIPTION).not.toContain('개인정보 없이');
    expect(DEFAULT_TITLE).not.toContain('개인정보 없이');
  });

  it('WebSite JSON-LD가 schema.org 형식을 지킨다', () => {
    expect(WEBSITE_JSON_LD).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '인비아',
      alternateName: ['Invia'],
      url: 'https://invia.co.kr',
    });
  });

  it('JSON-LD 직렬화 결과가 </script>로 스크립트를 조기 종료하지 않는다', () => {
    const html = serializeJsonLd({ text: '</script>' });
    expect(html).not.toContain('<');
    expect(JSON.parse(html)).toEqual({ text: '</script>' });
  });
});
