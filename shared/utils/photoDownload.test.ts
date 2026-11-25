import {
  buildPhotoFileName,
  fetchPhotoBlob,
  photoFileExtension,
  savePhotoToDevice,
} from './photoDownload';

type MockResponse = { ok: boolean; status?: number; blob: () => Promise<Blob> };

const mockFetchOnce = (response: MockResponse | Error) => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => {
    if (response instanceof Error) return Promise.reject(response);
    return Promise.resolve(response);
  });
};

describe('photoFileExtension', () => {
  it('URL 경로의 확장자를 사용한다', () => {
    expect(photoFileExtension('https://cdn.example.com/a/photo.png')).toBe(
      'png'
    );
    expect(
      photoFileExtension('https://cdn.example.com/a/photo.webp?w=800')
    ).toBe('webp');
    expect(photoFileExtension('https://cdn.example.com/a/photo.jpeg#top')).toBe(
      'jpg'
    );
  });

  it('blob 응답의 MIME 타입을 URL 확장자보다 우선한다', () => {
    expect(
      photoFileExtension('https://cdn.example.com/photo.jpg', 'image/png')
    ).toBe('png');
    expect(
      photoFileExtension('/api/drive/previewAsset?fileId=1', 'image/webp')
    ).toBe('webp');
    expect(
      photoFileExtension(
        '/api/drive/previewAsset?fileId=1',
        'image/png; charset=binary'
      )
    ).toBe('png');
  });

  it('확장자를 알 수 없으면 jpg로 저장한다', () => {
    expect(photoFileExtension('blob:https://invia.co.kr/1234')).toBe('jpg');
    expect(photoFileExtension('/api/drive/previewAsset?fileId=abc')).toBe(
      'jpg'
    );
    expect(photoFileExtension('https://cdn.example.com/a/photo.tiff')).toBe(
      'jpg'
    );
    expect(photoFileExtension('', 'application/octet-stream')).toBe('jpg');
  });
});

describe('buildPhotoFileName', () => {
  it('순번을 두 자리로 채운 invia-photo 파일명을 만든다', () => {
    expect(buildPhotoFileName('https://cdn.example.com/a.jpg', 0)).toBe(
      'invia-photo-01.jpg'
    );
    expect(buildPhotoFileName('https://cdn.example.com/a.png', 7)).toBe(
      'invia-photo-08.png'
    );
    expect(buildPhotoFileName('https://cdn.example.com/a.webp', 11)).toBe(
      'invia-photo-12.webp'
    );
  });

  it('잘못된 순번은 첫 번째 사진으로 처리한다', () => {
    expect(buildPhotoFileName('https://cdn.example.com/a.jpg', -3)).toBe(
      'invia-photo-01.jpg'
    );
    expect(
      buildPhotoFileName('https://cdn.example.com/a.jpg', Number.NaN)
    ).toBe('invia-photo-01.jpg');
  });
});

describe('fetchPhotoBlob', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('이미지 응답을 blob으로 돌려준다', async () => {
    const blob = new Blob(['image'], { type: 'image/png' });
    mockFetchOnce({ ok: true, blob: async () => blob });

    await expect(fetchPhotoBlob('https://cdn.example.com/a.png')).resolves.toBe(
      blob
    );
    expect(global.fetch).toHaveBeenCalledWith('https://cdn.example.com/a.png', {
      mode: 'cors',
    });
  });

  it('CORS 거부나 HTTP 오류는 예외로 알린다', async () => {
    mockFetchOnce(new TypeError('Failed to fetch'));
    await expect(
      fetchPhotoBlob('https://cdn.example.com/a.png')
    ).rejects.toThrow('Failed to fetch');

    mockFetchOnce({
      ok: false,
      status: 403,
      blob: async () => new Blob([]),
    });
    await expect(
      fetchPhotoBlob('https://cdn.example.com/a.png')
    ).rejects.toThrow('403');
  });

  it('이미지가 아닌 응답은 저장하지 않는다', async () => {
    mockFetchOnce({
      ok: true,
      blob: async () => new Blob(['<html></html>!'], { type: 'text/html' }),
    });
    await expect(
      fetchPhotoBlob('https://cdn.example.com/a.png')
    ).rejects.toThrow('이미지 응답이 아닙니다.');
  });
});

describe('savePhotoToDevice', () => {
  let clickedAnchors: HTMLAnchorElement[];

  beforeEach(() => {
    jest.useFakeTimers();
    clickedAnchors = [];
    global.fetch = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: jest.fn(() => 'blob:invia-photo'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: jest.fn(),
    });
    const createElement = document.createElement.bind(document);
    jest
      .spyOn(document, 'createElement')
      .mockImplementation((tagName: string) => {
        const element = createElement(tagName);
        if (element instanceof HTMLAnchorElement) clickedAnchors.push(element);
        return element;
      });
    // jsdom에서 앵커 클릭이 실제 내비게이션을 시도하지 않도록 막습니다.
    jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('blob 다운로드에 성공하면 순번이 붙은 파일명으로 저장한다', async () => {
    mockFetchOnce({
      ok: true,
      blob: async () => new Blob(['image'], { type: 'image/jpeg' }),
    });

    await expect(
      savePhotoToDevice('https://cdn.example.com/wedding/photo.jpg', 2)
    ).resolves.toBe('saved');

    expect(clickedAnchors).toHaveLength(1);
    expect(clickedAnchors[0].download).toBe('invia-photo-03.jpg');
    expect(clickedAnchors[0].href).toBe('blob:invia-photo');
    expect(clickedAnchors[0].isConnected).toBe(false);
  });

  it('CORS로 blob을 받지 못하면 원본 주소를 새 탭에서 연다', async () => {
    mockFetchOnce(new TypeError('Failed to fetch'));
    const src = 'https://drive.google.com/thumbnail?id=abc';

    await expect(savePhotoToDevice(src, 0)).resolves.toBe('opened');

    expect(clickedAnchors).toHaveLength(1);
    expect(clickedAnchors[0].href).toBe(src);
    expect(clickedAnchors[0].target).toBe('_blank');
    expect(clickedAnchors[0].rel).toBe('noopener noreferrer');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('blob URL 생성이 막히는 브라우저에서도 새 탭 열기로 폴백한다', async () => {
    mockFetchOnce({
      ok: true,
      blob: async () => new Blob(['image'], { type: 'image/png' }),
    });
    (URL.createObjectURL as jest.Mock).mockImplementation(() => {
      throw new Error('not supported');
    });

    await expect(
      savePhotoToDevice('https://cdn.example.com/photo.png', 0)
    ).resolves.toBe('opened');
    expect(clickedAnchors[0].target).toBe('_blank');
  });

  it('주소가 비어 있으면 아무 것도 열지 않는다', async () => {
    await expect(savePhotoToDevice('', 0)).resolves.toBe('failed');
    expect(clickedAnchors).toHaveLength(0);
  });
});
