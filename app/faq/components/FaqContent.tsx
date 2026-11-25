'use client';

import { Check, Link2, Minus, Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ContactEmailActions from '@/features/contact/components/ContactEmailActions';
import { cn } from '@/shared/utils/cn';

import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  type FaqCategoryId,
  type FaqItem,
} from '../data';
import { copyFaqText } from '../utils/copyFaqText';
import {
  faqAnchorId,
  faqShareUrl,
  findFaqItemByAnchor,
} from '../utils/faqDeepLink';

const COPY_FEEDBACK_MS = 2400;
const LINK_HIGHLIGHT_MS = 2600;

function FaqContent() {
  const [selectedCategory, setSelectedCategory] =
    useState<FaqCategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openedItemIds, setOpenedItemIds] = useState<Set<string>>(
    () => new Set(FAQ_ITEMS[0] ? [FAQ_ITEMS[0].id] : [])
  );
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [copyFailedItemId, setCopyFailedItemId] = useState<string | null>(null);
  const [linkedItemId, setLinkedItemId] = useState<string | null>(null);
  const copyFeedbackTimer = useRef<number | null>(null);
  const linkHighlightTimer = useRef<number | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter(item => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${item.question} ${item.answer}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const allFilteredOpened =
    filteredItems.length > 0 &&
    filteredItems.every(item => openedItemIds.has(item.id));

  const toggleItem = useCallback((itemId: string) => {
    setOpenedItemIds(current => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const toggleAllFiltered = useCallback(() => {
    setOpenedItemIds(current => {
      const next = new Set(current);
      if (filteredItems.every(item => next.has(item.id))) {
        filteredItems.forEach(item => next.delete(item.id));
      } else {
        filteredItems.forEach(item => next.add(item.id));
      }
      return next;
    });
  }, [filteredItems]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

  /**
   * Opens the answer a shared link points at, clears the filters that would
   * hide it, scrolls to it, and marks it for a moment so the arriving visitor
   * can see which answer the link was about.
   */
  const revealSharedAnswer = useCallback((item: FaqItem) => {
    setSelectedCategory('all');
    setSearchQuery('');
    setOpenedItemIds(current => new Set(current).add(item.id));
    setLinkedItemId(item.id);

    window.requestAnimationFrame(() => {
      document
        .getElementById(faqAnchorId(item.id))
        ?.scrollIntoView({ block: 'start' });
    });

    if (linkHighlightTimer.current) {
      window.clearTimeout(linkHighlightTimer.current);
    }
    linkHighlightTimer.current = window.setTimeout(() => {
      setLinkedItemId(null);
      linkHighlightTimer.current = null;
    }, LINK_HIGHLIGHT_MS);
  }, []);

  useEffect(() => {
    const openAnswerFromHash = () => {
      const item = findFaqItemByAnchor(FAQ_ITEMS, window.location.hash);
      if (item) revealSharedAnswer(item);
    };

    openAnswerFromHash();
    window.addEventListener('hashchange', openAnswerFromHash);

    return () => {
      window.removeEventListener('hashchange', openAnswerFromHash);

      if (linkHighlightTimer.current) {
        window.clearTimeout(linkHighlightTimer.current);
        linkHighlightTimer.current = null;
      }
      if (copyFeedbackTimer.current) {
        window.clearTimeout(copyFeedbackTimer.current);
        copyFeedbackTimer.current = null;
      }
    };
  }, [revealSharedAnswer]);

  const handleCopyLink = useCallback(async (item: FaqItem) => {
    try {
      await copyFaqText(faqShareUrl(item.id, window.location.origin));
      setCopiedItemId(item.id);
      setCopyFailedItemId(null);
    } catch {
      setCopiedItemId(null);
      setCopyFailedItemId(item.id);
    }

    if (copyFeedbackTimer.current) {
      window.clearTimeout(copyFeedbackTimer.current);
    }
    copyFeedbackTimer.current = window.setTimeout(() => {
      setCopiedItemId(null);
      setCopyFailedItemId(null);
      copyFeedbackTimer.current = null;
    }, COPY_FEEDBACK_MS);
  }, []);

  const copyStatusMessage = copiedItemId
    ? '이 답변 링크를 복사했어요. 붙여넣어 공유할 수 있어요.'
    : copyFailedItemId
      ? '링크를 복사하지 못했어요. 주소창의 주소를 복사해 주세요.'
      : '';

  return (
    <div className="w-full px-5 pb-16 pt-12 text-[#171717] sm:px-8 lg:px-12 lg:pb-20 lg:pt-16">
      <section className="mx-auto max-w-6xl">
        <div className="grid gap-8 border-b border-black/15 pb-10 lg:grid-cols-[1fr_360px] lg:items-end lg:gap-16 lg:pb-14">
          <div>
            <p className="mb-5 text-xs font-bold tracking-[0.24em] text-black/45">
              HELP CENTER
            </p>
            <h1 className="max-w-3xl text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.9]">
              Frequently
              <br />
              asked.
            </h1>
            <p className="mt-7 text-base leading-7 text-black/60 sm:whitespace-nowrap sm:text-lg sm:leading-8">
              Invia 이용 중 궁금한 점을 빠르게 찾아보세요. 필요한 답변이 없다면
              언제든 문의를 남겨주세요.
            </p>
          </div>

          <label className="group flex items-center gap-3 border-b border-black/45 py-3 transition-colors focus-within:border-black">
            <Search className="h-5 w-5 shrink-0 text-black/50 transition-colors group-focus-within:text-black" />
            <span className="sr-only">FAQ 검색</span>
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="궁금한 내용을 검색해 보세요"
              className="w-full bg-transparent text-base outline-none placeholder:text-black/35"
            />
          </label>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-14">
          <aside>
            <p className="mb-4 text-[13px] font-bold tracking-[0.18em] text-black/40">
              CATEGORY
            </p>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
              {FAQ_CATEGORIES.map(category => {
                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`cursor-pointer rounded-full px-3.5 py-2 text-[15px] transition-colors lg:rounded-none lg:px-0 lg:py-1 ${
                      isSelected
                        ? 'bg-black font-semibold text-white lg:bg-transparent lg:text-black'
                        : 'bg-black/5 text-black/55 hover:bg-black/10 hover:text-black lg:bg-transparent lg:hover:bg-transparent'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {category.label}
                      {isSelected && (
                        <span className="hidden h-1.5 w-1.5 rounded-full bg-black lg:block" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
            <div className="mb-3 flex items-end justify-between gap-4 border-b border-black pb-4">
              <h2 className="text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">
                무엇을 도와드릴까요?
              </h2>
              <div className="flex shrink-0 items-center gap-4">
                {filteredItems.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAllFiltered}
                    className="cursor-pointer text-[13px] font-semibold text-black/50 underline decoration-black/20 underline-offset-4 transition-colors hover:text-black"
                  >
                    {allFilteredOpened ? '모두 접기' : '모두 펼치기'}
                  </button>
                )}
                <span className="text-sm tabular-nums text-black/45">
                  {String(filteredItems.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            <p aria-live="polite" className="sr-only">
              {copyStatusMessage}
            </p>

            {filteredItems.length > 0 ? (
              <div>
                {filteredItems.map((item, index) => {
                  const isOpened = openedItemIds.has(item.id);
                  const isLinked = linkedItemId === item.id;
                  const isCopied = copiedItemId === item.id;
                  const answerId = `${item.id}-answer`;

                  return (
                    <article
                      key={item.id}
                      id={faqAnchorId(item.id)}
                      className={cn(
                        'scroll-mt-24 border-b border-black/15 transition-colors duration-500 motion-reduce:transition-none',
                        isLinked && 'bg-black/[0.04]'
                      )}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpened}
                        aria-controls={answerId}
                        onClick={() => toggleItem(item.id)}
                        className="flex w-full cursor-pointer items-start gap-4 py-5 text-left sm:gap-7 sm:py-6"
                      >
                        <span className="pt-0.5 text-xs font-semibold tabular-nums text-black/35">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1 text-base font-semibold leading-6 tracking-[-0.02em] sm:text-lg sm:leading-7">
                          {item.question}
                        </span>
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/20">
                          {isOpened ? (
                            <Minus className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </button>

                      <div
                        id={answerId}
                        aria-hidden={!isOpened}
                        inert={!isOpened ? true : undefined}
                        className={`grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none ${
                          isOpened
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="pb-6 pl-8 pr-11 sm:pb-7 sm:pl-14 sm:pr-16">
                            <p className="text-sm leading-7 text-black/60 sm:text-base sm:leading-7">
                              {item.answer}
                            </p>
                            <button
                              type="button"
                              onClick={() => void handleCopyLink(item)}
                              aria-label={`‘${item.question}’ 답변 링크 복사`}
                              className={cn(
                                'mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                                isCopied
                                  ? 'border-black/45 text-black'
                                  : 'border-black/15 text-black/50 hover:border-black/35 hover:text-black'
                              )}
                            >
                              {isCopied ? (
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              ) : (
                                <Link2
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              )}
                              {isCopied ? '링크 복사됨' : '답변 링크 복사'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center border-b border-black/15 px-4 text-center">
                <p className="text-lg font-semibold">검색 결과가 없습니다.</p>
                <p className="mt-2 text-sm leading-6 text-black/50">
                  다른 검색어를 입력하거나 카테고리를 변경해 보세요.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 cursor-pointer rounded-full border border-black/20 px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:border-black/45"
                >
                  전체 질문 보기
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="mt-4 grid gap-7 rounded-[2rem] bg-[#171717] px-7 py-8 text-white sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-white/45">
              STILL CURIOUS?
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] sm:text-4xl">
              찾는 답변이 없나요?
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
              문의를 남겨주시면 확인 후 답변드리겠습니다.
            </p>
          </div>

          <ContactEmailActions />
        </section>
      </section>
    </div>
  );
}

export default FaqContent;
