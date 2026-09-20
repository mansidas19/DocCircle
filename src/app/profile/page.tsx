import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import ProfileOnboarding from "@/components/ProfileOnboarding";

export const metadata: Metadata = { title: "My profile & circles — DocCircle" };

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <p className="eyebrow flex items-center gap-1.5 text-brand-700">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        Anonymous publicly · verified privately
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">My profile &amp; circles</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Tell us where you live, studied and work. We&apos;ll suggest the communities you already
        belong to, and you choose which to join and verify.
      </p>

      <div className="mt-8">
        <ProfileOnboarding />
      </div>
    </div>
  );
}
