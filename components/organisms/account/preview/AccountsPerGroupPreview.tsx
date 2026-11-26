import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';

import { Button } from '@/components/atoms/button';
import CopyIcon from '@/shared/assets/icons/copy.svg';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { useToast } from '@/shared/hooks/useToast';
import { cn } from '@/shared/utils/cn';
import { copyClipboardText } from '@/shared/utils/copyClipboardText';

import styles from './accountPreview.module.css';

import type { AccountEntry } from '../Account.schema';

export const AccountsPerGroupPreview = ({
  isOpenAccount,
  accountList,
  hideActions = false,
  panelId,
  headerId,
}: {
  isOpenAccount: boolean;
  accountList: AccountEntry[];
  hideActions?: boolean;
  /** 아코디언 헤더가 aria-controls로 가리키는 패널 id. */
  panelId?: string;
  /** 패널의 aria-labelledby가 가리키는 헤더 id. */
  headerId?: string;
}) => {
  const { success: successToast, error: errorToast } = useToast();
  const { fontFamily } = useBodyFontInfo();
  const [copyStatus, setCopyStatus] = useState<{
    message: string;
    key: number;
  } | null>(null);
  const statusKeyRef = useRef(0);

  // 같은 문구를 연달아 안내할 때도 스크린리더가 다시 읽도록 키를 갱신합니다.
  const announceCopyStatus = (message: string) => {
    statusKeyRef.current += 1;
    setCopyStatus({ message, key: statusKeyRef.current });
  };

  const handleCopyAccount = async (
    displayName: string,
    bank: string,
    account: string
  ) => {
    try {
      await copyClipboardText(`${bank} ${account}`);
      successToast('복사가 완료되었어요!');
      announceCopyStatus(
        `${displayName} ${bank} ${account} 계좌번호를 복사했어요.`
      );
    } catch (error) {
      console.error('copy failed:', error);
      errorToast('계좌번호를 복사하지 못했어요. 번호를 직접 복사해 주세요.');
      announceCopyStatus(
        '계좌번호를 복사하지 못했어요. 번호를 길게 눌러 직접 복사해 주세요.'
      );
    }
  };

  return (
    <AnimatePresence initial={false}>
      {isOpenAccount && (
        <motion.div
          key="account-list"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
          id={panelId}
          role="region"
          {...(headerId
            ? { 'aria-labelledby': headerId }
            : { 'aria-label': '계좌번호 목록' })}
        >
          <p role="status" className="sr-only">
            {copyStatus ? (
              <span key={copyStatus.key}>{copyStatus.message}</span>
            ) : null}
          </p>
          <div
            className={cn(styles.panel, 'flex flex-col gap-2 pb-[11px] pt-2')}
            role="list"
          >
            {accountList.map((account, j) => {
              const displayName = account.name.trim() || '예금주';
              const displayBank = account.bank.trim() || '은행';
              const displayAccount = account.account.trim() || '000-000-000000';
              const accountLabel = `${displayName} ${displayBank} 계좌번호`;

              return (
                <div
                  key={j}
                  role="listitem"
                  aria-label={`${accountLabel} ${displayAccount}`}
                  className="flex min-h-13 w-full shrink-0 items-center gap-2 pl-3 pr-2"
                >
                  <div
                    className="flex h-full w-full flex-col justify-center text-start"
                    style={{ fontFamily }}
                  >
                    <p
                      className={cn(
                        styles.holder,
                        'text-[13px] text-start font-semibold'
                      )}
                    >
                      {displayName}
                    </p>
                    <p className={cn(styles.accountValue, 'text-[13px] font-normal')}>
                      {displayBank}
                    </p>
                    <p className={cn(styles.accountValue, 'text-[13px] font-normal')}>
                      {displayAccount}
                    </p>
                  </div>
                  {!hideActions && (
                    <Button
                      type="button"
                      variant="borderless"
                      className={cn(
                        styles.copyButton,
                        'size-11 shrink-0 flex-center'
                      )}
                      aria-label={`${accountLabel} 복사`}
                      title="계좌번호 복사"
                      onClick={() =>
                        handleCopyAccount(
                          displayName,
                          displayBank,
                          displayAccount
                        )
                      }
                    >
                      <CopyIcon
                        className={styles.copyIcon}
                        aria-hidden="true"
                        focusable="false"
                      />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
