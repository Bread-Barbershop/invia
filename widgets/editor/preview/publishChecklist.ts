/**
 * 저장·발행 전 초대장 완성도 체크리스트.
 *
 * 편집기 상태(블록 목록·표지 캔버스)만 보고 "하객에게 그대로 공유해도 되는지"를
 * 판단한다. 화면과 분리된 순수 함수라 테스트에서 그대로 검증한다.
 */

export type PublishChecklistSeverity = 'required' | 'recommended';

/** 체크리스트 항목을 눌렀을 때 편집기에서 열어 줄 위치 */
export type PublishChecklistTarget = 'poster' | 'shareUrl' | 'block';

export interface PublishChecklistBlock {
  id: string;
  component: string;
  type?: string;
  props?: Record<string, unknown> | null;
}

export interface PublishChecklistInput {
  blocks: readonly PublishChecklistBlock[];
  /** 링크 공유·미리보기에 쓰는 초대장 제목 */
  title?: string;
  /** 표지 캔버스의 객체 수. 알 수 없으면 넘기지 않는다. */
  posterObjectCount?: number;
  /** 표지에 남아 있는 템플릿 예시 문구 */
  posterExampleTexts?: readonly string[];
  /** 기준 날짜(테스트 주입용) */
  now?: Date;
}

export interface PublishChecklistItem {
  id: string;
  severity: PublishChecklistSeverity;
  title: string;
  detail: string;
  /** 항목을 눌렀을 때 이동할 곳. 없으면 이동 없이 안내만 한다. */
  target?: PublishChecklistTarget;
  /** target 이 'block' 일 때 선택할 블록 id */
  blockId?: string;
  /** 항목을 눌렀을 때 할 일 안내(버튼 라벨) */
  actionLabel: string;
}

export interface PublishChecklistResult {
  items: PublishChecklistItem[];
  requiredCount: number;
  recommendedCount: number;
  /** 필수·권장 항목이 모두 채워졌는지 */
  isReady: boolean;
}

/** 템플릿에 남아 있는 자리표시자 주소·이름 흔적 */
const SAMPLE_PLACEHOLDER = /(0{3,}\s*홀|o{3,}|홍길동|예시\s*(주소|장소|이름))/i;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function dateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** calendar 블록 기본값(오늘 + 7일)이 그대로인지 */
function isSampleDate(date: string, now: Date) {
  const sample = new Date(now);
  sample.setDate(sample.getDate() + 7);
  return date === dateInputValue(sample);
}

function hasRichText(value: unknown): boolean {
  if (typeof value === 'string') return value.replace(/<[^>]*>/g, '').trim().length > 0;
  const doc = asRecord(value);
  if (Array.isArray(doc.content)) return doc.content.length > 0;
  return false;
}

function quoteList(texts: readonly string[]) {
  const shown = texts.slice(0, 3).map(item => `“${item}”`);
  if (texts.length > shown.length) shown.push(`외 ${texts.length - shown.length}개`);
  return shown.join(' · ');
}

function firstOf(blocks: readonly PublishChecklistBlock[], component: string) {
  return blocks.find(block => block.component === component);
}

function withMoreSuffix(title: string, count: number) {
  return count > 1 ? `${title} (외 ${count - 1}곳)` : title;
}

function collectBlockItems(
  blocks: readonly PublishChecklistBlock[],
  now: Date
): PublishChecklistItem[] {
  const items: PublishChecklistItem[] = [];

  const calendar = firstOf(blocks, 'calendar');
  if (calendar) {
    const props = asRecord(calendar.props);
    const date = text(props.date);
    const time = text(props.time);
    if (!date) {
      items.push({
        id: 'calendar-date-missing',
        severity: 'required',
        title: '행사 날짜가 비어 있어요',
        detail: '일정 블록에 날짜를 넣어야 하객이 언제인지 알 수 있어요.',
        target: 'block',
        blockId: calendar.id,
        actionLabel: '일정 입력',
      });
    } else if (isSampleDate(date, now)) {
      items.push({
        id: 'calendar-date-sample',
        severity: 'required',
        title: '행사 일시가 아직 예시예요',
        detail: `템플릿 기본값(${date}${time ? ` ${time}` : ''})이 그대로예요.`,
        target: 'block',
        blockId: calendar.id,
        actionLabel: '일정 확인',
      });
    }
  }

  const place = firstOf(blocks, 'place');
  if (place) {
    const props = asRecord(place.props);
    const placeName = text(props.placeName);
    const address = text(props.placeAddress);
    const lat = typeof props.lat === 'number' ? props.lat : 0;
    const lng = typeof props.lng === 'number' ? props.lng : 0;
    if (!placeName && !address) {
      items.push({
        id: 'place-empty',
        severity: 'required',
        title: '장소를 아직 입력하지 않았어요',
        detail: '주소가 없으면 하객이 오시는 길을 찾을 수 없어요.',
        target: 'block',
        blockId: place.id,
        actionLabel: '장소 입력',
      });
    } else {
      const sample = [placeName, address].find(value => SAMPLE_PLACEHOLDER.test(value));
      if (sample) {
        items.push({
          id: 'place-example',
          severity: 'required',
          title: '장소에 예시 주소가 남아 있어요',
          detail: `“${sample}” — 실제 장소로 바꿔 주세요.`,
          target: 'block',
          blockId: place.id,
          actionLabel: '장소 고치기',
        });
      } else if (!lat || !lng) {
        items.push({
          id: 'place-coordinates',
          severity: 'recommended',
          title: '지도 위치가 아직 없어요',
          detail: '지도·길찾기 버튼이 주소 검색으로만 열려요.',
          target: 'block',
          blockId: place.id,
          actionLabel: '지도 위치 잡기',
        });
      }
    }
  }

  const greeting = firstOf(blocks, 'greeting');
  if (greeting) {
    const props = asRecord(greeting.props);
    if (!hasRichText(props.messageHtml) && !hasRichText(props.messageJson)) {
      items.push({
        id: 'greeting-empty',
        severity: 'recommended',
        title: '인사말이 비어 있어요',
        detail: '한두 문장만 채워도 초대장이 훨씬 다정해져요.',
        target: 'block',
        blockId: greeting.id,
        actionLabel: '인사말 쓰기',
      });
    }
  }

  const phone = firstOf(blocks, 'phone');
  if (phone) {
    const props = asRecord(phone.props);
    const groups = Array.isArray(props.groups) ? props.groups : [];
    const hasNumber = groups.some(group => {
      const contacts = asRecord(group).contacts;
      return (
        Array.isArray(contacts) &&
        contacts.some(contact => text(asRecord(contact).number).length > 0)
      );
    });
    if (!hasNumber) {
      items.push({
        id: 'phone-empty',
        severity: 'recommended',
        title: '연락처가 비어 있어요',
        detail: '문의할 곳이 없으면 하객이 물어볼 수 없어요.',
        target: 'block',
        blockId: phone.id,
        actionLabel: '연락처 입력',
      });
    }
  }

  const account = firstOf(blocks, 'account');
  if (account) {
    const props = asRecord(account.props);
    const list = Array.isArray(props.accountList) ? props.accountList : [];
    const hasAccount = list.some(group =>
      Array.isArray(group)
        ? group.some(entry => {
            const item = asRecord(entry);
            return Boolean(text(item.bank) || text(item.account) || text(item.name));
          })
        : false
    );
    if (!hasAccount) {
      items.push({
        id: 'account-empty',
        severity: 'recommended',
        title: '계좌 정보가 비어 있어요',
        detail: '마음 보내실 곳을 비워 두면 하객이 계좌를 물어보게 돼요.',
        target: 'block',
        blockId: account.id,
        actionLabel: '계좌 입력',
      });
    }
  }

  return items;
}

