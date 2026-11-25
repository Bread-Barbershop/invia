'use client';
import React from 'react';
import { useShallow } from 'zustand/shallow';

import ShareUrl from '@/components/organisms/share-url/ShareUrl';
import { BlockEditorAppearanceContext } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { isBlockEnabled } from '@/shared/data/registry/blockAvailability';
import { blockRegistry } from '@/shared/data/registry/registry';
import { supportsSectionStyle } from '@/shared/data/sectionStyles';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { MainPoster } from '@/widgets/mainPoster/components/MainPoster';

import { SectionStyleControls } from './SectionStyleControls';

function Edit() {
  const { block, selectedId, isEmpty } = useEditorStore(
    useShallow(state => ({
      block: state.block.find(b => b.id === state.selectedId),
      selectedId: state.selectedId,
      isEmpty: state.block.length === 0,
    }))
  );
  if (selectedId === 'mainPoster') return <MainPoster />;
  if (selectedId === 'shareUrl') return <ShareUrl />;

  if (!block || !selectedId)
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <p className="text-sm font-semibold text-text-plain">
          {isEmpty && !selectedId
            ? '가운데에서 포스터를 선택해 주세요'
            : '페이지를 추가해주세요'}
        </p>
        <p className="text-xs leading-5 text-text-secondary">
          {isEmpty && !selectedId
            ? '포스터를 고르면 이곳에서 글꼴과 색상을 바꿀 수 있어요.'
            : '오른쪽의 +페이지 추가에서 필요한 블록을 골라 보세요.'}
        </p>
      </div>
    );

  if (!isBlockEnabled(block.component)) {
    return (
      <div className="h-203 flex-center px-6 text-center text-sm text-text-secondary">
        방명록은 현재 사용할 수 없습니다. 다른 페이지를 선택해 주세요.
      </div>
    );
  }

  const EditInfo = blockRegistry[block.component]
    .editComponent as React.ComponentType<{
    blockInfo: typeof block;
    id: string;
  }>;
  return (
    <BlockEditorAppearanceContext.Provider
      value={
        supportsSectionStyle(block.component) ? (
          <SectionStyleControls block={block} />
        ) : null
      }
    >
      <EditInfo key={selectedId} blockInfo={block} id={selectedId} />
    </BlockEditorAppearanceContext.Provider>
  );
}
export default Edit;
