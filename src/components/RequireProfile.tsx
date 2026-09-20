"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useCircle } from "@/lib/circle-store";

/**
 * Gate: search, doctor profiles and Ask My Circle need a completed profile,
 * because every signal is personalised to the user's circles.
 */
export default function RequireProfile({
  children,
  feature = "search",
}: {
  children: ReactNode;
  feature?: string;
}) {
  const { hydrated, hasProfile } = useCircle();
  const pathname = usePathname();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6" aria-busy="true">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (hasProfile) return <>{children}</>;

  const next = typeof window !== "undefined" ? `${pathname}${window.location.search}` : pathname;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="card fade-up p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700">
          <Lock className="h-6 w-6" aria-hidden />
        </span>
        <p className="eyebrow mt-5 text-brand-700">One quick step first</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Set up your profile to unlock {feature}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          DocCircle only makes sense once we know your circles. Tell us where you live, studied and
          work, and every result will show what people you trust have experienced.
        </p>
        <ul className="mx-auto mt-5 max-w-sm space-y-1.5 text-left text-sm text-slate-700">
          <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />Takes about a minute</li>
          <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />Your details stay private; only community labels are public</li>
          <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />We bring you straight back here afterwards</li>
        </ul>
        <Link href={`/profile?next=${encodeURIComponent(next)}`} className="btn-primary mt-6">
          Set up my profile
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
