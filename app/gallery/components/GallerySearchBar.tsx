'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { GALLERY_QUERY_PARAM } from './gallerySearchParams';

/**
 * 갤러리 템플릿 검색 입력. 검색어는 주소(?q=)에 남겨
 * 분류를 바꾸거나 링크를 공유해도 같은 결과가 이어지게 한다.
 */
function GallerySearchBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get(GALLERY_QUERY_PARAM) ?? '';
  const [value, setValue] = useState(urlQuery);

  // 뒤로가기나 분류 이동처럼 주소의 검색어가 바뀌면 입력창도 따라간다.
  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  const buildHref = (nextValue: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const trimmed = nextValue.trim();
    if (trimmed) {
      nextParams.set(GALLERY_QUERY_PARAM, trimmed);
    } else {
      nextParams.delete(GALLERY_QUERY_PARAM);
    }
    const query = nextParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const replaceQuery = (nextValue: string) => {
    router.replace(buildHref(nextValue), { scroll: false });
  };

  useEffect(() => {
    if (value.trim() === urlQuery) return;

    const timer = setTimeout(() => replaceQuery(value), 300);
    return () => clearTimeout(timer);
    // replaceQuery는 현재 주소를 그대로 쓰므로, 주소 구성요소가 바뀔 때만 다시 건다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, urlQuery, pathname, searchParams]);

  const reset = () => {
    setValue('');
    replaceQuery('');
  };

  return (
    <form
      role="search"
      onSubmit={event => {
        event.preventDefault();
        replaceQuery(value);
      }}
      className="relative flex h-11 w-full shrink-0 items-center gap-2 rounded-full bg-white px-4 shadow-edit focus-within:ring-2 focus-within:ring-[#1e5ca9] md:h-12 md:w-72 md:px-5"
    >
      <Search size={16} className="shrink-0 text-neutral-400" aria-hidden="true" />
      <label htmlFor="gallery-search" className="sr-only">
        템플릿 검색
      </label>
      <input
        id="gallery-search"
        type="search"
        value={value}
        onChange={event => setValue(event.target.value)}
        placeholder="이름·분위기로 찾기"
        className="w-full bg-transparent text-sm text-[#111] outline-none placeholder:text-neutral-400 md:text-base"
      />
      {value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={reset}
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-neutral-700"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}

export default GallerySearchBar;
