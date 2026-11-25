'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const CATEGORIES = [
  { label: '전체', value: 'all' },
  { label: '결혼식', value: 'wedding' },
  { label: '생일', value: 'birthday' },
  { label: '세미나', value: 'seminar' },
  { label: '돌잔치', value: 'firstBirthday' },
] as const;

const LARGE_PRINT_PARAM = 'largePrint';

function GalleryCategoryTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';
  const largePrintOnly = searchParams.get(LARGE_PRINT_PARAM) === '1';

  const largePrintParams = new URLSearchParams(searchParams);
  if (largePrintOnly) {
    largePrintParams.delete(LARGE_PRINT_PARAM);
  } else {
    largePrintParams.set(LARGE_PRINT_PARAM, '1');
  }
  const largePrintQuery = largePrintParams.toString();

  return (
    <div
      role="group"
      aria-label="디자인 필터"
      className="flex flex-wrap items-center gap-x-1 gap-y-2 max-[345px]:gap-x-[3px] md:gap-3"
    >
      {CATEGORIES.map(category => {
        const selected = category.value === selectedCategory;
        const nextParams = new URLSearchParams(searchParams);

        if (category.value === 'all') {
          nextParams.delete('category');
        } else {
          nextParams.set('category', category.value);
        }

        const query = nextParams.toString();

        return (
          <Link
            key={category.value}
            href={query ? `${pathname}?${query}` : pathname}
            replace
            scroll={false}
            prefetch={false}
            aria-current={selected ? 'page' : undefined}
            className="group inline-grid min-h-11 min-w-11 cursor-pointer place-content-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1e5ca9]"
          >
            <span
              className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 text-sm/[22px] font-[550] whitespace-nowrap transition-colors max-[370px]:px-2 md:h-12 md:px-8 md:text-[20px] md:font-semibold md:shadow-edit ${
                selected
                  ? 'bg-black text-white'
                  : 'bg-[#f2f2f2] text-[#494949] group-hover:bg-black/10 md:bg-white md:text-text-plain md:group-hover:bg-[#FAFAFB]'
              }`}
            >
              {category.label}
            </span>
          </Link>
        );
      })}

      <span
        aria-hidden="true"
        className="mx-1 hidden h-6 w-px shrink-0 bg-black/15 md:mx-0 md:block"
      />

      <Link
        href={largePrintQuery ? `${pathname}?${largePrintQuery}` : pathname}
        replace
        scroll={false}
        prefetch={false}
        aria-label="읽기 편한 디자인만 보기"
        aria-current={largePrintOnly ? 'true' : undefined}
        className="group inline-grid min-h-11 min-w-11 cursor-pointer place-content-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1e5ca9]"
      >
        <span
          className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 text-sm/[22px] font-[550] whitespace-nowrap transition-colors max-[370px]:px-2 md:h-12 md:px-8 md:text-[20px] md:font-semibold md:shadow-edit ${
            largePrintOnly
              ? 'bg-black text-white'
              : 'bg-[#f2f2f2] text-[#494949] group-hover:bg-black/10 md:bg-white md:text-text-plain md:group-hover:bg-[#FAFAFB]'
          }`}
        >
          읽기 편한 디자인
        </span>
      </Link>
    </div>
  );
}

export default GalleryCategoryTabs;
