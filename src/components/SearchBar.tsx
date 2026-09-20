"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MapPin, Search, Stethoscope } from "lucide-react";
import { CITIES, SPECIALTIES } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

interface Props {
  defaultSpecialty?: string;
  defaultCity?: string;
  compact?: boolean;
  /** Where to navigate on submit. Defaults to /doctors */
  target?: "/doctors" | "/circle";
}

export default function SearchBar({
  defaultSpecialty = "",
  defaultCity = "",
  compact = false,
  target = "/doctors",
}: Props) {
  const router = useRouter();
  const [specialty, setSpecialty] = useState(defaultSpecialty);
  const [city, setCity] = useState(defaultCity);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (city) params.set("city", city);
    router.push(`${target}?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Search doctors by specialty and city"
      className={cn(
        "card grid gap-2 p-2",
        compact ? "sm:grid-cols-[1fr_1fr_auto]" : "md:grid-cols-[1.3fr_1fr_auto]",
      )}
    >
      <label className="relative block">
        <span className="sr-only">Specialty</span>
        <Stethoscope className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="input appearance-none pl-9"
        >
          <option value="">Any specialty</option>
          {SPECIALTIES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="relative block">
        <span className="sr-only">City</span>
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          list="city-options"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City (e.g. Bangalore)"
          className="input pl-9"
          autoComplete="off"
        />
        <datalist id="city-options">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>

      <button type="submit" className="btn-primary">
        <Search className="h-4 w-4" aria-hidden />
        {target === "/circle" ? "Ask My Circle" : "Find doctors"}
      </button>
    </form>
  );
}
