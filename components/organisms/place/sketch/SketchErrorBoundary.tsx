'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  label?: string;
}

interface State {
  message: string | null;
}

/**
 * 약도 렌더링이 실패해도 초대장/편집기 전체가 무너지지 않도록 감싼다.
 * 저장된 데이터가 손상되었거나 예상하지 못한 형상이 들어온 경우의 안전장치.
 */
export class SketchErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: unknown): State {
    return {
      message: error instanceof Error ? error.message : 'unknown error',
    };
  }

  componentDidCatch(error: unknown) {
    console.error('[sketch] 약도 렌더링 실패', this.props.label ?? '', error);
  }

  render() {
    if (this.state.message !== null) {
      return (
        <div data-sketch-error={this.state.message}>{this.props.fallback}</div>
      );
    }
    return this.props.children;
  }
}
