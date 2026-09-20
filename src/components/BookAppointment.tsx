"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { CalendarCheck2, CalendarPlus, Check, Lock, Sparkles, X } from "lucide-react";
import { useCircle } from "@/lib/circle-store";
import type { Appointment, Doctor } from "@/lib/types";
import { cn, formatFee } from "@/lib/utils";

interface Props {
  doctor: Doctor;
  /** Open the panel immediately (e.g. arriving from Ask My Circle) */
  initialOpen?: boolean;
  initialReason?: string;
}

function nextDays(n: number) {
  const out: { iso: string; label: string; weekday: string }[] = [];
  const d = new Date();
  for (let i = 1; i <= n; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    if (x.getDay() === 0) continue; // clinic closed Sundays
    out.push({
      iso: x.toISOString().slice(0, 10),
      label: x.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      weekday: x.toLocaleDateString("en-IN", { weekday: "short" }),
    });
  }
  return out;
}

/** Deterministic pseudo-availability per doctor + date. */
function slotsFor(doctorId: string, iso: string) {
  const base = ["09:30", "10:00", "10:30", "11:00", "11:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"];
  let h = 0;
  for (const ch of doctorId + iso) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return base.map((time, i) => ({
    time,
    // Earliest morning and evening slots are held for contributors
    priority: i === 0 || i === 5,
    taken: ((h >> i) & 1) === 1 && i % 3 !== 0,
  }));
}

export default function BookAppointment({ doctor, initialOpen = false, initialReason = "" }: Props) {
  const { isContributor, addAppointment, appointments, hasProfile } = useCircle();
  const [open, setOpen] = useState(initialOpen);
  const days = useMemo(() => nextDays(8), []);
  const [date, setDate] = useState(days[0]?.iso ?? "");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState(initialReason);
  const [done, setDone] = useState<Appointment | null>(null);

  const slots = useMemo(() => slotsFor(doctor.id, date), [doctor.id, date]);
  const existing = appointments.find((a) => a.doctorId === doctor.id);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!date || !time) return;
    const slot = slots.find((s) => s.time === time);
    const appt = addAppointment({ doctorId: doctor.id, date, time, reason: reason.trim(), priority: !!slot?.priority });
    setDone(appt);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        <CalendarPlus className="h-4 w-4" aria-hidden />
        Book appointment
      </button>
    );
  }

  return (
    <section
      id="book"
      aria-labelledby="book-heading"
      className="card fade-up mt-6 border-brand-200 p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-brand-700">Book an appointment</p>
          <h2 id="book-heading" className="mt-1 text-xl font-bold text-slate-900">
            {doctor.name} · {doctor.clinicName}
          </h2>
          <p className="text-sm text-slate-600">
            {doctor.area}, {doctor.city} · Consultation {formatFee(doctor.consultationFee)}
          </p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close booking">
          <X className="h-4 w-4" />
        </button>
      </div>

      {done ? (
        <div className="fade-up mt-5 rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <p className="flex items-center gap-2 text-lg font-bold text-brand-900">
            <CalendarCheck2 className="h-5 w-5" aria-hidden />
            Appointment requested
          </p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Reference</dt><dd className="font-mono font-semibold text-slate-900">{done.reference}</dd></div>
            <div><dt className="text-slate-500">When</dt><dd className="font-semibold text-slate-900">{new Date(done.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · {done.time}{done.priority ? " · priority slot" : ""}</dd></div>
            {done.reason && <div className="sm:col-span-2"><dt className="text-slate-500">Reason shared with clinic</dt><dd className="text-slate-900">{done.reason}</dd></div>}
          </dl>
          <p className="mt-3 text-xs text-slate-600">
            The clinic confirms by SMS. After your visit, share your experience to help the next
            person in your circle.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/profile" className="btn-secondary px-3 py-2 text-xs">View my appointments</Link>
            <Link href={`/review?doctorId=${doctor.id}`} className="btn-ghost px-3 py-2 text-xs">Share experience later</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          {existing && (
            <p className="rounded-xl border border-peer-200 bg-peer-50 px-3 py-2 text-xs text-peer-900">
              You already have a request with {doctor.name} on {existing.date} at {existing.time} (ref {existing.reference}). Booking again adds a second request.
            </p>
          )}

          <div>
            <p className="label">Pick a day</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Day">
              {days.map((d) => (
                <label
                  key={d.iso}
                  className={cn(
                    "cursor-pointer rounded-xl border px-3 py-2 text-center text-sm transition focus-within:ring-2 focus-within:ring-brand-500",
                    date === d.iso ? "border-brand-600 bg-brand-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                  )}
                >
                  <input type="radio" name="day" className="sr-only" checked={date === d.iso} onChange={() => { setDate(d.iso); setTime(""); }} />
                  <span className="block text-[11px] opacity-80">{d.weekday}</span>
                  <span className="block font-semibold">{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="label mb-0">Pick a time</p>
              <p className="flex items-center gap-1 text-[11px] text-slate-500">
                <Sparkles className="h-3 w-3 text-peer-600" aria-hidden />
                {isContributor ? "Priority slots unlocked for you" : "Priority slots unlock after your first shared experience"}
              </p>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Time">
              {slots.map((s) => {
                const locked = s.priority && !isContributor;
                const disabled = s.taken || locked;
                return (
                  <label
                    key={s.time}
                    title={locked ? "Priority slot: share one experience to unlock" : s.taken ? "Already booked" : undefined}
                    className={cn(
                      "relative cursor-pointer rounded-xl border px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-brand-500",
                      disabled && "cursor-not-allowed opacity-50",
                      time === s.time ? "border-brand-600 bg-brand-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                      s.priority && !disabled && time !== s.time && "border-peer-300 bg-peer-50",
                    )}
                  >
                    <input type="radio" name="time" className="sr-only" disabled={disabled} checked={time === s.time} onChange={() => setTime(s.time)} />
                    {s.time}
                    {s.priority && (
                      <span className="ml-1 inline-flex align-middle">
                        {locked ? <Lock className="h-3 w-3" aria-label="Locked priority slot" /> : <Sparkles className="h-3 w-3" aria-label="Priority slot" />}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="book-reason" className="label">Reason for visit <span className="font-normal normal-case text-slate-400">(shared with the clinic only)</span></label>
            <input id="book-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={120} className="input" placeholder="e.g. Skin consultation" />
          </div>

          {!hasProfile && (
            <p className="text-xs text-slate-500">We&apos;ll use the contact details from your profile to confirm.</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary" disabled={!date || !time}>
              <Check className="h-4 w-4" aria-hidden />
              Request appointment
            </button>
            <p className="text-xs text-slate-500">No payment now. The clinic confirms your slot.</p>
          </div>
        </form>
      )}
    </section>
  );
}
