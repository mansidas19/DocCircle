import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import MembershipList from "@/components/MembershipList";

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
        Tell us where you studied and work so we can place you in the right communities. Then
        verify membership privately. Your reviews will only ever carry the community label.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="mb-3 text-lg font-bold text-slate-900">1. Your details</h2>
          <ProfileForm />
        </section>
        <section aria-labelledby="circles-heading">
          <h2 id="circles-heading" className="mb-3 text-lg font-bold text-slate-900">2. Your circles &amp; verification</h2>
          <MembershipList />
        </section>
      </div>
    </div>
  );
}
