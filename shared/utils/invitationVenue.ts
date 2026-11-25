import { isJsonRecord } from '@/shared/utils/json';

export interface InvitationVenue {
  /** Venue name, e.g. `인비아 하우스`. */
  name: string;
  /** Floor / hall, e.g. `3층 그랜드홀`. */
  detail: string;
  /** Street address. */
  address: string;
  /** Single line combining name, detail and address, empty when nothing was entered. */
  location: string;
}

const EMPTY_VENUE: InvitationVenue = {
  name: '',
  detail: '',
  address: '',
  location: '',
};

const readText = (props: Record<string, unknown>, key: string) => {
  const value = props[key];
  return typeof value === 'string' ? value.trim() : '';
};

/**
 * Guests get the venue from the invitation's place block, so the add-to-calendar
 * action never asks them to type anything. The first place block that carries a
 * venue wins; invitations without one simply save the schedule without a location.
 */
export function resolveInvitationVenue(
  blocks?: readonly unknown[] | null
): InvitationVenue {
  if (!blocks) return EMPTY_VENUE;
  for (const block of blocks) {
    if (!isJsonRecord(block) || block.component !== 'place') continue;
    if (!isJsonRecord(block.props)) continue;
    const name = readText(block.props, 'placeName');
    const detail = readText(block.props, 'placeDetail');
    const address = readText(block.props, 'placeAddress');
    const location = [name, detail, address].filter(Boolean).join(', ');
    if (!location) continue;
    return { name, detail, address, location };
  }
  return EMPTY_VENUE;
}
