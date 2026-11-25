/**
 * 커버 포스터(메인 포스터) 캔버스 위에 포인터가 있는지 표시한다.
 * 포스터 캔버스의 Ctrl+Z/⌘+Z는 fabric 캔버스 실행 취소가 처리하므로,
 * 블록 실행 취소 단축키는 이 표시가 켜져 있는 동안 비켜준다.
 */
let coverCanvasPointerInside = false;

export function setCoverCanvasPointerInside(inside: boolean) {
  coverCanvasPointerInside = inside;
}

export function isCoverCanvasPointerInside() {
  return coverCanvasPointerInside;
}
