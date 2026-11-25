import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import { isBlockEnabled } from '@/shared/data/registry/blockAvailability';
import type { EditorBlock } from '@/shared/types/block';

export type BlockMoveDirection = 'up' | 'down';

const FALLBACK_ID_PREFIX = 'block';

/**
 * 새 블록 id를 만든다. crypto.randomUUID를 쓸 수 없는 환경(일부 구형 웹뷰,
 * 테스트 환경)에서도 블록 복제가 중단되지 않도록 폴백을 둔다.
 */
export function createBlockId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${FALLBACK_ID_PREFIX}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/**
 * 블록 props를 깊은 복사한다. 복제된 블록이 원본과 같은 객체를 공유하면
 * 한쪽을 편집할 때 다른 쪽까지 바뀌므로 반드시 분리한다.
 */
export function cloneBlockProps<T>(props: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(props);
    } catch {
      // 함수나 DOM 노드처럼 구조적 복사가 불가능한 값이 섞인 경우 아래로 넘어간다.
    }
  }

  return JSON.parse(JSON.stringify(props)) as T;
}

/** 순서 목록에 실제로 노출되는 블록만 남긴다. */
export function getVisibleBlocks(blocks: EditorBlock[]): EditorBlock[] {
  return blocks.filter(block => isBlockEnabled(block.component));
}

/**
 * `id` 블록을 한 칸 위/아래로 옮겼을 때 자리를 바꿀 대상 블록을 찾는다.
 * 순서 목록에 보이지 않는 블록(저장된 방명록 등)은 건너뛴다.
 */
export function findReorderTarget(
  blocks: EditorBlock[],
  id: string,
  direction: BlockMoveDirection
): EditorBlock | null {
  const visibleBlocks = getVisibleBlocks(blocks);
  const currentIndex = visibleBlocks.findIndex(block => block.id === id);
  if (currentIndex < 0) return null;

  const targetIndex =
    direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  return visibleBlocks[targetIndex] ?? null;
}

/**
 * `moveBlock(from, to)`에 넘길 인덱스를 계산한다.
 * 더 움직일 곳이 없으면 null.
 */
export function getReorderIndexes(
  blocks: EditorBlock[],
  id: string,
  direction: BlockMoveDirection
): { from: number; to: number } | null {
  const target = findReorderTarget(blocks, id, direction);
  if (!target) return null;

  const from = blocks.findIndex(block => block.id === id);
  const to = blocks.findIndex(block => block.id === target.id);
  if (from < 0 || to < 0) return null;

  return { from, to };
}

const blockLabelCache = new Map<string, string>();

/** 순서 목록·스크린리더 안내에 쓸 블록 이름(예: '교통 / 주차'). */
export function getBlockDisplayName(component: string): string {
  const cached = blockLabelCache.get(component);
  if (cached) return cached;

  const matched = componentCls
    .flatMap(category => category.list)
    .find(item => item.component === component);

  const label = matched?.contents ?? '블록';
  blockLabelCache.set(component, label);
  return label;
}
