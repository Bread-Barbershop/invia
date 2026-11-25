import {
  cloneBlockProps,
  createBlockId,
  findReorderTarget,
  getBlockDisplayName,
  getReorderIndexes,
  getVisibleBlocks,
} from './blockManagement';

import type { EditorBlock } from '@/shared/types/block';

const makeBlock = (
  id: string,
  component: EditorBlock['component'] = 'greeting'
): EditorBlock =>
  ({
    id,
    type: 'wedding',
    component,
    props: {},
  }) as EditorBlock;

describe('블록 관리 유틸', () => {
  describe('createBlockId', () => {
    it('매번 다른 id를 만든다', () => {
      const ids = new Set(Array.from({ length: 20 }, () => createBlockId()));

      expect(ids.size).toBe(20);
    });
  });

  describe('cloneBlockProps', () => {
    it('중첩된 값까지 원본과 분리해서 복사한다', () => {
      const source = {
        title: '교통 / 주차',
        groups: [{ name: '신랑 측', accounts: [{ bank: '국민', account: '1' }] }],
      };

      const cloned = cloneBlockProps(source);
      cloned.groups[0].accounts[0].bank = '신한';
      cloned.title = '바뀐 제목';

      expect(cloned).not.toBe(source);
      expect(cloned.groups).not.toBe(source.groups);
      expect(cloned.groups[0].accounts[0]).not.toBe(source.groups[0].accounts[0]);
      expect(source.groups[0].accounts[0].bank).toBe('국민');
      expect(source.title).toBe('교통 / 주차');
    });

    it('구조적 복사가 불가능한 값이 섞여도 예외 없이 복사본을 만든다', () => {
      const source = { title: '인사말', handler: () => 'x' };

      const cloned = cloneBlockProps(source);

      expect(cloned.title).toBe('인사말');
      expect(cloned).not.toBe(source);
    });
  });

  describe('getVisibleBlocks', () => {
    it('순서 목록에서 숨기는 블록을 제외한다', () => {
      const blocks = [
        makeBlock('greeting'),
        makeBlock('guestbook', 'guestbook'),
        makeBlock('transportation', 'transportation'),
      ];

      expect(getVisibleBlocks(blocks).map(block => block.id)).toEqual([
        'greeting',
        'transportation',
      ]);
    });
  });

  describe('findReorderTarget', () => {
    const blocks = [
      makeBlock('a'),
      makeBlock('b'),
      makeBlock('c'),
    ];

    it('위/아래로 한 칸 이동할 대상을 찾는다', () => {
      expect(findReorderTarget(blocks, 'b', 'up')?.id).toBe('a');
      expect(findReorderTarget(blocks, 'b', 'down')?.id).toBe('c');
    });

    it('더 움직일 곳이 없으면 null을 돌려준다', () => {
      expect(findReorderTarget(blocks, 'a', 'up')).toBeNull();
      expect(findReorderTarget(blocks, 'c', 'down')).toBeNull();
    });

    it('목록에 없는 id면 null을 돌려준다', () => {
      expect(findReorderTarget(blocks, 'unknown', 'up')).toBeNull();
    });

    it('숨겨진 블록을 건너뛰고 바로 위의 보이는 블록과 자리를 바꾼다', () => {
      const withHidden = [
        makeBlock('a'),
        makeBlock('hidden', 'guestbook'),
        makeBlock('b'),
      ];

      expect(findReorderTarget(withHidden, 'b', 'up')?.id).toBe('a');
    });
  });

  describe('getReorderIndexes', () => {
    it('moveBlock에 넘길 from/to 인덱스를 돌려준다', () => {
      const blocks = [makeBlock('a'), makeBlock('b'), makeBlock('c')];

      expect(getReorderIndexes(blocks, 'c', 'up')).toEqual({ from: 2, to: 1 });
      expect(getReorderIndexes(blocks, 'a', 'down')).toEqual({ from: 0, to: 1 });
    });

    it('숨겨진 블록이 섞여 있어도 실제 배열 인덱스를 쓴다', () => {
      const blocks = [
        makeBlock('a'),
        makeBlock('hidden', 'guestbook'),
        makeBlock('b'),
      ];

      expect(getReorderIndexes(blocks, 'b', 'up')).toEqual({ from: 2, to: 0 });
    });

    it('움직일 수 없으면 null을 돌려준다', () => {
      const blocks = [makeBlock('a')];

      expect(getReorderIndexes(blocks, 'a', 'up')).toBeNull();
    });
  });

  describe('getBlockDisplayName', () => {
    it('블록 컴포넌트의 한글 이름을 돌려준다', () => {
      expect(getBlockDisplayName('transportation')).toBe('교통 / 주차');
    });

    it('알 수 없는 컴포넌트는 일반 명칭으로 돌려준다', () => {
      expect(getBlockDisplayName('not-a-block')).toBe('블록');
    });
  });
});
