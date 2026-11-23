'use client';

import { Children, createContext, useContext } from 'react';

import { cn } from '@/shared/utils/cn';

import type { HTMLAttributes, ReactNode } from 'react';

export const BlockEditorAppearanceContext = createContext<ReactNode>(null);

interface Props extends HTMLAttributes<HTMLElement> {
  ariaLabel?: string;
}

export const LeftEditorWrapper = ({
  children,
  className,
  ariaLabel,
  ...sectionProps
}: Props) => {
  const appearance = useContext(BlockEditorAppearanceContext);
  // Detail editors put their header first, before any block-specific fields.
  const [header, ...fields] = appearance ? Children.toArray(children) : [];

  return (
    <div className="grid w-full justify-items-center">
      <section
        {...sectionProps}
        className={cn(
          'relative flex flex-col items-center gap-1 px-5 pb-1.5 w-93.75 h-fit max-h-[750px] overflow-y-auto scrollbar-hide transition-all min-h-0',
          className
        )}
        aria-label={ariaLabel}
      >
        {appearance ? (
          <>
            {header}
            {appearance}
            {fields}
          </>
        ) : (
          children
        )}
      </section>
    </div>
  );
};
