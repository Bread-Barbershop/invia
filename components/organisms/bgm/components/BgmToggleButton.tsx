'use client';

import clsx from 'clsx';
import { useMemo } from 'react';

interface BgmToggleButtonProps {
  isOn: boolean;
  onToggle: () => void;
  className?: string;
}

export const BGM_TOGGLE_LABEL = '배경음악';

export default function BgmToggleButton({
  isOn,
  onToggle,
  className,
}: BgmToggleButtonProps) {
  const delays = useMemo(() => [0, -0.1, -0.2, -0.3], []);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={BGM_TOGGLE_LABEL}
      aria-pressed={isOn}
      title={isOn ? '배경음악 끄기' : '배경음악 켜기'}
      className={clsx(
        // 터치 영역은 44×44, 보이는 원은 기존 32px 그대로 두어 배치가 흔들리지 않게 -m-1.5로 중심을 맞춘다.
        'group absolute right-4 top-4 -m-1.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:ring-2 focus-visible:ring-black/45',
        className
      )}
    >
      <span
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full bg-black/[16%] backdrop-blur-md transition-colors',
          'group-hover:bg-black/[26%] group-active:bg-black/[32%]'
        )}
      >
        <span
          className={clsx(
            'flex gap-0.5',
            isOn ? 'items-end' : 'items-center'
          )}
        >
          {delays.map((delay, i) => (
            <span
              key={i}
              className={clsx(
                'w-0.5 h-3 bg-white rounded-full transition-all duration-500',
                isOn ? 'animate-eq' : 'scale-y-25 opacity-40'
              )}
              style={{
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </span>
      </span>
    </button>
  );
}
