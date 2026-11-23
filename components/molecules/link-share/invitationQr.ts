import { toCanvas } from 'qrcode';

export async function toDataURL(
  url: string,
  options: { width: number; margin: number }
): Promise<string> {
  const canvas = await toCanvas(url, { ...options, errorCorrectionLevel: 'H' });
  const favicon = new Image();
  favicon.src = '/favicon.ico';
  try {
    await favicon.decode();
  } catch {
    // Keep the invitation scannable if the decorative image is unavailable.
    return canvas.toDataURL('image/png');
  }

  const context = canvas.getContext('2d');
  if (!context) throw new Error('QR 캔버스를 열 수 없어요.');
  const center = canvas.width / 2;
  const diameter = canvas.width / 6;
  const iconSize = diameter * 0.68;
  context.beginPath();
  context.arc(center, center, diameter / 2, 0, Math.PI * 2);
  context.fillStyle = '#fff';
  context.fill();
  context.lineWidth = canvas.width / 1024;
  context.strokeStyle = '#dedbd8';
  context.stroke();
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    favicon,
    center - iconSize / 2,
    center - iconSize / 2,
    iconSize,
    iconSize
  );
  return canvas.toDataURL('image/png');
}
