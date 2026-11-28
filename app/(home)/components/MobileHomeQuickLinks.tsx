import Link from 'next/link';

const LINK_CLASS =
  'inline-flex min-h-11 cursor-pointer items-center rounded-full px-2 text-[13px] font-semibold text-[#4d4d4d] underline-offset-4 transition-colors hover:text-black hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5ca9]';

/**
 * 모바일 홈은 편집기 진입을 안내 모달로 막지만, 갤러리·FAQ는 휴대폰에서도 쓸 수 있다.
 * 막다른 화면이 되지 않도록 둘러보기 경로를 항상 함께 노출한다.
 */
export default function MobileHomeQuickLinks() {
  return (
    <nav
      aria-label="둘러보기"
      className="flex items-center justify-center gap-1 text-text-plain"
    >
      <Link href="/gallery" className={LINK_CLASS}>
        갤러리 둘러보기
      </Link>
      <span aria-hidden="true" className="h-3 w-px bg-black/15" />
      <Link href="/faq" className={LINK_CLASS}>
        자주 묻는 질문
      </Link>
    </nav>
  );
}
