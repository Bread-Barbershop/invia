import { ChevronRight, type LucideIcon } from 'lucide-react';

export const shareRow =
  'flex min-h-12 w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-neutral-50 focus-visible:outline-2 disabled:opacity-50';

export function ShareActionLabel({
  icon: Icon,
  title,
  detail,
  tone = 'bg-neutral-100 text-neutral-700',
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  tone?: string;
}) {
  return (
    <>
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}
      >
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs font-normal text-gray-600">
          {detail}
        </span>
      </span>
      <ChevronRight
        size={16}
        className="shrink-0 text-neutral-400"
        aria-hidden="true"
      />
    </>
  );
}
