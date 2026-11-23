import { toPngBytes } from '@/components/molecules/link-share/invitationQr';
import { buildZip, type ZipEntry } from '@/shared/utils/buildZip';

import type { ShareOption } from '../../carouselTypes';

export async function buildQrArchive(
  options: ShareOption[],
  signal: AbortSignal
) {
  const entries: ZipEntry[] = [];
  for (const option of options) {
    signal.throwIfAborted();
    entries.push({
      path: option.downloadName,
      data: await toPngBytes(option.url),
    });
  }
  signal.throwIfAborted();
  return buildZip(entries);
}
