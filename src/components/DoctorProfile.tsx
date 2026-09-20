"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BadgeCheck, Building2, Clock, Languages, MapPin, PenLine, Stethoscope, Wallet } from "lucide-react";
import type { Doctor } from "@/lib/types";
import { SPECIALTIES } from "@/lib/demo-data";
import { useCircle } from "@/lib/circle-store";
import { computeSignals, formatFee, getReviewsForDoctor } from "@/lib/utils";
import TrustSignal from "./TrustSignal";
import ReviewInsights from "./ReviewInsights";
import ReviewCard from "./ReviewCard";

export default function DoctorProfile({ doctor }: { doctor: Doctor }) {
  const { selectedCommunityIds, submittedReviews, customCommunities } = useCircle();
  const specialty = SPECIALTIES.find((s) => s.key === doctor.specialty);

  const signals = useMemo(
    () => computeSignals(doctor, selectedCommunityIds, submittedReviews, customCommunities),
    [doctor, selectedCommunityIds, submittedReviews, customCommunities],
  );
  const reviews = useMemo(() => getReviewsForDoctor(doctor.id, submittedReviews), [doctor.id, submittedReviews]);
  const mineIds = new Set(submittedReviews.map((r) => r.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/doctors" className="hover:text-brand-800">Doctors</Link>
        <span className="mx-2" aria-hidden>/</span>
        <Link href={`/doctors?specialty=${doctor.specialty}&city=${doctor.city}`} className="hover:text-brand-800">
          {specialty?.plural} in {doctor.city}
        </Link>
      </nav>

      {/* Header */}
      <header className="mt-4 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <span
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-700 text-2xl font-bold text-white"
            aria-hidden
          >
            {doctor.name.replace("Dr. ", "").split(" ").map((p) => p[0]).join("")}
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{doctor.name}</h1>
            <p className="mt-1 text-base font-medium text-brand-800">
              {specialty?.field} · {doctor.city}
            </p>
            {doctor.qualifications && (
              <p className="mt-1 text-sm text-slate-600">{doctor.qualifications}</p>
            )}
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              <BadgeCheck className="h-3.5 w-3.5 text-brand-700" aria-hidden />
              Verified provider information
            </p>
          </div>
        </div>
        <Link href={`/review?doctorId=${doctor.id}`} className="btn-primary self-start">
          <PenLine className="h-4 w-4" aria-hidden />
          Share your experience
        </Link>
      </header>

      {/* Provider info */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Provider information">
        {[
          { icon: Building2, label: "Clinic", value: doctor.clinicName },
          { icon: MapPin, label: "Location", value: `${doctor.area}, ${doctor.city}` },
          { icon: Wallet, label: "Consultation fee", value: formatFee(doctor.consultationFee) },
          { icon: Clock, label: "Experience", value: `${doctor.yearsExperience} years` },
          { icon: Languages, label: "Languages", value: doctor.languages.join(", ") },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card flex items-start gap-3 p-4">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </section>

      {doctor.specializations.length > 0 && (
        <section className="mt-4 card p-4 sm:p-5" aria-labelledby="spec-heading">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 id="spec-heading" className="text-sm font-semibold text-slate-900">
              Specialization
            </h2>
            <ul className="flex flex-wrap gap-1.5">
              {doctor.specializations.map((s) => (
                <li key={s} className="chip border-brand-100 bg-brand-50 text-brand-800">
                  <Stethoscope className="h-3 w-3" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="mt-8 space-y-8">
        <TrustSignal signals={signals} selectedIds={selectedCommunityIds} />
        <ReviewInsights insights={doctor.insights} experienceCount={signals.experienceCount} />

        {/* Detailed reviews */}
        <section aria-labelledby="reviews-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Detailed experiences</p>
              <h2 id="reviews-heading" className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {reviews.length} anonymous experience{reviews.length === 1 ? "" : "s"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Experiences from your selected circles are highlighted. Names are never shown.
              </p>
            </div>
            <Link href={`/review?doctorId=${doctor.id}`} className="btn-secondary">
              Add yours
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="card border-dashed p-6 text-sm text-slate-600">
              No experiences yet. Be the first to help your community.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  relevant={!!r.communityId && selectedCommunityIds.includes(r.communityId)}
                  mine={mineIds.has(r.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
