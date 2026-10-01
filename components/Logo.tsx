// Logo paytrak : le mot en blanc, posé sur une barre de progression orange.
// Le curseur blanc marque où en est l'utilisateur dans sa progression.

export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 86" className={className} role="img" aria-label="paytrak">
      <text
        x="4"
        y="52"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="46"
        fontWeight="800"
        fill="#FFFFFF"
        letterSpacing="-2.2"
      >
        paytrak
      </text>
      <rect x="7" y="64" width="211" height="6" rx="3" fill="#1C3A6E" />
      <rect x="7" y="64" width="147" height="6" rx="3" fill="#F0601E" />
      <circle cx="154" cy="67" r="6.5" fill="#FFFFFF" />
      <circle cx="154" cy="67" r="2.6" fill="#F0601E" />
    </svg>
  );
}

// Version carrée : icône de l'application et favicon.
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="paytrak">
      <rect width="100" height="100" rx="24" fill="#0A1F44" />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="48"
        fontWeight="800"
        fill="#FFFFFF"
      >
        p
      </text>
      <rect x="22" y="70" width="56" height="8" rx="4" fill="#1C3A6E" />
      <rect x="22" y="70" width="38" height="8" rx="4" fill="#F0601E" />
      <circle cx="60" cy="74" r="8" fill="#FFFFFF" />
      <circle cx="60" cy="74" r="3" fill="#F0601E" />
    </svg>
  );
}
