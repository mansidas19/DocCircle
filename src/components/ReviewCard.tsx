import { Clock, ShieldCheck, Tag, ThumbsDown, ThumbsUp, Minus } from "lucide-react";
import type { Review } from "@/lib/types";
import { WAIT_LABEL, cn, timeAgo } from "@/lib/utils";

interface Props {
  review: Review;
  /** true when this reviewer's community is one the user selected */
  relevant?: boolean;
  /** Mark reviews submitted in this browser session */
  mine?: boolean;
}

const REC: Record<Review["wouldRecommend"], { label: string; icon: typeof ThumbsUp; cls: string }> = {
  yes: { label: "Would recommend", icon: ThumbsUp, cls: "border-brand-200 bg-brand-50 text-brand-800" },
  maybe: { label: "Might recommend", icon: Minus, cls: "border-slate-200 bg-slate-50 text-slate-700" },
  no: { label: "Would not recommend", icon: ThumbsDown, cls: "border-rose-200 bg-rose-50 text-rose-800" },
};

export default function ReviewCard({ review, relevant = false, mine = false }: Props) {
  const rec = REC[review.wouldRecommend];
  const RecIcon = rec.icon;

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
        <span className={cn("chip", rec.cls)}>
          <RecIcon className="h-3 w-3" aria-hidden />
          {rec.label}
        </span>
      </header>

      {review.aiThemes.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Experience themes">
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

      <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {WAIT_LABEL[review.waitTime]}
        </span>
        <span>Listened: {review.listening}</span>
        <span>Explained clearly: {review.explanation}</span>
        <span>Fees clear: {review.feesClear ? "yes" : "no"}</span>
        <span className="ml-auto">{timeAgo(review.createdAt)}</span>
      </footer>
    </article>
  );
}
