import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { normalizeChecklistItems } from '@/components/organisms/checklist/checklistItems';
import { normalizeEventGuideItems } from '@/components/organisms/eventGuide/eventGuideItems';
import { getInterviewCard } from '@/components/organisms/interview/interviewContent';
import { safeRsvpFormUrl } from '@/components/organisms/rsvp/rsvpFormUrl';
import type { EditorBlock } from '@/shared/types/block';

import type { GuestBlock } from '../types/guestTypes';

type Profile = Pick<
  EditorBlock<'myChild'>['props'],
  'messageHtml' | 'messageJson' | 'image'
>;

function hasProfileContent(profile: Profile) {
  if (profile.image?.[0]) return true;
  const html =
    profile.messageHtml ?? tiptapJsonToHtmlUniversal(profile.messageJson);
  return Boolean(html.replace(/<[^>]*>|&(?:nbsp|#160|#xa0);/gi, '').trim());
}

export function hasGuestBlockContent(block: GuestBlock) {
  if (block.privacyPlaceholder || block.privacyMediaHidden) return true;
  switch (block.component) {
    case 'organizerInformation': {
      const props = block.props as EditorBlock<'organizerInformation'>['props'];
      return Boolean(props.organizer?.trim() || hasProfileContent(props));
    }
    case 'speakerInformation': {
      const props = block.props as EditorBlock<'speakerInformation'>['props'];
      return Boolean(
        props.speakers?.some(
          speaker =>
            speaker && (speaker.name?.trim() || hasProfileContent(speaker))
        )
      );
    }
    case 'myChild': {
      const props = block.props as EditorBlock<'myChild'>['props'];
      return Boolean(
        props.name?.trim() ||
        props.nickname?.trim() ||
        props.birthday?.trim() ||
        hasProfileContent(props)
      );
    }
    case 'rsvp': {
      const props = block.props as EditorBlock<'rsvp'>['props'];
      return Boolean(safeRsvpFormUrl(props.formUrl));
    }
    case 'interview': {
      const props = block.props as EditorBlock<'interview'>['props'];
      return Boolean(props.questions?.some(getInterviewCard));
    }
    case 'eventGuide': {
      const props = block.props as EditorBlock<'eventGuide'>['props'];
      return Boolean(
        normalizeEventGuideItems(props.items).some(item => item.title.trim())
      );
    }
    case 'checklist': {
      const props = block.props as EditorBlock<'checklist'>['props'];
      return Boolean(
        normalizeChecklistItems(props.items).some(item => item.label.trim())
      );
    }
    default:
      return true;
  }
}
