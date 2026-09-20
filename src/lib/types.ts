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
  /** e.g. "MBBS, MD (Dermatology)" */
  qualifications: string;
  /** Areas of focus within the specialty, e.g. "Acne & scarring" */
  specializations: string[];
  demoVerified: boolean;
  /** Pre-generated (cached) AI summary. Never regenerated at page load. */
  insights: DoctorInsights;
}

export type ThreeScale = "yes" | "somewhat" | "no";
export type NeedAnswer = "yes" | "partially" | "no";
export type AgainAnswer = "yes" | "maybe" | "no";
export type YesNo = "yes" | "no";

export interface Review {
  id: string;
  doctorId: string;
  /** null = reviewer chose "Prefer not to say" / general anonymous */
  communityId: string | null;
  /** Public-facing label only. Never a name. */
  reviewerDisplayLabel: string;
  /** Short, general reason for the visit, e.g. "Skin consultation". Kept non-clinical. */
  visitReason: string;
  /** Did visiting this doctor address that need? */
  addressedNeed: NeedAnswer;
  /** Did the doctor listen and explain things clearly? */
  listenedExplained: ThreeScale;
  /** Would you consult this doctor again? */
  consultAgain: AgainAnswer;
  /** Would you recommend this doctor to someone with a similar need? */
  wouldRecommend: YesNo;
  /** Best part of the experience (tags and/or short text) */
  bestPart: string;
  /** What could be improved */
  improvement: string;
  /** Combined free text that was moderated; shown as the quote */
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

/** Private user profile. Never rendered publicly; used only to derive communities. */
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  /** Neighbourhood / locality, e.g. "HSR Layout" */
  area: string;
  college: string;
  graduationYear: string;
  employer: string;
  workEmail: string;
  updatedAt: string;
}

export type MembershipStatus = "verified" | "pending" | "unverified";
export type VerificationMethod =
  | "seeded"
  | "email-domain"
  | "email-otp"
  | "document"
  | "invite-code"
  | "creator"
  | "personal";

/** User -> Community link. Verified privately; only the community label is ever public. */
export interface Membership {
  communityId: string;
  status: MembershipStatus;
  method: VerificationMethod | null;
  joinedAt: string;
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
