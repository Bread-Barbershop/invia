'use client';

import { GuestLoadErrorRecovery } from './components/GuestLoadErrorRecovery';

type GuestErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GuestInvitationError({ error, reset }: GuestErrorProps) {
  return <GuestLoadErrorRecovery error={error} reset={reset} />;
}
