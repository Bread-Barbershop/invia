import { componentCls } from './componentInfo';
import {
  getCurrentInvitationType,
  prioritizeComponentCategories,
} from './componentOrder';

describe('블록 추가 패널 분류 정렬', () => {
  it('편집 중인 초대장 종류를 첫 블록의 타입에서 읽는다', () => {
    expect(
      getCurrentInvitationType([
        { type: 'birthday' },
        { type: 'wedding' },
      ])
    ).toBe('birthday');
  });

  it('블록이 아직 없으면 현재 종류를 알 수 없다', () => {
    expect(getCurrentInvitationType([])).toBeNull();
    expect(getCurrentInvitationType(undefined)).toBeNull();
  });

  it('현재 초대장 분류를 맨 앞으로 올리고 나머지 순서는 그대로 둔다', () => {
    const ordered = prioritizeComponentCategories(componentCls, 'birthday');

    expect(ordered.map(category => category.english)).toEqual([
      'birthday',
      'wedding',
      'firstBirthday',
      'seminar',
      'etc',
      'layout',
    ]);
    expect(componentCls.map(category => category.english)).toEqual([
      'wedding',
      'firstBirthday',
      'birthday',
      'seminar',
      'etc',
      'layout',
    ]);
  });

  it('이미 맨 앞이거나 현재 종류가 없으면 원래 순서를 유지한다', () => {
    expect(
      prioritizeComponentCategories(componentCls, 'wedding').map(
        category => category.english
      )
    ).toEqual(componentCls.map(category => category.english));

    expect(
      prioritizeComponentCategories(componentCls, null).map(
        category => category.english
      )
    ).toEqual(componentCls.map(category => category.english));

    expect(
      prioritizeComponentCategories(componentCls, 'unknown').map(
        category => category.english
      )
    ).toEqual(componentCls.map(category => category.english));
  });
});
