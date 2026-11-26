import { Suspense, type CSSProperties } from 'react';

import DashboardShell from '@/features/session/components/DashboardShell';
import homeBackgroundImage from '@/shared/assets/images/home/home-background.png';

import GalleryCategoryTabs from './components/GalleryCategoryTabs';
import GallerySearchBar from './components/GallerySearchBar';
import GalleryTemplateGrid from './components/GalleryTemplateGrid';
import GalleryTitleBox from './components/GalleryTitleBox';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '초대장 갤러리',
  description: '초대장 디자인을 미리 보고 원하는 템플릿으로 바로 시작하세요.',
  alternates: {
    canonical: '/gallery',
  },
};

const curtainStyle = {
  '--gallery-background': `url(${homeBackgroundImage.src})`,
} as CSSProperties;

export default function GalleryPage() {
  return (
    <DashboardShell>
      <div className="fixed inset-x-0 bottom-10 top-14 overflow-y-auto overflow-x-hidden px-5 pb-24 motion-safe:scroll-smooth md:px-10 md:pt-[20vh] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="relative z-30 mt-[18px] flex justify-start md:mt-0">
          <GalleryTitleBox />
        </div>

        <section className="sticky top-0 z-20 mt-2.5 flex justify-start pt-0.5 pb-1 md:top-[max(-154px,-20vh)] md:mt-6 md:py-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -inset-x-5 bg-[#fcfcfc]/[.97] md:-inset-x-10 md:-top-60 md:-bottom-6 md:bg-transparent md:bg-fixed md:bg-cover md:bg-center md:bg-no-repeat md:[background-image:var(--gallery-background)]"
            style={curtainStyle}
          />
          <div className="relative z-10 flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-4">
            <Suspense fallback={null}>
              <GalleryCategoryTabs />
            </Suspense>
            <Suspense fallback={null}>
              <GallerySearchBar />
            </Suspense>
          </div>
        </section>

        <Suspense fallback={null}>
          <GalleryTemplateGrid />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
