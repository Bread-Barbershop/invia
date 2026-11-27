/**
 * Quiet actions used within an invitation, alongside contact/interview buttons.
 *
 * The button text used to sit at #838383 on white (3.7:1) and the helper note at
 * #787878 (4.2:1), both below the 4.5:1 minimum for 14px/11px text. The dark
 * variants keep the same quiet tone on a dark invitation surface
 * (`[data-invitation-dark]`), where the plain white pill turned into a bright
 * patch and the muted grays dropped further.
 */
export const invitationActionButtonClassName =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-[#e5e5e8] bg-white px-8 py-2 text-center text-sm font-bold text-[#5b5b5b] transition-colors hover:bg-gray-50 hover:border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer [[data-invitation-dark]_&]:border-white/30 [[data-invitation-dark]_&]:bg-white/10 [[data-invitation-dark]_&]:text-white/90 [[data-invitation-dark]_&]:hover:border-white/45 [[data-invitation-dark]_&]:hover:bg-white/20 [[data-invitation-dark]_&]:focus-visible:outline-white/80';

/** The muted line under an invitation action link (where the answer is submitted). */
export const invitationActionNoteClassName =
  'text-center text-[11px] leading-relaxed text-[#6b6b6b] [[data-invitation-dark]_&]:text-white/70';
