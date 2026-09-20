import { z } from "zod";
import type { ModerationResult, Sentiment } from "./types";

const sentiment = z.enum(["positive", "neutral", "negative", "mixed"]);

/** Strict output schema for the moderation model call. */
export const ModerationSchema = z.object({
  safeToPublish: z.boolean(),
  flags: z.array(z.string()),
  medicalClaim: z.boolean(),
  personalInformationDetected: z.boolean(),
  abusiveContent: z.boolean(),
  promotionalContent: z.boolean(),
  duplicateOrSpamLike: z.boolean(),
  experienceThemes: z.array(z.string()),
  communication: sentiment,
  listening: sentiment,
  feeTransparency: sentiment,
  waitTime: sentiment,
  safeSummary: z.string(),
  userMessage: z.string(),
});

export type ModerationOutput = z.infer<typeof ModerationSchema>;

export const MODERATION_SYSTEM_PROMPT = `You are the review-moderation layer for DocCircle, a platform where patients share anonymous, first-hand experiences of visiting a doctor so that people from communities they trust can find doctors.

Your job is to analyze ONE written patient experience and return a structured, safe-to-publish version.

Analyze only the reviewer's first-hand visit experience: communication, listening, fee transparency, waiting experience, staff, clinic environment, and whether they felt respected.

Hard rules:
- Never infer or state anything about the doctor's medical competence or the effectiveness of any treatment.
- Never produce medical advice.
- Set medicalClaim=true if the text asserts a diagnosis, prescription, treatment outcome, or cure ("cured me", "prescribed X and it worked", "misdiagnosed me").
- Set personalInformationDetected=true if the text includes names of people, phone numbers, emails, street addresses, ID numbers, or detailed medical records.
- Set abusiveContent=true for insults, threats, slurs, or harassment.
- Set promotionalContent=true for advertising-like language, discounts, referral codes, or clinic marketing.
- Set duplicateOrSpamLike=true for gibberish, repeated filler, or content unrelated to a doctor visit.
- safeToPublish must be false if ANY of medicalClaim, personalInformationDetected, abusiveContent, promotionalContent, or duplicateOrSpamLike is true.
- flags: short human-readable labels for each problem detected (empty array if none).
- experienceThemes: 1-4 short, neutral experience themes such as "Clear communication", "Patient consultation", "Transparent fees", "Long waiting time", "Felt rushed". Title case, no medical content.
- communication / listening / feeTransparency / waitTime: sentiment of the review on that dimension. Use "neutral" when the text says nothing about it.
- safeSummary: one sentence, third person, experience-focused, with any personal or medical details removed. Example: "Reviewer described the doctor as attentive and clear in communication, and mentioned a long wait."
- userMessage: if safeToPublish is false, one or two friendly sentences telling the reviewer what to change (e.g. "This review contains a medical outcome claim. Please describe your visit and communication experience rather than treatment effectiveness."). If safeToPublish is true, an empty string.

Return only the structured object.`;

const PHONE_RE = /(\+?\d[\d\s\-()]{8,}\d)/;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/i;
const MEDICAL_RE =
  /\b(cured?|cure[sd]?\b|prescri(bed|ption)|diagnos(ed|is)|misdiagnos|medic(ine|ation)s?\b|antibiotic|steroid|dosage|mg\b|treatment (worked|failed)|healed|disease|infection|tablets?)\b/i;
const ABUSE_RE = /\b(idiot|stupid|fraud|scam(mer)?|quack|hate|kill|useless|worst doctor ever)\b/i;
const PROMO_RE = /\b(discount|offer|call now|book now|whatsapp|visit our|best clinic in|coupon|referral code|%\s?off)\b/i;

function sentimentFor(text: string, pos: RegExp, neg: RegExp): Sentiment {
  const p = pos.test(text);
  const n = neg.test(text);
  if (p && n) return "mixed";
  if (p) return "positive";
  if (n) return "negative";
  return "neutral";
}

/**
 * Deterministic fallback used when no API key is configured.
 * Keeps the demo fully functional offline; clearly marked as demo mode.
 */
