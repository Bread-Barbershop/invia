'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { type KeyboardEvent, useId, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';

import { PosterPanel } from './components/PosterPanel';
import TypePanel from './components/TypePanel';
import { useComponentType } from './hooks/useComponentType';

type RightPanelTab = 'poster' | 'type';

const TAB_FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function RightPanel() {
  const { block, selectedId } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      selectedId: state.selectedId,
    }))
  );
  const { typeArray } = useComponentType({ block, selectedId });
  const selectedBlock = block.find(item => item.id === selectedId);
  const hasTypeArray = Boolean(typeArray && typeArray.length > 0);
  const isPosterTabDisabled =
    selectedBlock?.component === 'gallery' ||
    selectedBlock?.component === 'calendar';

  const [prevTypeArray, setPrevTypeArray] = useState(typeArray);
  const [tab, setTab] = useState<RightPanelTab>(
    typeArray && typeArray.length > 0 ? 'type' : 'poster'
  );

  const posterTabRef = useRef<HTMLButtonElement>(null);
  const typeTabRef = useRef<HTMLButtonElement>(null);
  const tabPanelId = useId();
  const posterTabId = useId();
  const typeTabId = useId();

  if (typeArray !== prevTypeArray) {
    setPrevTypeArray(typeArray);
    setTab(typeArray && typeArray.length > 0 ? 'type' : 'poster');
  }

  const tabs: {
    key: RightPanelTab;
    label: string;
    disabled: boolean;
    id: string;
    width: string;
    ref: typeof posterTabRef;
  }[] = [
    {
      key: 'poster',
      label: '포스터',
      disabled: isPosterTabDisabled,
      id: posterTabId,
      width: 'w-41.5',
      ref: posterTabRef,
    },
    {
      key: 'type',
      label: '타입',
      disabled: !hasTypeArray,
      id: typeTabId,
      width: 'w-41.75',
      ref: typeTabRef,
    },
  ];

  const selectTab = (next: RightPanelTab) => {
    if (next === 'poster' && isPosterTabDisabled) return;
    if (next === 'type' && !hasTypeArray) return;
    setTab(next);
  };

  /** 탭 사이를 방향키·Home·End로 옮기고 바로 선택한다. */
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const enabledTabs = tabs.filter(item => !item.disabled);
    if (enabledTabs.length === 0) return;

    const currentIndex = enabledTabs.findIndex(
      item => item.key === (tab as RightPanelTab)
    );
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex =
          (Math.max(currentIndex, 0) - 1 + enabledTabs.length) %
          enabledTabs.length;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (Math.max(currentIndex, 0) + 1) % enabledTabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabledTabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextTab = enabledTabs[nextIndex];
    selectTab(nextTab.key);
    nextTab.ref.current?.focus();
  };

  return (
    <div
      id="editor-block-panel"
      role="region"
      aria-label="블록 설정"
      tabIndex={-1}
      className={`${selectedId !== 'mainPoster' && (!typeArray || typeArray.length === 0) ? 'invisible' : 'visible'} w-93.75 h-full max-h-[810px] mr-5 min-[1540px]:mr-15 flex flex-col gap-5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
    >
      <div className="w-93.75 min-h-0 h-full flex-1 bg-white rounded-lg shadow-edit flex-center flex-col gap-2 px-5 ">
        <div role="tablist" aria-label="블록 설정 보기" className="w-full h-11">
          {tabs.map(item => {
            const selected = tab === item.key;

            return (
              <button
                key={item.key}
                ref={item.ref}
                type="button"
                role="tab"
                id={item.id}
                aria-selected={selected}
                aria-controls={tabPanelId}
                tabIndex={selected ? 0 : -1}
                disabled={item.disabled}
                className={cn(
                  `${item.width} h-11 select-none text-sm ${
                    item.disabled
                      ? 'cursor-not-allowed text-text-disabled'
                      : 'cursor-pointer'
                  } ${
                    selected
                      ? 'border-b font-semibold text-text-primary'
                      : 'font-normal text-[#838383]'
                  } transition-colors`,
                  TAB_FOCUS_RING
                )}
                onClick={() => selectTab(item.key)}
                onKeyDown={handleTabKeyDown}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          id={tabPanelId}
          role="tabpanel"
          aria-labelledby={tab === 'poster' ? posterTabId : typeTabId}
          className="w-full flex-1 min-h-0 flex flex-col"
        >
          <AnimatePresence mode="wait">
            {tab === 'type' && typeArray && typeArray.length > 0 && (
              <motion.div
                key="type"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full h-full flex flex-col"
              >
                <TypePanel typeArray={typeArray} selectedId={selectedId} />
              </motion.div>
            )}
            {tab === 'poster' && (
              <motion.div
                key="poster"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full h-full flex flex-col"
              >
                <PosterPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
export default RightPanel;
