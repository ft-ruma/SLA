// Decorative line art for the banners. Always aria-hidden.

/** Curved running-track lanes with lane numbers and a chequered finish. */
export function TrackArt({ className }: { className?: string }) {
  const lines = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg viewBox="0 0 400 320" fill="none" aria-hidden className={className}>
      {lines.map((i) => (
        <path key={i}
          d={`M ${-30 + i * 38} 340 C ${50 + i * 34} 210, ${190 + i * 20} ${130 + i * 10}, 430 ${46 + i * 24}`}
          stroke="white" strokeOpacity={0.42 - i * 0.035} strokeWidth={i === 0 || i === 6 ? 3 : 2} />
      ))}
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <text key={n} x={-6 + (n - 1) * 38} y={312} fill="white" fillOpacity={0.5}
          fontSize="20" fontWeight="800" fontFamily="ui-sans-serif, system-ui">{n}</text>
      ))}
      {Array.from({ length: 18 }, (_, k) => (
        <rect key={k} x={k % 2 ? 380 : 390} y={40 + Math.floor(k / 2) * 18} width="10" height="9"
          fill="var(--accent-gold)" fillOpacity={0.85} transform="rotate(12 385 130)" />
      ))}
    </svg>
  );
}

/** Coach's stopwatch with a gold hand. */
export function StopwatchArt({ className }: { className?: string }) {
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  return (
    <svg viewBox="0 0 200 220" fill="none" aria-hidden className={className}>
      <rect x="86" y="4" width="28" height="16" rx="5" fill="currentColor" fillOpacity="0.45" />
      <rect x="95" y="19" width="10" height="16" fill="currentColor" fillOpacity="0.45" />
      <path d="M152 48 l14 -14" stroke="currentColor" strokeOpacity="0.45" strokeWidth="9" strokeLinecap="round" />
      <circle cx="100" cy="126" r="84" stroke="currentColor" strokeOpacity="0.5" strokeWidth="7" />
      {ticks.map((i) => {
        const a = (i / 60) * Math.PI * 2;
        const long = i % 5 === 0;
        const r1 = long ? 62 : 68;
        // rounded so the server and browser print the same numbers (hydration)
        const p = (v: number) => Math.round(v * 100) / 100;
        return (
          <line key={i} x1={p(100 + Math.sin(a) * r1)} y1={p(126 - Math.cos(a) * r1)}
            x2={p(100 + Math.sin(a) * 74)} y2={p(126 - Math.cos(a) * 74)}
            stroke="currentColor" strokeOpacity={long ? 0.6 : 0.3} strokeWidth={long ? 3 : 1.5} strokeLinecap="round" />
        );
      })}
      <line x1="100" y1="126" x2="139" y2="80" stroke="var(--accent-gold)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="126" r="8" fill="var(--accent-gold)" />
    </svg>
  );
}
