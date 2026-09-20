import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageSquareText, ShieldCheck, Sparkles, Users } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ContributorBenefits from "@/components/ContributorBenefits";

const QUICK = [
  { label: "Dermatologists in Bangalore", href: "/doctors?specialty=dermatology&city=Bangalore" },
  { label: "Orthopedics in Bhopal", href: "/doctors?specialty=orthopedics&city=Bhopal" },
  { label: "Gynecologists in Mumbai", href: "/doctors?specialty=gynecology&city=Mumbai" },
  { label: "Dentists in Bangalore", href: "/doctors?specialty=dentistry&city=Bangalore" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_0%,#ccfbf1_0%,transparent_60%),radial-gradient(40%_40%_at_90%_10%,#fef3c7_0%,transparent_60%)]"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-800">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              DocCircle · Word of mouth, done properly
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              The right doctor <span className="text-brand-700">changes everything.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Think about the last time you searched for a doctor. Was it through Google reviews, or
              a trusted friend?
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              Hear from people you already trust, without asking them.
            </p>

            <div className="mx-auto mt-8 max-w-2xl text-left">
              <SearchBar />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-slate-500">Try:</span>
              {QUICK.map((q) => (
                <Link
                  key={q.href}
                  href={q.href}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 hover:border-brand-300 hover:text-brand-800"
                >
                  {q.label}
                </Link>
              ))}
            </div>

            <div className="mt-6">
              <Link href="/circle" className="btn-ghost">
                <Users className="h-4 w-4" aria-hidden />
                Or just describe what you need to Ask My Circle
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: MessageSquareText,
              title: "Trusted experiences",
              body: "Structured first-hand experiences from real visits: communication, listening, fees and waiting. Never medical scores.",
            },
            {
              icon: Users,
              title: "Community signals",
              body: "See whether people from communities you trust have visited a doctor, and how many would recommend them. Aggregated, never named.",
            },
            {
              icon: Sparkles,
              title: "AI summaries",
              body: "Fable moderates every review for safety and privacy, then summarises the common themes so you don't have to read everything.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <div className="card overflow-hidden bg-slate-900 p-8 text-white sm:p-10">
          <p className="eyebrow text-brand-300">Why this is different</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            Not another rating site. A doctor search with a peer-trust layer.
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              ["Search", "Specialty + city, like any discovery app. Every doctor shows up, even before your circle has reviewed them."],
              ["Peer signal", "A separate Peer Reviewed section surfaces doctors people in your verified communities have actually visited."],
              ["Pay it forward", "Share your own visit in under 60 seconds. Fable keeps it safe, anonymous and useful for the next person."],
            ].map(([t, b], i) => (
              <div key={t} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <p className="text-xs font-bold text-brand-300">0{i + 1}</p>
                <p className="mt-1 font-semibold">{t}</p>
                <p className="mt-2 text-sm text-slate-300">{b}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/doctors?specialty=dermatology&city=Bangalore" className="btn bg-white text-slate-900 hover:bg-brand-50">
              See the demo search
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/review" className="btn border border-white/20 text-white hover:bg-white/10">
              Share your experience
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <ContributorBenefits />
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 sm:flex-row sm:items-center">
          <BadgeCheck className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
          <p>
            <span className="font-semibold text-slate-900">DocCircle provides community experience information, not medical advice.</span>{" "}
            Experience signals describe communication, fees and waiting as patients felt them,
            never medical quality.
          </p>
        </div>
      </section>
    </div>
  );
}
