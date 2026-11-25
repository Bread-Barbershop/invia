import { useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { qrDownloadName } from '@/components/molecules/link-share/qrDownloadName';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import {
  clearEditorDraft,
  saveEditorDraft,
  type EditorDraftInput,
} from '@/features/editor/draft/editorDraft';
import {
  isInvitationSaveAuthRequiredError,
  saveInvitationFlow,
  type PhotoUploadProgress,
  type SaveProgressStep,
} from '@/features/invitation/save/saveInvitationFlow';
import type { DashboardPendingInvitation } from '@/shared/constants/dashboardPendingInvitation';
import { useToast } from '@/shared/hooks/useToast';
import {
  selectUploadData,
  useEditorStore,
} from '@/shared/store/editorStore/useEditorStore';
import { getFileKey } from '@/shared/utils/fileUtils';
import {
  customShareTitle,
  titleFromSavedInvitation,
} from '@/shared/utils/invitationTitle';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

const SAVE_PROGRESS_MESSAGES: Record<SaveProgressStep, string> = {
  preparing: '초대장을 저장할 준비를 하고 있어요.',
  uploadingPhotos: '사진을 업로드하는 중이에요.',
  uploadingAudio: '배경음악을 업로드하는 중이에요.',
  savingInvitation: '마지막으로 초대장을 저장하는 중이에요.',
};

type SavedEditorInvitation = DashboardPendingInvitation & {
  audienceSlug?: string;
  qrDownloadName: string;
};

type UploadOptions = { preserveVisibility?: boolean };

export const useInvitationUpload = (audienceName?: string) => {
  const editorData = useEditorStore(useShallow(selectUploadData));
  const {
    hashFiles,
    setHashFiles,
    setCleanUpFiles,
    clearHashFiles,
    clearCleanUpFiles,
  } = useEditorStore(
    useShallow(state => ({
      hashFiles: state.hashFiles,
      setHashFiles: state.setHashFiles,
      setCleanUpFiles: state.setCleanUpFiles,
      clearHashFiles: state.clearHashFiles,
      clearCleanUpFiles: state.clearCleanUpFiles,
    }))
  );

  const { exportIntersectedJSON, exportCanvasPreview } = useFabricContext();

  const {
    selectedBgmId,
    isLoop,
    volume,
    userFile,
    userFileName,
    userDuration,
  } = useBgmStore(
    useShallow(state => ({
      selectedBgmId: state.selectedBgmId,
      isLoop: state.isLoop,
      volume: state.volume,
      userFile: state.userFile,
      userFileName: state.userFileName,
      userDuration: state.userDuration,
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<{
    step: SaveProgressStep;
    photos?: PhotoUploadProgress;
  }>({ step: 'preparing' });
  const isSaveLoadingRef = useRef(false);
  const [isFail, setIsFail] = useState(false);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [pendingInvitation, setPendingInvitation] =
    useState<SavedEditorInvitation | null>(null);
  const { info, success, error: showError } = useToast();

  const applySaveResult = async (
    saveResult: Awaited<ReturnType<typeof saveInvitationFlow>>,
    allTasks: { id: string; file: File | string }[]
  ) => {
    if (!saveResult.success) {
      console.error('[applySaveResult] 저장 실패:', saveResult.results);
      throw new Error('Invitation save failed.');
    }

    editorData.setInvitationUuid(saveResult.invitationUuid);
    editorData.setImageFolderId(saveResult.folders.imageFolderId);
    editorData.setAudioFolderId(saveResult.folders.audioFolderId);
    editorData.setInvitationFolderId(saveResult.folders.invitationFolderId);
    const savedInvitation: SavedEditorInvitation = {
      qrDownloadName: qrDownloadName(
        customShareTitle(editorData.shareUrl?.title) ||
          titleFromSavedInvitation({
            shareUrl: editorData.shareUrl,
            blocks: editorData.block,
          }),
        audienceName || saveResult.audienceSlug
      ),
      invitationFolderId: saveResult.folders.invitationFolderId,
      invitationUuid: saveResult.invitationUuid,
      audienceSlug: saveResult.audienceSlug,
      dataJsonFileId: saveResult.files.dataJsonFileId,
      guestUrl: saveResult.guestUrl,
      thumbnailFileId: saveResult.files.thumbnailFileId,
      published: saveResult.visibility.published,
      ready: saveResult.visibility.ready,
      createdAt: new Date().toISOString(),
    };

    // 성공한 File 객체들에 driveFileId 속성 심기 (다음 저장 시 참조용)
    saveResult.results.images.ok.forEach(ok => {
      Object.defineProperty(ok.file, 'driveFileId', {
        value: ok.fileId,
        writable: false,
        configurable: true,
        enumerable: false,
      });
    });

    // 성공한 파일들의 fileKey -> fileId 매핑 (비동기 처리)
    // newTasks의 파일들만 업로드되었으므로, allTasks에서 찾아야 함
    const successfulFilesMap = new Map(
      saveResult.results.images.ok.map(ok => [ok.file, ok.fileId])
    );

    clearHashFiles();

    // allTasks의 모든 File 객체에 대해 hashFiles 업데이트
    // 성공한 것: 새로운 fileId
    // 업로드되지 않은 것: driveFileId 속성 또는 이전 캐시에서 찾기
    for (const { file, id: imageId } of allTasks) {
      if (file instanceof File) {
        const fileKey = await getFileKey(file, imageId);
        // 이번 업로드에서 성공한 파일인가?
        const newFileId = successfulFilesMap.get(file);
        if (newFileId) {
          setHashFiles(`${fileKey}::${newFileId}`);
        } else {
          // 이전에 업로드된 파일인가? (driveFileId 속성 확인)
          const oldFileId = (file as any).driveFileId;
          if (oldFileId) {
            setHashFiles(`${fileKey}::${oldFileId}`);
          }
        }
      }
    }

    setPendingInvitation(savedInvitation);
    return savedInvitation;
  };

  const performCleanup = async (fileIds: string[]) => {
    if (fileIds.length === 0) {
      return;
    }

    setIsCleaningUp(true);
    info('파일 정리 중...');

    try {
      const deleteFolder = (id: string) =>
        fetch('/api/drive/deleteInvitation', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId: id }),
        });

      const attempt = async (ids: string[]) => {
        const results = await Promise.allSettled(ids.map(deleteFolder));
        return ids.filter((id, idx) => {
          const result = results[idx];
          return result.status === 'rejected' || !result.value.ok;
        });
      };

      let failedIds = await attempt(fileIds);
      if (failedIds.length > 0) {
        console.warn('[cleanup] 실패 항목 재시도:', failedIds);
        failedIds = await attempt(failedIds);
      }

      if (failedIds.length > 0) {
        console.error('[cleanup] 재시도 후에도 삭제 실패:', failedIds);
        showError('파일 정리에 실패했습니다.');
      } else {
        success('파일 정리가 완료되었습니다.');
      }
    } catch (error) {
      console.error('[cleanup] DELETE 중 오류:', error);
    } finally {
      clearCleanUpFiles();
      setIsCleaningUp(false);
    }
  };

  const handleUpload = async ({ preserveVisibility }: UploadOptions = {}) => {
    if (isSaveLoadingRef.current || isCleaningUp) return null;

    let draftInput: EditorDraftInput | null = null;

    try {
      isSaveLoadingRef.current = true;
      setProgress({ step: 'preparing' });
      setIsLoading(true);
      setIsFail(false);
      setIsAuthRequired(false);
      setPendingInvitation(null);

      // Bundled sample URLs and existing URL references stay in block props.
      // Only actual files belong in the upload queue, including mixed galleries.
      const allTasks = editorData.images.flatMap(item =>
        item.file
          .filter((file): file is File => file instanceof File)
          .map(file => ({ id: item.id, file }))
      );
      // 이전 hashFiles의 fileId들을 캡처
      const oldHashFileIds = new Set(
        hashFiles.map(h => h.split('::')[1]).filter(Boolean)
      );

      // hashFiles를 빠른 조회를 위해 Map으로 변환: fileKey -> driveFileId
      const hashFileMap = new Map(
        hashFiles.map(h => {
          const [key, driveFileId] = h.split('::');
          return [key, driveFileId];
        })
      );

      // 드라이브에 이미 존재하는 파일은 업로드 제외
      const newTasks: typeof allTasks = [];
      for (const task of allTasks) {
        // imageId(task.id)와 파일을 함께 사용하여 같은 파일도 이미지별로 구분
        const fileKey = await getFileKey(task.file, task.id);
        const existingFileId = hashFileMap.get(fileKey);
        if (existingFileId) {
          // 새 File 인스턴스에 driveFileId 주입 → replaceFiles에서 교체 가능해짐
          Object.defineProperty(task.file, 'driveFileId', {
            value: existingFileId,
            writable: true,
            configurable: true,
            enumerable: false,
          });
        } else {
          newTasks.push(task);
        }
      }
      const bgmData = {
        selectedBgmId: selectedBgmId ?? null,
        isLoop,
        volume,
        userBgmTitle: userFileName ?? null,
        userBgmDuration: userDuration ?? null,
        userBgmFileId: null,
      };

      const bulkData = {
        backgroundColor: editorData.backgroundColor,
        backgroundTexture: editorData.backgroundTexture,
        sectionStyle: editorData.sectionStyle,
        titleData: editorData.titleData,
        bodyData: editorData.bodyData,
        isZoom: editorData.isZoom,
        invitationPrivacy: editorData.invitationPrivacy,
        scrollAnimation: editorData.scrollAnimation,
        invitationEffects: editorData.invitationEffects,
      };

      const mainPoster = exportIntersectedJSON() ?? {
        version: '7.1.0',
        objects: [],
      };
      const invitationThumbnail = exportCanvasPreview() ?? {
        name: 'invitation-thumbnail.webp',
        mimeType: 'image/webp',
        dataUrl: '',
        width: 0,
        height: 0,
        createdAt: '',
      };

      const invitationUuid = editorData.invitationUuid || undefined;
      // 로그인이 필요해 저장이 막히면 이 시점의 작업을 그대로 되살릴 수 있도록 모아 둔다.
      draftInput = {
        bulkData,
        blocks: editorData.block,
        images: allTasks,
        shareUrl: editorData.shareUrl,
        bgm: bgmData,
        audioFile: userFile,
        mainPoster,
      };
      const saveResult = await saveInvitationFlow({
        bulkData,
        images: allTasks,
        uploadImages: newTasks,
        audio: userFile,
        data: editorData.block,
        shareUrl: editorData.shareUrl,
        bgmData,
        mainPoster,
        invitationThumbnail,
        invitationUuid,
        preserveVisibility,
        onProgress: (step, photos) => setProgress({ step, photos }),
      });
      const savedInvitation = await applySaveResult(saveResult, allTasks);
      void clearEditorDraft();
      if (useBgmStore.getState().userFile === userFile) {
        useEditorStore.getState().setIsDirty(false);
      }

      if (invitationUuid) {
        // 저장 직후 복제하거나 편집기를 전환할 때는 파일 정리까지 마친다.
        const newHashFileIds = new Set(
          useEditorStore
            .getState()
            .hashFiles.map(h => h.split('::')[1])
            .filter(Boolean)
        );

        const toCleanIds = [...oldHashFileIds].filter(
          id => !newHashFileIds.has(id)
        );
        toCleanIds.forEach(id => setCleanUpFiles(id));
        const cleanup = performCleanup(toCleanIds);
        if (preserveVisibility) await cleanup;
      }

      return savedInvitation;
    } catch (error) {
      console.error('[uploadFlow] 저장 중 오류 발생:', error);

      if (isInvitationSaveAuthRequiredError(error)) {
        // 작성한 내용을 브라우저에 남겨 두고 로그인 안내로 넘긴다.
        setIsAuthRequired(true);
        if (draftInput) {
          void saveEditorDraft(draftInput);
        }
        return null;
      }

      setIsFail(true);
      return null;
    } finally {
      isSaveLoadingRef.current = false;
      setIsLoading(false);
    }
  };

  return {
    handleUpload,
    isLoading,
    isFail,
    isAuthRequired,
    isCleaningUp,
    pendingInvitation,
    photoProgress: progress.photos,
    loadingMessage: progress.photos?.retrying
      ? '사진을 다시 업로드하는 중이에요.'
      : SAVE_PROGRESS_MESSAGES[progress.step],
  };
};
