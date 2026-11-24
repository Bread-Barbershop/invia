'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';


import { fetchSessionState } from '@/features/session/hooks/fetchSessionState';
import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

import type { ReactNode } from 'react';

type PublicSession = {
  isLoggedIn: boolean | null;
  failed: boolean;
  checkSession: () => Promise<boolean | null>;
  setSession: (value: boolean) => void;
};

const PublicSessionContext = createContext<PublicSession | null>(null);

export function PublicSessionProvider({
  children,
  desktopOnly = false,
}: {
  children: ReactNode;
  desktopOnly?: boolean;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const current = useRef<boolean | null>(null);
  const generation = useRef(0);
  const pending = useRef<Promise<boolean | null> | null>(null);

  const setSession = useCallback((value: boolean) => {
    generation.current += 1;
    pending.current = null;
    current.current = value;
    setIsLoggedIn(value);
    setFailed(false);
  }, []);

  const checkSession = useCallback(() => {
    if (pending.current) return pending.current;
    const requestGeneration = generation.current;
    const request = fetchSessionState()
      .then(value => {
        if (generation.current === requestGeneration) {
          current.current = value;
          setIsLoggedIn(value);
          setFailed(false);
        }
        return current.current;
      })
      .catch(error => {
        console.error(error);
        if (generation.current === requestGeneration) {
          setFailed(true);
          return null;
        }
        return current.current;
      });
    void request.finally(() => {
      if (pending.current === request) pending.current = null;
    });
    pending.current = request;
    return request;
  }, []);

  useEffect(() => {
    if (!desktopOnly) {
      void checkSession();
      return;
    }
    const media = window.matchMedia(
      `(min-width: ${DESKTOP_CONTENT_MIN_WIDTH}px)`
    );
    const update = () => {
      if (media.matches && current.current === null) void checkSession();
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [checkSession, desktopOnly]);

  return (
    <PublicSessionContext.Provider
      value={{ isLoggedIn, failed, checkSession, setSession }}
    >
      {children}
    </PublicSessionContext.Provider>
  );
}

export function usePublicSession() {
  return useContext(PublicSessionContext);
}
