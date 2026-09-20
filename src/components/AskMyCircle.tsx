"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarPlus,
  ChevronDown,
  Loader2,
  MessageSquareText,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useCircle } from "@/lib/circle-store";
import { DOCTORS, SPECIALTIES } from "@/lib/demo-data";
import type { ConciergeMessage, ConciergeResponse, ConciergeResult } from "@/lib/types";
import { cn, formatFee } from "@/lib/utils";
import CommunityPicker from "./CommunityPicker";

interface Turn {
  role: "user" | "assistant";
  content: string;
  result?: ConciergeResult;
  meta?: { mode: "fable" | "mock"; model?: string; circles: string[] };
}

const STARTERS = [
  "My 6-year-old has had a persistent cough for a week. Who do people trust in Bangalore?",
  "I need a dermatologist near Indiranagar for acne that keeps coming back.",
  "Looking for a gynecologist in Mumbai my family would trust.",
  "Knee pain after running. Who's good in Bhopal?",
];

/**
 * Ask My Circle: a conversational concierge. Describe what you need in plain
 * words; it asks at most two clarifying questions, then reasons over what your
 * circles actually said and returns a synthesized recommendation.
 */
export default function AskMyCircle() {
  const { selectedCommunityIds, selectedCommunities, customCommunities, submittedReviews, profile } = useCircle();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCircles, setShowCircles] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history: ConciergeMessage[] = [...turns, { role: "user" as const, content }].map((t) => ({
      role: t.role as ConciergeMessage["role"],
      content: t.content,
    }));
    setTurns((t) => [...t, { role: "user", content }]);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          selectedCommunityIds,
          customCommunities,
          extraReviews: submittedReviews,
          city: profile?.city,
          area: profile?.area,
        }),
      });
      const data = (await res.json()) as ConciergeResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content: data.result.message,
          result: data.result,
          meta: { mode: data.mode, model: data.model, circles: data.circlesConsulted },
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setTurns((t) => t.slice(0, -1));
      setInput(content);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const lastAnswer = [...turns].reverse().find((t) => t.result?.type === "answer")?.result;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-1.5 text-peer-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Your concierge
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Ask My Circle</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Describe what you need the way you&apos;d text a friend. I&apos;ll figure out the right
            kind of doctor, read what people in your circles actually said, and tell you who
            I&apos;d start with and why.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCircles((v) => !v)}
          aria-expanded={showCircles}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-brand-300"
        >
          <Users className="h-3.5 w-3.5" aria-hidden />
          Consulting {selectedCommunities.length} circle{selectedCommunities.length === 1 ? "" : "s"}
          <ChevronDown className={cn("h-3.5 w-3.5 transition", showCircles && "rotate-180")} aria-hidden />
        </button>
      </div>

      {showCircles && (
        <div className="card fade-up mt-4 p-4">
          <CommunityPicker />
          <p className="mt-3 text-xs text-slate-500">
            Changing circles changes whose experiences I reason over. Ask again to see the difference.
          </p>
        </div>
      )}

      {/* Conversation */}
      <div className="card mt-6 flex min-h-[28rem] flex-col">
        <div className="flex-1 space-y-4 p-4 sm:p-6" aria-live="polite">
          {turns.length === 0 && (
            <div className="fade-up">
              <div className="flex items-start gap-3">
                <Avatar />
                <div className="max-w-xl rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-3 text-[15px] text-slate-800">
                  Hi{profile?.name ? ` ${profile.name.split(" ")[0]}` : ""}. What do you need help finding? I&apos;ll
                  check what your{" "}
                  <span className="font-semibold">{selectedCommunities.map((c) => c.name).join(", ") || "circles"}</span>{" "}
                  have shared.
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 pl-12">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs text-slate-700 transition hover:border-brand-300 hover:text-brand-800"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-xl rounded-2xl rounded-tr-sm bg-brand-700 px-4 py-3 text-[15px] text-white">{t.content}</div>
              </div>
            ) : (
              <AssistantTurn key={i} turn={t} />
            ),
          )}

          {busy && (
            <div className="flex items-start gap-3">
              <Avatar />
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Reading what your circles said…
              </div>
            </div>
          )}
          {error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={onSubmit} className="border-t border-slate-200 p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="concierge-input">Describe what you need</label>
            <textarea
              id="concierge-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={2}
              maxLength={1500}
              placeholder={lastAnswer ? "Ask a follow-up, or describe something else…" : "e.g. My 6-year-old has had a cough for a week…"}
              className="input flex-1 resize-none"
              disabled={busy}
            />
            <button type="submit" className="btn-primary h-11 px-4" disabled={busy || !input.trim()} aria-label="Send">
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-700" aria-hidden />
            Community experience, not medical advice. Reviewers stay anonymous; only their community label is used.
          </p>
        </form>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-700 text-white" aria-hidden>
      <MessageSquareText className="h-4 w-4" />
    </span>
  );
}

