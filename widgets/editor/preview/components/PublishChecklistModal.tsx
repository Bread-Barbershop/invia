'use client';

import { AlertCircle, Check, ChevronRight, Info, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';

import {
  publishChecklistSummary,
  type PublishChecklistItem,
  type PublishChecklistResult,
} from '../publishChecklist';

interface Props {
  result: PublishChecklistResult;
  onFix: (item: PublishChecklistItem) => void;
  onSave: () => void;
  onClose: () => void;
}

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202020]';

const ChecklistRow = ({
  item,
  onFix,
}: {
  item: PublishChecklistItem;
  onFix: (item: PublishChecklistItem) => void;
}) => {
  const isRequired = item.severity === 'required';
  const Icon = isRequired ? AlertCircle : Info;
  const body = (
    <>
      <span
        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
          isRequired ? 'bg-[#FDF1E7] text-[#B45309]' : 'bg-[#F2F4F6] text-neutral-500'
        }`}
      >
        <Icon size={15} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[13px] font-semibold text-[#202020]">
          {item.title}
        </span>
        <span className="text-xs leading-5 break-words text-neutral-500">
          {item.detail}
        </span>
      </span>
    </>
  );

  if (!item.target) {
    return (
      <div className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5">
        {body}
        <span className="mt-0.5 shrink-0 rounded-full bg-[#FAFAFB] px-2 py-0.5 text-[10px] font-medium text-neutral-500 ring-1 ring-[#EBEBEB] ring-inset">
          {item.actionLabel}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onFix(item)}
      aria-label={`${item.title} — ${item.actionLabel}`}
      className={`group flex w-full cursor-pointer items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-[#F7F7F7] active:bg-[#F1F1F1] ${FOCUS_RING}`}
    >
      {body}
      <ChevronRight
        size={16}
        aria-hidden="true"
        className="mt-1 shrink-0 text-neutral-300 transition-colors group-hover:text-neutral-500"
      />
    </button>
  );
};

export function PublishChecklistModal({ result, onFix, onSave, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const backdropDismiss = useBackdropDismiss<HTMLDivElement>(onClose);

  useEffect(() => {
    saveRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const required = result.items.filter(item => item.severity === 'required');
  const recommended = result.items.filter(
    item => item.severity === 'recommended'
  );
  const saveLabel = result.requiredCount > 0 ? '그대로 저장하기' : '저장하기';

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100] bg-[rgb(0_0_0_/_28%)]"
        {...backdropDismiss}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-checklist-title"
        aria-describedby="publish-checklist-summary"
        tabIndex={-1}
        className="fixed top-1/2 left-1/2 z-[101] flex max-h-[calc(100dvh-32px)] w-[400px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white p-5 shadow-[0_24px_60px_-20px_rgb(0_0_0_/_20%),0_8px_24px_-8px_rgb(0_0_0_/_16%)]"
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className={`absolute top-3.5 right-3.5 grid size-8 cursor-pointer place-items-center rounded-lg text-neutral-400 transition-colors hover:bg-[#F5F5F5] hover:text-[#202020] ${FOCUS_RING}`}
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="pr-8">
          <p
            id="publish-checklist-title"
            className="text-base font-semibold text-[#202020]"
          >
            발행 전 체크리스트
          </p>
          <p
            id="publish-checklist-summary"
            className="mt-1 text-xs leading-5 text-neutral-500"
          >
            {publishChecklistSummary(result)}
          </p>
        </div>

        {result.isReady ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-[#F3F8F3] px-4 py-6 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-[#476247] text-white">
              <Check size={22} aria-hidden="true" strokeWidth={3} />
            </span>
            <p className="text-sm font-semibold text-[#2F4530]">
              표지·일정·장소까지 모두 준비됐어요
            </p>
            <p className="text-xs leading-5 text-[#4D6650]">
              이대로 저장하면 하객이 바로 볼 수 있는 초대장이 돼요.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex max-h-[46vh] flex-col gap-1 overflow-y-auto overscroll-contain">
            {required.length > 0 && (
              <>
                <p className="px-2.5 pb-1 text-[11px] font-semibold tracking-wide text-neutral-400">
                  꼭 확인해 주세요
                </p>
                {required.map(item => (
                  <ChecklistRow key={item.id} item={item} onFix={onFix} />
                ))}
              </>
            )}
            {recommended.length > 0 && (
              <>
                <p
                  className={`px-2.5 pb-1 text-[11px] font-semibold tracking-wide text-neutral-400 ${
                    required.length > 0 ? 'pt-3' : ''
                  }`}
                >
                  채우면 더 좋아요
                </p>
                {recommended.map(item => (
                  <ChecklistRow key={item.id} item={item} onFix={onFix} />
                ))}
              </>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <button
            ref={saveRef}
            type="button"
            onClick={onSave}
            className={`flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-black text-sm font-semibold text-white transition-colors hover:bg-[#202020] active:bg-[#0D0D0D] ${FOCUS_RING}`}
          >
            {saveLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-transparent text-sm font-semibold text-neutral-500 transition-colors hover:bg-[#F7F7F7] hover:text-[#202020] ${FOCUS_RING}`}
          >
            {result.isReady ? '조금 더 다듬기' : '돌아가서 고치기'}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default PublishChecklistModal;
