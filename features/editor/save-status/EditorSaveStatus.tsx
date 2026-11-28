'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';
import {
  getEditorSaveStatusView,
  type EditorSaveStatusTone,
} from '@/shared/utils/editorUnsavedChanges';

const toneClassName: Record<EditorSaveStatusTone, string> = {
  saved: 'bg-[#E6F7E6] text-[#1B6E1B]',
  dirty: 'bg-[#FEF3C7] text-[#92400E]',
  unsaved: 'bg-[#F2F3F5] text-[#4B5563]',
};

const dotClassName: Record<EditorSaveStatusTone, string> = {
  saved: 'bg-[#2DB400]',
  dirty: 'bg-[#D97706]',
  unsaved: 'bg-[#9CA3AF]',
};

// 편집기 머리말에서 지금 고친 내용이 저장돼 있는지 한눈에 알려 준다.
// 저장 자체는 '모두 저장하기'가 하고, 여기서는 상태만 보여 준다.
export default function EditorSaveStatus() {
  const { id: folderId } = useParams<{ id?: string }>();
  const requestedUuids = useSearchParams().getAll('uuid');
  const { isDirty, invitationFolderId, invitationUuid } = useEditorStore(
    useShallow(state => ({
      isDirty: state.isDirty,
      invitationFolderId: state.invitationFolderId,
      invitationUuid: state.invitationUuid,
    }))
  );

  if (
    folderId &&
    (folderId !== invitationFolderId ||
      !invitationUuid ||
      requestedUuids.length !== 1 ||
      requestedUuids[0] !== invitationUuid)
  ) {
    return null;
  }

  const view = getEditorSaveStatusView({
    isDirty,
    hasSavedInvitation: Boolean(invitationUuid),
  });

  return (
    <p
      role="status"
      aria-live="polite"
      aria-atomic="true"
      title={view.description}
      data-save-state={view.tone}
      className={cn(
        'flex h-7 select-none items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold',
        toneClassName[view.tone]
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          dotClassName[view.tone]
        )}
      />
      {view.label}
    </p>
  );
}
