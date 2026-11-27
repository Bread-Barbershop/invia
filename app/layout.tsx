import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { ReactNode } from 'react';

import { ConfirmContainer } from '@/components/molecules/confirm/ConfirmContainer';
import { ToastContainer } from '@/components/molecules/toast/ToastContainer';
import ClarityInit from '@/features/monitoring/ClarityInit';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SERVICE_NAME,
  SITE_URL,
  WEBSITE_JSON_LD,
  serializeJsonLd,
} from '@/shared/config/seo';

import './styles/globals.css';

const pretendard = localFont({
  src: '../public/font/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--pretendard',
});
const inter = localFont({
  src: '../public/font/InterVariable.woff2',
  display: 'swap',
  variable: '--inter',
  weight: '100 900',
  preload: false,
});

const lineSeedKr = localFont({
  src: [
    {
      path: '../public/font/LINESeedKR/LINESeedKR-Th.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/font/LINESeedKR/LINESeedKR-Rg.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/font/LINESeedKR/LINESeedKR-Bd.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--line-seed-kr',
});

const defaultOgImage = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: SERVICE_NAME,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SERVICE_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SERVICE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: '/',
    siteName: SERVICE_NAME,
    images: [defaultOgImage],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [defaultOgImage.url],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${inter.variable} ${lineSeedKr.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased font-pretendard" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(WEBSITE_JSON_LD) }}
        />
        <div id="app-root">{children}</div>
        <Analytics />
        <SpeedInsights />
        <ClarityInit />
        <ToastContainer />
        <ConfirmContainer />
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js"
          integrity="sha384-JpLApTkB8lPskhVMhT+m5Ln8aHlnS0bsIexhaak0jOhAkMYedQoVghPfSpjNi9K1"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
