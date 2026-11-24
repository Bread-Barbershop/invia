import { cn } from '@/shared/utils/cn';
import { DEFAULT_IMAGE_URL } from '@/shared/utils/shareUrlDefaults';

export function ShareThumbnail({ imageUrl, className }: {
  imageUrl: string | null;
  className: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl || DEFAULT_IMAGE_URL}
      alt="공유 썸네일"
      className={cn(className, imageUrl ? 'object-cover' : 'bg-white object-contain')}
    />
  );
}
