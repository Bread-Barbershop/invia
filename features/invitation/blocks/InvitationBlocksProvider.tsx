'use client';

import { createContext, useContext, type ReactNode } from 'react';

/** The minimal shape of a rendered block: what kind it is and what it holds. */
export interface InvitationBlockSource {
  component: string;
  props: unknown;
}

const EMPTY_BLOCKS: readonly InvitationBlockSource[] = [];

const InvitationBlocksContext =
  createContext<readonly InvitationBlockSource[]>(EMPTY_BLOCKS);

/**
 * Makes the invitation's whole block list available to individual blocks, so a
 * block can read invitation-level facts (such as the venue) without the guest
 * page having to thread props through every renderer.
 */
export function InvitationBlocksProvider({
  blocks,
  children,
}: {
  blocks: readonly InvitationBlockSource[];
  children: ReactNode;
}) {
  return (
    <InvitationBlocksContext.Provider value={blocks}>
      {children}
    </InvitationBlocksContext.Provider>
  );
}

export function useInvitationBlocks() {
  return useContext(InvitationBlocksContext);
}
