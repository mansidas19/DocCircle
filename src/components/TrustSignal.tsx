import Link from "next/link";
import { ShieldCheck, Users } from "lucide-react";
import type { DoctorSignals } from "@/lib/types";
import CommunitySignal from "./CommunitySignal";

interface Props {
  signals: DoctorSignals;
  selectedIds: string[];
}

/** The large "Peer Trust" block on a doctor profile. */
export default function TrustSignal({ signals, selectedIds }: Props) {
  const { recommendationRate, experienceCount, communityStats, relevantExperienceCount } = signals;
  const communityExperiences = communityStats.reduce((n, s) => n + s.visited, 0);

  return (
    <section className="card overflow-hidden" aria-labelledby="trust-heading">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[auto_1fr]">
        <div className="lg:w-64">
          <p className="eyebrow flex items-center gap-1.5 text-peer-700">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Peer trust
          </p>
          <h2 id="trust-heading" className="sr-only">Peer trust signals</h2>
          <p className="mt-2 text-5xl font-extrabold tabular-nums tracking-tight text-slate-900">
            {experienceCount ? `${recommendationRate}%` : "—"}
          </p>
          <p className="text-sm font-medium text-slate-600">would recommend</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">Total experiences</dt>
              <dd className="text-xl font-bold text-slate-900">{experienceCount}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">From verified communities</dt>
              <dd className="text-xl font-bold text-slate-900">{communityExperiences}</dd>
            </div>
            <div className="col-span-2 rounded-xl bg-peer-50 p-3 ring-1 ring-peer-200 lg:col-span-1">
              <dt className="text-xs text-peer-800">From your selected circles</dt>
              <dd className="text-xl font-bold text-peer-900">{relevantExperienceCount}</dd>
            </div>
          </dl>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Community breakdown</p>
            <Link href="/circle" className="text-xs font-medium text-brand-800 hover:underline">
              Change my circles
            </Link>
          </div>
          {communityStats.length ? (
            <div className="mt-3 space-y-2">
              {communityStats.map((s) => (
                <CommunitySignal
                  key={s.community.id}
                  stat={s}
                  size="md"
                  relevant={selectedIds.includes(s.community.id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <p>
                No verified community has shared an experience with this doctor yet. All signals
                below come from general verified visits.
              </p>
            </div>
          )}
          <p className="mt-4 text-xs text-slate-500">
            Reviewers are anonymous. We verify community membership privately and show only the
            community label and aggregate counts.
          </p>
        </div>
      </div>
    </section>
  );
}
