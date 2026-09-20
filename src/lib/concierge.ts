import { z } from "zod";
import { CITIES, DOCTORS, REVIEWS, SPECIALTIES } from "./demo-data";
import type { Community, ConciergeMessage, ConciergeResult, Review, SpecialtyKey } from "./types";
import { computeSignals, getSpecialty, normalizeCity, reviewerLabelFor } from "./utils";

/* ---------------- Output schema ---------------- */

export const ConciergeSchema = z.object({
  type: z.enum(["question", "answer", "urgent"]),
  message: z.string(),
  understood: z.object({
    specialty: z.string().nullable(),
    city: z.string().nullable(),
    need: z.string().nullable(),
  }),
  reasoning: z.array(z.string()),
  recommendations: z.array(
    z.object({
      doctorId: z.string(),
      headline: z.string(),
      why: z.string(),
      evidence: z.array(z.string()),
    }),
  ),
  caveats: z.array(z.string()),
});

export interface ConciergeContext {
  selectedCommunityIds: string[];
  communities: Community[];
  extraReviews: Review[];
  city?: string;
  area?: string;
}

/* ---------------- Knowledge base rendered for the model ---------------- */

function reviewLine(r: Review, communities: Community[]) {
  const label = reviewerLabelFor(communities.find((c) => c.id === r.communityId));
  const parts = [
    `[${label}]`,
    `visited for: ${r.visitReason}`,
    `need addressed: ${r.addressedNeed}`,
    `listened & explained: ${r.listenedExplained}`,
    `consult again: ${r.consultAgain}`,
    `recommend: ${r.wouldRecommend}`,
  ];
  if (r.writtenExperience) parts.push(`said: "${r.writtenExperience}"`);
  if (r.improvement) parts.push(`could improve: ${r.improvement}`);
  return "  - " + parts.join(" | ");
}

export function buildKnowledgeBase(ctx: ConciergeContext) {
  const all = [...REVIEWS, ...ctx.extraReviews].filter((r) => r.safeToPublish);
  return DOCTORS.map((d) => {
    const spec = SPECIALTIES.find((s) => s.key === d.specialty)!;
    const reviews = all.filter((r) => r.doctorId === d.id);
    const head = [
      `DOCTOR id=${d.id}`,
      `name: ${d.name}`,
      `specialty: ${spec.label} (${spec.field})`,
      `location: ${d.area}, ${d.city}`,
      `fee: ₹${d.consultationFee}`,
      `qualifications: ${d.qualifications}`,
      `focus: ${d.specializations.join(", ")}`,
      `summary: ${d.insights.summary}`,
      `experiences: ${reviews.length}`,
    ].join(" | ");
    return [head, ...reviews.map((r) => reviewLine(r, ctx.communities))].join("\n");
  }).join("\n\n");
}

export function buildSystemPrompt(ctx: ConciergeContext) {
  const circleNames = ctx.communities
    .filter((c) => ctx.selectedCommunityIds.includes(c.id))
    .map((c) => reviewerLabelFor(c));
  const home = [ctx.area, ctx.city].filter(Boolean).join(", ");

  return `You are the Ask My Circle concierge for DocCircle, a doctor-discovery service built on anonymous, community-verified patient experiences.

Your job: have a short conversation to understand what the person needs, then recommend doctors the way a well-connected friend would: by reasoning over what people in their trusted circles actually said.

USER CONTEXT
- Trusted circles: ${circleNames.length ? circleNames.join("; ") : "none selected"}
- Home: ${home || "unknown"}
- Available cities: ${CITIES.join(", ")}
- Available specialties: ${SPECIALTIES.map((s) => s.label).join(", ")}. There is no paediatrician; for children use General Physician and say so.

HOW TO BEHAVE
1. Ask at most TWO clarifying questions in the whole conversation, one at a time (type="question"). Ask only when you genuinely cannot pick a specialty or a city. Use the user's home city if they gave none. Never interrogate about symptoms beyond what is needed to choose a specialty.
2. When you can answer, return type="answer" with up to 3 recommendations ordered by fit. Prefer doctors with experiences from the user's trusted circles, then doctors whose reviewers had a similar need, then general signal. Explain the ranking in "reasoning" as 2-4 short bullets a friend would say ("Two people from your Microsoft community went for a similar skin issue and both would go back").
3. "evidence" lines must be anonymous and start with the community label, e.g. "NIT Alumni: 'She listened carefully and explained everything clearly.'". Never invent quotes; only use text from the knowledge base.
4. If no doctor matches the specialty in that city, say so honestly, offer the closest alternative from the data, and set recommendations to what you can justify (possibly empty).
5. Red flags (difficulty breathing, chest pain, stroke signs, heavy bleeding, infant under 3 months with fever, severe dehydration, suicidal thoughts): return type="urgent", tell them to seek emergency care now, and do not recommend a clinic doctor.
6. Never diagnose, never suggest treatment, never judge medical competence. You describe patient experience only. Put "Community experience, not medical advice." in caveats on every answer.
7. "understood" reflects what you have inferred so far (specialty label, city, need in the user's words). Keep "message" warm and under 60 words.
8. Use only doctorId values that appear in the knowledge base.

KNOWLEDGE BASE (anonymous community experiences)
${buildKnowledgeBase(ctx)}`;
}

