"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useCircle } from "@/lib/circle-store";
import { CITIES } from "@/lib/demo-data";
import type { Community, UserProfile } from "@/lib/types";

const EMPTY: Omit<UserProfile, "updatedAt"> = {
  name: "",
  email: "",
  phone: "",
  city: "",
  college: "",
  graduationYear: "",
  employer: "",
  workEmail: "",
};

/**
 * Private profile. Used only to identify which communities the user can join.
 * Nothing here is ever shown next to a review.
 */
export default function ProfileForm() {
  const { profile, saveProfile } = useCircle();
  const [form, setForm] = useState<Omit<UserProfile, "updatedAt">>(profile ?? EMPTY);
  const [saved, setSaved] = useState<{ added: Community[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Please enter a valid email.");
    setError(null);
    const res = saveProfile(form);
    setSaved(res);
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6 sm:p-8">
      <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
        <p>
          <span className="font-semibold text-slate-800">Private.</span> We use these details only to
          work out which communities you can join and to verify membership. Reviews show your
          community label, never your name, email or employer details.
        </p>
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="eyebrow mb-3">About you</legend>
        <label className="block">
          <span className="label">Full name</span>
          <input value={form.name} onChange={set("name")} className="input" placeholder="Your name" autoComplete="name" required />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <input type="email" value={form.email} onChange={set("email")} className="input" placeholder="you@example.com" autoComplete="email" required />
        </label>
        <label className="block">
          <span className="label">Phone (optional)</span>
          <input type="tel" value={form.phone} onChange={set("phone")} className="input" placeholder="+91" autoComplete="tel" />
        </label>
        <label className="block">
          <span className="label">City</span>
          <input list="profile-cities" value={form.city} onChange={set("city")} className="input" placeholder="Where you live now" />
          <datalist id="profile-cities">
            {CITIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="eyebrow mb-3">Education</legend>
        <label className="block">
          <span className="label">College / university</span>
          <input value={form.college} onChange={set("college")} className="input" placeholder="e.g. NIT Bhopal" />
          <span className="mt-1 block text-xs text-slate-500">Adds you to that alumni community.</span>
        </label>
        <label className="block">
          <span className="label">Graduation year</span>
          <input inputMode="numeric" value={form.graduationYear} onChange={set("graduationYear")} className="input" placeholder="e.g. 2019" />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="eyebrow mb-3">Work</legend>
        <label className="block">
          <span className="label">Current employer</span>
          <input value={form.employer} onChange={set("employer")} className="input" placeholder="e.g. Microsoft" />
          <span className="mt-1 block text-xs text-slate-500">Adds you to that workplace community.</span>
        </label>
        <label className="block">
          <span className="label">Work email (optional)</span>
          <input type="email" value={form.workEmail} onChange={set("workEmail")} className="input" placeholder="you@company.com" />
          <span className="mt-1 block text-xs text-slate-500">
            A matching domain verifies your workplace instantly.
          </span>
        </label>
      </fieldset>

      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}

      {saved && (
        <div role="status" className="fade-up flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
          <div>
            <p className="font-semibold text-brand-900">Profile saved.</p>
            {saved.added.length > 0 ? (
              <p className="mt-0.5 text-brand-900">
                We matched you to{" "}
                <span className="font-semibold">{[...new Set(saved.added.map((c) => c.name))].join(" and ")}</span>.
                Verify below to start posting under that community.
              </p>
            ) : (
              <p className="mt-0.5 text-brand-900">Your circles are up to date.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary">
          <Sparkles className="h-4 w-4" aria-hidden />
          {profile ? "Update profile" : "Save profile & find my circles"}
        </button>
        <p className="text-xs text-slate-500">Takes about a minute.</p>
      </div>
    </form>
  );
}
