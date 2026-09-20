import { Suspense } from "react";
import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import ReviewForm from "@/components/ReviewForm";
import ContributorBenefits from "@/components/ContributorBenefits";

export const metadata: Metadata = { title: "Share your experience — DocCircle" };

export default function ReviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="eyebrow flex items-center gap-1.5 text-brand-700">
        <HeartHandshake className="h-3.5 w-3.5" aria-hidden />
        Pay it forward
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Share your experience</h1>
      <p className="mt-2 text-slate-600">
        Your experience could save someone in your community hours of uncertainty. It stays
        anonymous, and Fable makes sure it&apos;s safe and useful before it&apos;s published.
      </p>

      <div className="mt-6">
        <Suspense fallback={<div className="card h-96 animate-pulse bg-slate-100" />}>
          <ReviewForm />
        </Suspense>
      </div>

      <div className="mt-8">
        <ContributorBenefits compact />
      </div>
    </div>
  );
}
