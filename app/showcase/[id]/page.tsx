import { notFound } from 'next/navigation';

import { buildShowcaseInvitation } from '@/shared/data/buildShowcaseInvitation';
import {
  getShowcaseInvitation,
  SHOWCASE_INVITATIONS,
} from '@/shared/data/showcaseInvitations';

import ShowcaseDocument from './ShowcaseDocument';
import { buildShowcaseMetadata } from './showcaseMetadata';

import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return buildShowcaseMetadata(id);
}

export function generateStaticParams() {
  return SHOWCASE_INVITATIONS.map(({ id }) => ({ id }));
}

export default async function ShowcasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const design = getShowcaseInvitation(id);
  if (!design) notFound();
  const invitation = buildShowcaseInvitation(design);

  return (
    <main style={{ backgroundColor: design.palette[0] }} className="min-h-dvh">
      <div className="mx-auto w-full max-w-[430px]">
        <ShowcaseDocument {...invitation} design={design} />
      </div>
    </main>
  );
}
