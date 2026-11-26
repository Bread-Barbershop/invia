import { ChevronDown } from 'lucide-react';
import React, { useId, useState } from 'react';

import { Button } from '@/components/atoms/button';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { cn } from '@/shared/utils/cn';

import styles from './accountPreview.module.css';

/** 아코디언 패널과 헤더를 잇는 식별자 묶음. */
export interface AccountGroupAccordion {
  isOpenAccount: boolean;
  panelId: string;
  headerId: string;
}

export const GroupPreview = ({
  children,
  group,
}: {
  children: (accordion: AccountGroupAccordion) => React.ReactNode;
  group: { name: string };
}) => {
  const { fontFamily } = useBodyFontInfo();
  const groupId = useId();
  const headerId = `${groupId}-header`;
  const panelId = `${groupId}-panel`;

  const [isOpenAccount, setIsOpenAccount] = useState(false);
  const displayGroupName = group.name.trim() || '그룹명';
  const handleOpenAccount = () => {
    setIsOpenAccount(prev => !prev);
  };
  return (
    <div
      className={cn(
        styles.card,
        'relative flex w-70 flex-col justify-center overflow-hidden rounded-lg border border-border-button shadow-btn-drop-black'
      )}
    >
      <Button
        id={headerId}
        className={cn(
          styles.groupButton,
          'h-[43px] w-full border-none py-2 text-sm font-bold enabled:active:bg-btn-hover',
          isOpenAccount && 'rounded-b-none'
        )}
        style={{ fontFamily }}
        type="button"
        aria-expanded={isOpenAccount}
        aria-controls={panelId}
        aria-label={`${displayGroupName} 계좌번호 ${
          isOpenAccount ? '접기' : '펼치기'
        }`}
        onClick={handleOpenAccount}
      >
        {displayGroupName}
        <div
          aria-hidden="true"
          className={cn(
            'absolute right-2 flex-center size-8 transition-transform animate-expand shrink-0',
            isOpenAccount && 'rotate-180'
          )}
        >
          <ChevronDown size={28} />
        </div>
      </Button>
      {children({ isOpenAccount, panelId, headerId })}
    </div>
  );
};
