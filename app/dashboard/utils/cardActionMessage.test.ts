import { resolveCardActionFailureMessage } from './cardActionMessage';

describe('대시보드 카드 액션 실패 문구', () => {
  it('공개 권한 설정 실패는 다시 시도할 수 있는 안내로 바꾼다', () => {
    expect(
      resolveCardActionFailureMessage(
        'visibility',
        'Visibility update failed: visibility_publish_failed'
      )
    ).toEqual({
      title: '초대장을 공개로 바꾸지 못했어요',
      description: '공개 링크 권한을 설정하지 못했어요. 다시 시도해 주세요.',
    });
  });

  it('비공개 전환 실패는 이미 보낸 링크가 열릴 수 있음을 알린다', () => {
    expect(
      resolveCardActionFailureMessage(
        'visibility',
        'Visibility update failed: visibility_revoke_failed'
      )
    ).toEqual({
      title: '초대장을 비공개로 바꾸지 못했어요',
      description: '이미 보낸 링크로 초대장이 열릴 수 있어요. 다시 시도해 주세요.',
    });
  });

  it('서버가 준 한국어 메시지는 그대로 제목으로 쓰고 재시도를 안내한다', () => {
    expect(
      resolveCardActionFailureMessage(
        'visibility',
        'Visibility update failed: 초대장의 공개 상태를 변경하지 못했어요.'
      )
    ).toEqual({
      title: '초대장의 공개 상태를 변경하지 못했어요.',
      description: '잠시 후 다시 시도해 주세요.',
    });
  });

  it('상태 코드만 남은 실패도 기술 문자열 없이 안내한다', () => {
    const message = resolveCardActionFailureMessage(
      'visibility',
      'Visibility update failed: 502'
    );

    expect(message).toEqual({
      title: '공개 상태를 바꾸지 못했어요',
      description: '잠시 후 다시 시도해 주세요.',
    });
    expect(message?.title).not.toMatch(/visibility update failed/i);
  });

  it('네트워크 실패는 연결 확인을 안내한다', () => {
    expect(
      resolveCardActionFailureMessage(
        'visibility',
        'Visibility update request failed.'
      )
    ).toEqual({
      title: '공개 상태를 바꾸지 못했어요',
      description: '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
    });
    expect(
      resolveCardActionFailureMessage('share', 'Failed to fetch')
    ).toEqual({
      title: '공유 정보를 불러오지 못했어요',
      description: '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
    });
  });

  it('공유 준비 실패의 한국어 안내는 다시 준비할 버튼을 알려준다', () => {
    expect(
      resolveCardActionFailureMessage(
        'share',
        '공유할 하객 그룹을 불러오지 못했어요.'
      )
    ).toEqual({
      title: '공유할 하객 그룹을 불러오지 못했어요.',
      description: '아래 버튼을 눌러 다시 시도할 수 있어요.',
    });
  });

  it('알 수 없는 공유 실패도 다시 시도할 길을 남긴다', () => {
    expect(resolveCardActionFailureMessage('share', 'boom')).toEqual({
      title: '공유 정보를 불러오지 못했어요',
      description: '아래 버튼을 눌러 다시 시도할 수 있어요.',
    });
  });

  it('보여줄 실패가 없으면 안내를 만들지 않는다', () => {
    expect(resolveCardActionFailureMessage('visibility', null)).toBeNull();
    expect(resolveCardActionFailureMessage('share', undefined)).toBeNull();
    expect(resolveCardActionFailureMessage('visibility', '   ')).toBeNull();
    expect(
      resolveCardActionFailureMessage('visibility', 'Visibility update failed:')
    ).toBeNull();
  });
});
