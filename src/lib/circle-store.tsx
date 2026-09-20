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
import { COMMUNITIES } from "./demo-data";
import type {
  Community,
  Membership,
  Review,
  UserProfile,
  VerificationMethod,
} from "./types";
import { slugify } from "./utils";

/**
 * Client-side session state for the current user.
 *
 * Mirrors the future DB shape:
 *   User (profile, private) -> Membership (verified privately) -> Community -> Review -> Doctor
 *
 * Persisted in localStorage so it survives refreshes. Nothing here is ever
 * shown publicly except the community *label* on an anonymous review.
 */

interface CircleState {
  profile: UserProfile | null;
  memberships: Membership[];
  customCommunities: Community[];
  /** Communities currently used for Ask My Circle / peer signals */
  selectedCommunityIds: string[];
  submittedReviews: Review[];
}

interface CircleContextValue extends CircleState {
  hydrated: boolean;
  allCommunities: Community[];
  /** Communities the user belongs to (any status) */
  myCommunities: Community[];
  selectedCommunities: Community[];
  verifiedCommunityIds: string[];
  membershipFor: (communityId: string) => Membership | undefined;
  saveProfile: (p: Omit<UserProfile, "updatedAt">) => { added: Community[] };
  toggleCommunity: (id: string) => void;
  setSelected: (ids: string[]) => void;
  addCustomCommunity: (c: Community) => void;
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
  requestVerification: (id: string, method: VerificationMethod, verifiedNow: boolean) => void;
  approvePending: (id: string) => void;
  addSubmittedReview: (r: Review) => void;
  reset: () => void;
}

const STORAGE_KEY = "doccircle:v2";
const today = () => new Date().toISOString().slice(0, 10);

/** Pre-verified memberships for the demo user. */
const SEED_MEMBERSHIPS: Membership[] = [
  { communityId: "c-nit", status: "verified", method: "seeded", joinedAt: "2026-06-01" },
  { communityId: "c-microsoft", status: "verified", method: "seeded", joinedAt: "2026-06-01" },
  { communityId: "c-friends", status: "verified", method: "personal", joinedAt: "2026-06-01" },
  { communityId: "c-family", status: "verified", method: "personal", joinedAt: "2026-06-01" },
];

const initial: CircleState = {
  profile: null,
  memberships: SEED_MEMBERSHIPS,
  customCommunities: [],
  selectedCommunityIds: ["c-nit", "c-microsoft"],
  submittedReviews: [],
};

const CircleContext = createContext<CircleContextValue | null>(null);

/** Map free-text profile fields onto pre-built communities where possible. */
function matchPrebuilt(text: string): Community | undefined {
  const t = text.toLowerCase();
  if (/\bnit\b|national institute of technology/.test(t)) return COMMUNITIES.find((c) => c.id === "c-nit");
  if (/microsoft/.test(t)) return COMMUNITIES.find((c) => c.id === "c-microsoft");
  return undefined;
}

function emailDomainMatches(email: string, org: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain) return false;
  const orgSlug = slugify(org).split("-")[0];
  return orgSlug.length >= 3 && domain.includes(orgSlug);
}

