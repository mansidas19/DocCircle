import { Suspense } from "react";
import type { Metadata } from "next";
import AskMyCircle from "@/components/AskMyCircle";

export const metadata: Metadata = { title: "Ask My Circle — DocCircle" };

export default function CirclePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="h-96 animate-pulse rounded-2xl bg-slate-100" /></div>}>
      <AskMyCircle />
    </Suspense>
  );
}
