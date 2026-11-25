import { ReactNode } from 'react';

import DashboardShell from '@/features/session/components/DashboardShell';

import EditorSkipLinks from './components/EditorSkipLinks';
import EditorViewportGuard from './components/EditorViewportGuard';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function EditorLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      {/* 헤더보다 먼저 두어, 첫 Tab 키가 편집기 영역 이동으로 향하게 한다. */}
      <EditorSkipLinks />
      <DashboardShell variant="editor">
        <EditorViewportGuard>{children}</EditorViewportGuard>
      </DashboardShell>
    </>
  );
}
