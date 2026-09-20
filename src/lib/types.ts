// Core data model for DocCircle.
// Kept deliberately close to a relational shape so it can move to a real DB later:
// User -> UserCommunityMembership -> Community -> Review -> Doctor

export type SpecialtyKey =
  | "dermatology"
  | "orthopedics"
  | "ent"
  | "dentistry"
  | "cardiology"
  | "general-medicine"
  | "gynecology";

export interface Specialty {
  key: SpecialtyKey;
  /** Singular practitioner label, e.g. "Dermatologist" */
  label: string;
  /** Plural practitioner label, e.g. "Dermatologists" */
  plural: string;
  /** Field name, e.g. "Dermatology" */
  field: string;
}

export type CommunityType =
  | "alumni"
  | "workplace"
  | "friends"
  | "family"
  | "local"
  | "custom";

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  verified: boolean;
  description: string;
}

export interface DoctorInsights {
  /** % of experiences reporting positive communication */
  communication: number;
  listening: number;
  feeTransparency: number;
  waitTime: number;
  summary: string;
  positiveThemes: string[];
  concerns: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: SpecialtyKey;
  clinicName: string;
  city: string;
  area: string;
  consultationFee: number;
  yearsExperience: number;
  languages: string[];
  demoVerified: boolean;
  /** Pre-generated (cached) AI summary. Never regenerated at page load. */
  insights: DoctorInsights;
}

export type ThreeScale = "yes" | "somewhat" | "no";
export type RecommendAnswer = "yes" | "maybe" | "no";
export type WaitBucket = "<15" | "15-30" | "30-60" | ">60";

export interface Review {
  id: string;
  doctorId: string;
  /** null = reviewer chose "Prefer not to say" / general anonymous */
  communityId: string | null;
  /** Public-facing label only. Never a name. */
  reviewerDisplayLabel: string;
  listening: ThreeScale;
  explanation: ThreeScale;
  feesClear: boolean;
  waitTime: WaitBucket;
  wouldRecommend: RecommendAnswer;
  writtenExperience: string;
  aiThemes: string[];
  aiSummary: string;
  safeToPublish: boolean;
  /** ISO date */
  createdAt: string;
}

export type Sentiment = "positive" | "neutral" | "negative" | "mixed";

export interface ModerationResult {
  safeToPublish: boolean;
  flags: string[];
  medicalClaim: boolean;
  personalInformationDetected: boolean;
  abusiveContent: boolean;
  promotionalContent: boolean;
  duplicateOrSpamLike: boolean;
  experienceThemes: string[];
  communication: Sentiment;
  listening: Sentiment;
  feeTransparency: Sentiment;
  waitTime: Sentiment;
  safeSummary: string;
  /** Plain-language guidance shown to the reviewer if something was flagged */
  userMessage?: string;
}

export interface ModerationResponse {
  result: ModerationResult;
  /** "fable" when a live model call was made, "mock" for the deterministic fallback */
  mode: "fable" | "mock";
  model?: string;
}

/** Aggregated, anonymous signal for one community on one doctor. */
export interface CommunitySignalStat {
  community: Community;
  visited: number;
  recommend: number;
}

export interface DoctorSignals {
  doctor: Doctor;
  experienceCount: number;
  recommendationRate: number; // 0-100
  communityStats: CommunitySignalStat[];
  /** Stats for only the communities the current user selected */
  relevantStats: CommunitySignalStat[];
  relevantExperienceCount: number;
  relevantRecommendCount: number;
  themes: string[];
}
