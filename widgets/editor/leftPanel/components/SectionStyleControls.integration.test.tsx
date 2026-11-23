import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useInitData } from '@/app/editor/[id]/hooks/useInitData';
import type { SavedData } from '@/app/editor/[id]/types/savedata';
import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';
import { EditorBgmPlayerProvider } from '@/components/organisms/bgm/context/EditorBgmPlayerContext';
import calendarStyles from '@/components/organisms/calendar/calendarPreview.module.css';
import InvitationChapter from '@/components/organisms/invitation-chapter/InvitationChapter';
import {
  createPreviewSnapshot,
  parsePreviewSnapshot,
} from '@/features/invitation/preview/previewSnapshot';
import { createInvitationTemplate } from '@/shared/data/invitationTemplates';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import LeftPanel from '../LeftPanel';

import BulkEdit from './BulkEdit';
import Edit from './Edit';

jest.mock('@/shared/assets/icons/sectionArrow.svg', () => () => null);

jest.mock('@/shared/data/invitationTemplates/originalPosterLoader', () => ({
  loadOriginalPosterJson: async () => ({ version: '7.2.0', objects: [] }),
}));
jest.mock('next/navigation', () => ({ usePathname: () => '/guest/test' }));
jest.mock('@/widgets/mainPoster/components/MainPoster', () => ({
  MainPoster: () => <h3>포스터 편집 패널</h3>,
}));
jest.mock('@/shared/fonts/fontLoader', () => ({
  hasCustomFontFace: () => false,
  preloadFontFamilyWeights: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/components/molecules/text-editor/utils/tiptapJsonToHtml', () => {
  const actual = jest.requireActual<
    typeof import('@/components/molecules/text-editor/utils/tiptapJsonToHtml')
  >('@/components/molecules/text-editor/utils/tiptapJsonToHtml');

  return {
    ...actual,
    tiptapJsonToHtmlInBrowser: actual.tiptapJsonToHtmlUniversal,
  };
});
jest.mock('./TitleEdit', () => ({ __esModule: true, default: () => null }));
jest.mock('./BodyEdit', () => ({ __esModule: true, default: () => null }));
jest.mock('./BackGroundColorEdit', () => ({
  __esModule: true,
  default: () => null,
}));

describe('템플릿과 추가 블록의 공통 카드 디자인', () => {
  beforeEach(() => useEditorStore.getState().reset());
  afterEach(() => act(() => useEditorStore.getState().reset()));

  it('전체 스타일에서 기본 카드 스타일 뒤에 초대장 연출을 표시한다', () => {
    render(<BulkEdit />);

    const cardStyle = screen.getByText('기본 카드 스타일');
    const effects = screen.getByText('초대장 연출');

    expect(cardStyle.compareDocumentPosition(effects)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('공지사항 편집 헤더와 항목추가 아래에서 제목보다 먼저 카드 스타일과 등장 효과를 편집한다', async () => {
    const user = userEvent.setup();
    const editor = useEditorStore.getState();
    editor.addBlock('wedding', 'notice', 'notice');
    editor.selectedBlock('notice');
    render(<LeftPanel />);

    const detail = within(screen.getByRole('region', { name: '공지사항' }));
    const heading = detail.getByRole('heading', {
      name: '공지사항 편집 페이지',
    });
    const addItem = detail.getByRole('button', { name: '항목추가' });
    const card = detail.getByRole('combobox', { name: '블록 카드 스타일' });
    const effect = detail.getByRole('combobox', { name: '블록 등장 효과' });
    const title = detail.getByRole('textbox', { name: '제목' });

    expect(heading.parentElement).toContainElement(addItem);
    expect(heading.compareDocumentPosition(card)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(card).toBeVisible();
    expect(effect).toBeVisible();
    expect(detail.getByText('블록 카드 스타일', { selector: 'label' })).toHaveClass(
      'text-sm font-normal text-text-secondary'
    );
    expect(detail.getByText('블록 등장 효과', { selector: 'label' })).toHaveClass(
      'text-sm font-normal text-text-secondary'
    );
    expect(
      screen.queryByRole('button', { name: '카드 디자인 · 등장 효과' })
    ).toBeNull();

    addItem.focus();
    await user.tab();
    expect(card).toHaveFocus();
    await user.tab();
    expect(effect).toHaveFocus();
    await user.tab();
    expect(title).toHaveFocus();
  });

  it('상세 편집에서 블록을 바꾸면 선택한 블록의 설정 한 쌍을 바로 표시한다', () => {
    const editor = useEditorStore.getState();
    editor.addBlock('wedding', 'notice', 'notice', { sectionStyle: 'paper' });
    editor.addBlock('wedding', 'place', 'place', {
      sectionStyle: 'rounded',
      entranceEffect: 'from-left',
    });
    editor.selectedBlock('notice');
    render(<Edit />);
    expect(
      screen.getByRole('combobox', { name: '블록 카드 스타일' })
    ).toHaveTextContent('종이 카드');

    act(() => editor.selectedBlock('place'));

    const detail = within(screen.getByRole('region', { name: '예식 장소' }));
    const heading = detail.getByRole('heading', {
      name: '예식 장소 편집 페이지',
    });
    const card = detail.getByRole('combobox', { name: '블록 카드 스타일' });
    const effect = detail.getByRole('combobox', { name: '블록 등장 효과' });
    const title = detail.getByRole('textbox', { name: '제목' });
    expect(heading.compareDocumentPosition(card)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(effect.compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(card).toHaveTextContent('라운드 카드');
    expect(effect).toHaveTextContent('왼쪽에서 등장');
    expect(
      screen.getAllByRole('combobox', { name: '블록 카드 스타일' })
    ).toHaveLength(1);
  });

  it('포스터, 공유 썸네일, 초대장 전체 효과와 비활성 방명록에는 개별 설정을 표시하지 않는다', () => {
    const editor = useEditorStore.getState();
    editor.addBlock('wedding', 'bgm', 'music');
    editor.addBlock('wedding', 'visualEffects', 'effects');
    editor.addBlock('wedding', 'guestbook', 'guestbook');
    render(
      <EditorBgmPlayerProvider>
        <Edit />
      </EditorBgmPlayerProvider>
    );

    for (const [id, copy] of [
      ['mainPoster', '포스터 편집 패널'],
      ['shareUrl', '공유 썸네일'],
      ['music', '배경 음악 편집 페이지'],
      ['effects', '배경 · 오프닝 효과'],
      [
        'guestbook',
        '방명록은 현재 사용할 수 없습니다. 다른 페이지를 선택해 주세요.',
      ],
    ]) {
      act(() => editor.selectedBlock(id));

      expect(screen.getByText(copy)).toBeVisible();
      expect(
        screen.queryByRole('combobox', { name: '블록 카드 스타일' })
      ).toBeNull();
      expect(
        screen.queryByRole('combobox', { name: '블록 등장 효과' })
      ).toBeNull();
    }
  });

  it('새 블록에 초대장 스타일을 적용하고 개별 변경과 상속 복원을 저장 전 미리보기에 반영한다', async () => {
    const prepared = await createInvitationTemplate('showcase-21');
    act(() => {
      useEditorStore.setState({
        block: prepared.blocks.filter(block => block.component === 'greeting'),
        backgroundColor: prepared.backgroundColor,
        titleData: prepared.titleData,
        bodyData: prepared.bodyData,
        sectionStyle: prepared.sectionStyle,
      });
      useEditorStore.getState().addBlock('firstBirthday', 'faq', 'added-faq');
      useEditorStore.getState().updateBlock('added-faq', {
        title: '추가한 질문',
        items: [
          {
            question: '새 질문도 수정할 수 있나요?',
            answer: '네, 같은 편집기를 사용합니다.',
          },
        ],
      });
      useEditorStore.getState().selectedBlock('added-faq');
    });
    const controls = render(
      <>
        <BulkEdit />
        <Edit />
      </>
    );
    const defaultStyle = screen.getByRole('combobox', {
      name: '기본 카드 스타일',
    });
    const blockStyle = screen.getByRole('combobox', {
      name: '블록 카드 스타일',
    });
    expect(defaultStyle).toHaveTextContent('종이 카드');
    expect(blockStyle).toHaveTextContent('초대장 스타일 따르기');

    fireEvent.click(defaultStyle);
    fireEvent.click(screen.getByRole('option', { name: '라운드 카드' }));
    const inherited = createPreviewSnapshot('data:image/png;base64,test');
    const guest = render(<GuestRenderer {...inherited.snapshot.payload} />);
    const invitation = within(guest.container);
    expect(
      invitation.getByText('추가한 질문').closest('[data-section-style]')
    ).toHaveAttribute('data-section-style', 'rounded');
    expect(
      invitation.getByText('네, 같은 편집기를 사용합니다.')
    ).toBeInTheDocument();

    fireEvent.click(blockStyle);
    fireEvent.click(screen.getByRole('option', { name: '테두리 카드' }));
    const custom = createPreviewSnapshot('data:image/png;base64,test');
    const restored = parsePreviewSnapshot(
      JSON.parse(JSON.stringify(custom.snapshot))
    );
    expect(restored).not.toBeNull();
    guest.rerender(<GuestRenderer {...restored!.payload} />);
    expect(
      invitation.getByText('추가한 질문').closest('[data-section-style]')
    ).toHaveAttribute('data-section-style', 'outlined');
    expect(restored!.payload.bulkData.sectionStyle).toBe('rounded');

    fireEvent.click(blockStyle);
    fireEvent.click(screen.getByRole('option', { name: '초대장 스타일 따르기' }));
    const reset = createPreviewSnapshot('data:image/png;base64,test');
    guest.rerender(<GuestRenderer {...reset.snapshot.payload} />);
    expect(
      invitation.getByText('추가한 질문').closest('[data-section-style]')
    ).toHaveAttribute('data-section-style', 'rounded');
    inherited.dispose();
    custom.dispose();
    reset.dispose();
    controls.unmount();
  });

  it.each([
    ['spacer', '기본 여백 유지'],
    ['divider', '기본 구분선 유지'],
  ] as const)(
    '%s의 개별 스타일과 효과를 직렬화한 뒤 공개 미리보기에서 복원한다',
    (component, defaultLabel) => {
      const editor = useEditorStore.getState();
      editor.setSectionStyle('paper');
      editor.addBlock('wedding', component, 'layout');
      editor.selectedBlock('layout');
      render(<Edit />);

      const card = screen.getByRole('combobox', {
        name: '블록 카드 스타일',
      });
      const effect = screen.getByRole('combobox', {
        name: '블록 등장 효과',
      });
      expect(card).toHaveTextContent(defaultLabel);

      fireEvent.click(card);
      fireEvent.click(screen.getByRole('option', { name: '라운드 카드' }));
      fireEvent.click(effect);
      fireEvent.click(screen.getByRole('option', { name: '페이드' }));
      const preview = createPreviewSnapshot('data:image/png;base64,test');
      const restored = parsePreviewSnapshot(
        JSON.parse(JSON.stringify(preview.snapshot))
      );
      preview.dispose();
      if (!restored) throw new Error('미리보기 설정을 복원할 수 없습니다.');
      const guest = render(<GuestRenderer {...restored.payload} />);

      const surface = 'section[data-section-style]';
      expect(guest.container.querySelector(surface)).toHaveAttribute(
        'data-section-style',
        'rounded'
      );
      expect(restored.payload.blocks[0].props).toMatchObject({
        sectionStyle: 'rounded',
        entranceEffect: 'fade',
      });

      fireEvent.click(card);
      fireEvent.click(screen.getByRole('option', { name: defaultLabel }));
      const reset = createPreviewSnapshot('data:image/png;base64,test');
      guest.rerender(<GuestRenderer {...reset.snapshot.payload} />);
      reset.dispose();
      expect(guest.container.querySelector(surface)).toBeNull();
    }
  );

  it('기본 스타일은 모든 블록을 지운 뒤 추가해도 유지하고 저장 데이터 로딩과 초기화에서 복원한다', async () => {
    const prepared = await createInvitationTemplate('showcase-21');
    const { result, rerender } = renderHook(
      ({ bulkData }) =>
        useInitData({
          savedData: { bulkData } as SavedData,
          uuid: '',
          invitationFolderId: '',
        }),
      {
        initialProps: {
          bulkData: {
            ...prepared,
            isZoom: false,
          },
        },
      }
    );
    act(() => result.current.initBulkData());
    expect(useEditorStore.getState().sectionStyle).toBe('paper');
    act(() => {
      useEditorStore.getState().setBlock([]);
      useEditorStore.getState().addBlock('wedding', 'place', 'after-delete');
    });
    const preview = createPreviewSnapshot('data:image/png;base64,test');
    expect(preview.snapshot.payload.bulkData.sectionStyle).toBe('paper');
    preview.dispose();
    rerender({
      bulkData: {
        ...prepared,
        sectionStyle: undefined,
        isZoom: false,
      },
    });
    act(() => result.current.initBulkData());
    expect(useEditorStore.getState().sectionStyle).toBeUndefined();
    act(() => {
      useEditorStore.getState().setSectionStyle('rounded');
      useEditorStore.getState().reset();
    });
    expect(useEditorStore.getState().sectionStyle).toBeUndefined();
  });

  it('저장된 어두운 배경과 자동 글자색을 공개 미리보기 카드에 반영한다', () => {
    const styledText = (text: string, color: string) => ({
      type: 'text',
      text,
      marks: [
        {
          type: 'textStyle',
          attrs: {
            fontFamily: 'LINESeedKR',
            fontSize: '14px',
            fontWeight: '400',
            color,
          },
        },
      ],
    });
    act(() => {
      const editor = useEditorStore.getState();
      editor.addBlock('wedding', 'greeting', 'dark-greeting');
      editor.updateBlock('dark-greeting', {
        title: '어두운 배경 인사말',
        messageJson: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                styledText('기존 기본 본문', '#000000'),
                styledText('지정한 로즈', '#BC7780'),
                styledText('지정한 검정', 'rgba(0, 0, 0, 1)'),
              ],
            },
          ],
        },
        messageHtml:
          '<p><span style="font-family: LINESeedKR; font-size: 14px; font-weight: 400; color: #000000">기존 기본 본문</span><span style="font-family: LINESeedKR; font-size: 14px; font-weight: 400; color: #BC7780">지정한 로즈</span><span style="font-family: LINESeedKR; font-size: 14px; font-weight: 400; color: rgba(0, 0, 0, 1)">지정한 검정</span></p>',
      });
      editor.setSectionStyle('outlined');
      editor.selectBackgroundColor('#536780');
    });

    const preview = createPreviewSnapshot('data:image/png;base64,test');
    const restored = parsePreviewSnapshot(
      JSON.parse(JSON.stringify(preview.snapshot))
    );
    preview.dispose();
    if (!restored) throw new Error('Preview snapshot was not restored');

    render(<GuestRenderer {...restored.payload} />);

    const title = screen.getByText('어두운 배경 인사말');
    expect(title).toHaveStyle({ color: '#FFFAF2' });
    expect(
      title.closest('[data-section-style="outlined"]')
    ).toBeInTheDocument();
    expect(title.closest('[data-invitation-dark]')).toBeInTheDocument();
    expect(restored.payload.bulkData).toMatchObject({
      backgroundColor: '#536780',
      bodyData: { color: '#E2E6ED', colorMode: 'automatic' },
    });
    const inherited = screen.getByText('기존 기본 본문');
    expect(getComputedStyle(inherited).color).toBe('rgb(226, 230, 237)');
    expect(inherited).toHaveStyle({ fontSize: '14px', fontWeight: '400' });
    expect(screen.getByText('지정한 로즈')).toHaveStyle({ color: '#BC7780' });
    expect(screen.getByText('지정한 검정')).toHaveStyle({ color: '#000000' });

    const darkBlock = useEditorStore.getState().block[0];
    act(() => useEditorStore.getState().selectBackgroundColor('#FFFFFF'));
    expect(useEditorStore.getState().block[0]).toBe(darkBlock);
    expect(useEditorStore.getState().bodyData.color).toBe('#000000');
    expect(inherited).toHaveAttribute(
      'style',
      expect.not.stringContaining('color:')
    );
    expect(screen.getByText('지정한 로즈')).toHaveStyle({ color: '#BC7780' });
  });

  it('HTML만 남아 있는 본문에서 기존 기본 색상만 제거한다', () => {
    act(() => {
      const editor = useEditorStore.getState();
      editor.addBlock('wedding', 'greeting', 'legacy-html');
      editor.updateBlock('legacy-html', {
        messageJson: null,
        messageHtml:
          '<p><span style="color: #000000; font-size: 14px; font-family: LINESeedKR; font-weight: 400; font-style: italic">기존 본문</span><strong><span style="color: #000000; font-size: 18px; font-family: LINESeedKR; font-weight: 400">직접 편집한 본문</span></strong></p>',
      });
      editor.selectBackgroundColor('#536780');
    });

    expect(useEditorStore.getState().block[0].props).toMatchObject({
      messageJson: null,
      messageHtml:
        '<p><span style=" font-size: 14px; font-family: LINESeedKR; font-weight: 400; font-style: italic">기존 본문</span><strong><span style="color: #000000; font-size: 18px; font-family: LINESeedKR; font-weight: 400">직접 편집한 본문</span></strong></p>',
    });
  });

  it('구형 흰색 카드의 인사말과 달력에 저장된 초대장 배경의 명암을 적용한다', () => {
    // Next Jest stubs CSS modules, so load the styles for the computed-style checks.
    const style = document.createElement('style');
    const readStylesheet = (file: string) =>
      readFileSync(join(process.cwd(), 'components/organisms', file), 'utf8');
    style.textContent = [
      readStylesheet('invitation-chapter/invitationChapter.module.css'),
      readStylesheet('calendar/calendarPreview.module.css').replace(
        ':global([data-invitation-dark])',
        '[data-invitation-dark]'
      ),
    ].join('\n');
    document.head.append(style);

    try {
      act(() => {
        const editor = useEditorStore.getState();
        editor.addBlock('wedding', 'greeting', 'legacy-greeting', {
          collectionStyle: 'showcase-18',
          title: '구형 인사말',
          messageHtml:
            '<p>기본 본문 <span style="color: #bc7780">지정한 색</span></p>',
        });
        editor.addBlock('wedding', 'calendar', 'legacy-calendar', {
          collectionStyle: 'showcase-18',
          title: '구형 달력',
          date: '2026-03-19',
          showDday: false,
        });
      });

      const savedPayload = () => {
        const preview = createPreviewSnapshot('data:image/png;base64,test');
        const restored = parsePreviewSnapshot(
          JSON.parse(JSON.stringify(preview.snapshot))
        );
        preview.dispose();
        if (!restored) throw new Error('Preview snapshot was not restored');
        return restored.payload;
      };
      const guest = render(<GuestRenderer {...savedPayload()} />);
      const title = screen.getByText('구형 인사말');
      const greeting = title.closest('[data-design="showcase-18"]');
      const calendar = screen
        .getByText('2026년 3월 19일')
        .closest(`.${calendarStyles.preview}`);
      const calendarChapter = calendar?.closest('[data-design="showcase-18"]');
      if (!calendar) throw new Error('Calendar preview was not rendered');
      const calendarTextColor = () =>
        getComputedStyle(calendar).getPropertyValue('--calendar-text').trim();

      expect(greeting).toHaveStyle({ backgroundColor: '#fff' });
      expect(calendarChapter).toHaveStyle({ backgroundColor: '#fff' });
      expect(calendarTextColor()).toBe('');

      act(() => useEditorStore.getState().selectBackgroundColor('#536780'));
      guest.rerender(<GuestRenderer {...savedPayload()} />);

      expect(greeting).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.12)' });
      expect(calendarChapter).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
      });
      expect(title).toHaveStyle({ color: '#FFFAF2' });
      expect(screen.getByText(/기본 본문/).parentElement).toHaveStyle({
        color: '#E2E6ED',
      });
      expect(screen.getByText('지정한 색')).toHaveStyle({ color: '#bc7780' });
      expect(calendarTextColor()).toBe('#ffffff');

      act(() => useEditorStore.getState().selectBackgroundColor('#FFFFFF'));
      guest.rerender(<GuestRenderer {...savedPayload()} />);

      expect(greeting).toHaveStyle({ backgroundColor: '#fff' });
      expect(calendarChapter).toHaveStyle({ backgroundColor: '#fff' });
      expect(calendarTextColor()).toBe('');
    } finally {
      style.remove();
    }
  });

  it('기존 저장된 카드 모양을 읽고 명시적인 기본형 선택과 레이아웃 블록의 예외를 적용한다', () => {
    const { container, rerender } = render(
      <InvitationChapter component="place" collectionStyle="showcase-21">
        장소
      </InvitationChapter>
    );
    expect(
      container.querySelector('[data-design="showcase-21"]')
    ).not.toBeNull();
    rerender(
      <InvitationChapter
        component="place"
        collectionStyle="showcase-21"
        sectionStyle="plain"
        defaultStyle="rounded"
      >
        장소
      </InvitationChapter>
    );
    expect(container.querySelector('section')).toBeNull();
    rerender(
      <InvitationChapter
        component="place"
        collectionStyle="showcase-21"
        sectionStyle="invalid"
        defaultStyle="paper"
      >
        장소
      </InvitationChapter>
    );
    expect(
      container.querySelector('[data-section-style="paper"]')
    ).not.toBeNull();
    for (const component of ['spacer', 'divider', 'bgm', 'visualEffects']) {
      rerender(
        <InvitationChapter component={component} defaultStyle="paper">
          레이아웃
        </InvitationChapter>
      );
      expect(container.querySelector('section')).toBeNull();
    }
  });
});
