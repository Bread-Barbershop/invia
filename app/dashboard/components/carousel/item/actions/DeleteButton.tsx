import { Loader2, Trash2 } from 'lucide-react';

import { dashboardCarouselLayout } from '../../carouselLayout';

type DeleteButtonProps = {
  isBusy?: boolean;
};

function DeleteButton({ isBusy = false }: DeleteButtonProps) {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-white transition-colors hover:bg-[#E5E7EB]"
      style={{
        width: dashboardCarouselLayout.sideActionSize,
        height: dashboardCarouselLayout.sideActionSize,
        boxShadow: dashboardCarouselLayout.sideActionShadow,
      }}
    >
      {isBusy ? (
        <Loader2
          size={dashboardCarouselLayout.sideActionIconSize}
          strokeWidth={1.5}
          color="#F32E2E"
          aria-hidden="true"
          className="motion-safe:animate-spin"
        />
      ) : (
        <Trash2
          size={dashboardCarouselLayout.sideActionIconSize}
          strokeWidth={1.5}
          color="#F32E2E"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default DeleteButton;
