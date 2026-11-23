import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FabricImage, Rect } from 'fabric';

import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { ImagePanel } from './ImagePanel';

import type { FabricObject } from 'fabric';

jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricContext: jest.fn(),
}));

const slotId = 'portrait-slot';
const imageUrl = 'data:image/png;base64,dGVzdA==';

describe('포스터 사진 편집 버튼', () => {
  it.each([
    { frame: false, label: '일반 사진' },
    { frame: true, label: '프레임 사진' },
  ])('$label을 추가하면 사진 편집 버튼이 나타나고 사진을 지우면 사라진다', async ({ frame }) => {
    const user = userEvent.setup();
    const file = new File(['test'], 'photo.png', { type: 'image/png' });
    const photo = new FabricImage(new Image(120, 80));
    jest.spyOn(photo, 'toDataURL').mockReturnValue(imageUrl);
    const emptyFrame = new Rect({ width: 120, height: 80 });
    emptyFrame.set('name', 'slot-placeholder');
    emptyFrame.set('slot', { key: slotId, replaceable: true, filled: false });
    if (frame) {
      photo.set('slot', { key: slotId, replaceable: true, filled: true });
    }

    const emptySelection = frame ? emptyFrame : undefined;
    let selected: FabricObject | undefined = emptySelection;
    const startCrop = jest.fn();
    const addImage = jest.fn();
    const replaceSlotImageBySlot = jest.fn();
    const canvas = { getActiveObject: () => selected };
    jest.mocked(useFabricContext).mockReturnValue({
      canvas,
      startCrop,
      addImage,
      replaceSlotImageBySlot,
      compressImage: async (source: string) => source,
      getActiveSlotEntity: () => ({ slotId }),
      getSlotImagePositionBySlot: () => ({ x: 0, y: 0 }),
      getSlotImageScaleBySlot: () => 100,
      exportSlotImagePreviewBySlot: () => selected === photo ? imageUrl : '',
    } as unknown as ReturnType<typeof useFabricContext>);
    const view = render(<ImagePanel />);
    expect(screen.queryByRole('button', { name: '사진 편집' })).toBeNull();

    const input = view.container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('사진 업로드 입력을 찾을 수 없습니다.');
    }
    await user.upload(input, file);
    await waitFor(() => {
      if (frame) {
        expect(replaceSlotImageBySlot).toHaveBeenCalledWith(slotId, imageUrl);
      } else {
        expect(addImage).toHaveBeenCalledWith(imageUrl, canvas);
      }
    });

    selected = photo;
    view.rerender(<ImagePanel />);
    const editButton = screen.getByRole('button', { name: '사진 편집' });
    expect(editButton).toBeVisible();
    view.rerender(<ImagePanel />);
    expect(screen.getByRole('button', { name: '사진 편집' })).toBe(editButton);

    await user.click(editButton);
    expect(startCrop).toHaveBeenCalledWith(photo);

    if (!frame) {
      photo.set('isLocked', true);
      view.rerender(<ImagePanel />);
      expect(editButton).toBeDisabled();
    }

    selected = emptySelection;
    view.rerender(<ImagePanel />);
    expect(screen.queryByRole('button', { name: '사진 편집' })).toBeNull();
  });
});
