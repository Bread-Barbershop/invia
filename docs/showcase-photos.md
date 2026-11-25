# 첫 화면 초대장 본문 사진

홈 쇼케이스와 템플릿 본문에 쓰는 사진은 저장소 용량을 늘리지 않도록 **Google Drive에 두고 링크로 불러옵니다.**

## 호스팅

- Drive 폴더: `invia-showcase-images` (링크가 있는 모든 사용자 보기 가능)
  - https://drive.google.com/drive/folders/1sDysC5qitHrpbARhPuoiGHoZqiQfhsij
- 이미지 주소 형식: `https://lh3.googleusercontent.com/d/<FILE_ID>`
- 코드에서는 `shared/data/showcaseImages.ts`의 `SHOWCASE_PHOTOS` 상수로만 참조합니다.
  ```ts
  image: SHOWCASE_PHOTOS.classicNewspaper
  ```
- 앱의 `components/atoms/image/Image.tsx`가 `googleusercontent.com` 주소를 직접 요청(unoptimized)하므로
  Next 이미지 최적화 서버를 거치지 않습니다.

`shared/data/buildShowcaseInvitation.test.ts`는 본문 사진이 **로컬 파일이거나 위 Drive 주소 형식**인지 확인합니다.

## 제작 기준

- 35mm 필름/에디토리얼 사진 느낌, 자연광 또는 따뜻한 실내 조명, 눈에 보이는 입자와 질감.
- 사람이 등장하는 컷(돌잔치 아이, 예비부부, 연사)은 초대장에서 얼굴이 먼저 보여야 하므로 **정면 또는 자연스러운 3/4 정면의 캔디드 스냅**으로 만듭니다.
  뒷모습·완전 측면·손만 나오는 컷은 쓰지 않습니다. 다만 스튜디오 초상처럼 대칭이 맞고 피부가 번들거리면 AI 느낌이 나므로,
  자연광·캔디드 프레이밍·필름 입자로 정면을 유지합니다.
- 사람 사진은 생성 후 전부 육안으로 확인하고, 어색한 손·과한 피부 보정·번진 글자가 보이면 다시 생성합니다.
- 글자·로고·워터마크가 들어가지 않게 생성합니다.

## 교체한 기존 에셋

아래 파일은 AI 생성 느낌(과장된 광택, 완벽한 대칭, 부자연스러운 인물)이 뚜렷해 새 사진으로 바꾸고,
더 이상 참조되지 않는 파일은 저장소에서 삭제했습니다.

| 기존 파일 | 문제 | 대체 |
| --- | --- | --- |
| `public/images/showcase/conference-speaker.webp` | AI 생성 정장 인물 초상(피부 보정) | 세미나별 무대·실루엣·손 사진 |
| `public/images/showcase/first-cake.webp` | 검은 배경에 분리된 제품컷 | 필름 느낌의 첫돌 케이크 |
| `public/images/showcase/conference-hall.webp` | 합성 느낌의 대형 홀 | 세미나별 실제 같은 공간 사진 |

돌잔치 7종(`hanbok`, `orchard`, `sea`, `moon`, `portrait`, `dino`, `post`)과 `clay`, `prism`, `citrus`,
`cinema`, `flowers`, `camp` 사진은 본문과 **템플릿 표지(포스터·썸네일)에서 모두** 새 사진으로 교체했습니다.

- 포스터 JSON(`public/templates/json/*.v1.json`)의 사진 슬롯 `src`를 Drive 주소로 바꾸고,
  슬롯 프레임 좌표는 그대로 두어 기존 레이아웃이 유지됩니다.
- 썸네일(`public/templates/thumbnails/*.webp`)은 포스터 프레임 영역만 새 사진으로 다시 채워
  글자·테두리 등 나머지 디자인은 그대로입니다.
- 위 파일들은 더 이상 참조되지 않아 `public/images/showcase/`에서 삭제했습니다.
