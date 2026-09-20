import Link from "next/link";
import { Sparkles, Users } from "lucide-react";
import type { Community, DoctorSignals } from "@/lib/types";
import DoctorCard from "./DoctorCard";

interface Props {
  peer: DoctorSignals[];
  selectedCommunities: Community[];
}

export default function PeerReviewedSection({ peer, selectedCommunities }: Props) {
  const totalRelevant = peer.reduce((n, s) => n + s.relevantExperienceCount, 0);

  return (
    <section aria-labelledby="peer-heading" className="fade-up">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-1.5 text-peer-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Peer reviewed for you
          </p>
          <h2 id="peer-heading" className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Doctors your circles have visited
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Experiences from communities you belong to or selected:{" "}
            {selectedCommunities.length ? (
              <span className="font-medium text-slate-800">
                {selectedCommunities.map((c) => c.name).join(", ")}
              </span>
            ) : (
              <span className="italic">none selected</span>
            )}
            .{" "}
            <Link href="/circle" className="font-medium text-brand-800 underline-offset-2 hover:underline">
              Change circles
            </Link>
          </p>
        </div>
        {peer.length > 0 && (
          <p className="rounded-full bg-peer-50 px-3 py-1.5 text-xs font-semibold text-peer-800 ring-1 ring-peer-200">
            {totalRelevant} peer experience{totalRelevant === 1 ? "" : "s"} · {peer.length} doctor
            {peer.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {peer.length === 0 ? (
        <div className="card flex flex-col items-start gap-3 border-dashed p-6 sm:flex-row sm:items-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="eyebrow">No peer reviews yet</p>
            <p className="mt-1 font-semibold text-slate-900">
              No one from your selected communities has shared an experience for this search yet.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Browse all doctors below while the community grows. Your own visit could be the first
              signal for someone in your circle.
            </p>
          </div>
          <Link href="/review" className="btn-secondary sm:ml-auto">
            Share an experience
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {peer.map((s) => (
            <DoctorCard key={s.doctor.id} signals={s} variant="peer" />
          ))}
        </div>
      )}
    </section>
  );
}
