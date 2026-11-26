const ALLOWED_HOSTS = [
  'map.naver.com',
  'naver.me',
  'map.kakao.com',
  'kko.to',
  'tmap.co.kr',
  'www.tmap.co.kr',
  'maps.google.com',
  'www.google.com',
];

/**
 * 지하철역·정류장 이름처럼 지도에서 바로 검색할 수 있는 키워드만 뽑아냅니다.
 * "압구정역 2번 출구" → "압구정역", "3호선 압구정역" → "3호선 압구정역".
 * 지도 검색어로 쓸 수 없는 문장은 null을 반환해 링크를 만들지 않습니다.
 */
const STATION_KEYWORD =
  /([가-힣A-Za-z0-9][가-힣A-Za-z0-9.\s]{0,24}?(?:역|정류장|터미널|Station|station))(?=\s|$|[(),·])/;

export function safeNavigationUrl(input: unknown): string | null {
  if (typeof input !== 'string' || input.trim().length === 0 || input.length > 2048) return null;
  try {
    const url = new URL(input);
    if (
      url.protocol !== 'https:' ||
      !ALLOWED_HOSTS.includes(url.hostname.toLowerCase()) ||
      (url.username || url.password)
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * 호스트가 내비게이션 링크를 직접 넣지 않아도, 하객이 하차 역·정류장을
 * 한 번에 지도에서 찾아볼 수 있도록 네이버 지도 검색 링크를 만듭니다.
 */
export function buildStationMapSearchUrl(station: unknown): string | null {
  if (typeof station !== 'string') return null;
  const value = station.trim();
  if (!value || value.length > 80) return null;

  const keyword = value
    .match(STATION_KEYWORD)?.[1]
    ?.replace(/\s+/g, ' ')
    .trim();
  if (!keyword) return null;

  return `https://map.naver.com/p/search/${encodeURIComponent(keyword)}`;
}
