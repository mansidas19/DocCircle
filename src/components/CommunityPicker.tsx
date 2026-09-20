"use client";

import Link from "next/link";
import { BadgeCheck, Check, Clock, Users } from "lucide-react";
import { useCircle } from "@/lib/circle-store";
import { cn } from "@/lib/utils";

/** Checkbox list of the user's communities. Selecting changes every peer signal in the app. */
export default function CommunityPicker() {
  const { myCommunities, selectedCommunityIds, toggleCommunity, membershipFor } = useCircle();

  return (
    <fieldset>
      <div className="mb-1.5 flex items-center justify-between">
        <legend className="label mb-0">Your circles</legend>
        <Link href="/profile" className="text-xs font-medium text-brand-800 hover:underline">
          Manage & verify
        </Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {myCommunities.map((c) => {
          const checked = selectedCommunityIds.includes(c.id);
          const verified = membershipFor(c.id)?.status === "verified";
          return (
            <label
              key={c.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition focus-within:ring-2 focus-within:ring-brand-500",
                checked ? "border-peer-300 bg-peer-50" : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => toggleCommunity(c.id)}
                aria-describedby={`${c.id}-desc`}
              />
              <span
                className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                  checked ? "border-peer-600 bg-peer-600 text-white" : "border-slate-300 bg-white",
                )}
                aria-hidden
              >
                {checked && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Users className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                  {c.name}
                  {verified ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                      <BadgeCheck className="h-3 w-3" aria-hidden /> verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-peer-700">
                      <Clock className="h-3 w-3" aria-hidden /> pending
                    </span>
                  )}
                </span>
                <span id={`${c.id}-desc`} className="mt-0.5 block text-xs text-slate-600">
                  {c.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
