import { isJsonRecord } from '@/shared/utils/json';
import { DEFAULT_TITLE } from '@/shared/utils/shareUrlDefaults';

export function customShareTitle(value: unknown) {
  const title = typeof value === 'string' ? value.trim() : '';
  return title === DEFAULT_TITLE ? '' : title;
}

export function titleFromSavedInvitation(data: unknown) {
  if (!isJsonRecord(data)) return '';
  if (isJsonRecord(data.shareUrl)) {
    const title =
      customShareTitle(data.shareUrl.urlTitle) ||
      customShareTitle(data.shareUrl.title);
    if (title) return title;
  }

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
