import { COMMUNITIES, DOCTORS, REVIEWS, SPECIALTIES } from "./demo-data";
import type {
  Community,
  CommunitySignalStat,
  Doctor,
  DoctorSignals,
  Review,
  SpecialtyKey,
} from "./types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function getSpecialty(key: string | null | undefined) {
  if (!key) return undefined;
  const k = key.toLowerCase().trim();
  return SPECIALTIES.find(
    (s) =>
      s.key === k ||
      s.label.toLowerCase() === k ||
      s.plural.toLowerCase() === k ||
      s.field.toLowerCase() === k,
  );
}

export function normalizeCity(city: string | null | undefined) {
  if (!city) return undefined;
  const c = city.trim().toLowerCase();
  if (!c) return undefined;
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export function getDoctor(id: string): Doctor | undefined {
  return DOCTORS.find((d) => d.id === id);
}

export function getCommunity(
  id: string | null,
  extra: Community[] = [],
): Community | undefined {
  if (!id) return undefined;
  return [...COMMUNITIES, ...extra].find((c) => c.id === id);
}

export function filterDoctors(specialty?: SpecialtyKey, city?: string) {
  return DOCTORS.filter(
    (d) =>
      (!specialty || d.specialty === specialty) &&
      (!city || d.city.toLowerCase() === city.toLowerCase()),
  );
}

function pct(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

/**
 * Compute aggregate, anonymous signals for one doctor.
 * `selectedCommunityIds` are the communities the current user belongs to / selected.
 * `extraReviews` lets the client append reviews submitted this session.
 */
export function computeSignals(
  doctor: Doctor,
  selectedCommunityIds: string[],
  extraReviews: Review[] = [],
  extraCommunities: Community[] = [],
): DoctorSignals {
  const reviews = [...REVIEWS, ...extraReviews].filter(
    (r) => r.doctorId === doctor.id && r.safeToPublish,
  );
  const recommendCount = reviews.filter((r) => r.wouldRecommend === "yes").length;

  const byCommunity = new Map<string, { visited: number; recommend: number }>();
  for (const rv of reviews) {
    if (!rv.communityId) continue;
    const cur = byCommunity.get(rv.communityId) ?? { visited: 0, recommend: 0 };
    cur.visited += 1;
    if (rv.wouldRecommend === "yes") cur.recommend += 1;
    byCommunity.set(rv.communityId, cur);
  }

  const communityStats: CommunitySignalStat[] = [];
  for (const [id, stat] of byCommunity) {
    const community = getCommunity(id, extraCommunities);
    if (community) communityStats.push({ community, ...stat });
  }
  communityStats.sort((a, b) => b.visited - a.visited);

  const relevantStats = communityStats.filter((s) =>
    selectedCommunityIds.includes(s.community.id),
  );

  // Card themes come from the cached AI summary (positive themes only) so that
  // concerns like "Waiting time" are never shown with a checkmark on a card.
  const themes = doctor.insights.positiveThemes.slice(0, 3);

  return {
    doctor,
    experienceCount: reviews.length,
    recommendationRate: pct(recommendCount, reviews.length),
    communityStats,
    relevantStats,
    relevantExperienceCount: relevantStats.reduce((n, s) => n + s.visited, 0),
    relevantRecommendCount: relevantStats.reduce((n, s) => n + s.recommend, 0),
    themes,
  };
}

/** Split a doctor list into the Peer Reviewed segment and the general segment. */
export function segmentDoctors(
  doctors: Doctor[],
  selectedCommunityIds: string[],
  extraReviews: Review[] = [],
  extraCommunities: Community[] = [],
) {
  const all = doctors.map((d) =>
    computeSignals(d, selectedCommunityIds, extraReviews, extraCommunities),
  );

  const peer = all
    .filter((s) => s.relevantExperienceCount > 0)
    .sort((a, b) => {
      // 1) strength of relevant community experiences
      if (b.relevantExperienceCount !== a.relevantExperienceCount)
        return b.relevantExperienceCount - a.relevantExperienceCount;
      // 2) recommendation share within those experiences
      const ar = pct(a.relevantRecommendCount, a.relevantExperienceCount);
      const br = pct(b.relevantRecommendCount, b.relevantExperienceCount);
      if (br !== ar) return br - ar;
      // 3) general signal
      return b.recommendationRate - a.recommendationRate;
    });

  const general = all.sort(
    (a, b) =>
      b.recommendationRate - a.recommendationRate ||
      b.experienceCount - a.experienceCount,
  );

  return { peer, general };
}

export function getReviewsForDoctor(doctorId: string, extra: Review[] = []) {
  return [...extra, ...REVIEWS]
    .filter((r) => r.doctorId === doctorId && r.safeToPublish)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function timeAgo(iso: string, now = new Date("2026-09-20")) {
  const d = new Date(iso);
  const days = Math.max(0, Math.round((now.getTime() - d.getTime()) / 86_400_000));
  if (days < 1) return "today";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 30) {
    const w = Math.round(days / 7);
    return `${w} week${w === 1 ? "" : "s"} ago`;
  }
  const m = Math.round(days / 30);
  return `${m} month${m === 1 ? "" : "s"} ago`;
}

export const WAIT_LABEL: Record<Review["waitTime"], string> = {
  "<15": "Under 15 min wait",
  "15-30": "15–30 min wait",
  "30-60": "30–60 min wait",
  ">60": "Over 60 min wait",
};

export function formatFee(fee: number) {
  return `₹${fee.toLocaleString("en-IN")}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
