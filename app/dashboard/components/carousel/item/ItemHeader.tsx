import type { InviteListItem } from '@/app/dashboard/types';

import { dashboardCarouselLayout } from '../carouselLayout';

import VisibilityToggle from './VisibilityToggle';

type ItemHeaderProps = {
  hasAudienceGroups?: boolean;
  audienceVisibility?: InviteListItem['audienceVisibility'];
  invitationTitle: string;
  isPublished: boolean;
  disabled?: boolean;
  isBusy?: boolean;
  hasError?: boolean;
  onToggle?: () => void;
};

function ItemHeader({
  hasAudienceGroups,
  audienceVisibility,
  invitationTitle,
  isPublished,
  disabled = false,
  isBusy = false,
  hasError = false,
  onToggle,
}: ItemHeaderProps) {
  return (
    <div
      className="flex items-center justify-end rounded-t-lg bg-white px-3"
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.headerHeight,
      }}
    >
      <VisibilityToggle
        hasAudienceGroups={hasAudienceGroups}
        audienceVisibility={audienceVisibility}
        invitationTitle={invitationTitle}
        isPublished={isPublished}
        disabled={disabled}
        isBusy={isBusy}
        hasError={hasError}
        onToggle={onToggle}
      />
    </div>
  );
}

export default ItemHeader;
