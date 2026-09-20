import { Stethoscope } from "lucide-react";
import type { DoctorSignals } from "@/lib/types";
import DoctorCard from "./DoctorCard";

interface Props {
  general: DoctorSignals[];
  /** ids already shown in the peer section; still listed here for completeness but flagged */
  peerIds: Set<string>;
}

export default function GeneralDoctorsSection({ general, peerIds }: Props) {
  const rest = general.filter((s) => !peerIds.has(s.doctor.id));

  return (
    <section aria-labelledby="all-heading" className="fade-up">
      <div className="mb-4">
        <p className="eyebrow">All doctors</p>
        <h2 id="all-heading" className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Everyone available for this search
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          General experience signals from all verified visits. Community reviews may appear here as
          your circles grow.
        </p>
      </div>

      {rest.length === 0 && general.length === 0 ? (
        <div className="card flex items-center gap-3 border-dashed p-6">
          <Stethoscope className="h-5 w-5 text-slate-400" aria-hidden />
          <p className="text-sm text-slate-600">
            No doctors match this search yet. Try Bangalore, Bhopal, Mumbai, Delhi,
            Pune or Hyderabad.
          </p>
        </div>
      ) : rest.length === 0 ? (
        <p className="card border-dashed p-5 text-sm text-slate-600">
          Every doctor for this search already appears in your peer-reviewed list above.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((s) => (
            <DoctorCard key={s.doctor.id} signals={s} variant="general" />
          ))}
        </div>
      )}
    </section>
  );
}
