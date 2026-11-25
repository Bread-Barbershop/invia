'use client';

import { type MouseEvent, useCallback, useEffect } from 'react';

import {
  EDITOR_SKIP_TARGETS,
  ensureEditorSkipTarget,
  focusEditorSkipTarget,
  type EditorSkipTarget,
} from '@/shared/utils/editorSkipTargets';

/**
 * 편집기 화면 맨 앞에 놓이는 영역 이동 링크(스킵 링크).
 *
 * 헤더 다음에 바로 이 링크들이 오므로, 키보드 사용자는 Tab 한 번으로
 * 편집 도구·미리보기·블록 설정 중 원하는 영역으로 건너뛸 수 있다.
 * 링크는 포커스를 받을 때만 화면에 나타난다.
 */
function EditorSkipLinks() {
  useEffect(() => {
    const labelTargets = () => {
      EDITOR_SKIP_TARGETS.forEach(target => {
        ensureEditorSkipTarget(document, target);
      });
    };

    labelTargets();
    // 미리보기 영역은 이 이펙트보다 늦게 그려질 수 있어, 다음 프레임에 한 번 더 확인한다.
    const frame = requestAnimationFrame(labelTargets);

    return () => cancelAnimationFrame(frame);
  }, []);

  const moveFocus = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, target: EditorSkipTarget) => {
      // 앵커의 기본 이동(스크롤)만으로는 포커스가 링크에 남는다.
      // 포커스를 옮길 수 있으면 해시 이동은 취소한다.
      if (focusEditorSkipTarget(document, target)) event.preventDefault();
    },
    []
  );

  return (
    <nav
      aria-label="편집기 바로가기"
      className="group pointer-events-none fixed left-0 top-0 z-[120] flex flex-col items-start gap-2 p-4"
    >
      {EDITOR_SKIP_TARGETS.map(target => (
        <a
          key={target.id}
          href={`#${target.id}`}
          onClick={event => moveFocus(event, target)}
          className="pointer-events-auto sr-only rounded-lg bg-black px-4 text-sm font-semibold text-white shadow-edit focus:not-sr-only focus:inline-flex focus:h-11 focus:items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary group-focus-within:not-sr-only group-focus-within:inline-flex group-focus-within:h-11 group-focus-within:items-center"
        >
          {target.label}
        </a>
      ))}
    </nav>
  );
}

export default EditorSkipLinks;
