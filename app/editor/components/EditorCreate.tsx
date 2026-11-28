'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  parseGuestPayload,
  type NormalizedGuestPayload,
} from '@/app/guest/[id]/validation/parseGuestPayload';
import { ScreenTransitionLoader } from '@/components/molecules/screen-transition-loader';
import {
  BLANK_EDITOR_DRAFT_KEY,
  loadEditorDraft,
  type EditorDraftKey,
  type EditorDraftSnapshot,
} from '@/features/editor/draft/editorDraft';
import EditorDraftRecoveryDialog from '@/features/editor/draft/EditorDraftRecoveryDialog';
import { useToastStore } from '@/shared/store/useToastStore';
import type { BgmData } from '@/shared/types/invitationSave';
import { hydrateShareUrlState } from '@/shared/utils/shareUrlDefaults';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import { toEditorDraftSavedData } from './draftSavedData';
import MainContentsArea from './MainContentsArea';
import TemplateEditorEntry from './TemplateEditorEntry';

import type { SavedData } from '../[id]/types/savedata';

type SampleManifestItem = {
  id: string;
  dataUrl: string;
  posterTemplateId?: string;
};

type SamplesManifest = {
  samples: SampleManifestItem[];
};

type TemplateManifest = {
  templates: Array<{
    id: string;
    jsonUrl: string;
  }>;
};

const SAMPLES_MANIFEST_URL = '/samples/manifest.json';
const TEMPLATES_MANIFEST_URL = '/templates/manifest.json';
const BUNDLED_SAMPLE_ASSET_PREFIX = '/samples/';

function isBundledSampleAsset(value: unknown): value is string {
  return (
    typeof value === 'string' && value.startsWith(BUNDLED_SAMPLE_ASSET_PREFIX)
  );
}

function stripBundledSampleAssets<T>(value: T): T {
  if (isBundledSampleAsset(value)) {
    return '' as T;
  }

  if (Array.isArray(value)) {
    return value
      .filter(item => !isBundledSampleAsset(item))
      .map(stripBundledSampleAssets) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        stripBundledSampleAssets(child),
      ])
    ) as T;
  }

  return value;
}

function sanitizeSampleBgm(bgm: BgmData): BgmData {
  if (
    bgm.selectedBgmId !== 'user-bgm' &&
    !isBundledSampleAsset(bgm.userBgmFileId)
  ) {
    return bgm;
  }

  return {
    ...bgm,
    selectedBgmId: null,
    userBgmTitle: null,
    userBgmDuration: null,
    userBgmFileId: null,
  };
}

function toSavedData(
  payload: NormalizedGuestPayload,
  mainPoster: unknown
): SavedData {
  return {
    bulkData: payload.bulkData,
    blocks: stripBundledSampleAssets(payload.blocks) as SavedData['blocks'],
    mainPoster: JSON.stringify(mainPoster),
    bgm: {
      bgmInfo: sanitizeSampleBgm(payload.bgm),
      bgmFile: null,
    },
    shareUrl: hydrateShareUrlState(stripBundledSampleAssets(payload.shareUrl)),
    imageFolderId: '',
    audioFolderId: '',
    invitationImage: [],
  };
}

async function loadPosterTemplateJson(templateId: string) {
  const manifestResponse = await fetch(TEMPLATES_MANIFEST_URL);
  if (!manifestResponse.ok) {
    throw new Error(`template_manifest_failed:${manifestResponse.status}`);
  }

  const manifest = (await manifestResponse.json()) as TemplateManifest;
  const template = manifest.templates.find(item => item.id === templateId);
  if (!template) {
    throw new Error(`poster_template_not_found:${templateId}`);
  }

  const templateResponse = await fetch(template.jsonUrl);
  if (!templateResponse.ok) {
    throw new Error(`poster_template_failed:${templateResponse.status}`);
  }

  return templateResponse.json();
}

async function loadSampleSavedData(sampleId: string): Promise<SavedData> {
  const manifestResponse = await fetch(SAMPLES_MANIFEST_URL);
  if (!manifestResponse.ok) {
    throw new Error(`sample_manifest_failed:${manifestResponse.status}`);
  }

  const manifest = (await manifestResponse.json()) as SamplesManifest;
  const sample = manifest.samples.find(item => item.id === sampleId);
  if (!sample) {
    throw new Error(`sample_not_found:${sampleId}`);
  }

  const sampleResponse = await fetch(sample.dataUrl);
  if (!sampleResponse.ok) {
    throw new Error(`sample_data_failed:${sampleResponse.status}`);
  }

  const result = parseGuestPayload(await sampleResponse.json());
  if (!result.ok) {
    throw new Error(`sample_parse_failed:${result.reason}`);
  }

  const posterTemplateJson = await loadPosterTemplateJson(
    sample.posterTemplateId ?? sample.id
  );

  return toSavedData(result.payload, posterTemplateJson);
}