export function CircleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CircleState>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<CircleState>;
          setState({
            profile: parsed.profile ?? null,
            memberships: parsed.memberships ?? initial.memberships,
            customCommunities: parsed.customCommunities ?? [],
            selectedCommunityIds: parsed.selectedCommunityIds ?? initial.selectedCommunityIds,
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
      // storage unavailable; state still works in memory
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
      customCommunities: s.customCommunities.some((x) => x.id === c.id)
        ? s.customCommunities
        : [...s.customCommunities, c],
      memberships: s.memberships.some((m) => m.communityId === c.id)
        ? s.memberships
        : [...s.memberships, { communityId: c.id, status: "verified", method: "creator", joinedAt: today() }],
      selectedCommunityIds: s.selectedCommunityIds.includes(c.id)
        ? s.selectedCommunityIds
        : [...s.selectedCommunityIds, c.id],
    }));
  }, []);

  const joinCommunity = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      memberships: s.memberships.some((m) => m.communityId === id)
        ? s.memberships
        : [...s.memberships, { communityId: id, status: "pending", method: null, joinedAt: today() }],
      selectedCommunityIds: s.selectedCommunityIds.includes(id)
        ? s.selectedCommunityIds
        : [...s.selectedCommunityIds, id],
    }));
  }, []);

  const leaveCommunity = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      memberships: s.memberships.filter((m) => m.communityId !== id),
      selectedCommunityIds: s.selectedCommunityIds.filter((x) => x !== id),
    }));
  }, []);

  const requestVerification = useCallback(
    (id: string, method: VerificationMethod, verifiedNow: boolean) => {
      setState((s) => ({
        ...s,
        memberships: s.memberships.map((m) =>
          m.communityId === id
            ? { ...m, method, status: verifiedNow ? "verified" : "pending" }
            : m,
        ),
      }));
    },
    [],
  );

  const approvePending = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      memberships: s.memberships.map((m) =>
        m.communityId === id && m.status === "pending" ? { ...m, status: "verified" } : m,
      ),
    }));
  }, []);

  const saveProfile = useCallback((p: Omit<UserProfile, "updatedAt">) => {
    const added: Community[] = [];
    setState((s) => {
      const custom = [...s.customCommunities];
      const memberships = [...s.memberships];
      const selected = [...s.selectedCommunityIds];

      const ensure = (community: Community, verifiedNow: boolean, method: VerificationMethod) => {
        const all = [...COMMUNITIES, ...custom];
        if (!all.some((c) => c.id === community.id)) {
          custom.push(community);
          added.push(community);
        }
        const existing = memberships.find((m) => m.communityId === community.id);
        if (!existing) {
          memberships.push({
            communityId: community.id,
            status: verifiedNow ? "verified" : "pending",
            method: verifiedNow ? method : null,
            joinedAt: today(),
          });
          added.push(community);
        } else if (existing.status !== "verified" && verifiedNow) {
          existing.status = "verified";
          existing.method = method;
        }
        if (!selected.includes(community.id)) selected.push(community.id);
      };

      // College -> alumni community
      if (p.college.trim()) {
        const pre = matchPrebuilt(p.college);
        const community: Community = pre ?? {
          id: `c-${slugify(p.college)}-alumni`,
          name: `${p.college.trim()} Alumni`,
          type: "alumni",
          verified: true,
          description: `Alumni of ${p.college.trim()}. Membership verified privately.`,
        };
        ensure(community, emailDomainMatches(p.email, p.college), "email-domain");
      }

      // Employer -> workplace community
      if (p.employer.trim()) {
        const pre = matchPrebuilt(p.employer);
        const community: Community = pre ?? {
          id: `c-${slugify(p.employer)}`,
          name: `${p.employer.trim()} Community`,
          type: "workplace",
          verified: true,
          description: `Current and former ${p.employer.trim()} employees. Verified via work email.`,
        };
        const workEmail = p.workEmail || p.email;
        ensure(community, emailDomainMatches(workEmail, p.employer), "email-domain");
      }

      return {
        ...s,
        profile: { ...p, updatedAt: today() },
        customCommunities: custom,
        memberships,
        selectedCommunityIds: selected,
      };
    });
    return { added };
  }, []);

  const addSubmittedReview = useCallback((r: Review) => {
    setState((s) => ({ ...s, submittedReviews: [r, ...s.submittedReviews] }));
  }, []);

  const reset = useCallback(() => setState(initial), []);

  const value = useMemo<CircleContextValue>(() => {
    const allCommunities = [...COMMUNITIES, ...state.customCommunities];
    const memberIds = new Set(state.memberships.map((m) => m.communityId));
    const myCommunities = allCommunities.filter((c) => memberIds.has(c.id));
    const verifiedCommunityIds = state.memberships
      .filter((m) => m.status === "verified")
      .map((m) => m.communityId);
    return {
      ...state,
      hydrated,
      allCommunities,
      myCommunities,
      selectedCommunities: allCommunities.filter((c) => state.selectedCommunityIds.includes(c.id)),
      verifiedCommunityIds,
      membershipFor: (id) => state.memberships.find((m) => m.communityId === id),
      saveProfile,
      toggleCommunity,
      setSelected,
      addCustomCommunity,
      joinCommunity,
      leaveCommunity,
      requestVerification,
      approvePending,
      addSubmittedReview,
      reset,
    };
  }, [
    state,
    hydrated,
    saveProfile,
    toggleCommunity,
    setSelected,
    addCustomCommunity,
    joinCommunity,
    leaveCommunity,
    requestVerification,
    approvePending,
    addSubmittedReview,
    reset,
  ]);

  return <CircleContext.Provider value={value}>{children}</CircleContext.Provider>;
}

export function useCircle() {
  const ctx = useContext(CircleContext);
  if (!ctx) throw new Error("useCircle must be used inside CircleProvider");
  return ctx;
}