export function mockModerate(text: string): ModerationResult {
  const t = text.trim();
  const flags: string[] = [];

  const personalInformationDetected = PHONE_RE.test(t) || EMAIL_RE.test(t);
  if (personalInformationDetected) flags.push("Personal contact information");

  const medicalClaim = MEDICAL_RE.test(t);
  if (medicalClaim) flags.push("Medical outcome or treatment claim");

  const abusiveContent = ABUSE_RE.test(t);
  if (abusiveContent) flags.push("Abusive or defamatory language");

  const promotionalContent = PROMO_RE.test(t);
  if (promotionalContent) flags.push("Promotional content");

  const words = t.split(/\s+/).filter(Boolean);
  const unique = new Set(words.map((w) => w.toLowerCase()));
  const duplicateOrSpamLike =
    (words.length > 6 && unique.size / words.length < 0.4) ||
    (t.length > 0 && !/[aeiou]/i.test(t));
  if (duplicateOrSpamLike) flags.push("Looks like spam or filler");

  const communication = sentimentFor(
    t,
    /\b(explain(ed|s)?|clear(ly)?|plain language|answered|understood)\b/i,
    /\b(confus(ing|ed)|unclear|didn'?t explain|did not explain|no explanation)\b/i,
  );
  const listening = sentimentFor(
    t,
    /\b(listen(ed|s)?|attentive|patient(ly)?|heard|took (her|his|their) time|not rushed|never rushed)\b/i,
    /\b(rushed|interrupt(ed)?|dismiss(ive|ed)|didn'?t listen|did not listen|hurried)\b/i,
  );
  const feeTransparency = sentimentFor(
    t,
    /\b(fees? (were|was) (clear|told|explained|upfront|up front)|transparent|reasonable|stated up ?front|clear (about )?(fees?|costs?|pricing))\b/i,
    /\b(hidden (charges?|costs?)|surprise (bill|charges?|costs?)|overcharg|expensive|more than quoted|unclear fee|fee(s)? (were|was) unclear)\b/i,
  );
  const waitTime = sentimentFor(
    t,
    /\b(no wait(ing)?|short wait|on time|seen (quickly|immediately)|barely any wait|(under|less than) (10|15|20) min|(wait(ed)?|waiting) (about |around |for )?([5-9]|1[0-9]|2[0-5])\s?min)/i,
    /\b(long wait|waited (over|more than)|hours? (of )?wait|crowded|(wait(ed)?|waiting) (about |around |for |over |was )?(3[0-9]|[4-9][0-9]|1[0-9]{2})\s?min|(1|2|two|one) hours?)/i,
  );

  const themes: string[] = [];
  if (communication === "positive") themes.push("Clear communication");
  if (communication === "negative") themes.push("Unclear explanations");
  if (listening === "positive") themes.push("Patient consultation");
  if (listening === "negative") themes.push("Felt rushed");
  if (feeTransparency === "positive") themes.push("Transparent fees");
  if (feeTransparency === "negative") themes.push("Fee clarity concerns");
  if (waitTime === "positive") themes.push("Short waiting time");
  if (waitTime === "negative") themes.push("Long waiting time");
  if (/\b(staff|reception(ist)?|nurse)\b/i.test(t) && /\b(polite|friendly|helpful|kind)\b/i.test(t))
    themes.push("Friendly staff");
  if (themes.length === 0 && t.length > 0) themes.push("General visit experience");

  const safeToPublish =
    !personalInformationDetected &&
    !medicalClaim &&
    !abusiveContent &&
    !promotionalContent &&
    !duplicateOrSpamLike;

  const parts: string[] = [];
  if (communication === "positive") parts.push("clear in communication");
  if (communication === "negative") parts.push("hard to follow");
  if (listening === "positive") parts.push("attentive");
  if (listening === "negative") parts.push("rushed");
  if (feeTransparency === "positive") parts.push("transparent about fees");
  if (feeTransparency === "negative") parts.push("unclear about fees");
  const waitNote =
    waitTime === "negative"
      ? " and mentioned a long wait"
      : waitTime === "positive"
        ? " and mentioned a short wait"
        : "";
  const safeSummary =
    t.length === 0
      ? "Reviewer shared structured feedback without written comments."
      : parts.length
        ? `Reviewer described the doctor as ${parts.join(", ")}${waitNote}.`
        : `Reviewer shared a general account of their visit${waitNote}.`;

  let userMessage = "";
  if (medicalClaim)
    userMessage =
      "This review contains a medical outcome or treatment claim. Please describe your visit and communication experience rather than making claims about treatment effectiveness.";
  else if (personalInformationDetected)
    userMessage =
      "This review appears to include personal contact information. Please remove names, phone numbers, or emails before publishing.";
  else if (abusiveContent)
    userMessage =
      "Please keep the review focused on your experience and avoid insults or accusations.";
  else if (promotionalContent)
    userMessage = "This reads like promotional content. Please describe your own visit instead.";
  else if (duplicateOrSpamLike)
    userMessage = "We could not read this as a visit experience. Please describe what happened during your visit.";

  return {
    safeToPublish,
    flags,
    medicalClaim,
    personalInformationDetected,
    abusiveContent,
    promotionalContent,
    duplicateOrSpamLike,
    experienceThemes: themes.slice(0, 4),
    communication,
    listening,
    feeTransparency,
    waitTime,
    safeSummary,
    userMessage,
  };
}