/* ---------------- Offline fallback (no API key) ---------------- */

const SPECIALTY_HINTS: Array<[RegExp, SpecialtyKey]> = [
  [/\b(skin|acne|rash|pimple|hair ?loss|dandruff|eczema|pigment|derma|mole|itch)/i, "dermatology"],
  [/\b(knee|back|spine|joint|fracture|bone|shoulder|ligament|ortho|sprain|hip)/i, "orthopedics"],
  [/\b(tooth|teeth|dental|dentist|gum|cavity|braces|root canal)/i, "dentistry"],
  [/\b(ear|nose|throat|sinus|hearing|tonsil|ent\b|snor)/i, "ent"],
  [/\b(heart|chest|palpitation|bp\b|blood pressure|cardio|cholesterol)/i, "cardiology"],
  [/\b(pregnan|period|pcos|gyn|menopause|fertility|uterus|ob-?gyn)/i, "gynecology"],
  [/\b(cough|cold|fever|flu|child|kid|son|daughter|year[- ]old|general|physician|gp\b|check-?up|diabet|thyroid|weakness|viral)/i, "general-medicine"],
];
const URGENT_RE =
  /\b(can'?t breathe|difficulty breathing|breathless|chest pain|unconscious|seizure|stroke|heavy bleeding|suicid|not waking|blue lips|severe dehydration)\b/i;

function detectCity(text: string) {
  return CITIES.find((c) => new RegExp(`\\b${c}\\b`, "i").test(text));
}
function detectSpecialty(text: string): SpecialtyKey | undefined {
  const direct = SPECIALTIES.find((s) => new RegExp(`\\b${s.label}s?\\b|\\b${s.field}\\b`, "i").test(text));
  if (direct) return direct.key;
  for (const [re, key] of SPECIALTY_HINTS) if (re.test(text)) return key;
  return undefined;
}

export function mockConcierge(messages: ConciergeMessage[], ctx: ConciergeContext): ConciergeResult {
  const userText = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
  const questionsAsked = messages.filter((m) => m.role === "assistant").length;
  const caveats = ["Community experience, not medical advice."];

  if (URGENT_RE.test(userText)) {
    return {
      type: "urgent",
      message:
        "This sounds like it may need urgent care. Please go to the nearest emergency department or call local emergency services now rather than waiting for a clinic appointment.",
      understood: { specialty: null, city: detectCity(userText) ?? ctx.city ?? null, need: userText.slice(0, 80) },
      reasoning: ["Some of what you described can be a red flag that clinics are not set up to handle quickly."],
      recommendations: [],
      caveats,
    };
  }

  const specialtyKey = detectSpecialty(userText);
  const city = detectCity(userText) ?? normalizeCity(ctx.city);
  const isChild = /\b(child|kid|son|daughter|\d+[- ]?year[- ]old|baby|toddler)\b/i.test(userText);
  const needMatch = userText.split(/[.!?\n]/)[0]?.trim().slice(0, 80) || null;

  if (!specialtyKey && questionsAsked < 2) {
    return {
      type: "question",
      message:
        "Happy to help. To point you to the right kind of doctor, what's the main concern? For example skin, joints or back, teeth, ear/nose/throat, heart, women's health, or a general issue like fever or cough.",
      understood: { specialty: null, city: city ?? null, need: needMatch },
      reasoning: [],
      recommendations: [],
      caveats,
    };
  }
  if (!city && questionsAsked < 2) {
    return {
      type: "question",
      message: `Got it. Which city are you in? I have community experiences for ${CITIES.join(", ")}.`,
      understood: { specialty: specialtyKey ? getSpecialty(specialtyKey)!.label : null, city: null, need: needMatch },
      reasoning: [],
      recommendations: [],
      caveats,
    };
  }

  const key = specialtyKey ?? "general-medicine";
  const spec = getSpecialty(key)!;
  const cityName = city ?? "Bangalore";
  const pool = DOCTORS.filter((d) => d.specialty === key && d.city.toLowerCase() === cityName.toLowerCase());
  const signals = pool
    .map((d) => computeSignals(d, ctx.selectedCommunityIds, ctx.extraReviews, ctx.communities))
    .sort(
      (a, b) =>
        b.relevantExperienceCount - a.relevantExperienceCount ||
        b.recommendationRate - a.recommendationRate ||
        b.experienceCount - a.experienceCount,
    );

  const reasoning: string[] = [];
  if (isChild && key === "general-medicine")
    reasoning.push("There isn't a paediatrician in the network yet, so I looked at General Physicians your circles trust for children and family visits.");
  if (signals.length === 0) {
    const elsewhere = DOCTORS.filter((d) => d.specialty === key).map((d) => d.city);
    return {
      type: "answer",
      message: `I couldn't find a ${spec.label.toLowerCase()} in ${cityName} with community experiences yet.`,
      understood: { specialty: spec.label, city: cityName, need: needMatch },
      reasoning: [
        ...reasoning,
        elsewhere.length
          ? `Your circles have shared ${spec.label.toLowerCase()} experiences in ${[...new Set(elsewhere)].join(", ")}, but not in ${cityName}.`
          : "None of your circles have shared an experience for this specialty yet.",
        "You could be the first to add one after your visit, which helps the next person in your community.",
      ],
      recommendations: [],
      caveats,
    };
  }

  const all = [...REVIEWS, ...ctx.extraReviews];
  const recommendations = signals.slice(0, 3).map((s, i) => {
    const reviews = all.filter((r) => r.doctorId === s.doctor.id && r.safeToPublish);
    const relevant = reviews.filter((r) => r.communityId && ctx.selectedCommunityIds.includes(r.communityId));
    const quotes = (relevant.length ? relevant : reviews)
      .filter((r) => r.writtenExperience)
      .slice(0, 2)
      .map((r) => `${reviewerLabelFor(ctx.communities.find((c) => c.id === r.communityId))}: "${r.writtenExperience}"`);
    const circleBits = s.relevantStats.map((st) => `${st.visited} from ${st.community.name} (${st.recommend} would recommend)`);
    const why = circleBits.length
      ? `${circleBits.join(" and ")} have been here. ${s.recommendationRate}% of all ${s.experienceCount} experiences would recommend.`
      : `No one from your circles has been yet, but ${s.recommendationRate}% of ${s.experienceCount} verified visitors would recommend.`;
    const concern = s.doctor.insights.concerns[0];
    return {
      doctorId: s.doctor.id,
      headline:
        i === 0 && circleBits.length
          ? "Strongest signal from your circles"
          : circleBits.length
            ? "Also visited by your circles"
            : "Well regarded, no circle overlap yet",
      why: concern ? `${why} Most common gripe: ${concern.toLowerCase()}.` : why,
      evidence: quotes,
    };
  });

  const top = signals[0];
  if (top.relevantExperienceCount > 0) {
    reasoning.unshift(
      `${top.relevantExperienceCount} people from your circles have visited ${top.doctor.name}, and ${top.relevantRecommendCount} of them would recommend. That's the closest thing to a friend's referral in the data.`,
    );
  } else {
    reasoning.unshift(`None of your circles have reviewed a ${spec.label.toLowerCase()} in ${cityName} yet, so this is ranked on all verified experiences instead.`);
  }
  if (signals.length > 1)
    reasoning.push(`I ranked by how many people from your circles went, then by how many would recommend, then by overall experience count.`);
  const commonThemes = top.doctor.insights.positiveThemes.slice(0, 2).join(" and ").toLowerCase();
  if (commonThemes) reasoning.push(`Reviewers of ${top.doctor.name} keep mentioning ${commonThemes}.`);

  return {
    type: "answer",
    message: `Here's who I'd start with for a ${spec.label.toLowerCase()} in ${cityName}, based on what your circles have shared.`,
    understood: { specialty: spec.label, city: cityName, need: needMatch },
    reasoning,
    recommendations,
    caveats,
  };
}
