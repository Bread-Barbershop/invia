import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import mealMenuStyles from '@/components/organisms/mealMenu/MealMenuPreview.module.css';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import Edit from '@/widgets/editor/leftPanel/components/Edit';

import Preview from './Preview';
import styles from './Preview.module.css';

jest.mock('@/widgets/mainPoster/components/MainPosterPreview', () => ({
  MainPosterPreview: () => null,
}));
jest.mock('@/widgets/mainPoster/components/MainPoster', () => ({
  MainPoster: () => <div>포스터 편집 패널</div>,
}));
jest.mock('@/components/organisms/bgm/components/EditorBgmOverlay', () => ({
  EditorBgmOverlay: () => null,
}));
jest.mock('@/components/molecules/editor-callout', () => ({
  EditorCallout: () => null,
}));
jest.mock('@/shared/assets/icons/callout.svg', () => () => null);

describe('미리보기 블록 클릭 선택', () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = jest.fn();
    useEditorStore.getState().reset();
  });

  const addDemoBlocks = () => {
    const state = useEditorStore.getState();
    state.addBlock('etc', 'divider', 'divider');
    state.addBlock('etc', 'mealMenu', 'menu', {
      collectionStyle: 'showcase-0',
    });
    state.selectedBlock('divider');
    state.setIsEdit(true);
  };

  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('빈 미리보기에서 키보드로 포스터를 선택하면 왼쪽에 포스터 편집 패널이 열린다', async () => {
    const user = userEvent.setup();
    useEditorStore.getState().setIsEdit(true);
    render(
      <>
        <Edit />
        <Preview />
      </>
    );
    expect(screen.getByText('가운데에서 포스터를 선택해 주세요')).toBeVisible();
    const choosePoster = screen.getByRole('button', {
      name: '포스터 선택하기',
    });

    await user.tab();
    expect(choosePoster).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(screen.getByText('포스터 편집 패널')).toBeVisible();
    expect(choosePoster).not.toBeInTheDocument();
    expect(useEditorStore.getState()).toMatchObject({
      selectedId: 'mainPoster',
      isEdit: false,
      isDirty: false,
    });
  });

  it('페이지가 있는 미리보기에서는 포스터 선택 안내를 표시하지 않는다', () => {
    useEditorStore.getState().addBlock('etc', 'divider', 'divider');
    render(
      <>
        <Edit />
        <Preview />
      </>
    );

    expect(screen.getByText('페이지를 추가해주세요')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: '포스터 선택하기' })
    ).toBeNull();
  });

  it('식사 메뉴 본문을 한 번 클릭하면 해당 블록이 선택되고 편집 모드로 전환된다', async () => {
    addDemoBlocks();
    const user = userEvent.setup();
    render(<Preview />);

    await user.click(screen.getByText('구운 단호박 수프'));

    expect(
      screen.queryByRole('button', { name: '식사 메뉴 순서 변경' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '세로 구분선 순서 변경' })
    ).not.toBeInTheDocument();
    expect(useEditorStore.getState()).toMatchObject({
      selectedId: 'menu',
      isEdit: false,
    });
  });

  it('디자인 바깥 여백을 클릭해도 해당 블록이 선택된다', async () => {
    addDemoBlocks();
    const user = userEvent.setup();
    render(<Preview />);
    const chapter = screen
      .getByRole('article', { name: '식사 메뉴' })
      .closest('section[data-component="mealMenu"]');
    if (!(chapter instanceof HTMLElement))
      throw new Error('메뉴 디자인 영역이 없습니다.');

    await user.click(chapter);

    expect(
      screen.queryByRole('button', { name: '식사 메뉴 순서 변경' })
    ).toBeInTheDocument();
    expect(useEditorStore.getState()).toMatchObject({
      selectedId: 'menu',
      isEdit: false,
    });
  });

  it.each([
    ['라운드 카드', { sectionStyle: 'rounded' }, '[data-section-style="rounded"]'],
    ['종이 카드', { sectionStyle: 'paper' }, '[data-section-style="paper"]'],
    [
      '테두리 카드',
      { sectionStyle: 'outlined' },
      '[data-section-style="outlined"]',
    ],
    [
      '기존 카드',
      { collectionStyle: 'showcase-2' },
      '[data-design="showcase-2"]',
    ],
    ['카드 없는 블록', { sectionStyle: 'plain' }, `.${mealMenuStyles.wrapper}`],
  ] as const)(
    '%s의 실제 영역에 선택선을 표시하고 다른 블록을 선택하면 옮긴다',
    async (_label, appearance, selector) => {
      const user = userEvent.setup();
      const editor = useEditorStore.getState();
      editor.addBlock('etc', 'mealMenu', 'menu', appearance);
      editor.addBlock('etc', 'spacer', 'spacer');
      const { container } = render(<Preview />);
      const surface = container.querySelector(
        `[data-preview-block-id="menu"] ${selector}`
      );
      const spacer = container.querySelector('[data-preview-block-id="spacer"]');
      if (!(surface instanceof HTMLElement) || !(spacer instanceof HTMLElement))
        throw new Error('선택할 미리보기 블록이 없습니다.');

      expect(container.getElementsByClassName(styles.selectedBlock)).toHaveLength(
        0
      );
      await user.click(surface);
      expect(surface.parentElement).toHaveClass(styles.selectedBlock);
      expect(surface).not.toHaveClass('ring-primary');
      expect(container.getElementsByClassName(styles.selectedBlock)).toHaveLength(
        1
      );

      await user.click(spacer);
      expect(surface.parentElement).not.toHaveClass(styles.selectedBlock);
      expect(spacer.getElementsByClassName(styles.selectedBlock)).toHaveLength(1);
      act(() => editor.selectedBlock(null));
      expect(container.getElementsByClassName(styles.selectedBlock)).toHaveLength(
        0
      );
    }
  );

  it.each(['spacer', 'divider'] as const)(
    '미리보기에서 %s를 선택해 개별 카드 스타일을 바로 적용한다',
    async component => {
      const user = userEvent.setup();
      const editor = useEditorStore.getState();
      editor.setSectionStyle('paper');
      editor.addBlock('wedding', component, 'layout');
      const { container } = render(
        <>
          <Edit />
          <Preview />
        </>
      );

      const preview = container.querySelector(
        '[data-preview-block-id="layout"]'
      );
      if (!(preview instanceof HTMLElement)) {
        throw new Error('레이아웃 블록 미리보기가 없습니다.');
      }
      expect(preview.querySelector('[data-section-style]')).toBeNull();

      await user.click(preview);
      await user.click(
        screen.getByRole('combobox', { name: '이 블록의 카드 스타일' })
      );
      await user.click(screen.getByRole('option', { name: '테두리 카드' }));

      expect(preview.querySelector('[data-section-style]')).toHaveAttribute(
        'data-section-style',
        'outlined'
      );
    }
  );
});
