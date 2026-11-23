import { QR_DATA_URL, SHARE_URL } from './fixtures/shareLink';
import { toDataURL } from './invitationQr';

const mockToCanvas = jest.fn();
jest.mock('qrcode', () => ({
  toCanvas: (...args: unknown[]) => mockToCanvas(...args),
}));

describe('초대장 QR PNG', () => {
  function setup() {
    const context = {
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      drawImage: jest.fn(),
    };
    const exportPng = jest.fn().mockReturnValue(QR_DATA_URL);
    mockToCanvas.mockResolvedValue({
      width: 1024,
      getContext: () => context,
      toDataURL: exportPng,
    });
    const favicon = document.createElement('img');
    favicon.decode = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(window, 'Image').mockImplementation(() => favicon);
    return { context, exportPng, favicon };
  }

  afterEach(() => jest.restoreAllMocks());

  it('하객 주소를 높은 오류 정정 수준으로 인코딩하고 PNG 중앙에 원과 파비콘을 그린다', async () => {
    const { context, exportPng, favicon } = setup();
    const url = new URL(SHARE_URL);
    url.searchParams.set('to', 'family');
    const png = await toDataURL(url.href);
    expect(mockToCanvas).toHaveBeenCalledWith(url.href, {
      width: 1024,
      margin: 4,
      errorCorrectionLevel: 'H',
    });
    expect(favicon.getAttribute('src')).toBe('/favicon.ico');
    expect(context.arc).toHaveBeenCalledWith(
      512,
      512,
      1024 / 12,
      0,
      2 * Math.PI
    );
    const [image, x, y, width, height] = context.drawImage.mock.calls[0];
    expect(image).toBe(favicon);
    expect(x + width / 2).toBe(512);
    expect(y + height / 2).toBe(512);
    expect(context.fill).toHaveBeenCalled();
    expect(exportPng).toHaveBeenCalledWith('image/png');
    expect(png).toBe(QR_DATA_URL);
  });

  it('파비콘을 불러오지 못하면 QR을 가리지 않고 저장한다', async () => {
    const { context, favicon } = setup();
    jest
      .mocked(favicon.decode)
      .mockRejectedValue(new Error('image unavailable'));
    await expect(toDataURL(SHARE_URL)).resolves.toBe(QR_DATA_URL);
    expect(context.fill).not.toHaveBeenCalled();
    expect(context.drawImage).not.toHaveBeenCalled();
  });
});
