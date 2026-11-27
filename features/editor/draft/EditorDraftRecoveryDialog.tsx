'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  disableBodyScroll,
  getHiddenRoot,
  removeHiddenRoot,
  trapFocus,
} from '@/shared/utils/focusTrap';

import { summarizeEditorDraft } from './draftRecovery';
import {
  discardEditorDraft,
  type EditorDraftKey,
  type EditorDraftSnapshot,
} from './editorDraft';

type EditorDraftRecoveryDialogProps = {
  draft: EditorDraftSnapshot;
  draftKey: EditorDraftKey;
  /** 테스트에서 시각을 고정하기 위해 주입한다. */
  now?: number;
  onResume: () => void;
  onDraftChange: (draft: EditorDraftSnapshot) => void;
  /** 삭제가 끝난 뒤 새 편집기를 시작한다. */
  onDiscard: () => void;
};

const TITLE_ID = 'editor-draft-recovery-title';
const SUMMARY_ID = 'editor-draft-recovery-summary';
const DESCRIPTION_ID = 'editor-draft-recovery-description';

/**
 * 이 기기에 남은 초안을 이어서 작성하거나 삭제한 뒤 새로 시작한다.
 */
export default function EditorDraftRecoveryDialog({
  draft,
  draftKey,
  now,
  onResume,
  onDraftChange,
  onDiscard,
}: EditorDraftRecoveryDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const resumeButtonRef = useRef<HTMLButtonElement>(null);
  const cancelDiscardButtonRef = useRef<HTMLButtonElement>(null);
  const discardPendingRef = useRef(false);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [discardNotice, setDiscardNotice] = useState<'changed' | 'failed' | null>(
    null
  );

  // 기본값을 렌더 중에 계산하지 않도록 마운트 시각을 한 번만 잡는다.
  const [mountedAt] = useState(() => Date.now());
  const summary = summarizeEditorDraft(draft, now ?? mountedAt);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (dialogRef.current) {
      trapFocus(event, dialogRef.current);
    }
  }, []);

  useEffect(() => {
    const enableRestore = disableBodyScroll();
    getHiddenRoot();

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      enableRestore();
      removeHiddenRoot();
    };
  }, [handleKeyDown]);

  const cancelDiscard = useCallback(() => {
    if (discardPendingRef.current) return;
    setIsConfirmingDiscard(false);
    setDiscardNotice(null);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      event.preventDefault();
      if (discardPendingRef.current) return;
      if (isConfirmingDiscard) {
        cancelDiscard();
        return;
      }
      onResume();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [cancelDiscard, isConfirmingDiscard, onResume]);

  useEffect(() => {
    if (isDiscarding) return;

    const button = isConfirmingDiscard ? cancelDiscardButtonRef : resumeButtonRef;
    button.current?.focus();
  }, [isConfirmingDiscard, isDiscarding]);

  async function confirmDiscard() {
    if (discardPendingRef.current) return;
    discardPendingRef.current = true;
    setIsDiscarding(true);
    setDiscardNotice(null);
    try {
      const result = await discardEditorDraft(draftKey, draft);
      if (result.status === 'changed') {
        onDraftChange(result.draft);
        setIsConfirmingDiscard(false);
        setDiscardNotice('changed');
      } else if (result.status === 'failed') {
        setDiscardNotice('failed');
      } else {
        onDiscard();
      }
    } finally {
      discardPendingRef.current = false;
      setIsDiscarding(false);
    }
  }

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      aria-describedby={`${SUMMARY_ID} ${DESCRIPTION_ID}`}
      data-editor-popup="draft-recovery"
    >
      <div className="absolute inset-0 bg-[rgb(0_0_0_/_28%)]" aria-hidden="true" />

      <div
        ref={dialogRef}
        className="relative flex w-[min(420px,calc(100vw-40px))] flex-col gap-5 rounded-3xl bg-white p-7 shadow-edit"
      >
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-text-secondary">이 기기의 초안</p>
          <h1
            id={TITLE_ID}
            className="break-keep text-[22px] font-bold leading-8 text-text-plain"
          >
            작성 중이던 초대장이 있어요
          </h1>
          <p
            id={SUMMARY_ID}
            className="break-keep text-sm font-medium text-text-plain"
            data-testid="editor-draft-recovery-summary"
          >
            {summary}
          </p>
          <p
            id={DESCRIPTION_ID}
            className="break-keep text-[13px] leading-5 text-text-secondary"
          >
            로그인하기 전에 저장하려던 작업이에요. 초안은 일주일 동안 보관돼요.
          </p>
          {discardNotice === 'changed' && (
            <p
              className="break-keep text-[13px] font-medium text-text-plain"
              role="status"
            >
              다른 탭에서 초안이 갱신됐어요. 최신 초안을 확인해 주세요.
            </p>
          )}
        </div>

        {isConfirmingDiscard ? (
          <div
            className="flex flex-col gap-3 rounded-2xl bg-[#F7F7F8] p-4"
            role="group"
            aria-label="초안 삭제 확인"
            aria-busy={isDiscarding}
          >
            <p className="break-keep text-[13px] leading-5 text-text-plain">
              초안을 삭제하면 되돌릴 수 없어요. 정말 삭제할까요?
            </p>
            {discardNotice === 'failed' && (
              <p className="break-keep text-[13px] text-[#A52D32]" role="alert">
                초안을 삭제하지 못했어요. 다시 시도해 주세요.
              </p>
            )}
            <div className="flex gap-2">
              <button
                ref={cancelDiscardButtonRef}
                type="button"
                disabled={isDiscarding}
                onClick={cancelDiscard}
                className="h-10 flex-1 rounded-lg bg-white text-[13px] font-semibold text-text-plain ring-1 ring-[#E4E4E7] ring-inset transition-colors hover:bg-[#FAFAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isDiscarding}
                onClick={() => void confirmDiscard()}
                className="h-10 flex-1 rounded-lg bg-[#C4362F] text-[13px] font-semibold text-white transition-colors hover:bg-[#A82C26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4362F] focus-visible:ring-offset-2"
              >
                {isDiscarding ? '삭제하는 중' : '삭제하고 시작'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              ref={resumeButtonRef}
              type="button"
              onClick={onResume}
              className="flex h-12 w-full items-center justify-center rounded-full bg-bg-plain px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#202020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2"
            >
              이어서 작성
            </button>
            <button
              type="button"
              onClick={() => {
                setDiscardNotice(null);
                setIsConfirmingDiscard(true);
              }}
              className="flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-[#A52D32] ring-1 ring-[#E4E4E7] ring-inset transition-colors hover:bg-[#FAFAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A52D32] focus-visible:ring-offset-2"
            >
              초안 삭제 후 새로 시작
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
