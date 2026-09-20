"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Check, CheckCircle2, Loader2, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { DOCTORS, SPECIALTIES } from "@/lib/demo-data";
import { useCircle } from "@/lib/circle-store";
import type { ModerationResponse, RecommendAnswer, Review, Sentiment, ThreeScale, WaitBucket } from "@/lib/types";
import { cn, reviewerLabelFor } from "@/lib/utils";

type Step = "form" | "submitting" | "flagged" | "done" | "error";

const THREE: Array<{ value: ThreeScale; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "somewhat", label: "Somewhat" },
  { value: "no", label: "No" },
];
const WAITS: Array<{ value: WaitBucket; label: string }> = [
  { value: "<15", label: "Under 15 min" },
  { value: "15-30", label: "15–30 min" },
  { value: "30-60", label: "30–60 min" },
  { value: ">60", label: "Over 60 min" },
];
const REC: Array<{ value: RecommendAnswer; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
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
  const [listening, setListening] = useState<ThreeScale | "">("");
  const [explanation, setExplanation] = useState<ThreeScale | "">("");
  const [feesClear, setFeesClear] = useState<"yes" | "no" | "">("");
  const [waitTime, setWaitTime] = useState<WaitBucket | "">("");
  const [wouldRecommend, setWouldRecommend] = useState<RecommendAnswer | "">("");
  const [written, setWritten] = useState("");
  const [communityId, setCommunityId] = useState<string>("c-nit");

  const [step, setStep] = useState<Step>("form");
  const [moderation, setModeration] = useState<ModerationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const doctor = useMemo(() => DOCTORS.find((d) => d.id === doctorId), [doctorId]);
  const doctorsSorted = useMemo(
    () => [...DOCTORS].sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)),
    [],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!doctorId || !listening || !explanation || !feesClear || !waitTime || !wouldRecommend) return;
    setStep("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/moderate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writtenExperience: written }),
      });
      const data = (await res.json()) as ModerationResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Moderation failed");
      setModeration(data);

      if (!data.result.safeToPublish) {
        setStep("flagged");
        return;
      }

      const community = postable.find((c) => c.id === communityId);
      const review: Review = {
        id: `rv-local-${crypto.randomUUID()}`,
        doctorId,
        communityId: community ? community.id : null,
        reviewerDisplayLabel: reviewerLabelFor(community),
        listening,
        explanation,
        feesClear: feesClear === "yes",
        waitTime,
        wouldRecommend,
        writtenExperience: written.trim(),
        aiThemes: data.result.experienceThemes,
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
              Experience captured by Fable
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              {(
                [
                  ["Communication", r.communication],
                  ["Listening", r.listening],
                  ["Fee transparency", r.feeTransparency],
                  ["Waiting experience", r.waitTime],
                ] as Array<[string, Sentiment]>
              ).map(([label, s]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-slate-700">
                    <Check className="h-4 w-4 text-brand-700" aria-hidden />
                    {label}
                  </dt>
                  <dd className={cn("chip capitalize", SENTIMENT_STYLE[s])}>{s}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-slate-700">
                  <Check className="h-4 w-4 text-brand-700" aria-hidden />
                  Would recommend
                </dt>
                <dd className="chip border-slate-200 bg-slate-50 capitalize text-slate-700">{wouldRecommend}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="eyebrow">Safe public summary</p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-800">&ldquo;{r.safeSummary}&rdquo;</p>
            {r.experienceThemes.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {r.experienceThemes.map((t) => (
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
          <button type="button" className="btn-ghost" onClick={() => { setStep("form"); setWritten(""); setModeration(null); }}>
            Share another
          </button>
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
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Let&apos;s keep this safe and useful
            </h2>
            <p className="mt-2 text-slate-700">{r.userMessage || "Please revise your written experience."}</p>
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
            Describe how the visit felt: did the doctor listen, explain clearly, were fees and
            waiting reasonable? Avoid diagnoses, prescriptions, outcomes, names and contact details.
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p id="listening-label" className="label">Did the doctor listen carefully?</p>
          <Segmented name="listening" value={listening} onChange={setListening} options={THREE} />
        </div>
        <div>
          <p id="explanation-label" className="label">Did the doctor explain things clearly?</p>
          <Segmented name="explanation" value={explanation} onChange={setExplanation} options={THREE} />
        </div>
        <div>
          <p id="fees-label" className="label">Were fees clear?</p>
          <Segmented name="fees" value={feesClear} onChange={setFeesClear} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
        </div>
        <div>
          <p id="wait-label" className="label">How was the waiting experience?</p>
          <Segmented name="wait" value={waitTime} onChange={setWaitTime} options={WAITS} />
        </div>
        <div className="sm:col-span-2">
          <p id="recommend-label" className="label">Would you recommend this doctor?</p>
          <Segmented name="recommend" value={wouldRecommend} onChange={setWouldRecommend} options={REC} />
        </div>
      </div>

      {/* Written */}
      <div>
        <label htmlFor="written" className="label">
          Written experience <span className="font-normal normal-case text-slate-400">(optional, moderated by Fable)</span>
        </label>
        <textarea
          id="written"
          value={written}
          onChange={(e) => setWritten(e.target.value)}
          rows={4}
          maxLength={2000}
          className="input resize-y"
          placeholder="Describe your experience. Please avoid sharing medical records, diagnoses, prescriptions, phone numbers, or other personal information."
        />
        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-700" aria-hidden />
            Fable checks for medical claims, personal info, abuse and spam before publishing.
          </span>
          <span className="tabular-nums">{written.length}/2000</span>
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
      {mode === "fable" ? `Moderated live by ${model ?? "Fable"}` : "Demo mode: deterministic mock moderation (no API key configured)"}
    </p>
  );
}
