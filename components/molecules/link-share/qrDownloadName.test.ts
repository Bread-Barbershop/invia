import { qrDownloadName } from './qrDownloadName';

describe('QR 다운로드 파일명', () => {
  it('행사 제목과 하객 이름에 입력한 파일명 금지 문자와 공백을 정리한다', () => {
    expect(qrDownloadName('  민서/지훈: 결혼식  ', '가족 | 친척')).toBe(
      '민서 지훈 결혼식 - 가족 친척 QR.png'
    );
    expect(qrDownloadName('CON.txt')).toBe('_CON.txt QR.png');
    expect(qrDownloadName('.../', '직장용')).toBe('초대장 - 직장용 QR.png');
  });

  it('긴 한글 제목을 줄여도 그룹명과 PNG 확장자를 유지한다', () => {
    const filename = qrDownloadName('칠순🎂'.repeat(100), '가족용');
    expect(new Blob([filename]).size).toBeLessThanOrEqual(255);
    expect(filename).toMatch(/ - 가족용 QR\.png$/);
    expect(filename).not.toContain('\uFFFD');
  });
});
