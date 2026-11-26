export type AudienceVisibility = {
  published: boolean;
  /** The empty slug is the default invitation. Choices survive a master switch change. */
  publicSlugs: string[];
  revision: string;
  pending: boolean;
};

export type AudienceVisibilityOptions = {
  groups: { slug: string; name: string }[];
  visibility: AudienceVisibility;
};

export type AudienceVisibilityStatus =
  | 'public'
  | 'partial'
  | 'private'
  | 'pending';

export type GroupShareVisibility = Exclude<AudienceVisibilityStatus, 'partial'>;

export function removeDeletedAudienceFromVisibility(
  visibility: AudienceVisibility,
  deletedSlug: string,
  remainingGroupSlugs: string[],
  revision: string
): AudienceVisibility {
  const remaining = new Set(remainingGroupSlugs);
  const publicSlugs = visibility.publicSlugs.filter(
    slug => slug !== deletedSlug && remaining.has(slug)
  );
  return {
    ...visibility,
    published: visibility.published && publicSlugs.length > 0,
    publicSlugs,
    revision,
  };
}

export function visibilityStatus({
  groups,
  visibility,
}: AudienceVisibilityOptions): AudienceVisibilityStatus {
  if (visibility.pending) return 'pending';
  if (!visibility.published) return 'private';
  return groups.every(group => visibility.publicSlugs.includes(group.slug))
    ? 'public'
    : 'partial';
}
