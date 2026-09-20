import Link from "next/link";
import { ArrowRight, Check, MapPin, ThumbsUp } from "lucide-react";
import type { DoctorSignals } from "@/lib/types";
import { SPECIALTIES } from "@/lib/demo-data";
import { cn, formatFee } from "@/lib/utils";
import CommunitySignal from "./CommunitySignal";

interface Props {
  signals: DoctorSignals;
  variant: "peer" | "general";
}

export default function DoctorCard({ signals, variant }: Props) {
  const { doctor, recommendationRate, experienceCount, relevantStats, themes } = signals;
  const specialty = SPECIALTIES.find((s) => s.key === doctor.specialty);
  const peer = variant === "peer";

  return (
    <article
      className={cn(
        "card fade-up flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg",
        peer && "ring-1 ring-peer-200",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-900">
            <Link href={`/doctors/${doctor.id}`} className="hover:text-brand-800">
              {doctor.name}
            </Link>
          </h3>
          <p className="text-sm font-medium text-brand-800">{specialty?.label}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {doctor.area}, {doctor.city}
            <span aria-hidden>·</span>
            {formatFee(doctor.consultationFee)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-extrabold tabular-nums text-slate-900">
            {experienceCount ? `${recommendationRate}%` : "—"}
          </p>
          <p className="text-[11px] font-medium leading-tight text-slate-500">
            would recommend
            <br />
            {experienceCount} experience{experienceCount === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <div className="mt-4 space-y-2">
        {peer ? (
          relevantStats.map((s) => <CommunitySignal key={s.community.id} stat={s} relevant />)
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">
            No experiences from your circles yet
          </p>
        )}
      </div>

      {themes.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Common experience themes">
          {themes.map((t) => (
            <li key={t} className="chip border-brand-100 bg-brand-50 text-brand-800">
              <Check className="h-3 w-3" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <ThumbsUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Experience signals, not medical scores
        </span>
        <Link href={`/doctors/${doctor.id}`} className={cn(peer ? "btn-primary" : "btn-secondary", "shrink-0 whitespace-nowrap px-3 py-2")}>
          View profile
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