function AssistantTurn({ turn }: { turn: Turn }) {
  const r = turn.result;
  return (
    <div className="fade-up flex items-start gap-3">
      <Avatar />
      <div className="min-w-0 flex-1 space-y-3">
        <div
          className={cn(
            "max-w-xl rounded-2xl rounded-tl-sm px-4 py-3 text-[15px] text-slate-800",
            r?.type === "urgent" ? "border border-rose-200 bg-rose-50" : "bg-slate-50",
          )}
        >
          {r?.type === "urgent" && (
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-700">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Please seek care now
            </p>
          )}
          {turn.content}
        </div>

        {r && (r.understood.specialty || r.understood.city) && r.type !== "urgent" && (
          <p className="flex flex-wrap gap-1.5 text-xs">
            {r.understood.specialty && <span className="chip border-slate-200 bg-white text-slate-700">Looking for: {r.understood.specialty}</span>}
            {r.understood.city && <span className="chip border-slate-200 bg-white text-slate-700">In: {r.understood.city}</span>}
            {r.understood.need && <span className="chip border-slate-200 bg-white text-slate-700">Need: {r.understood.need}</span>}
          </p>
        )}

        {r?.type === "answer" && (
          <>
            {r.reasoning.length > 0 && (
              <div className="rounded-2xl border border-peer-200 bg-peer-50/60 p-4">
                <p className="eyebrow text-peer-700">How I ranked these</p>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-800">
                  {r.reasoning.map((line, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-peer-500" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {r.recommendations.length > 0 && (
              <ol className="space-y-3">
                {r.recommendations.map((rec, i) => (
                  <RecommendationCard key={rec.doctorId} rec={rec} rank={i + 1} need={r.understood.need} />
                ))}
              </ol>
            )}
          </>
        )}

        {r && (r.caveats.length > 0 || turn.meta) && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            {r.caveats.map((c) => <span key={c}>{c}</span>)}
            {turn.meta && (
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-brand-700" aria-hidden />
                {turn.meta.mode === "fable" ? `Reasoned by ${turn.meta.model}` : "Offline reasoning (no API key configured)"}
                {turn.meta.circles.length > 0 && ` · circles: ${turn.meta.circles.join(", ")}`}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ rec, rank, need }: { rec: ConciergeResult["recommendations"][number]; rank: number; need: string | null }) {
  const doctor = DOCTORS.find((d) => d.id === rec.doctorId);
  if (!doctor) return null;
  const spec = SPECIALTIES.find((s) => s.key === doctor.specialty);
  const bookHref = `/doctors/${doctor.id}?book=1${need ? `&reason=${encodeURIComponent(need)}` : ""}`;
  return (
    <li className={cn("card p-4 sm:p-5", rank === 1 && "ring-1 ring-peer-200")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white" aria-label={`Rank ${rank}`}>
            {rank}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-peer-700">{rec.headline}</p>
            <h3 className="text-lg font-bold text-slate-900">
              <Link href={`/doctors/${doctor.id}`} className="hover:text-brand-800">{doctor.name}</Link>
            </h3>
            <p className="text-sm text-slate-600">
              {spec?.label} · {doctor.area}, {doctor.city} · {formatFee(doctor.consultationFee)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/doctors/${doctor.id}`} className="btn-secondary px-3 py-2 text-xs">
            Profile
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link href={bookHref} className="btn-primary px-3 py-2 text-xs">
            <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
            Book
          </Link>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-800">{rec.why}</p>
      {rec.evidence.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {rec.evidence.map((e, i) => (
            <li key={i} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
