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
  /** Communities derived from the profile that the user has not joined yet */
  suggestedCommunities: Array<{ community: Community; reason: string }>;
  saveProfile: (p: Omit<UserProfile, "updatedAt">) => void;
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

/** Communities a profile makes the user eligible for: college, employer, locality, city. */
function deriveCommunities(p: UserProfile | null): Array<{ community: Community; reason: string }> {
  if (!p) return [];
  const out: Array<{ community: Community; reason: string }> = [];
  const college = p.college.trim();
  const employer = p.employer.trim();
  const area = p.area.trim();
  const city = p.city.trim();

  if (college) {
    const pre = matchPrebuilt(college);
    out.push({
      reason: `Because you studied at ${college}`,
      community: pre ?? {
        id: `c-${slugify(college)}-alumni`,
        name: `${college} Alumni`,
        type: "alumni",
        verified: true,
        description: `Alumni of ${college}. Membership verified privately.`,
      },
    });
  }
  if (employer) {
    const pre = matchPrebuilt(employer);
    out.push({
      reason: `Because you work at ${employer}`,
      community: pre ?? {
        id: `c-${slugify(employer)}`,
        name: `${employer} Community`,
        type: "workplace",
        verified: true,
        description: `Current and former ${employer} employees. Verified via work email.`,
      },
    });
  }
  if (area) {
    out.push({
      reason: `Because you live in ${area}`,
      community: {
        id: `c-${slugify(area)}-residents`,
        name: `${area} Residents`,
        type: "local",
        verified: true,
        description: `People living in and around ${area}${city ? `, ${city}` : ""}. Verified via address or society code.`,
      },
    });
  }
  if (city) {
    out.push({
      reason: `Because you live in ${city}`,
      community: {
        id: `c-${slugify(city)}-locals`,
        name: `${city} Locals`,
        type: "local",
        verified: true,
        description: `Residents of ${city}. Verified via address.`,
      },
    });
  }
  // de-dupe by id
  const seen = new Set<string>();
  return out.filter(({ community }) => (seen.has(community.id) ? false : (seen.add(community.id), true)));
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
    setState((s) => {
      if (s.memberships.some((m) => m.communityId === id)) return s;
      const community = [...COMMUNITIES, ...s.customCommunities].find((c) => c.id === id);
      // Instant verification when a work/college email domain matches the organisation.
      let verifiedNow = false;
      if (community && s.profile) {
        const org = community.name.replace(/ (Community|Alumni)$/i, "");
        if (community.type === "workplace")
          verifiedNow = emailDomainMatches(s.profile.workEmail || s.profile.email, org);
        if (community.type === "alumni") verifiedNow = emailDomainMatches(s.profile.email, org);
      }
      return {
        ...s,
        memberships: [
          ...s.memberships,
          {
            communityId: id,
            status: verifiedNow ? "verified" : "pending",
            method: verifiedNow ? "email-domain" : null,
            joinedAt: today(),
          },
        ],
        selectedCommunityIds: s.selectedCommunityIds.includes(id)
          ? s.selectedCommunityIds
          : [...s.selectedCommunityIds, id],
      };
    });
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

  /**
   * Save the private profile and make the derived communities *available*.
   * Joining is a separate, explicit step on the "Your circles" screen.
   */
  const saveProfile = useCallback((p: Omit<UserProfile, "updatedAt">) => {
    setState((s) => {
      const profile: UserProfile = { ...p, updatedAt: today() };
      const custom = [...s.customCommunities];
      for (const { community } of deriveCommunities(profile)) {
        if (![...COMMUNITIES, ...custom].some((c) => c.id === community.id)) custom.push(community);
      }
      return { ...s, profile, customCommunities: custom };
    });
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
    const suggestedCommunities = deriveCommunities(state.profile).filter(
      ({ community }) => !memberIds.has(community.id),
    );
    return {
      ...state,
      hydrated,
      allCommunities,
      myCommunities,
      selectedCommunities: allCommunities.filter((c) => state.selectedCommunityIds.includes(c.id)),
      verifiedCommunityIds,
      membershipFor: (id) => state.memberships.find((m) => m.communityId === id),
      suggestedCommunities,
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
