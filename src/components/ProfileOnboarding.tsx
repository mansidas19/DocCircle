"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, ShieldCheck } from "lucide-react";
import { useCircle } from "@/lib/circle-store";
import { cn } from "@/lib/utils";
import ProfileForm from "./ProfileForm";
import MembershipList from "./MembershipList";

type Step = 1 | 2;

/**
 * Two-step onboarding:
 *  1. Your details (private)
 *  2. Your circles: suggested groups to join based on those details, then verification.
 */
export default function ProfileOnboarding() {
  const { profile, hydrated } = useCircle();
  const [step, setStep] = useState<Step | null>(null);

  // Pick the starting step once storage has loaded: existing profile -> circles.
  useEffect(() => {
    if (hydrated && step === null) queueMicrotask(() => setStep(profile ? 2 : 1));
  }, [hydrated, profile, step]);

  if (step === null) {
    return <div className="card h-96 animate-pulse bg-slate-100" aria-busy="true" />;
  }

  return (
    <div>
      <ol className="mb-6 flex items-center gap-3 text-sm" aria-label="Onboarding steps">
        <StepPill n={1} label="Your details" active={step === 1} done={!!profile} onClick={() => setStep(1)} />
        <span className="h-px w-8 bg-slate-300" aria-hidden />
        <StepPill n={2} label="Your circles" active={step === 2} done={false} onClick={() => profile && setStep(2)} disabled={!profile} />
      </ol>

      {step === 1 ? (
        <section aria-labelledby="details-heading" className="fade-up mx-auto max-w-2xl">
          <h2 id="details-heading" className="mb-1 text-xl font-bold text-slate-900">Tell us a little about you</h2>
          <p className="mb-4 text-sm text-slate-600">
            We&apos;ll use this to suggest communities you already belong to. Nothing here is shown publicly.
          </p>
          <ProfileForm onSaved={() => setStep(2)} />
        </section>
      ) : (
        <section aria-labelledby="circles-heading" className="fade-up">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="circles-heading" className="text-xl font-bold text-slate-900">
                {profile ? `Circles for you, ${profile.name.split(" ")[0]}` : "Your circles"}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4 text-brand-700" aria-hidden />
                Join the groups that fit, then verify privately. Only the group label ever appears on a review.
              </p>
            </div>
            <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
              <Pencil className="h-4 w-4" aria-hidden />
              Edit details
            </button>
          </div>
          <MembershipList />
        </section>
      )}
    </div>
  );
}

function StepPill({
  n,
  label,
  active,
  done,
  onClick,
  disabled,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-current={active ? "step" : undefined}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
          active ? "border-brand-600 bg-brand-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
        )}
      >
        <span
          className={cn(
            "grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold",
            active ? "bg-white/20 text-white" : done ? "bg-brand-100 text-brand-800" : "bg-slate-100 text-slate-600",
          )}
        >
          {done && !active ? <Check className="h-3 w-3" aria-hidden /> : n}
        </span>
        {label}
      </button>
    </li>
  );
}
