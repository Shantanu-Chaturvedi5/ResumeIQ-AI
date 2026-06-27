export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="hsl(var(--gradient-start))" />
          <stop offset="1" stopColor="hsl(var(--gradient-end))" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logoGrad)" />
      <path
        d="M11 21V11h2.4v4.2L17.6 11H20.6l-4.5 4.6 4.7 5.4h-3.2l-3.4-4-0.8 0.9V21H11z"
        fill="white"
      />
      <circle cx="23" cy="11" r="1.6" fill="white" fillOpacity="0.85" />
    </svg>
  );
}
