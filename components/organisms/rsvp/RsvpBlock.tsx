'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { safeRsvpFormUrl } from './rsvpFormUrl';

type FieldKey = 'title' | 'description' | 'buttonText' | 'formUrl';

export function RsvpBlock({
  blockInfo,
  id,
}: {
  blockInfo: EditorBlock<'rsvp'>;
  id: string;
}) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const { title, description, buttonText, formUrl } = blockInfo.props;
  const validFormUrl = safeRsvpFormUrl(formUrl);
  const formUrlError = Boolean(formUrl) && !validFormUrl;
  const formUrlErrorId = `rsvp-${id}-form-url-error`;
  const formUrlOkId = `rsvp-${id}-form-url-ok`;
  const setField = (key: FieldKey, value: string) =>
    updateBlock(id, { [key]: value });

  const fields = [
    { key: 'title', label: '제목', value: title, maxLength: 40 },
    {
      key: 'description',
      label: '참석 안내 문구',
      value: description,
      maxLength: 250,
    },
    {
      key: 'buttonText',
      label: '버튼 문구',
      value: buttonText,
      maxLength: 40,
    },
    {
      key: 'formUrl',
      label: 'Google 설문 응답 링크',
      value: formUrl,
      maxLength: 2048,
    },
  ] as const;

  return (
    <LeftEditorWrapper ariaLabel="참석 여부" className="gap-3">
      <NavigationBar>참석 여부 편집</NavigationBar>
      <div className="flex w-full flex-col gap-4 py-2">
        {fields.map(field => {
          const inputId = `rsvp-${id}-${field.key}`;
          const isFormUrl = field.key === 'formUrl';
          return (
            <label
              key={field.key}
              htmlFor={inputId}
              className="flex flex-col gap-1 text-sm text-text-primary"
            >
              {field.label}
              <input
                id={inputId}
                value={field.value ?? ''}
                maxLength={field.maxLength}
                aria-invalid={isFormUrl && formUrlError ? true : undefined}
                aria-describedby={
                  isFormUrl
                    ? [
                        formUrlError ? formUrlErrorId : null,
                        validFormUrl ? formUrlOkId : null,
                      ]
                        .filter(Boolean)
                        .join(' ') || undefined
                    : undefined
                }
                onChange={event => setField(field.key, event.currentTarget.value)}
                placeholder={
                  isFormUrl ? 'https://forms.gle/...' : '내용을 입력해주세요'
                }
                className={cn(
                  'h-10 min-w-0 rounded-md border border-border-divider px-3 text-sm outline-none focus:border-primary',
                  isFormUrl &&
                    formUrlError &&
                    'border-red-500 focus:border-red-500'
                )}
              />
            </label>
          );
        })}
        {!formUrl && (
          <p className="text-xs text-text-secondary">
            응답 링크를 입력하면 하객에게 참석 여부 블록이 표시됩니다.
          </p>
        )}
        {formUrlError && (
          <p
            id={formUrlErrorId}
            role="alert"
            className="text-xs text-red-600"
          >
            응답자용 Google Forms HTTPS 링크를 입력해 주세요.
          </p>
        )}
        {validFormUrl && (
          <div className="flex flex-col gap-1">
            <p
              id={formUrlOkId}
              role="status"
              className="text-xs text-emerald-700"
            >
              응답자용 링크가 연결되었습니다. 하객 화면에 응답 버튼이
              표시됩니다.
            </p>
            <a
              href={validFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-xs text-text-secondary underline underline-offset-2 hover:text-text-primary"
            >
              응답자 화면 미리 열어보기 (새 창)
            </a>
          </div>
        )}
        <div className="rounded-md bg-[#FAFAFB] p-3 text-xs leading-relaxed text-text-secondary">
          <p>Google Forms에서 응답자용 링크를 복사해 입력하세요.</p>
          <p className="mt-2">
            응답은 주최자가 관리하는 Google 계정의 설문에 제출됩니다. 응답
            권한과 스프레드시트 저장은 주최자 설정에 따라 달라집니다. 익명
            응답을 받으려면 시크릿 창에서 로그인 없이 설문을 열고 직접 제출해
            보세요. 시트에 응답을 누적하려면 Google Forms의 [응답] 탭에서
            스프레드시트를 연결하고, 테스트 제출 후 Forms 응답과 시트에 새 행이
            추가되었는지 확인하세요.
          </p>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}
