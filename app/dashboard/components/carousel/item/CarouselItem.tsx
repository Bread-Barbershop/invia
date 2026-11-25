import { Copy } from 'lucide-react';
import Image from 'next/image';
import { KeyboardEvent, MouseEvent, useEffect, useId, useState } from 'react';

import type {
  InvitationPreviewTarget,
  InviteListItem,
} from '@/app/dashboard/types';
import { resolveCardActionFailureMessage } from '@/app/dashboard/utils/cardActionMessage';
import { formatInvitationCreatedDate } from '@/app/dashboard/utils/formatInvitationCreatedDate';
import KakaoIcon from '@/shared/assets/icons/kakao2.svg';
import LinkIcon from '@/shared/assets/icons/link.svg';
import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';
import { cn } from '@/shared/utils/cn';
import InvitationTemplatePoster from '@/widgets/editor/preview/components/InvitationTemplatePoster';

import createdDateStyles from '../carouselCreatedDate.module.css';
import { dashboardCarouselLayout } from '../carouselLayout';
import {
  CarouselCardItem,
  type ShareAudienceLink,
  type ShareAudienceWithKakao,
} from '../carouselTypes';

import DashboardActionButton from './actions/DashboardActionButton';
import DashboardCardActionAlert from './actions/DashboardCardActionAlert';
import DeleteButton from './actions/DeleteButton';
import InvitationAudienceButton from './actions/InvitationAudienceButton';
import { useAudienceShare } from './actions/useAudienceShare';
import ItemHeader from './ItemHeader';

function getImageKey(image: CarouselCardItem['image']) {
  return typeof image === 'string' ? image : image.src;
}

type CarouselItemProps = {
  item: CarouselCardItem;
  index: number;
  isSelected: boolean;
  showHeader?: boolean;
  showSideActions?: boolean;
  showCenterActions?: boolean;
  selectedLift?: string;
  preloadImage?: boolean;
  showPreviewLabel?: boolean;
  onSelect: (index: number) => void;
  onClone?: (invite: InviteListItem) => void;
  onDelete?: (folderId: string) => void | Promise<void>;
  onPreview?: (target: InvitationPreviewTarget) => void;
  onUpdate?: (folderId: string, uuid?: string) => void;
  onToggleVisibility?: (
    folderId: string,
    nextVisible: boolean
  ) => void | Promise<void>;
  onOpenLinkShare?: ShareAudienceLink;
  onShare?: ShareAudienceWithKakao;
  guestUrl: string | null;
  isDeleting: boolean;
  isSharing: boolean;
  isVisibilityUpdating: boolean;
  visibilityError: string | null;
};

