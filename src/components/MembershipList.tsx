"use client";

import { useState, type FormEvent } from "react";
import {
  BadgeCheck,
  Clock,
  FileUp,
  KeyRound,
  Mail,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useCircle } from "@/lib/circle-store";
import type { Community, Membership, VerificationMethod } from "@/lib/types";
import { cn } from "@/lib/utils";
import CreateCommunity from "./CreateCommunity";

const STATUS: Record<Membership["status"], { label: string; cls: string; icon: typeof ShieldCheck }> = {
  verified: { label: "Verified", cls: "border-brand-200 bg-brand-50 text-brand-800", icon: BadgeCheck },
  pending: { label: "Pending verification", cls: "border-peer-200 bg-peer-50 text-peer-800", icon: Clock },
  unverified: { label: "Not verified", cls: "border-slate-200 bg-slate-50 text-slate-600", icon: ShieldCheck },
};

const METHOD_LABEL: Record<VerificationMethod, string> = {
  seeded: "verified membership",
  "email-domain": "work/college email domain",
  "email-otp": "email code",
  document: "document review",
  "invite-code": "invite code",
  creator: "community creator",
  personal: "personal circle",
};

/** Your communities with their verification status, plus the join/verify flows. */
export default function MembershipList() {
  const { myCommunities, allCommunities, memberships, membershipFor, joinCommunity, leaveCommunity } = useCircle();
  const [verifying, setVerifying] = useState<string | null>(null);

  const notJoined = allCommunities.filter((c) => !memberships.some((m) => m.communityId === c.id));

  return (
    <div className="space-y-6">
      <ul className="grid gap-3 sm:grid-cols-2">
        {myCommunities.map((c) => {
          const m = membershipFor(c.id)!;
          const s = STATUS[m.status];
          const Icon = s.icon;
          const personal = c.type === "friends" || c.type === "family";
          return (
            <li key={c.id} className="card flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600">
                    <Users className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-xs capitalize text-slate-500">{c.type} community</p>
                  </div>
                </div>
                <span className={cn("chip", s.cls)}>
                  <Icon className="h-3 w-3" aria-hidden />
                  {s.label}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">{c.description}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {m.method ? `Via ${METHOD_LABEL[m.method]}` : "Verification needed to post under this community"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {m.status !== "verified" && !personal && (
                  <button type="button" className="btn-primary px-3 py-1.5 text-xs" onClick={() => setVerifying(c.id)}>
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    {m.status === "pending" && m.method ? "Check status" : "Verify membership"}
                  </button>
                )}
                {m.method !== "seeded" && !personal && (
                  <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => leaveCommunity(c.id)}>
                    Leave
                  </button>
                )}
              </div>

              {verifying === c.id && (
                <VerifyPanel community={c} membership={m} onClose={() => setVerifying(null)} />
              )}
            </li>
          );
        })}
      </ul>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Join a pre-built community</p>
          <p className="mt-1 text-xs text-slate-600">
            Request to join, then verify with your email or a document.
          </p>
          {notJoined.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">You&apos;re a member of every available community.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {notJoined.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2">
                  <span className="text-sm font-medium text-slate-800">{c.name}</span>
                  <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => joinCommunity(c.id)}>
                    Request to join
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Make your own peer group</p>
          <p className="mt-1 text-xs text-slate-600">
            Batchmates, your apartment, a parents&apos; group. You become its verified creator and
            can circulate an invite link.
          </p>
          <div className="mt-3">
            <CreateCommunity />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Verification flow ---------------- */

type Method = "email-otp" | "document" | "invite-code";

function VerifyPanel({
  community,
  membership,
  onClose,
}: {
  community: Community;
  membership: Membership;
  onClose: () => void;
}) {
  const { requestVerification, approvePending, profile } = useCircle();
  const [method, setMethod] = useState<Method>("email-otp");
  const [email, setEmail] = useState(profile?.workEmail || profile?.email || "");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [invite, setInvite] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isAlumni = community.type === "alumni";

  function sendCode(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email.");
    setError(null);
    setCodeSent(true);
  }
  function confirmCode(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code from your email.");
    requestVerification(community.id, "email-otp", true);
    onClose();
  }
  function submitDocument(e: FormEvent) {
    e.preventDefault();
    if (!fileName) return setError("Choose a document first.");
    requestVerification(community.id, "document", false);
    setError(null);
  }
  function submitInvite(e: FormEvent) {
    e.preventDefault();
    if (!/^DC-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(invite.trim())) return setError("Invite codes look like DC-XXXX-XXXX.");
    requestVerification(community.id, "invite-code", true);
    onClose();
  }

  const pendingDoc = membership.status === "pending" && membership.method === "document";

  return (
    <div className="fade-up mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3" role="dialog" aria-label={`Verify ${community.name}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Verify {community.name}</p>
        <button type="button" onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-200" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-600">
        Verification is private. Other users only ever see &ldquo;{community.name}&rdquo; on your anonymous reviews.
      </p>

      {pendingDoc ? (
        <div className="mt-3 rounded-lg border border-peer-200 bg-peer-50 p-3 text-sm text-peer-900">
          <p className="font-semibold">Document received. Awaiting admin review.</p>
          <p className="mt-1 text-xs">Usually within 24 hours. You can keep using DocCircle meanwhile.</p>
          <button type="button" className="btn-secondary mt-3 px-3 py-1.5 text-xs" onClick={() => { approvePending(community.id); onClose(); }}>
            Approve now (admin preview)
          </button>
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Verification method">
            {(
              [
                ["email-otp", Mail, isAlumni ? "Alumni email" : "Work email"],
                ["document", FileUp, isAlumni ? "Degree / ID card" : "Employee ID / offer letter"],
                ["invite-code", KeyRound, "Invite code"],
              ] as Array<[Method, typeof Mail, string]>
            ).map(([m, Icon, label]) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={method === m}
                onClick={() => { setMethod(m); setError(null); }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium",
                  method === m ? "border-brand-600 bg-white text-brand-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          {method === "email-otp" && (
            <form onSubmit={codeSent ? confirmCode : sendCode} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              {!codeSent ? (
                <>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder={isAlumni ? "you@alumni.college.edu" : "you@company.com"} />
                  <button type="submit" className="btn-primary px-3 py-2 text-xs">Send code</button>
                </>
              ) : (
                <>
                  <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="input tracking-[0.3em]" placeholder="6-digit code" aria-label="Verification code" />
                  <button type="submit" className="btn-primary px-3 py-2 text-xs">Confirm</button>
                  <p className="text-xs text-slate-500 sm:col-span-2">Code sent to {email}. Enter it above.</p>
                </>
              )}
            </form>
          )}

          {method === "document" && (
            <form onSubmit={submitDocument} className="mt-3 space-y-2">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 hover:border-brand-300">
                <span>{fileName ?? "Upload a photo or PDF (kept private, deleted after review)"}</span>
                <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
                <FileUp className="h-4 w-4 shrink-0" aria-hidden />
              </label>
              <button type="submit" className="btn-primary px-3 py-2 text-xs">Submit for review</button>
            </form>
          )}

          {method === "invite-code" && (
            <form onSubmit={submitInvite} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <input value={invite} onChange={(e) => setInvite(e.target.value.toUpperCase())} className="input font-mono" placeholder="DC-XXXX-XXXX" aria-label="Invite code" />
              <button type="submit" className="btn-primary px-3 py-2 text-xs">Verify</button>
              <p className="text-xs text-slate-500 sm:col-span-2">Shared by a verified member or the community creator.</p>
            </form>
          )}
        </>
      )}

      {error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}
    </div>
  );
}
