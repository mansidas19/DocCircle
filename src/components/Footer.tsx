import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-base font-bold text-slate-900">DocCircle</p>
          <p className="mt-1 text-sm text-slate-600">Find doctors through people you trust.</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-800">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Anonymous publicly, verified privately.
          </p>
        </div>
        <div className="text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Explore</p>
          <ul className="mt-2 space-y-1.5">
            <li><Link className="hover:text-brand-800" href="/doctors?specialty=dermatology&city=Bangalore">Dermatologists in Bangalore</Link></li>
            <li><Link className="hover:text-brand-800" href="/circle">Ask My Circle</Link></li>
            <li><Link className="hover:text-brand-800" href="/review">Share your experience</Link></li>
          </ul>
        </div>
        <div className="text-xs leading-relaxed text-slate-500">
          <p className="font-semibold text-slate-700">Important</p>
          <p className="mt-2">
            DocCircle provides community experience information, not medical advice. Experience
            signals describe how patients felt about communication, fees and waiting, never medical
            quality.
          </p>
        </div>
      </div>
    </footer>
  );
}
