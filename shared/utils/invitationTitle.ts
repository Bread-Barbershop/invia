import { isJsonRecord } from '@/shared/utils/json';
import { DEFAULT_TITLE } from '@/shared/utils/shareUrlDefaults';

export function customShareTitle(value: unknown) {
  const title = typeof value === 'string' ? value.trim() : '';
  return title === DEFAULT_TITLE || title === '소중한 분들을 초대합니다.' ? '' : title;
}

export function eventNameFromBlocks(blocks: unknown): string {
  if (!Array.isArray(blocks)) return '';
  for (const block of blocks) {
    if (block?.component !== 'closingComment') continue;
    const name = block.props?.eventName;
    if (typeof name === 'string' && name.trim()) return name.trim();
  }
  return '';
}

/** Only suggest the event name when the author left both sharing titles empty. */
export function eventShareFallback(
  share: { title?: string; urlTitle?: string; titleFormat?: string } | undefined,
  blocks: unknown
) {
  const hasTitle = (value?: string) => {
    const title = value?.trim();
    return title && (share?.titleFormat === 'raw' || title !== DEFAULT_TITLE);
  };
  return hasTitle(share?.title) || hasTitle(share?.urlTitle)
    ? ''
    : eventNameFromBlocks(blocks);
}

export function titleFromSavedInvitation(data: unknown) {
  if (!isJsonRecord(data)) return '';
  if (isJsonRecord(data.shareUrl)) {
    const title =
      customShareTitle(data.shareUrl.urlTitle) ||
      customShareTitle(data.shareUrl.title);
    if (title) return title;
  }

  const eventName = eventNameFromBlocks(data.blocks);
  if (eventName) return eventName;
  if (!Array.isArray(data.blocks)) return '';
  for (const block of data.blocks) {
    if (!isJsonRecord(block) || !isJsonRecord(block.props)) continue;
    const { groom, bride, brideFirst, name } = block.props;
    if (block.component === 'coupleIntroduction') {
      const names = (brideFirst === true ? [bride, groom] : [groom, bride])
        .filter((value): value is string => typeof value === 'string')
        .map(value => value.trim())
        .filter(Boolean);
      if (names.length) return `${names.join('·')} 결혼식`;
    }
    if (
      block.component === 'myChild' &&
      typeof name === 'string' &&
      name.trim()
    ) {
      if (block.type === 'firstBirthday') return `${name.trim()} 돌잔치`;
      if (block.type === 'birthday') return `${name.trim()} 생일`;
    }
  }
  return '';
}
