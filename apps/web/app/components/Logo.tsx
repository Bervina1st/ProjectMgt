export default function Logo({ size = 40 }: { size?: number }) {
  const gid = `lg${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f6bed" />
          <stop offset="1" stopColor="#7c5cff" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="44" height="44" rx="12" fill={`url(#${gid})`} />
      <circle cx="23" cy="23" r="11" fill="none" stroke="#fff" strokeWidth="2.4" opacity="0.9" />
      <circle cx="23" cy="23" r="4.4" fill="#fff" />
      <path d="M23 6v4M23 36v4M6 23h4M36 23h4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}
