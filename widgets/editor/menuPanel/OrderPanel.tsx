'use client';

import type { EditorDraftKey } from '@/features/editor/draft/editorDraft';

import InvitationSettingsButton from '../preview/components/AdditionalFeaturesButton';
import AddPageButton from '../preview/components/AddPageButton';
import InvitationAudiencesButton from '../preview/components/InvitationAudiencesButton';
import InvitationPreviewButton from '../preview/components/InvitationPreviewButton';
import OrderPanel from '../preview/components/OrderPanel';
import { ShareUrlButton } from '../preview/components/ShareUrlButton';
import UndoRedoButtons from '../preview/components/UndoRedoButtons';
import UploadButton from '../preview/components/UploadButton';
import { useInvitationUpload } from '../preview/hooks/useInvitationUpload';

import type { RefObject } from 'react';

function MenuPanel({
  audienceName,
  draftKey,
  toolbarRef,
}: {
  audienceName?: string;
  draftKey?: EditorDraftKey;
  toolbarRef: RefObject<HTMLDivElement | null>;
}) {
  const upload = useInvitationUpload(audienceName, draftKey);

  return (
    <div ref={toolbarRef} className="w-28 flex flex-col gap-4">
      <UndoRedoButtons />
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