function collectMissingSectionItems(
  blocks: readonly PublishChecklistBlock[]
): PublishChecklistItem[] {
  const items: PublishChecklistItem[] = [];

  if (blocks.length === 0) {
    items.push({
      id: 'no-blocks',
      severity: 'recommended',
      title: '본문 블록이 아직 없어요',
      detail: '인사말·일정·장소 블록을 더하면 초대장이 완성돼요.',
      actionLabel: '블록 추가',
    });
    return items;
  }

  if (!firstOf(blocks, 'calendar')) {
    items.push({
      id: 'no-calendar',
      severity: 'recommended',
      title: '일정 블록이 없어요',
      detail: '하객이 날짜와 시간을 한눈에 확인할 수 있어요.',
      actionLabel: '일정 블록 추가',
    });
  }

  if (!firstOf(blocks, 'place')) {
    items.push({
      id: 'no-place',
      severity: 'recommended',
      title: '장소 블록이 없어요',
      detail: '주소와 지도를 함께 보여 주면 헤매지 않아요.',
      actionLabel: '장소 블록 추가',
    });
  }

  return items;
}

export function buildPublishChecklist(
  input: PublishChecklistInput
): PublishChecklistResult {
  const blocks = input.blocks ?? [];
  const items: PublishChecklistItem[] = [];

  if (typeof input.posterObjectCount === 'number' && input.posterObjectCount === 0) {
    items.push({
      id: 'poster-empty',
      severity: 'required',
      title: '표지가 아직 비어 있어요',
      detail: '포스터를 고르면 초대장 첫 화면이 완성돼요.',
      target: 'poster',
      actionLabel: '포스터 고르기',
    });
  }

  const posterExamples = input.posterExampleTexts ?? [];
  if (posterExamples.length > 0) {
    items.push({
      id: 'poster-example',
      severity: 'required',
      title: withMoreSuffix('표지에 예시 문구가 남아 있어요', posterExamples.length),
      detail: `${quoteList(posterExamples)} — 본문을 바꿔도 표지 문구는 그대로 발행돼요.`,
      target: 'poster',
      actionLabel: '표지 고치기',
    });
  }

  if (!text(input.title)) {
    items.push({
      id: 'title-missing',
      severity: 'required',
      title: '초대장 제목이 없어요',
      detail: '링크 공유 카드와 미리보기에 이 제목이 보여요.',
      target: 'shareUrl',
      actionLabel: '제목 정하기',
    });
  }

  items.push(...collectBlockItems(blocks, input.now ?? new Date()));
  items.push(...collectMissingSectionItems(blocks));

  const requiredCount = items.filter(item => item.severity === 'required').length;
  const recommendedCount = items.length - requiredCount;

  return {
    items,
    requiredCount,
    recommendedCount,
    isReady: items.length === 0,
  };
}

/** 체크리스트 요약 문구 (모달 머리말·스크린리더 안내에 함께 쓴다) */
export function publishChecklistSummary(result: PublishChecklistResult) {
  if (result.isReady) return '필수 항목을 모두 채웠어요. 바로 저장할 수 있어요.';
  const parts: string[] = [];
  if (result.requiredCount > 0) parts.push(`꼭 확인할 항목 ${result.requiredCount}개`);
  if (result.recommendedCount > 0) parts.push(`권장 항목 ${result.recommendedCount}개`);
  return `${parts.join(' · ')}가 남아 있어요.`;
}
