import { safeNavigationUrl } from './navigationUrl';

export interface TransportationSummaryProps {
  title?: string;
  subwayLine?: string;
  subwayStation?: string;
  subwayExit?: string;
  subwayWalk?: string;
  busRoutes?: string;
  shuttleStop?: string;
  shuttleInterval?: string;
  parkingHours?: string;
  alternativeParking?: string;
  navigationUrl?: string;
}

const clean = (value?: string) => (value ?? '').trim();

const joinDetails = (...values: (string | undefined)[]) =>
  values.map(clean).filter(Boolean).join(' · ');

/**
 * 화면에 보이는 교통·주차 안내를 메신저로 그대로 붙여넣을 수 있는 문장으로 만듭니다.
 * 보여줄 내용이 하나도 없으면 빈 문자열을 반환합니다.
 */
export function buildTransportationSummary(
  props: TransportationSummaryProps
): string {
  const subway = joinDetails(
    props.subwayLine,
    props.subwayStation,
    props.subwayExit
  );
  const walk = clean(props.subwayWalk);
  const bus = clean(props.busRoutes);
  const shuttle = joinDetails(props.shuttleStop, props.shuttleInterval);
  const parking = joinDetails(props.parkingHours, props.alternativeParking);
  const navigationUrl = safeNavigationUrl(props.navigationUrl);

  const lines = [
    subway ? `지하철: ${subway}${walk ? ` (${walk})` : ''}` : '',
    !subway && walk ? `도보: ${walk}` : '',
    bus ? `버스: ${bus}` : '',
    shuttle ? `셔틀버스: ${shuttle}` : '',
    parking ? `자가용/주차: ${parking}` : '',
    navigationUrl ? `지도: ${navigationUrl}` : '',
  ].filter((line): line is string => Boolean(line));

  if (lines.length === 0) return '';

  const title = clean(props.title) || '오시는 길 안내';
  return `${title}\n\n${lines.join('\n')}`;
}