function EditorCreate({
  initialIsLoggedIn = false,
}: {
  initialIsLoggedIn?: boolean;
}) {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const sampleId = searchParams.get('sample') || null;
  const draftKey: EditorDraftKey = sampleId
    ? `sample:${sampleId}`
    : BLANK_EDITOR_DRAFT_KEY;
  return templateId ? (
    <TemplateEditorEntry
      key={templateId}
      templateId={templateId}
      initialIsLoggedIn={initialIsLoggedIn}
    />
  ) : (
    <SampleEditorCreate
      key={draftKey}
      draftKey={draftKey}
      sampleId={sampleId}
      isLoggedIn={initialIsLoggedIn}
    />
  );
}

function SampleEditorCreate({
  draftKey,
  sampleId,
  isLoggedIn,
}: {
  draftKey: EditorDraftKey;
  sampleId: string | null;
  isLoggedIn: boolean;
}) {
  const [savedData, setSavedData] = useState<SavedData | null>(null);
  const [pendingDraft, setPendingDraft] = useState<EditorDraftSnapshot | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const showToast = useToastStore(state => state.showToast);

  // 초안이 있으면 덮어쓰지 않고 먼저 사용자에게 물어본다.
  useEffect(() => {
    let cancelled = false;

    async function loadInitialEditorData() {
      try {
        setIsLoading(true);
        setLoadError(false);

        const draft = await loadEditorDraft(draftKey);
        if (cancelled) return;
        if (draft) {
          setPendingDraft(draft);
          return;
        }
        if (!sampleId) return;

        const data = await loadSampleSavedData(sampleId);
        if (!cancelled) {
          setSavedData(data);
        }
      } catch (error) {
        console.error('샘플 에디터 로드 실패:', error);
        if (!cancelled) {
          setSavedData(null);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialEditorData();

    return () => {
      cancelled = true;
    };
  }, [draftKey, sampleId]);

  const startFreshEditor = useCallback(async () => {
    setPendingDraft(null);
    if (!sampleId) {
      setSavedData(null);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(false);
      const data = await loadSampleSavedData(sampleId);
      setSavedData(data);
    } catch (error) {
      console.error('샘플 에디터 로드 실패:', error);
      setSavedData(null);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [sampleId]);

  const handleResumeDraft = useCallback(() => {
    if (!pendingDraft) return;

    setSavedData(toEditorDraftSavedData(pendingDraft));
    setPendingDraft(null);
    showToast(
      '작성하던 초안을 이어서 불러왔어요. 저장을 마치면 이 기기의 초안은 지워져요.',
      'info'
    );
  }, [pendingDraft, showToast]);

  if (isLoading) {
    return <ScreenTransitionLoader label="에디터를 준비하는 중" />;
  }

  if (sampleId && loadError) {
    return <EditorCreateError />;
  }

  // 고르기 전에는 편집기를 띄우지 않는다. 빈 편집기가 잠깐 깔렸다가 초안으로
  // 바뀌는 깜빡임 없이, 선택 후에 한 번만 초기화한다.
  if (pendingDraft) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#E7E9EB]">
        <EditorDraftRecoveryDialog
          draft={pendingDraft}
          draftKey={draftKey}
          isLoggedIn={isLoggedIn}
          onResume={handleResumeDraft}
          onDraftChange={setPendingDraft}
          onStartFresh={() => void startFreshEditor()}
          onDiscard={() => void startFreshEditor()}
        />
      </div>
    );
  }

  return (
    <FabricProvider initialData={savedData?.mainPoster}>
      <div className="w-full h-full bg-[#E7E9EB] flex flex-col gap-13 justify-center overflow-x-auto overflow-y-hidden">
        <MainContentsArea savedData={savedData} draftKey={draftKey} />
      </div>
    </FabricProvider>
  );
}

function EditorCreateError() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#E7E9EB]">
      <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-edit">
        <h1 className="text-2xl font-bold text-text-plain">
          샘플을 불러오지 못했습니다.
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          갤러리로 돌아가 다른 디자인을 선택해 주세요.
        </p>
        <Link
          href="/gallery"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-black px-5 font-semibold text-white"
        >
          갤러리로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default EditorCreate;
