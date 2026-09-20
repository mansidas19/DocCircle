import { Suspense } from "react";
import type { Metadata } from "next";
import SearchResults, { ResultsSkeleton } from "@/components/SearchResults";

export const metadata: Metadata = {
  title: "Find doctors — DocCircle",
};

export default function DoctorsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <ResultsSkeleton />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
