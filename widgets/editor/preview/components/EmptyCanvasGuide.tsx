import Link from 'next/link';

const STEPS = [
  {
    title: '표지 고르기',
    description: '분위기에 맞는 표지를 먼저 선택해요',
  },
  {
    title: '페이지 더하기',
    description: '인사말·일정·사진 블록을 차례로 담아요',
  },
  {
    title: '미리보기 · 저장',
    description: '하객이 보는 화면을 확인하고 저장해요',
  },
] as const;

/**
 * 편집기에 처음 들어왔을 때, 표지를 고르기 전까지 보이는 빈 캔버스 안내.
 * 아무것도 없는 흰 화면 대신 무엇을 어떤 순서로 하면 되는지 보여 준다.
 */
export default function EmptyCanvasGuide({
  onChoosePoster,
}: {
  onChoosePoster: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-white px-6 py-8 text-center font-pretendard">
      <div className="flex w-full max-w-[320px] flex-col items-center gap-5">
        <p className="text-[11px] font-bold tracking-[0.2em] text-[#9CA3AF]">
          FIRST STEP
        </p>

        <div className="flex flex-col gap-2">
          <h2
            id="editor-empty-guide-title"
            className="break-keep text-xl font-bold leading-8 text-text-plain"
          >
            표지부터 골라볼까요?
          </h2>
          <p className="break-keep text-sm leading-6 text-text-secondary">
            표지를 고르면 초대장의 분위기가 정해져요.
            <br />
            그다음 페이지를 더해 우리 이야기를 채워요.
          </p>
        </div>

        <ol
          aria-labelledby="editor-empty-guide-title"
          className="flex w-full flex-col gap-2"
        >
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-3 rounded-xl bg-[#F7F8FA] px-3.5 py-3 text-left"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#6B7280] shadow-[0_1px_2px_rgb(0_0_0_/_8%)]"
              >
                {index + 1}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold leading-5 text-text-plain">
                  {step.title}
                </span>
                <span className="break-keep text-[12px] leading-5 text-text-secondary">
                  {step.description}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="flex w-full flex-col items-center gap-2">
          <button
            type="button"
            className="min-h-11 w-full cursor-pointer rounded-lg bg-bg-plain px-5 text-sm font-semibold text-white transition-colors hover:bg-[#202020] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={onChoosePoster}
          >
            포스터 선택하기
          </button>
          <Link
            href="/gallery"
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-[13px] font-medium text-text-secondary underline-offset-4 hover:text-black hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            갤러리에서 디자인 먼저 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
