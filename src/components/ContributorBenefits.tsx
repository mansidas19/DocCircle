import { BellRing, CalendarClock, Gift, LineChart, Scale, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const BENEFITS = [
  {
    icon: CalendarClock,
    title: "Priority appointment windows",
    body: "Active contributors get first access to early slots at partner clinics.",
  },
  {
    icon: BellRing,
    title: "Early availability alerts",
    body: "Be notified first when a doctor your circle trusts opens new slots.",
  },
  {
    icon: LineChart,
    title: "Deeper community insights",
    body: "Unlock the full experience breakdown for every doctor after your first review.",
  },
  {
    icon: Users,
    title: "Community booking perks",
    body: "Group benefits negotiated for verified communities, like reduced wait guarantees.",
  },
];

/**
 * Explains the non-monetary "pay it forward" loop. Benefits are never tied to
 * review sentiment, so incentives cannot bias reviews.
 */
export default function ContributorBenefits({ compact = false }: { compact?: boolean }) {
  return (
    <section aria-labelledby="benefits-heading" className={cn("card p-6", !compact && "sm:p-8")}>
      <p className="eyebrow flex items-center gap-1.5 text-peer-700">
        <Gift className="h-3.5 w-3.5" aria-hidden />
        What you get back
      </p>
      <h2 id="benefits-heading" className={cn("mt-1 font-bold tracking-tight text-slate-900", compact ? "text-lg" : "text-2xl")}>
        Contributors earn priority, not cash
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Every anonymous experience you share strengthens your community&apos;s signal. In return,
        contributors unlock practical, non-monetary benefits.
      </p>

      <ul className={cn("mt-5 grid gap-3", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4")}>
        {BENEFITS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-brand-700 ring-1 ring-slate-200">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{body}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
        <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
        Benefits depend only on sharing an honest experience. A negative review earns exactly the
        same as a positive one, so incentives never pressure reviews.
      </p>
    </section>
  );
}
