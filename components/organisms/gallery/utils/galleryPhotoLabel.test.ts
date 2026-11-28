import {
  GALLERY_PHOTO_DECORATIVE_ALT,
  galleryPhotoAriaLabel,
} from './galleryPhotoLabel';

describe('하객 갤러리 사진 접근성 이름', () => {
  it('몇 번째 사진인지와 전체 장수를 알려 준다', () => {
    expect(galleryPhotoAriaLabel(0, 5)).toBe('갤러리 사진 1 / 5 크게 보기');
    expect(galleryPhotoAriaLabel(4, 5)).toBe('갤러리 사진 5 / 5 크게 보기');
  });

  it('한 장뿐인 갤러리도 읽을 수 있는 이름을 만든다', () => {
    expect(galleryPhotoAriaLabel(0, 1)).toBe('갤러리 사진 1 / 1 크게 보기');
  });

  it('카드 안 이미지는 장식용이라 alt를 비운다', () => {
    expect(GALLERY_PHOTO_DECORATIVE_ALT).toBe('');
  });
});
