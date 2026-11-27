import Link from 'next/link';

import EditorUpdate from './components/EditorUpdate';

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uuid?: string | string[] }>;
}) {
  const { id } = await params;
  const { uuid } = await searchParams;
  if (typeof uuid !== 'string' || !uuid.trim()) {
    return (
      <section className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-xl font-semibold">초대장을 열 수 없어요.</h1>
        <p className="text-sm text-text-secondary">
          내 초대장 목록에서 해당 초대장의 편집 화면을 다시 열어 주세요.
        </p>
        <Link href="/dashboard" className="text-sm font-semibold underline">
          내 초대장으로 이동
        </Link>
      </section>
    );
  }

  return <EditorUpdate key={`${id}:${uuid}`} folderId={id} uuid={uuid} />;
}
