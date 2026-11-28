/**
 * 하객 갤러리 사진 카드의 접근성 이름.
 *
 * 사진 버튼의 이름이 이미지 alt(`slide-0`)에 기대고 있어서 스크린리더가
 * 사진마다 같은 이름을 읽었습니다. 몇 번째 사진인지와 전체 장수를 함께 알려 줍니다.
 */
export function galleryPhotoAriaLabel(index: number, total: number): string {
  return `갤러리 사진 ${index + 1} / ${total} 크게 보기`;
}

/** 사진 카드 안의 이미지는 장식용이므로 alt를 비웁니다. (이름은 카드 버튼이 가집니다) */
export const GALLERY_PHOTO_DECORATIVE_ALT = '';
