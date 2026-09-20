import { ShieldCheck, Sparkles, Stethoscope, Tag, ThumbsDown, ThumbsUp, Wrench } from "lucide-react";
import type { Review } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

interface Props {
  review: Review;
  /** true when this reviewer's community is one the user selected */
  relevant?: boolean;
  /** Mark reviews submitted in this browser session */
  mine?: boolean;
}

const ANSWER_LABEL: Record<string, string> = {
  yes: "Yes",
  partially: "Partially",
  somewhat: "Somewhat",
  maybe: "Maybe",
  no: "No",
};

function Answer({ label, value }: { label: string; value: string }) {
  const good = value === "yes";
  const bad = value === "no";
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-slate-500">{label}:</span>
      <span className={cn("font-semibold", good ? "text-brand-800" : bad ? "text-rose-700" : "text-slate-700")}>
        {ANSWER_LABEL[value] ?? value}
      </span>
    </span>
  );
}

export default function ReviewCard({ review, relevant = false, mine = false }: Props) {
  const recommends = review.wouldRecommend === "yes";

  return (
    <article className={cn("card p-5", relevant && "ring-1 ring-peer-200")}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full text-sm font-bold",
              relevant ? "bg-peer-100 text-peer-800" : "bg-slate-100 text-slate-500",
            )}
            aria-hidden
          >
            ?
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Anonymous reviewer</p>
            <p className="flex items-center gap-1 text-xs text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-700" aria-hidden />
              {review.reviewerDisplayLabel}
              {relevant && <span className="ml-1 font-semibold text-peer-700">· your circle</span>}
              {mine && <span className="ml-1 font-semibold text-brand-700">· you (this session)</span>}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "chip",
            recommends ? "border-brand-200 bg-brand-50 text-brand-800" : "border-rose-200 bg-rose-50 text-rose-800",
          )}
        >
          {recommends ? <ThumbsUp className="h-3 w-3" aria-hidden /> : <ThumbsDown className="h-3 w-3" aria-hidden />}
          {recommends ? "Recommends for a similar need" : "Would not recommend"}
        </span>
      </header>

      {review.visitReason && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
          <Stethoscope className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          Visited for: {review.visitReason}
        </p>
      )}

      {review.aiThemes.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Experience themes">
          {review.aiThemes.map((t) => (
            <li key={t} className="chip border-slate-200 bg-white text-slate-700">
              <Tag className="h-3 w-3 text-slate-400" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      )}

      {review.writtenExperience ? (
        <blockquote className="mt-3 text-[15px] leading-relaxed text-slate-800">
          &ldquo;{review.writtenExperience}&rdquo;
        </blockquote>
      ) : (
        <p className="mt-3 text-sm italic text-slate-500">{review.aiSummary}</p>
      )}

      {(review.bestPart || review.improvement) && (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {review.bestPart && (
            <div className="rounded-xl bg-brand-50/60 p-3">
              <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-brand-800">
                <Sparkles className="h-3 w-3" aria-hidden /> Best part
              </dt>
              <dd className="mt-0.5 text-slate-800">{review.bestPart}</dd>
            </div>
          )}
          {review.improvement && (
            <div className="rounded-xl bg-peer-50/70 p-3">
              <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-peer-800">
                <Wrench className="h-3 w-3" aria-hidden /> Could improve
              </dt>
              <dd className="mt-0.5 text-slate-800">{review.improvement}</dd>
            </div>
          )}
        </dl>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <Answer label="Need addressed" value={review.addressedNeed} />
        <Answer label="Listened & explained" value={review.listenedExplained} />
        <Answer label="Would consult again" value={review.consultAgain} />
        <span className="ml-auto text-slate-500">{timeAgo(review.createdAt)}</span>
      </footer>
    </article>
  );
}
