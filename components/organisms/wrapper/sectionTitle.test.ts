import {
  cleanSectionText,
  resolveSectionTitleRenderState,
  resolveSectionTitleText,
} from './sectionTitle';

describe('cleanSectionText', () => {
  it('앞뒤 공백을 지운다', () => {
    expect(cleanSectionText('  우리의 봄  ')).toBe('우리의 봄');
  });

  it('빈 값과 공백만 있는 값을 빈 문자열로 본다', () => {
    expect(cleanSectionText(undefined)).toBe('');
    expect(cleanSectionText(null)).toBe('');
    expect(cleanSectionText('')).toBe('');
    expect(cleanSectionText('   ')).toBe('');
    expect(cleanSectionText('\n\t')).toBe('');
  });

  it('편집기 안내문이 저장된 값은 없는 것으로 본다', () => {
    expect(cleanSectionText('제목을 입력해 주세요')).toBe('');
    expect(cleanSectionText(' 제목을 입력해주세요 ')).toBe('');
  });
});

describe('resolveSectionTitleText - 편집기 화면', () => {
  it('작성자가 넣은 값을 그대로 넘겨 PreviewTitle이 안내문까지 그리게 한다', () => {
    expect(resolveSectionTitleText('  ', '갤러리', false)).toBe('  ');
    expect(resolveSectionTitleText('', '갤러리', false)).toBe('갤러리');
    expect(resolveSectionTitleText(undefined, undefined, false)).toBe('');
  });
});

describe('resolveSectionTitleText - 하객 화면', () => {
  it('공백만 있는 제목은 기본 문구로 채워 안내문이 새지 않게 한다', () => {
    expect(resolveSectionTitleText('   ', '갤러리', true)).toBe('갤러리');
  });

  it('실제 제목은 앞뒤 공백을 지워 그대로 쓴다', () => {
    expect(resolveSectionTitleText('  우리의 봄  ', '갤러리', true)).toBe(
      '우리의 봄'
    );
  });

  it('안내문이 저장된 제목도 기본 문구로 되돌린다', () => {
    expect(resolveSectionTitleText('제목을 입력해 주세요', '갤러리', true)).toBe(
      '갤러리'
    );
  });

  it('기본 문구가 없으면 빈 문자열을 돌려준다', () => {
    expect(resolveSectionTitleText('   ', undefined, true)).toBe('');
    expect(resolveSectionTitleText(undefined, '  ', true)).toBe('');
  });
});

describe('resolveSectionTitleRenderState', () => {
  it('하객 화면에서 그릴 문구가 없으면 제목 요소를 그리지 않는다', () => {
    expect(resolveSectionTitleRenderState('  ', undefined, true)).toEqual({
      text: '',
      visible: false,
    });
  });

  it('하객 화면이라도 기본 문구가 있으면 그린다', () => {
    expect(resolveSectionTitleRenderState('', '갤러리', true)).toEqual({
      text: '갤러리',
      visible: true,
    });
  });

  it('편집기 화면은 안내문을 보여 줘야 하므로 항상 그린다', () => {
    expect(resolveSectionTitleRenderState('', undefined, false)).toEqual({
      text: '',
      visible: true,
    });
  });
});
