export const SITE_URL = 'https://invia.co.kr';

/** 브라우저 탭·검색 결과에 노출되는 서비스 이름 (한글명 + 영문명) */
export const SERVICE_NAME = '인비아(Invia)';

export const DEFAULT_TITLE = '인비아(Invia) | 무료 모바일 청첩장, 초대장의 새로운 기준';

export const DEFAULT_DESCRIPTION =
  '무료 모바일 청첩장부터 돌잔치·생일·세미나 초대장까지, 인비아(Invia)에서 예쁜 디자인을 골라 링크로 마음을 전하세요.';

/**
 * 사이트 전역 `WebSite` 구조화 데이터.
 * 검색엔진이 '인비아'와 'Invia'를 같은 서비스로 인식하도록 한글명·영문명을 함께 알린다.
 */
export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '인비아',
  alternateName: ['Invia'],
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  inLanguage: 'ko-KR',
} as const;

/** `<script type="application/ld+json">`에 넣을 때 HTML이 조기 종료되지 않도록 `<`를 이스케이프한다. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
