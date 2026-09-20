import { Users } from "lucide-react";
import type { CommunitySignalStat } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  stat: CommunitySignalStat;
  /** Highlight when this community is one the user selected */
  relevant?: boolean;
  size?: "sm" | "md";
}

/**
 * Aggregate, anonymous community signal: "NIT Alumni · 6 visited · 5 recommend".
 * Never renders reviewer identities.
 */
export default function CommunitySignal({ stat, relevant = false, size = "sm" }: Props) {
  const rate = stat.visited ? Math.round((stat.recommend / stat.visited) * 100) : 0;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-3",
        size === "sm" ? "py-2" : "py-3",
        relevant ? "border-peer-200 bg-peer-50" : "border-slate-200 bg-slate-50",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-full",
            relevant ? "bg-peer-100 text-peer-800" : "bg-slate-200 text-slate-600",
          )}
        >
          <Users className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className={cn("truncate font-semibold", size === "sm" ? "text-sm" : "text-base", relevant ? "text-peer-900" : "text-slate-800")}>
            {stat.community.name}
            {relevant && (
              <span className="ml-2 rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-peer-700">
                your circle
              </span>
            )}
          </p>
          <p className="text-xs text-slate-600">
            {stat.visited} visited · {stat.recommend} recommend
          </p>
        </div>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-lg px-2 py-1 text-xs font-bold tabular-nums",
          relevant ? "bg-white text-peer-800" : "bg-white text-slate-700",
        )}
        aria-label={`${rate} percent would recommend`}
      >
        {rate}%
      </span>
    </div>
  );
}
