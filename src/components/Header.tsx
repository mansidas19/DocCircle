"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, PenLine, Search, Menu, X } from "lucide-react";
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
  const { selectedCommunities, hydrated } = useCircle();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="DocCircle home">
          <Logo />
          <span className="text-lg font-bold tracking-tight text-slate-900">DocCircle</span>
          <span className="hidden rounded-full border border-peer-200 bg-peer-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-peer-800 sm:inline">
            Prototype · demo data
          </span>
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
            href="/circle"
            className="ml-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-brand-300"
            title="Your circles"
          >
            <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden />
            {hydrated ? `${selectedCommunities.length} circle${selectedCommunities.length === 1 ? "" : "s"}` : "Circles"}
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
        <nav
          id="mobile-nav"
          className="border-t border-slate-200 bg-white px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          {NAV.map(({ href, label, icon: Icon }) => (
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
