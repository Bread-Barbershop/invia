/** @jest-environment node */

import { GET } from './route';

const ROAD_ELEMENT = {
  type: 'way',
  id: 1,
  tags: { highway: 'primary', name: '언주로' },
  geometry: [
    { lat: 37.5098, lon: 127.059 },
    { lat: 37.5098, lon: 127.0622 },
  ],
};

function buildRequest(params: Record<string, string | number>) {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  );
  return { url: `http://localhost/api/map/sketch?${query.toString()}` } as Request;
}

function okResponse(elements: unknown[]) {
  return { ok: true, status: 200, json: async () => ({ elements }) };
}

describe('GET /api/map/sketch', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('좌표가 없으면 400을 돌려준다', async () => {
    const response = await GET(buildRequest({ lat: 0, lng: 0 }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe('invalid_params');
  });

  it('지원 범위를 벗어난 반경은 400으로 거절한다', async () => {
    const response = await GET(
      buildRequest({ lat: 37.5088, lng: 127.0606, radius: 5000 })
    );
    expect(response.status).toBe(400);
  });

  it('Overpass 응답을 약도 데이터로 변환해 돌려준다', async () => {
    global.fetch = jest.fn().mockResolvedValue(okResponse([ROAD_ELEMENT]));

    const response = await GET(
      buildRequest({
        lat: 37.5098,
        lng: 127.0606,
        radius: 500,
        density: 'standard',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data.roads).toHaveLength(1);
    expect(payload.data.roads[0].c).toBe('major');
    expect(response.headers.get('Cache-Control')).toContain('s-maxage');
  });

  it('같은 조건의 두 번째 요청은 캐시에서 즉시 응답한다', async () => {
    const fetchMock = jest.fn().mockResolvedValue(okResponse([ROAD_ELEMENT]));
    global.fetch = fetchMock;
    const params = { lat: 37.5108, lng: 127.0616, radius: 500 };

    const first = await GET(buildRequest(params));
    const callsAfterFirst = fetchMock.mock.calls.length;
    const second = await GET(buildRequest(params));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.headers.get('X-Sketch-Cache')).toBe('hit');
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);
  });

  it('도로 데이터가 없으면 422로 안내한다', async () => {
    global.fetch = jest.fn().mockResolvedValue(okResponse([]));

    const response = await GET(
      buildRequest({ lat: 37.5208, lng: 127.0706, radius: 500 })
    );
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.code).toBe('no_road_data');
  });

  it('모든 미러가 실패하면 503을 돌려준다', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 502, json: async () => ({}) });
    global.fetch = fetchMock;

    const response = await GET(
      buildRequest({ lat: 37.5308, lng: 127.0806, radius: 500 })
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.code).toBe('upstream_unavailable');
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
