'use client';

import { GuestLoadErrorRecovery } from '@/app/guest/[id]/components/GuestLoadErrorRecovery';

type ShortGuestErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ShortGuestInvitationError({
  error,
  reset,
}: ShortGuestErrorProps) {
  return <GuestLoadErrorRecovery error={error} reset={reset} />;
}
