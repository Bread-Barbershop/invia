export const FAQ_ANCHOR_PREFIX = 'faq-';

/** The id a single FAQ item gets in the page, e.g. `faq-share-link`. */
export function faqAnchorId(itemId: string) {
  return `${FAQ_ANCHOR_PREFIX}${itemId}`;
}

/**
 * Reads the item id out of a location hash such as `#faq-share-link`.
 * Returns `null` for an empty hash, another page's anchor, or a malformed one.
 */
export function parseFaqHash(hash: string): string | null {
  const raw = hash.trim().replace(/^#/, '');
  if (!raw) return null;

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }

  if (!decoded.startsWith(FAQ_ANCHOR_PREFIX)) return null;

  const itemId = decoded.slice(FAQ_ANCHOR_PREFIX.length).trim();
  return itemId.length > 0 ? itemId : null;
}

/** Finds the FAQ item a hash points at, or `null` when the hash names no item. */
export function findFaqItemByAnchor<T extends { id: string }>(
  items: readonly T[],
  hash: string
): T | null {
  const itemId = parseFaqHash(hash);
  if (!itemId) return null;

  return items.find(item => item.id === itemId) ?? null;
}

/** The shareable absolute address of one FAQ answer. */
export function faqShareUrl(itemId: string, origin: string) {
  const base = origin.trim().replace(/\/+$/, '');
  return `${base}/faq#${faqAnchorId(itemId)}`;
}
