'use client';

import {
  getBlockEntrance,
  PAIRED_ENTRANCE,
  SCROLL_ANIMATION_OPTIONS,
  supportsPairedEntrance,
} from '@/components/molecules/scroll-fade-in/animationConfig';
import { SectionStyleSelect } from '@/components/molecules/section-style-select/SectionStyleSelect';
import { FormSelector } from '@/components/molecules/selector/FormSelector';
import { resolveSectionStyle } from '@/shared/data/sectionStyles';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

export function SectionStyleControls({ block }: { block: EditorBlock }) {
  const updateAppearance = useEditorStore(state => state.updateBlockAppearance);
  const commonEffect = useEditorStore(
    state => state.scrollAnimation.animationType
  );
  const { id, component, props } = block;
  const inheritLabel =
    component === 'spacer'
      ? '기본 여백 유지'
      : component === 'divider'
        ? '기본 구분선 유지'
        : '초대장 스타일 따르기';

  return (
    <div className="grid w-full shrink-0 gap-3 py-2">
      <SectionStyleSelect
        label="이 블록의 카드 스타일"
        value={resolveSectionStyle(props.sectionStyle)}
        inheritLabel={inheritLabel}
        onChange={sectionStyle => updateAppearance(id, { sectionStyle })}
      />
      <FormSelector
        label="이 블록의 등장 효과"
        className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary"
        options={[
          {
            value: 'inherit' as const,
            label: `전체 설정 따르기 (${SCROLL_ANIMATION_OPTIONS.find(option => option.value === commonEffect)?.label})`,
          },
          ...SCROLL_ANIMATION_OPTIONS,
          ...(supportsPairedEntrance(component) ? [PAIRED_ENTRANCE] : []),
        ]}
        value={getBlockEntrance(component, props) ?? 'inherit'}
        onChange={value =>
          updateAppearance(id, {
            entranceEffect: value === 'inherit' ? undefined : value,
          })
        }
      />
    </div>
  );
}
