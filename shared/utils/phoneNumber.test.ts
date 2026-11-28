import { formatPhoneNumber, toPhoneHrefNumber, toTelHref } from './phoneNumber';

describe('formatPhoneNumber', () => {
  it.each([
    ['0212345678', '02-1234-5678'],
    ['021234567', '02-123-4567'],
    ['01012345678', '010-1234-5678'],
    ['0311234567', '031-123-4567'],
    ['15446867', '1544-6867'],
    ['16001234', '1600-1234'],
    ['050713418605', '0507-1341-8605'],
    ['050512345678', '0505-1234-5678'],
  ])('%s는 %s로 표시한다', (input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  it('숫자가 아닌 문자는 무시한다', () => {
    expect(formatPhoneNumber('TEL. 02-1234-5678')).toBe('02-1234-5678');
  });
});

describe('toTelHref', () => {
  it.each([
    ['010-1234-5678', 'tel:01012345678'],
    ['02 1234 5678', 'tel:0212345678'],
    ['+82 10-1234-5678', 'tel:+821012345678'],
  ])('%s는 %s로 바꾼다', (input, expected) => {
    expect(toTelHref(input)).toBe(expected);
  });

  it('숫자가 없으면 링크를 만들지 않는다', () => {
    expect(toTelHref('')).toBeNull();
    expect(toTelHref('   ')).toBeNull();
    expect(toTelHref(undefined)).toBeNull();
  });
});

describe('toPhoneHrefNumber', () => {
  it('국제번호의 +를 살린다', () => {
    expect(toPhoneHrefNumber('+82 10-1234-5678')).toBe('+821012345678');
    expect(toPhoneHrefNumber('010-1234-5678')).toBe('01012345678');
  });
});
