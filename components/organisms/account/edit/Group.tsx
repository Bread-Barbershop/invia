import { UtilityButton } from '@/components/atoms/button';
import { ActionField } from '@/components/molecules/action-field';
import { MultiField } from '@/components/molecules/multi-field';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextField } from '@/components/molecules/text-field';

import type { AccountEntry } from '../Account.schema';
import type { RefObject } from 'react';

interface Props {
  groupIndex: number;
  groupName: string;
  accountList: AccountEntry[];
  handleUpdateBlock: (
    key: string,
    value:
      | string
      | number
      | boolean
      | { name: string }[]
      | AccountEntry[]
      | AccountEntry[][]
  ) => void;
  onOpenGroupPopup: () => void;
  groupPopupTriggerRef: RefObject<HTMLDivElement | null>;
}

export const Group = ({
  handleUpdateBlock,
  groupIndex,
  groupName,
  accountList,
  onOpenGroupPopup,
  groupPopupTriggerRef,
}: Props) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {groupIndex === 0 ? (
        <NavigationBar
          action={
            <div ref={groupPopupTriggerRef}>
              <UtilityButton
                size="md"
                variant="primary"
                onClick={onOpenGroupPopup}
              >
                그룹편집
              </UtilityButton>
            </div>
          }
          direction="right"
          className="w-full"
        >
          {`${groupIndex + 1}번 그룹`}
        </NavigationBar>
      ) : (
        <NavigationBar>{`${groupIndex + 1}번 그룹`}</NavigationBar>
      )}

      <ActionField
        className="mb-2 text-center "
        label="그룹명"
        inputProps={{
          placeholder: '그룹명',
          value: groupName,
          onChange: e =>
            handleUpdateBlock(`groupList.${groupIndex}.name`, e.target.value),
        }}
        buttonProps={{
          children: '계좌추가',
          variant: 'bordered',
          size: 'sm',
          onClick: () => {
            const newAccounts = [
              ...accountList,
              { name: '', bank: '', account: '' },
            ];
            handleUpdateBlock(`accountList.${groupIndex}`, newAccounts);
          },
        }}
      />
      {accountList.map((account, i) => (
        <div key={`${i}`} className="flex flex-col gap-3.5">
          <TextField
            label="예금주"
            inputProps={{
              placeholder: '예금주명',
              value: account.name,
              onChange: e =>
                handleUpdateBlock(
                  `accountList.${groupIndex}.${i}.name`,
                  e.target.value
                ),
            }}
            className="w-full text-center"
          />
          <MultiField
            label={`${i + 1}번 계좌`}
            className="w-full"
            subInputProps={{
              placeholder: '은행',
              className: 'w-[65px]',
              value: account.bank,
              onChange: e =>
                handleUpdateBlock(
                  `accountList.${groupIndex}.${i}.bank`,
                  e.target.value
                ),
            }}
            mainInputProps={{
              placeholder: '계좌번호',
              className: 'w-[173px]',
              value: account.account,
              onChange: e =>
                handleUpdateBlock(
                  `accountList.${groupIndex}.${i}.account`,
                  e.target.value
                ),
            }}
          />
        </div>
      ))}
    </div>
  );
};
