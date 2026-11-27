import {
  decodePoints,
  encodedToPath,
  encodePoints,
  isClosedPolyline,
  isPointInFrame,
  projectPoint,
  simplifyPolyline,
} from './projection';

describe('projectPoint', () => {
  const frame = { lat: 37.5088, lng: 127.0606, radius: 500 };

  it('예식장 좌표는 뷰박스 중앙(500,500)에 놓인다', () => {
    const point = projectPoint(37.5088, 127.0606, frame);
    expect(point.x).toBeCloseTo(500, 6);
    expect(point.y).toBeCloseTo(500, 6);
  });

  it('반경만큼 동쪽으로 이동하면 오른쪽 끝에 닿는다', () => {
    const dLng = 500 / (111320 * Math.cos((37.5088 * Math.PI) / 180));
    const point = projectPoint(37.5088, 127.0606 + dLng, frame);
    expect(point.x).toBeCloseTo(1000, 0);
    expect(point.y).toBeCloseTo(500, 6);
  });

  it('북쪽은 위쪽(작은 y)으로 투영된다', () => {
    const dLat = 500 / 111320;
    const point = projectPoint(37.5088 + dLat, 127.0606, frame);
    expect(point.y).toBeCloseTo(0, 0);
    expect(point.x).toBeCloseTo(500, 6);
  });

  it('반경이 커지면 같은 거리가 중앙에 더 가깝게 그려진다', () => {
    const dLat = 250 / 111320;
    const narrow = projectPoint(37.5088 + dLat, 127.0606, {
      ...frame,
      radius: 500,
    });
    const wide = projectPoint(37.5088 + dLat, 127.0606, {
      ...frame,
      radius: 1000,
    });
    expect(500 - narrow.y).toBeCloseTo(250, 0);
    expect(500 - wide.y).toBeCloseTo(125, 0);
  });
});

describe('simplifyPolyline', () => {
  it('직선 위의 중간점은 제거하고 양 끝점은 유지한다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
    ];
    const simplified = simplifyPolyline(points, 2);
    expect(simplified).toEqual([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
    ]);
  });

  it('허용 오차보다 크게 꺾이는 점은 남긴다', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 25, y: 20 },
      { x: 50, y: 0 },
    ];
    expect(simplifyPolyline(points, 3)).toHaveLength(3);
    expect(simplifyPolyline(points, 40)).toHaveLength(2);
  });

  it('점이 2개 이하면 그대로 돌려준다', () => {
    const points = [{ x: 1, y: 1 }];
    expect(simplifyPolyline(points, 5)).toBe(points);
  });
});

describe('좌표 문자열 인코딩', () => {
  it('정수 좌표 문자열로 압축하고 다시 복원한다', () => {
    const points = [
      { x: 10.4, y: 20.6 },
      { x: 30.2, y: 40 },
    ];
    const encoded = encodePoints(points);
    expect(encoded).toBe('10,21 30,40');
    expect(decodePoints(encoded)).toEqual([
      { x: 10, y: 21 },
      { x: 30, y: 40 },
    ]);
  });

  it('잘못된 조각은 건너뛴다', () => {
    expect(decodePoints('10,20 30,x 40,50')).toEqual([
      { x: 10, y: 20 },
      { x: 40, y: 50 },
    ]);
    expect(decodePoints('')).toEqual([]);
  });

  it('SVG path 문자열로 변환한다', () => {
    expect(encodedToPath('0,0 10,10 20,0')).toBe('M0 0 L10 10 L20 0');
    expect(encodedToPath('0,0 10,10 0,0', true)).toBe(
      'M0 0 L10 10 L0 0 Z'
    );
    expect(encodedToPath('')).toBe('');
  });
});

describe('isClosedPolyline / isPointInFrame', () => {
  it('시작점과 끝점이 같으면 닫힌 폴리곤으로 본다', () => {
    expect(
      isClosedPolyline([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 0 },
      ])
    ).toBe(true);
    expect(
      isClosedPolyline([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 20, y: 20 },
      ])
    ).toBe(false);
  });

  it('여유 범위를 넘어간 점은 프레임 밖으로 판정한다', () => {
    expect(isPointInFrame({ x: 500, y: 500 })).toBe(true);
    expect(isPointInFrame({ x: -10, y: 500 })).toBe(false);
    expect(isPointInFrame({ x: -10, y: 500 }, 1000, 20)).toBe(true);
  });
});
