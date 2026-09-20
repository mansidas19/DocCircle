"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Check, CheckCircle2, Loader2, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { DOCTORS, SPECIALTIES } from "@/lib/demo-data";
import { useCircle } from "@/lib/circle-store";
import type {
  AgainAnswer,
  ModerationResponse,
  NeedAnswer,
  Review,
  Sentiment,
  ThreeScale,
  YesNo,
} from "@/lib/types";
import { cn, reviewerLabelFor } from "@/lib/utils";

type Step = "form" | "submitting" | "flagged" | "done" | "error";

const NEED: Array<{ value: NeedAnswer; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "partially", label: "Partially" },
  { value: "no", label: "No" },
];
const THREE: Array<{ value: ThreeScale; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "somewhat", label: "Somewhat" },
  { value: "no", label: "No" },
];
const AGAIN: Array<{ value: AgainAnswer; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
];
const YESNO: Array<{ value: YesNo; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const BEST_TAGS = [
  "Listened patiently",
  "Explained clearly",
  "Transparent fees",
  "Short wait",
  "Friendly staff",
  "Didn't push extra tests",
  "Easy to reach",
];

const REASON_SUGGESTIONS = [
  "Skin consultation",
  "Knee pain",
  "Routine check-up",
  "Second opinion",
  "Tooth pain",
  "Fever & cold",
  "Pregnancy care",
  "Sinus consultation",
];

const SENTIMENT_STYLE: Record<Sentiment, string> = {
  positive: "bg-brand-50 text-brand-800 border-brand-200",
  neutral: "bg-slate-50 text-slate-600 border-slate-200",
  negative: "bg-rose-50 text-rose-800 border-rose-200",
  mixed: "bg-peer-50 text-peer-800 border-peer-200",
};

function Segmented<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T | "";
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div role="radiogroup" aria-labelledby={`${name}-label`} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              "cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-medium transition focus-within:ring-2 focus-within:ring-brand-500",
              active ? "border-brand-600 bg-brand-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
            )}
          >
            <input type="radio" name={name} value={o.value} checked={active} onChange={() => onChange(o.value)} className="sr-only" required />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

