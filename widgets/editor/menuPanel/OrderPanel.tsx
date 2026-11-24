'use client';

import InvitationSettingsButton from '../preview/components/AdditionalFeaturesButton';
import AddPageButton from '../preview/components/AddPageButton';
import InvitationAudiencesButton from '../preview/components/InvitationAudiencesButton';
import InvitationPreviewButton from '../preview/components/InvitationPreviewButton';
import OrderPanel from '../preview/components/OrderPanel';
import { ShareUrlButton } from '../preview/components/ShareUrlButton';
import UploadButton from '../preview/components/UploadButton';
import { useInvitationUpload } from '../preview/hooks/useInvitationUpload';

import type { RefObject } from 'react';

function MenuPanel({
  audienceName,
  toolbarRef,
}: {
  audienceName?: string;
  toolbarRef: RefObject<HTMLDivElement | null>;
}) {
  const upload = useInvitationUpload(audienceName);

  return (
    <div ref={toolbarRef} className="w-28 flex flex-col gap-4">
      <OrderPanel />
      <AddPageButton />
      <ShareUrlButton />
      <InvitationSettingsButton />
      <InvitationAudiencesButton upload={upload} audienceName={audienceName} />
      <InvitationPreviewButton />
      <UploadButton upload={upload} />
    </div>
  );
}

export default MenuPanel;
