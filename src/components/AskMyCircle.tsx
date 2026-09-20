"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Stethoscope, Users } from "lucide-react";
import { CITIES, SPECIALTIES } from "@/lib/demo-data";
import { useCircle } from "@/lib/circle-store";
import { filterDoctors, getSpecialty, normalizeCity, segmentDoctors } from "@/lib/utils";
import CommunityPicker from "./CommunityPicker";
import CreateCommunity from "./CreateCommunity";
import DoctorCard from "./DoctorCard";

export default function AskMyCircle() {
  const router = useRouter();
  const params = useSearchParams();
  const initialSpecialty = getSpecialty(params.get("specialty"))?.key ?? "";
  const initialCity = normalizeCity(params.get("city")) ?? "";

  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState(initialCity);
  const [asked, setAsked] = useState(Boolean(initialSpecialty || initialCity));

  const { selectedCommunityIds, selectedCommunities, submittedReviews, customCommunities, hydrated } =
    useCircle();

  const result = useMemo(() => {
    if (!asked) return null;
    const docs = filterDoctors(getSpecialty(specialty)?.key, normalizeCity(city));
    const { peer, general } = segmentDoctors(docs, selectedCommunityIds, submittedReviews, customCommunities);
    const totalPeer = peer.reduce((n, s) => n + s.relevantExperienceCount, 0);
    const totalRec = peer.reduce((n, s) => n + s.relevantRecommendCount, 0);
    return { peer, general, totalPeer, totalRec };
  }, [asked, specialty, city, selectedCommunityIds, submittedReviews, customCommunities]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setAsked(true);
    const q = new URLSearchParams();
    if (specialty) q.set("specialty", specialty);
    if (city) q.set("city", city);
    router.replace(`/circle?${q.toString()}`, { scroll: false });
  }

  const specialtyLabel = getSpecialty(specialty)?.plural ?? "doctors";
  const cityLabel = normalizeCity(city);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Left: controls */}
        <div>
          <p className="eyebrow flex items-center gap-1.5 text-peer-700">
            <Users className="h-3.5 w-3.5" aria-hidden />
            Signature feature
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Ask My Circle</h1>
          <p className="mt-2 text-slate-600">
            Find doctors recommended by people from communities you trust. Toggle a circle and every
            signal on DocCircle updates.
          </p>

          <form onSubmit={onSubmit} className="card mt-6 space-y-5 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="relative block">
                <span className="label">Specialty</span>
                <Stethoscope className="pointer-events-none absolute left-3 top-[34px] h-4 w-4 text-slate-400" aria-hidden />
                <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="input appearance-none pl-9">
                  <option value="">Any specialty</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </label>
              <label className="relative block">
                <span className="label">City</span>
                <MapPin className="pointer-events-none absolute left-3 top-[34px] h-4 w-4 text-slate-400" aria-hidden />
                <input list="circle-cities" value={city} onChange={(e) => setCity(e.target.value)} className="input pl-9" placeholder="Any city" />
                <datalist id="circle-cities">
                  {CITIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </label>
            </div>

            {hydrated ? <CommunityPicker /> : <div className="h-28 animate-pulse rounded-xl bg-slate-100" />}

            <CreateCommunity />

            <button type="submit" className="btn-primary w-full">
              <Users className="h-4 w-4" aria-hidden />
              Ask My Circle
            </button>

            <p className="flex items-start gap-2 text-xs text-slate-500">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
              We verify community membership privately and never reveal who wrote a review. Only
              aggregate counts per community are shown.
            </p>
          </form>
        </div>

        {/* Right: results */}
        <div aria-live="polite">
          {!asked || !result ? (
            <div className="card flex h-full min-h-64 flex-col items-center justify-center border-dashed p-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-peer-50 text-peer-700">
                <Sparkles className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-4 font-semibold text-slate-900">Your circle&apos;s answer appears here</p>
              <p className="mt-1 max-w-sm text-sm text-slate-600">
                Pick a specialty and city, choose which circles to ask, then hit Ask My Circle.
              </p>
            </div>
          ) : (
            <div className="fade-up space-y-6">
              <div className="card bg-slate-900 p-6 text-white">
                <p className="eyebrow text-brand-300">
                  {specialtyLabel}{cityLabel ? ` in ${cityLabel}` : ""}
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight">
                  {result.totalPeer === 0
                    ? "No peer experiences yet"
                    : `We found ${result.totalPeer} relevant peer experience${result.totalPeer === 1 ? "" : "s"}.`}
                </p>
                <p className="mt-2 text-slate-300">
                  {result.totalPeer === 0 ? (
                    <>
                      Nobody in {selectedCommunities.length ? selectedCommunities.map((c) => c.name).join(", ") : "your selected circles"} has
                      shared an experience for this search. Try adding a circle, or browse{" "}
                      <Link href={`/doctors?specialty=${specialty}&city=${city}`} className="underline">all {result.general.length} doctors</Link>.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-white">{result.peer.length}</span> doctor{result.peer.length === 1 ? " was" : "s were"} visited by people in{" "}
                      <span className="font-semibold text-white">{selectedCommunities.map((c) => c.name).join(", ")}</span>.{" "}
                      <span className="font-semibold text-white">{result.totalRec}</span> of those {result.totalPeer} experiences would recommend.
                    </>
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.peer.flatMap((s) => s.relevantStats).reduce<{ name: string; visited: number; recommend: number }[]>((acc, st) => {
                    const hit = acc.find((a) => a.name === st.community.name);
                    if (hit) { hit.visited += st.visited; hit.recommend += st.recommend; } else acc.push({ name: st.community.name, visited: st.visited, recommend: st.recommend });
                    return acc;
                  }, []).map((c) => (
                    <span key={c.name} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/15">
                      {c.name}: {c.visited} visited · {c.recommend} recommend
                    </span>
                  ))}
                </div>
              </div>

              {result.peer.length > 0 && (
                <div className="grid gap-4">
                  {result.peer.map((s) => <DoctorCard key={s.doctor.id} signals={s} variant="peer" />)}
                </div>
              )}

              <Link href={`/doctors?specialty=${specialty}&city=${city}`} className="btn-secondary w-full">
                See all {result.general.length} doctor{result.general.length === 1 ? "" : "s"} for this search
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