export default function ReviewForm() {
  const params = useSearchParams();
  const { myCommunities, verifiedCommunityIds, membershipFor, addSubmittedReview } = useCircle();
  const postable = myCommunities.filter((c) => verifiedCommunityIds.includes(c.id));
  const pendingOnes = myCommunities.filter((c) => membershipFor(c.id)?.status !== "verified");

  const [doctorId, setDoctorId] = useState(params.get("doctorId") ?? "");
  const [visitReason, setVisitReason] = useState("");
  const [addressedNeed, setAddressedNeed] = useState<NeedAnswer | "">("");
  const [listenedExplained, setListenedExplained] = useState<ThreeScale | "">("");
  const [consultAgain, setConsultAgain] = useState<AgainAnswer | "">("");
  const [wouldRecommend, setWouldRecommend] = useState<YesNo | "">("");
  const [bestTags, setBestTags] = useState<string[]>([]);
  const [bestText, setBestText] = useState("");
  const [improvement, setImprovement] = useState("");
  const [communityId, setCommunityId] = useState<string>("c-nit");

  const [step, setStep] = useState<Step>("form");
  const [moderation, setModeration] = useState<ModerationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const doctor = useMemo(() => DOCTORS.find((d) => d.id === doctorId), [doctorId]);
  const doctorsSorted = useMemo(
    () => [...DOCTORS].sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)),
    [],
  );

  const written = [bestText.trim(), improvement.trim()].filter(Boolean).join(" ");
  const charCount = bestText.length + improvement.length;

  function toggleTag(t: string) {
    setBestTags((tags) => (tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!doctorId || !visitReason.trim() || !addressedNeed || !listenedExplained || !consultAgain || !wouldRecommend) return;
    setStep("submitting");
    setErrorMsg(null);

    try {
      // Everything free-text goes through moderation, including the visit reason.
      const toModerate = [visitReason.trim() ? `Visit reason: ${visitReason.trim()}.` : "", written]
        .filter(Boolean)
        .join(" ");
      const res = await fetch("/api/moderate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writtenExperience: toModerate }),
      });
      const data = (await res.json()) as ModerationResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Moderation failed");
      setModeration(data);

      if (!data.result.safeToPublish) {
        setStep("flagged");
        return;
      }

      const community = postable.find((c) => c.id === communityId);
      const bestPart = [...bestTags, bestText.trim()].filter(Boolean).join(", ");
      const themes = [...new Set([...bestTags, ...data.result.experienceThemes])].slice(0, 5);
      const review: Review = {
        id: `rv-local-${crypto.randomUUID()}`,
        doctorId,
        communityId: community ? community.id : null,
        reviewerDisplayLabel: reviewerLabelFor(community),
        visitReason: visitReason.trim(),
        addressedNeed,
        listenedExplained,
        consultAgain,
        wouldRecommend,
        bestPart,
        improvement: improvement.trim(),
        writtenExperience: written,
        aiThemes: themes,
        aiSummary: data.result.safeSummary,
        safeToPublish: true,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addSubmittedReview(review);
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  }

  function resetForm() {
    setStep("form");
    setModeration(null);
    setVisitReason("");
    setAddressedNeed("");
    setListenedExplained("");
    setConsultAgain("");
    setWouldRecommend("");
    setBestTags([]);
    setBestText("");
    setImprovement("");
  }

  /* ---------- Result screens ---------- */
  if (step === "done" && moderation) {
    const r = moderation.result;
    return (
      <div className="card fade-up p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="eyebrow text-brand-700">Experience submitted</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              You&apos;ve helped your community make better doctor-discovery decisions.
            </h2>
            <p className="mt-2 text-slate-600">
              Your anonymous experience has been added to the community signal for{" "}
              <span className="font-semibold text-slate-900">{doctor?.name}</span>. Only your
              community label is shown, never your identity.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="eyebrow flex items-center gap-1.5 text-brand-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Experience captured
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              {(
                [
                  ["Need addressed", addressedNeed],
                  ["Listened & explained", listenedExplained],
                  ["Would consult again", consultAgain],
                  ["Would recommend", wouldRecommend],
                ] as Array<[string, string]>
              ).map(([label, v]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-slate-700">
                    <Check className="h-4 w-4 text-brand-700" aria-hidden />
                    {label}
                  </dt>
                  <dd className="chip border-slate-200 bg-slate-50 capitalize text-slate-700">{v}</dd>
                </div>
              ))}
              {(
                [
                  ["Communication tone", r.communication],
                  ["Listening tone", r.listening],
                ] as Array<[string, Sentiment]>
              ).map(([label, s]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-slate-700">
                    <Sparkles className="h-4 w-4 text-brand-700" aria-hidden />
                    {label}
                  </dt>
                  <dd className={cn("chip capitalize", SENTIMENT_STYLE[s])}>{s}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="eyebrow">Safe public summary</p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-800">&ldquo;{r.safeSummary}&rdquo;</p>
            {(bestTags.length > 0 || r.experienceThemes.length > 0) && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {[...new Set([...bestTags, ...r.experienceThemes])].map((t) => (
                  <li key={t} className="chip border-brand-100 bg-brand-50 text-brand-800">✓ {t}</li>
                ))}
              </ul>
            )}
            <ModeBadge mode={moderation.mode} model={moderation.model} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/doctors/${doctorId}`} className="btn-primary">See it on the profile</Link>
          <Link href={`/doctors?specialty=${doctor?.specialty}&city=${doctor?.city}`} className="btn-secondary">Back to search</Link>
          <button type="button" className="btn-ghost" onClick={resetForm}>Share another</button>
        </div>
      </div>
    );
  }

  if (step === "flagged" && moderation) {
    const r = moderation.result;
    return (
      <div className="card fade-up border-peer-200 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-peer-50 text-peer-700">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="eyebrow text-peer-700">Needs a small edit before publishing</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Let&apos;s keep this safe and useful</h2>
            <p className="mt-2 text-slate-700">{r.userMessage || "Please revise your written answers."}</p>
          </div>
        </div>

        <ul className="mt-5 space-y-2" aria-label="Moderation flags">
          {r.flags.map((f) => (
            <li key={f} className="flex items-center gap-2 rounded-xl border border-peer-200 bg-peer-50 px-3 py-2 text-sm text-peer-900">
              <XCircle className="h-4 w-4 shrink-0 text-peer-700" aria-hidden />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Tip</p>
          <p className="mt-1">
            Keep the visit reason general (e.g. &ldquo;skin consultation&rdquo;) and describe how the
            visit felt. Avoid diagnoses, prescriptions, outcomes, names and contact details.
          </p>
        </div>
        <ModeBadge mode={moderation.mode} model={moderation.model} />

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={() => setStep("form")}>Edit my review</button>
        </div>
      </div>
    );
  }

  /* ---------- Form ---------- */
  const busy = step === "submitting";

  return (
    <form onSubmit={onSubmit} className="card space-y-7 p-6 sm:p-8" aria-busy={busy}>
      {/* Doctor */}
      <div>
        <label htmlFor="doctor" className="label">Which doctor did you visit?</label>
        <select id="doctor" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="input" required>
          <option value="">Select a doctor</option>
          {doctorsSorted.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} · {SPECIALTIES.find((s) => s.key === d.specialty)?.label} · {d.city}
            </option>
          ))}
        </select>
      </div>

      {/* Need */}
      <div>
        <label htmlFor="reason" className="label">What was your need / reason for this visit?</label>
        <input
          id="reason"
          list="reason-suggestions"
          value={visitReason}
          onChange={(e) => setVisitReason(e.target.value)}
          className="input"
          placeholder="e.g. Skin consultation, knee pain, routine check-up"
          maxLength={60}
          required
        />
        <datalist id="reason-suggestions">
          {REASON_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
        </datalist>
        <p className="mt-1 text-xs text-slate-500">
          Keep it general. This helps people with a similar need, and is checked for personal or clinical detail.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p id="need-label" className="label">Did visiting this doctor address the need you mentioned?</p>
          <Segmented name="need" value={addressedNeed} onChange={setAddressedNeed} options={NEED} />
        </div>
        <div>
          <p id="listen-label" className="label">Did the doctor listen and explain things clearly?</p>
          <Segmented name="listen" value={listenedExplained} onChange={setListenedExplained} options={THREE} />
        </div>
        <div>
          <p id="again-label" className="label">Would you consult this doctor again?</p>
          <Segmented name="again" value={consultAgain} onChange={setConsultAgain} options={AGAIN} />
        </div>
        <div>
          <p id="recommend-label" className="label">Would you recommend this doctor to someone with a similar need?</p>
          <Segmented name="recommend" value={wouldRecommend} onChange={setWouldRecommend} options={YESNO} />
        </div>
      </div>

      {/* Best part */}
      <div>
        <p className="label">
          What was the best part of your experience? <span className="font-normal normal-case text-slate-400">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Best part tags">
          {BEST_TAGS.map((t) => {
            const on = bestTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => toggleTag(t)}
                className={cn(
                  "chip cursor-pointer px-3 py-1.5 text-sm transition",
                  on ? "border-brand-600 bg-brand-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                )}
              >
                {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                {t}
              </button>
            );
          })}
        </div>
        <input
          value={bestText}
          onChange={(e) => setBestText(e.target.value)}
          className="input mt-2"
          maxLength={300}
          placeholder="Anything else that stood out? (short answer)"
          aria-label="Best part, short answer"
        />
      </div>

      {/* Improvement */}
      <div>
        <label htmlFor="improve" className="label">
          What could be improved? <span className="font-normal normal-case text-slate-400">(optional, moderated by Fable)</span>
        </label>
        <textarea
          id="improve"
          value={improvement}
          onChange={(e) => setImprovement(e.target.value)}
          rows={3}
          maxLength={600}
          className="input resize-y"
          placeholder="e.g. Shorter waiting time, clearer fees before the visit. Please avoid diagnoses, prescriptions, names or contact details."
        />
        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-700" aria-hidden />
            Fable checks for medical claims, personal info, abuse and spam before publishing.
          </span>
          <span className="tabular-nums">{charCount}/900</span>
        </div>
      </div>

      {/* Community */}
      <div>
        <label htmlFor="community" className="label">Post as a member of</label>
        <select id="community" value={communityId} onChange={(e) => setCommunityId(e.target.value)} className="input">
          {postable.map((c) => (
            <option key={c.id} value={c.id}>{c.name} (verified)</option>
          ))}
          <option value="none">Prefer not to say</option>
        </select>
        <p className="mt-1.5 text-xs text-slate-500">
          Shown publicly as &ldquo;Anonymous reviewer · {reviewerLabelFor(postable.find((c) => c.id === communityId))}&rdquo;. Your name is never displayed.
          {pendingOnes.length > 0 && (
            <>
              {" "}
              <Link href="/profile" className="font-medium text-brand-800 hover:underline">
                Verify {pendingOnes.map((c) => c.name).join(", ")}
              </Link>{" "}
              to post under {pendingOnes.length === 1 ? "it" : "them"} too.
            </>
          )}
        </p>
      </div>

      {step === "error" && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">We couldn&apos;t submit your experience.</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary min-w-44" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Fable is reviewing…
            </>
          ) : (
            "Submit experience"
          )}
        </button>
        <p className="text-xs text-slate-500">Takes under 60 seconds. Anonymous publicly, verified privately.</p>
      </div>
    </form>
  );
}

function ModeBadge({ mode, model }: { mode: "fable" | "mock"; model?: string }) {
  return (
    <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
      <Sparkles className="h-3 w-3 text-brand-700" aria-hidden />
      {mode === "fable" ? `Moderated live by ${model ?? "Fable"}` : "Offline moderation (no API key configured)"}
    </p>
  );
}
