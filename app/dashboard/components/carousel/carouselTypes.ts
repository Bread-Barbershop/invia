import { StaticImageData } from 'next/image';

import { InviteListItem } from '@/app/dashboard/types';
import type { GroupShareVisibility } from '@/features/invitation/audiences/visibility';

export type CarouselCardItem = {
  id: string;
  image: string | StaticImageData;
  fallbackImage?: string | StaticImageData;
  alt: string;
  invite?: InviteListItem;
};

export type ShareOption = {
  folderId: string;
  name: string;
  url: string;
  visibility: GroupShareVisibility;
};

export type ShareAudienceLink = (folderId: string, option: ShareOption) => void;

export type ShareAudienceWithKakao = (
  rootFolderId: string,
  option: ShareOption,
  signal: AbortSignal
) => Promise<void>;
