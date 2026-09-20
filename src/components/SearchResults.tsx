"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useCircle } from "@/lib/circle-store";
import { filterDoctors, getSpecialty, normalizeCity, segmentDoctors } from "@/lib/utils";
import SearchBar from "./SearchBar";
import PeerReviewedSection from "./PeerReviewedSection";
import GeneralDoctorsSection from "./GeneralDoctorsSection";

export default function SearchResults() {
  const params = useSearchParams();
  const specialtyParam = params.get("specialty") ?? "";
  const cityParam = params.get("city") ?? "";
  const specialty = getSpecialty(specialtyParam);
  const city = normalizeCity(cityParam);

  const { selectedCommunityIds, selectedCommunities, submittedReviews, customCommunities, hydrated } =
    useCircle();

  const { peer, general } = useMemo(() => {
    const docs = filterDoctors(specialty?.key, city);
    return segmentDoctors(docs, selectedCommunityIds, submittedReviews, customCommunities);
  }, [specialty?.key, city, selectedCommunityIds, submittedReviews, customCommunities]);

  const heading = [specialty ? specialty.plural : "Doctors", city ? `in ${city}` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="eyebrow">Search results</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{heading}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {general.length} doctor{general.length === 1 ? "" : "s"} found
      </p>

      <div className="mt-6">
        <SearchBar compact defaultSpecialty={specialty?.key ?? ""} defaultCity={city ?? ""} />
      </div>

      <div className="mt-10 space-y-14">
        {hydrated ? (
          <>
            <PeerReviewedSection peer={peer} selectedCommunities={selectedCommunities} />
            <GeneralDoctorsSection general={general} peerIds={new Set(peer.map((s) => s.doctor.id))} />
          </>
        ) : (
          <ResultsSkeleton />
        )}
      </div>
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading results">
      <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-56 animate-pulse bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
