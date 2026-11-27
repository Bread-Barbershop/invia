import { useEffect } from 'react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { useConfirm } from './useConfirm';

export function usePreventBack() {
  const { confirm } = useConfirm();

  useEffect(() => {
    // 1. 탭 닫기 / 새로고침 방지
    // 브라우저가 페이지를 뒤로가기 캐시(bfcache)에 담지 못하게 되므로,
    // 저장할 변경사항이 있을 때만 경고 리스너를 붙이고 저장되면 바로 뗀다.
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!useEditorStore.getState().isDirty) {
        return;
      }
      e.preventDefault();
      // preventDefault만으로 동작하지 않는 예전 브라우저를 위해 함께 채운다.
      e.returnValue = '';
    };

    let isUnloadGuardAttached = false;
    const syncUnloadGuard = (isDirty: boolean) => {
      if (isDirty && !isUnloadGuardAttached) {
        window.addEventListener('beforeunload', handleBeforeUnload);
        isUnloadGuardAttached = true;
        return;
      }
      if (!isDirty && isUnloadGuardAttached) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        isUnloadGuardAttached = false;
      }
    };

    // 2. 뒤로가기 방지
    const handlePopState = async () => {
      if (!useEditorStore.getState().isDirty) {
        return;
      }

      const isConfirm = await confirm({
        message:
          '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?',
        variant: 'white',
        yPosition: 'center',
      });
      if (!isConfirm) {
        history.pushState(null, '', window.location.href);
        return;
      }
      window.removeEventListener('popstate', handlePopState);
      history.back();
    };

    syncUnloadGuard(useEditorStore.getState().isDirty);
    const unsubscribeDirty = useEditorStore.subscribe(
      state => state.isDirty,
      syncUnloadGuard
    );

    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubscribeDirty();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [confirm]);
}
