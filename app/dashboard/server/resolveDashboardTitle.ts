import {
  customShareTitle,
  titleFromSavedInvitation,
} from '@/shared/utils/invitationTitle';

export async function resolveDashboardTitle(
  folderName: string,
  shareTitle: string | undefined,
  loadSavedData: () => Promise<unknown>
): Promise<string> {
  const baseName = folderName
    .replace(/ - \d{4}년 \d{2}월 \d{2}일 \d{2}시 \d{2}분$/, '')
    .trim();
  const generatedName = /^초대장((?: \(복사본\))*)$/.exec(baseName);
  if (baseName && !generatedName) return baseName;

  const title =
    customShareTitle(shareTitle) ||
    titleFromSavedInvitation(await loadSavedData());
  return title
    ? title + (generatedName?.[1] ?? '')
    : folderName.trim() || '제목 없는 초대장';
}
