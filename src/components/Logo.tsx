export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <circle cx="16" cy="16" r="15" fill="#0f766e" />
      <circle cx="16" cy="16" r="9.5" stroke="#99f6e4" strokeWidth="2" strokeDasharray="6 4" />
      <circle cx="16" cy="12.5" r="3" fill="#ffffff" />
      <path d="M10.5 21.5c1.2-2.8 3.3-4.2 5.5-4.2s4.3 1.4 5.5 4.2" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="8" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}
