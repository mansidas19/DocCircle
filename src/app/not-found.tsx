import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-slate-600">The doctor or page you&apos;re looking for isn&apos;t in our demo data.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-primary">Back home</Link>
        <Link href="/doctors" className="btn-secondary">Browse doctors</Link>
      </div>
    </div>
  );
}
