import type { KakaoShareData } from '@/app/dashboard/types';
import {
  resolveShareDescription,
  resolveShareImageUrl,
  resolveShareTitle,
} from '@/shared/utils/shareUrlDefaults';

type ShareUrlResponse = {
  ok: boolean;
  visibility?: 'private' | 'pending';
  data?: KakaoShareData;
  error?: string;
};

export async function loadShareData(folderId: string, signal?: AbortSignal) {
  const res = await fetch(
    `/api/drive/shareUrl?invitationFolderId=${encodeURIComponent(folderId)}&intent=share`,
    {
      method: 'GET',
      cache: 'no-store',
      signal,
    }
  );

  const payload = (await res
    .json()
    .catch(() => null)) as ShareUrlResponse | null;

  if (
    res.status === 409 &&
    (payload?.visibility === 'private' || payload?.visibility === 'pending')
  ) {
    return payload.visibility;
  }
  if (!res.ok || payload?.ok === false || !payload?.data) {
    if (payload?.error === 'share data not found in meta.json') {
      throw new Error('이 초대장에 저장된 카카오톡 공유 정보가 없어요.');
    }
    throw new Error(payload?.error ?? '공유 데이터를 불러오지 못했습니다.');
  }

  return payload.data;
}

export function shareInvitationWithKakao(shareData: KakaoShareData) {
  if (typeof window === 'undefined' || !window.Kakao) {
    throw new Error('카카오 SDK 스크립트가 아직 로드되지 않았습니다.');
  }

  const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!kakaoJsKey) {
    throw new Error('NEXT_PUBLIC_KAKAO_JS_KEY가 설정되지 않았습니다.');
  }

  const safeLinkUrl = shareData.invitationUrl;
  if (!safeLinkUrl) {
    throw new Error('공유할 초대장 링크가 없습니다.');
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoJsKey);
  }

  const messageButtons = [
    {
      title: '보러가기',
      link: {
        mobileWebUrl: safeLinkUrl,
        webUrl: safeLinkUrl,
      },
    },
  ];

  if (shareData.showLocationButton && shareData.locationInfo) {
    const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(
      shareData.locationInfo.placeName
    )},${shareData.locationInfo.lat},${shareData.locationInfo.lng}`;

    const bypassUrl = `${window.location.origin}/api/map-redirect?url=${encodeURIComponent(
      kakaoMapUrl
    )}`;

    messageButtons.push({
      title: '위치보기',
      link: {
        mobileWebUrl: bypassUrl,
        webUrl: bypassUrl,
      },
    });
  }

  const imageUrl = resolveShareImageUrl(
    shareData.imageFileId,
    window.location.origin
  );

  return window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: resolveShareTitle(shareData.title),
      description: resolveShareDescription(shareData.description),
      imageUrl,
      imageWidth: 800,
      imageHeight: 600,
      link: {
        mobileWebUrl: safeLinkUrl,
        webUrl: safeLinkUrl,
      },
    },
    buttons: messageButtons,
  });
}
