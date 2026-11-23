// Reserve room for the audience and extension on filesystems with a 255-byte limit.
function fileLabel(text: string, maxBytes: number) {
  const cleaned = text
    .normalize('NFC')
    .replace(/[<>:"/\\|?*\p{Cc}\p{Zl}\p{Zp}]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(/^[. ]+|[. ]+$/g, '')
    .replace(/^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])\s*\./i, '_$&');
  if (new Blob([cleaned]).size <= maxBytes) return cleaned;
  let label = '';
  let bytes = 0;
  for (const character of cleaned) {
    bytes += new Blob([character]).size;
    if (bytes > maxBytes) break;
    label += character;
  }
  return label.trimEnd();
}

export function qrDownloadName(eventTitle: string, audienceName?: string) {
  const audience = fileLabel(audienceName ?? '', 120);
  const suffix = (audience ? ` - ${audience}` : '') + ' QR.png';
  const title =
    fileLabel(eventTitle, 255 - new Blob([suffix]).size) || '초대장';
  return title + suffix;
}
