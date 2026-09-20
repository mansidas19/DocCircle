"use client";

import { useState, type FormEvent } from "react";
import { Copy, Check, Link2, Plus } from "lucide-react";
import { useCircle } from "@/lib/circle-store";
import type { Community, CommunityType } from "@/lib/types";
import { slugify } from "@/lib/utils";

const TYPES: Array<{ value: CommunityType; label: string }> = [
  { value: "alumni", label: "Alumni group" },
  { value: "workplace", label: "Workplace" },
  { value: "local", label: "Local / residents" },
  { value: "friends", label: "Friends" },
  { value: "family", label: "Family" },
  { value: "custom", label: "Other" },
];

/**
 * P1: lightweight Create a Community flow (local demo state only).
 * No document verification; generates a mock invite code/link.
 */
export default function CreateCommunity() {
  const { addCustomCommunity, allCommunities } = useCircle();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<CommunityType>("alumni");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ community: Community; code: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 3) return setError("Give your community a name of at least 3 characters.");
    const id = `c-${slugify(trimmed)}`;
    if (allCommunities.some((c) => c.id === id)) return setError("A community with this name already exists.");
    const community: Community = {
      id,
      name: trimmed,
      type,
      verified: false,
      description: description.trim() || "Custom community you created. Members join via invite link.",
    };
    addCustomCommunity(community);
    const code = `DC-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setCreated({ community, code });
    setName("");
    setDescription("");
    setError(null);
  }

  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/circle?invite=${created.code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked; the code is visible anyway */
    }
  }

  if (!open && !created) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost -ml-3">
        <Plus className="h-4 w-4" aria-hidden />
        Create a community
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {created ? (
        <div className="fade-up">
          <p className="text-sm font-semibold text-slate-900">
            &ldquo;{created.community.name}&rdquo; created and added to your circles
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Share this invite so people in your community can join. Their reviews stay anonymous;
            only the community label is shown.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800">
              <Link2 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              {created.code}
            </code>
            <button type="button" onClick={copy} className="btn-secondary px-3 py-2">
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "Copied" : "Copy invite link"}
            </button>
            <button
              type="button"
              className="btn-ghost px-3 py-2"
              onClick={() => {
                setCreated(null);
                setOpen(false);
              }}
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold text-slate-900">Create a community</p>
            <p className="text-xs text-slate-600">
              For groups that aren&apos;t pre-built: your apartment, batch, parents&apos; group, study
              circle. Demo only, no verification step.
            </p>
          </div>
          <label className="block">
            <span className="label">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Prestige Lakeside Residents" required />
          </label>
          <label className="block">
            <span className="label">Type</span>
            <select value={type} onChange={(e) => setType(e.target.value as CommunityType)} className="input">
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="label">Description (optional)</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="Who is this community for?" />
          </label>
          {error && (
            <p role="alert" className="text-sm text-rose-700 sm:col-span-2">{error}</p>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
