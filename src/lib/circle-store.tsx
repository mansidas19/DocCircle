"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COMMUNITIES, DEFAULT_USER_COMMUNITY_IDS } from "./demo-data";
import type { Community, Review } from "./types";

/**
 * Client-side "session" state for the demo user:
 * - which communities they belong to / have selected for Ask My Circle
 * - custom communities they created (P1)
 * - reviews they submitted this session (so signals update live)
 *
 * Persisted in localStorage so it survives refreshes during a demo.
 * In production this becomes User -> UserCommunityMembership -> Community.
 */

interface CircleState {
  selectedCommunityIds: string[];
  customCommunities: Community[];
  submittedReviews: Review[];
}

interface CircleContextValue extends CircleState {
  hydrated: boolean;
  allCommunities: Community[];
  selectedCommunities: Community[];
  toggleCommunity: (id: string) => void;
  setSelected: (ids: string[]) => void;
  addCustomCommunity: (c: Community) => void;
  addSubmittedReview: (r: Review) => void;
  reset: () => void;
}

const STORAGE_KEY = "doccircle:v1";

const initial: CircleState = {
  selectedCommunityIds: DEFAULT_USER_COMMUNITY_IDS,
  customCommunities: [],
  submittedReviews: [],
};

const CircleContext = createContext<CircleContextValue | null>(null);

export function CircleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CircleState>(initial);
  const [hydrated, setHydrated] = useState(false);

  // One-time hydration from localStorage (an external system). Deferred to a
  // microtask so React doesn't treat it as a synchronous effect setState.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<CircleState>;
          setState({
            selectedCommunityIds: parsed.selectedCommunityIds ?? initial.selectedCommunityIds,
            customCommunities: parsed.customCommunities ?? [],
            submittedReviews: parsed.submittedReviews ?? [],
          });
        }
      } catch {
        // ignore corrupt storage
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage may be unavailable; demo still works in-memory
    }
  }, [state, hydrated]);

  const toggleCommunity = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      selectedCommunityIds: s.selectedCommunityIds.includes(id)
        ? s.selectedCommunityIds.filter((x) => x !== id)
        : [...s.selectedCommunityIds, id],
    }));
  }, []);

  const setSelected = useCallback((ids: string[]) => {
    setState((s) => ({ ...s, selectedCommunityIds: ids }));
  }, []);

  const addCustomCommunity = useCallback((c: Community) => {
    setState((s) => ({
      ...s,
      customCommunities: [...s.customCommunities, c],
      selectedCommunityIds: [...s.selectedCommunityIds, c.id],
    }));
  }, []);

  const addSubmittedReview = useCallback((r: Review) => {
    setState((s) => ({ ...s, submittedReviews: [r, ...s.submittedReviews] }));
  }, []);

  const reset = useCallback(() => setState(initial), []);

  const value = useMemo<CircleContextValue>(() => {
    const allCommunities = [...COMMUNITIES, ...state.customCommunities];
    return {
      ...state,
      hydrated,
      allCommunities,
      selectedCommunities: allCommunities.filter((c) =>
        state.selectedCommunityIds.includes(c.id),
      ),
      toggleCommunity,
      setSelected,
      addCustomCommunity,
      addSubmittedReview,
      reset,
    };
  }, [state, hydrated, toggleCommunity, setSelected, addCustomCommunity, addSubmittedReview, reset]);

  return <CircleContext.Provider value={value}>{children}</CircleContext.Provider>;
}

export function useCircle() {
  const ctx = useContext(CircleContext);
  if (!ctx) throw new Error("useCircle must be used inside CircleProvider");
  return ctx;
}
