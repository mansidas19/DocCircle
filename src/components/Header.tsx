"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, PenLine, Search, Menu, X, UserRound } from "lucide-react";
import { useState } from "react";
import { useCircle } from "@/lib/circle-store";
import { cn } from "@/lib/utils";
import Logo from "./Logo";

const NAV = [
  { href: "/doctors", label: "Find doctors", icon: Search },
  { href: "/circle", label: "Ask My Circle", icon: Users },
  { href: "/review", label: "Share experience", icon: PenLine },
] as const;

export default function Header() {
  const pathname = usePathname();
  const { profile, verifiedCommunityIds, hydrated } = useCircle();
  const [open, setOpen] = useState(false);

  const initials = profile?.name
    ? profile.name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="DocCircle home">
          <Logo />
          <span className="text-lg font-bold tracking-tight text-slate-900">DocCircle</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-brand-50 text-brand-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
          <Link
            href="/profile"
            className={cn(
              "ml-2 inline-flex items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-3 text-xs font-medium transition hover:border-brand-300",
              pathname.startsWith("/profile") ? "border-brand-300 text-brand-800" : "border-slate-200 text-slate-700",
            )}
            title="Your profile and circles"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
              {initials ?? <UserRound className="h-3.5 w-3.5" aria-hidden />}
            </span>
            {hydrated
              ? profile
                ? `${verifiedCommunityIds.length} verified circle${verifiedCommunityIds.length === 1 ? "" : "s"}`
                : "Set up profile"
              : "Profile"}
          </Link>
        </nav>

        <button
          type="button"
          className="btn-secondary px-3 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Mobile">
          {[...NAV, { href: "/profile", label: "My profile & circles", icon: UserRound }].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
