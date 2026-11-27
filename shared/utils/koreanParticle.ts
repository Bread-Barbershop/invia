const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const HANGUL_FINAL_COUNT = 28;

// 숫자로 끝나는 말은 읽는 소리로 받침을 판단한다. (0 영 · 1 일 · 3 삼 · 6 육 · 7 칠 · 8 팔 은 받침 있음)
const DIGIT_FINAL_CONSONANT: Record<string, boolean> = {
  '0': true,
  '1': true,
  '2': false,
  '3': true,
  '4': false,
  '5': false,
  '6': true,
  '7': true,
  '8': true,
  '9': false,
};

// 조사 판단에서 빼고 보는 문장부호·따옴표. (예: ‘모던’ → 모던)
const TRAILING_PUNCTUATION = /['"’”』」〉》)\]}.!,?…·:;]/;

/**
 * 마지막 글자에 받침이 있는지 판단한다.
 * 한글 음절과 숫자는 확정할 수 있고, 그 밖의 글자(영문 등)는 발음을 단정할 수 없어 undefined 를 돌려준다.
 */
export function hasFinalConsonant(word: string): boolean | undefined {
  const characters = [...word.trim().normalize('NFC')];
  while (
    characters.length > 0 &&
    TRAILING_PUNCTUATION.test(characters[characters.length - 1])
  ) {
    characters.pop();
  }

  const last = characters[characters.length - 1];
  if (!last) return undefined;

  const code = last.charCodeAt(0);
  if (code >= HANGUL_START && code <= HANGUL_END) {
    return (code - HANGUL_START) % HANGUL_FINAL_COUNT !== 0;
  }
  if (last >= '0' && last <= '9') return DIGIT_FINAL_CONSONANT[last];
  return undefined;
}

/**
 * 앞말에 맞는 조사를 붙여 돌려준다.
 * 발음을 단정할 수 없는 말에는 fallback 조사를 쓴다. fallback 을 주지 않으면 받침 있는 말의 조사를 쓴다.
 * 예) withParticle('모던', '과', '와') → '모던과', withParticle('선라이트', '과', '와') → '선라이트와'
 */
export function withParticle(
  word: string,
  consonantForm: string,
  vowelForm: string,
  fallback = consonantForm
): string {
  const hasBatchim = hasFinalConsonant(word);
  if (hasBatchim === undefined) return word + fallback;
  return word + (hasBatchim ? consonantForm : vowelForm);
}