function CarouselItem({
  item,
  index,
  isSelected,
  showHeader = false,
  showSideActions = false,
  showCenterActions = false,
  selectedLift: selectedLiftProp = dashboardCarouselLayout.selectedLift,
  preloadImage = false,
  showPreviewLabel = false,
  onSelect,
  onClone,
  onDelete,
  onPreview,
  onUpdate,
  onToggleVisibility,
  onOpenLinkShare,
  onShare,
  guestUrl: guestUrlProp,
  isDeleting,
  isSharing,
  isVisibilityUpdating,
  visibilityError,
}: CarouselItemProps) {
  const currentImageKey = getImageKey(item.image);
  const collectionTemplate = showPreviewLabel
    ? INVITATION_TEMPLATES.find(template => template.id === item.id)
    : undefined;
  const cardWidth = collectionTemplate
    ? `${(Number.parseFloat(dashboardCarouselLayout.cardHeight) * collectionTemplate.poster.width) / collectionTemplate.poster.height}px`
    : dashboardCarouselLayout.cardWidth;
  const [hasImageError, setHasImageError] = useState(false);
  const [dismissedVisibilityError, setDismissedVisibilityError] = useState<
    string | null
  >(null);
  const [dismissedShareError, setDismissedShareError] = useState<string | null>(
    null
  );
  const invite = item.invite;
  const title = invite?.displayTitle ?? invite?.name ?? item.alt;
  const createdDateId = useId();
  const createdDate = showHeader
    ? formatInvitationCreatedDate(invite?.createdTime)
    : undefined;
  const guestUrl = invite?.guestUrl ?? guestUrlProp;
  const isPublished = invite?.published ?? Boolean(guestUrlProp);
  const readiness = invite?.readiness ?? (guestUrl ? 'ready' : 'idle');
  const isPending =
    Boolean(invite?.isPending) ||
    readiness === 'pending' ||
    readiness === 'checking';
  const audienceShare = useAudienceShare({
    invite,
    guestUrl,
    active: isSelected && showCenterActions && !isPending,
    onOpenLinkShare,
    onKakao: onShare,
    isSharing,
  });
  const canToggleVisibility = Boolean(
    invite && !isPending && !isVisibilityUpdating
  );
  const visibilityFailure =
    visibilityError && visibilityError !== dismissedVisibilityError
      ? resolveCardActionFailureMessage('visibility', visibilityError)
      : null;
  const shareFailure =
    audienceShare.error && audienceShare.error !== dismissedShareError
      ? resolveCardActionFailureMessage('share', audienceShare.error)
      : null;
  const showSelectedOverlay =
    showHeader || showSideActions || showCenterActions;
  const hoverLift = showHeader
    ? `calc(${selectedLiftProp} - ${dashboardCarouselLayout.headerHeight})`
    : selectedLiftProp;
  const selectedLift = showHeader
    ? `calc(${selectedLiftProp} + ${dashboardCarouselLayout.headerHeight})`
    : selectedLiftProp;
  const displayImage =
    hasImageError && item.fallbackImage ? item.fallbackImage : item.image;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasImageError(false);
  }, [currentImageKey]);

  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(index);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(index)}
      onKeyDown={handleKeyDown}
      aria-label={showPreviewLabel ? `${item.alt} 미리보기` : title}
      aria-describedby={createdDate ? createdDateId : undefined}
      aria-haspopup={showPreviewLabel ? 'dialog' : undefined}
      aria-pressed={showPreviewLabel ? undefined : isSelected}
      className={cn(
        'group relative shrink-0 overflow-visible cursor-pointer select-none text-left',
        isSelected ? 'z-10' : 'hover:z-10',
        showHeader && ['focus-within:z-10', createdDateStyles.slide]
      )}
      draggable={false}
      style={{
        width: cardWidth,
        height: dashboardCarouselLayout.cardHeight,
        // Embla includes the final slide's margin when measuring a full loop.
        marginInlineEnd: showPreviewLabel
          ? dashboardCarouselLayout.trackGap
          : undefined,
      }}
    >
      <div
        className={cn(
          'relative overflow-visible transition-transform motion-reduce:transition-none',
          isSelected
            ? '[transform:translateY(calc(-1*var(--carousel-selected-lift)))]'
            : 'group-hover:[transform:translateY(calc(-1*var(--carousel-hover-lift)))]',
          !isSelected &&
            showHeader &&
            'group-focus-within:[transform:translateY(calc(-1*var(--carousel-hover-lift)))]',
          showPreviewLabel &&
            'group-focus-visible:[transform:translateY(calc(-1*var(--carousel-hover-lift)))]'
        )}
        style={{
          transitionDuration: `${dashboardCarouselLayout.cardLiftDurationMs}ms`,
          ['--carousel-hover-lift' as string]: hoverLift,
          ['--carousel-selected-lift' as string]: selectedLift,
          height:
            isSelected && showHeader
              ? dashboardCarouselLayout.selectedVisualHeight
              : dashboardCarouselLayout.cardHeight,
        }}
      >
        {createdDate && (
          <time
            id={createdDateId}
            dateTime={invite?.createdTime}
            className={cn(
              'pointer-events-none absolute bottom-[calc(100%+8px)] left-0 whitespace-nowrap font-pretendard text-xs leading-4 text-text-secondary transition-opacity duration-200 motion-reduce:transition-none',
              createdDateStyles.date
            )}
          >
            {createdDate}
          </time>
        )}
        {isSelected && showSideActions && invite && (
          <div
            className="absolute z-20 flex translate-x-1/2 -translate-y-1/2 flex-col"
            style={{
              top: dashboardCarouselLayout.actionTop,
              right: dashboardCarouselLayout.actionRight,
              gap: dashboardCarouselLayout.sideActionGap,
              minHeight: dashboardCarouselLayout.sideActionSize,
            }}
          >
            {onClone && (
              <button
                type="button"
                onClick={event => {
                  handleActionClick(event);
                  event.currentTarget.focus();
                  onClone(invite);
                }}
                className="flex cursor-pointer items-center justify-center rounded-lg bg-white transition-colors hover:bg-[#E5E7EB]"
                style={{
                  width: dashboardCarouselLayout.sideActionSize,
                  height: dashboardCarouselLayout.sideActionSize,
                  boxShadow: dashboardCarouselLayout.sideActionShadow,
                }}
                aria-label="초대장 복사"
                aria-haspopup="dialog"
              >
                <Copy
                  size={dashboardCarouselLayout.sideActionIconSize}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </button>
            )}
            <InvitationAudienceButton
              invite={invite}
              action="preview"
              onSelect={onPreview}
            />
            <button
              type="button"
              disabled={isDeleting}
              onClick={event => {
                handleActionClick(event);
                if (isDeleting) return;
                event.currentTarget.focus();
                void onDelete?.(invite.folderId);
              }}
              className={
                isDeleting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }
              aria-disabled={isDeleting}
              aria-busy={isDeleting}
              aria-label={isDeleting ? '초대장 삭제 중' : '초대장 삭제'}
              aria-haspopup="dialog"
            >
              <DeleteButton isBusy={isDeleting} />
            </button>
          </div>
        )}

        <div
          className={`absolute bottom-0 left-0 z-10 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.06),0_2px_10px_rgba(0,0,0,0.08)] ${
            showPreviewLabel
              ? 'transition-shadow duration-300 ease-in-out motion-reduce:transition-none group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.13)] group-focus-visible:shadow-[0_12px_32px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.13)]'
              : ''
          }`}
          style={{
            width: cardWidth,
            height:
              isSelected && showHeader
                ? dashboardCarouselLayout.selectedVisualHeight
                : dashboardCarouselLayout.cardHeight,
          }}
        >
          {isSelected && showHeader && (
            <div className="absolute top-0 left-0 z-10">
              <ItemHeader
                hasAudienceGroups={invite?.hasAudienceGroups}
                audienceVisibility={invite?.audienceVisibility}
                invitationTitle={title}
                isPublished={isPublished}
                disabled={!canToggleVisibility}
                isBusy={isVisibilityUpdating}
                hasError={Boolean(visibilityError)}
                onToggle={() => {
                  if (!invite || !canToggleVisibility) return;
                  void onToggleVisibility?.(invite.folderId, !isPublished);
                }}
              />
            </div>
          )}

          {visibilityFailure && isSelected && showHeader && (
            <DashboardCardActionAlert
              title={visibilityFailure.title}
              description={visibilityFailure.description}
              actionLabel="다시 시도"
              onAction={() => {
                if (!invite || !canToggleVisibility) return;
                setDismissedVisibilityError(null);
                void onToggleVisibility?.(invite.folderId, !isPublished);
              }}
              onDismiss={() => setDismissedVisibilityError(visibilityError)}
              className="absolute inset-x-2 z-30"
              style={{
                top: `calc(${dashboardCarouselLayout.headerHeight} + 8px)`,
              }}
            />
          )}

          <div
            className={`absolute bottom-0 left-0 overflow-hidden ${
              isSelected && showHeader ? 'rounded-b-xl' : 'rounded-xl'
            }`}
            style={{
              width: cardWidth,
              height: dashboardCarouselLayout.cardHeight,
            }}
          >
            {collectionTemplate ? (
              <InvitationTemplatePoster
                template={collectionTemplate}
                sizes={cardWidth}
              />
            ) : (
              <Image
                src={displayImage}
                alt={item.alt}
                fill
                sizes="260px"
                preload={preloadImage}
                unoptimized={typeof displayImage === 'string'}
                draggable={false}
                className="object-cover"
                onError={() => {
                  if (!hasImageError && item.fallbackImage) {
                    setHasImageError(true);
                  }
                }}
              />
            )}
            <div
              className={`absolute inset-0 bg-black/8 transition-opacity duration-300 ${
                isSelected && showSelectedOverlay ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {showPreviewLabel && (
              <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/40 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-300 ease-in-out motion-reduce:transition-none group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/95 px-5 py-3 text-[13px] font-semibold text-[#252522] shadow-lg backdrop-blur-sm">
                  미리보기 <span aria-hidden="true">↗</span>
                </span>
              </div>
            )}
            {showHeader && invite && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-white/95 px-3 py-2 text-text-plain">
                <p
                  className="pointer-events-auto line-clamp-2 break-words font-pretendard text-[15px] font-semibold leading-5"
                  title={title}
                >
                  {title}
                </p>
              </div>
            )}
            {isPending && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/72 text-text-plain backdrop-blur-[2px]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-border-plain" />
                <p className="font-pretendard text-[13px] font-semibold leading-[18px]">
                  초대장 준비 중
                </p>
              </div>
            )}
            {isSelected && showCenterActions && invite && (
              <div
                className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center"
                style={{
                  gap: dashboardCarouselLayout.centerActionGap,
                  paddingBottom:
                    dashboardCarouselLayout.centerActionBottomPadding,
                }}
              >
                {shareFailure && (
                  <DashboardCardActionAlert
                    title={shareFailure.title}
                    description={shareFailure.description}
                    actionLabel="다시 준비"
                    onAction={audienceShare.retry}
                    onDismiss={() =>
                      setDismissedShareError(audienceShare.error ?? null)
                    }
                    className="mb-1 w-full"
                  />
                )}
                <DashboardActionButton
                  icon={KakaoIcon}
                  variant="kakao"
                  {...audienceShare.kakaoButtonProps}
                >
                  {audienceShare.kakaoLabel}
                </DashboardActionButton>
                <span aria-live="polite" className="sr-only">
                  {audienceShare.statusLabel}
                </span>
                {audienceShare.picker}
                <DashboardActionButton
                  icon={LinkIcon}
                  variant="url"
                  {...audienceShare.linkButtonProps}
                >
                  {audienceShare.linkLabel}
                </DashboardActionButton>
                <InvitationAudienceButton
                  invite={invite}
                  action="edit"
                  onSelect={onUpdate}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CarouselItem;
