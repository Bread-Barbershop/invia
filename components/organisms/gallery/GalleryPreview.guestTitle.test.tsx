import { render, screen } from '@testing-library/react';

import GalleryPreview from '@/components/organisms/gallery/GalleryPreview';
import { GuestSurfaceProvider } from '@/components/organisms/wrapper/GuestSurfaceContext';

import type { EditorBlock } from '@/shared/types/block';

jest.mock('@/shared/store/editorStore/useEditorStore');
jest.mock('@/shared/hooks/useTitleFontInfo', () => ({
  useTitleFontInfo: () => ({ mainStyle: {}, subStyle: {} }),
}));
jest.mock('@/shared/hooks/useBodyFontInfo', () => ({
  useBodyFontInfo: () => ({ fontFamily: undefined, fontSize: undefined }),
}));
jest.mock('@/shared/hooks/useResolvedImageSources', () => ({
  useResolvedImageSources: () => [],
}));

const galleryBlock = {
  id: 'gallery-1',
  type: 'wedding',
  component: 'gallery',
  props: {
    title: '   ',
    subTitle: '  ',
    isSubTitle: true,
    images: [],
    template: 'galleryType1',
    ratio: '1:1',
    isPopupViewer: false,
  },
} as unknown as EditorBlock<'gallery'>;

const EDITOR_PLACEHOLDER = '제목을 입력해 주세요';

describe('갤러리 블록 - 제목을 공백만 남긴 초대장', () => {
  it('하객 화면에서는 편집 안내문 대신 기본 제목과 영문 부제목을 보여 준다', () => {
    render(
      <GuestSurfaceProvider>
        <GalleryPreview blockInfo={galleryBlock} className="" onClick={() => {}} />
      </GuestSurfaceProvider>
    );

    expect(screen.getByText('갤러리')).toBeInTheDocument();
    expect(screen.getByText('GALLERY')).toBeInTheDocument();
    expect(screen.queryByText(EDITOR_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it('편집기에서는 지금처럼 입력 안내문을 보여 준다', () => {
    render(
      <GalleryPreview blockInfo={galleryBlock} className="" onClick={() => {}} />
    );

    expect(screen.getByText(EDITOR_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.queryByText('갤러리')).not.toBeInTheDocument();
  });
});
