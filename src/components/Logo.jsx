export default function Logo({ className, size = 44 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="App logo"
    >
      <rect x="6" y="47" width="15" height="10" rx="1.6" fill="var(--accent-wash)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="24.5" y="47" width="15" height="10" rx="1.6" fill="var(--accent-wash)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="43" y="47" width="15" height="10" rx="1.6" fill="var(--accent-wash)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="6" y="33.5" width="5.75" height="10" rx="1.6" fill="var(--accent-wash)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="15.25" y="33.5" width="15" height="10" rx="1.6" fill="var(--accent-wash)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="33.75" y="33.5" width="15" height="10" rx="1.6" fill="var(--accent-wash)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="52.25" y="33.5" width="5.75" height="10" rx="1.6" fill="var(--accent-wash)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="6" y="20" width="15" height="10" rx="1.6" fill="var(--accent-wash)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="24.5" y="20" width="15" height="10" rx="1.6" fill="var(--accent-wash)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round"/>
      {/* empty slot in the wall */}
      <rect x="43" y="20" width="15" height="10" rx="1.6" fill="none" stroke="var(--outline)" strokeWidth="1.1" strokeDasharray="1.8 2.2" opacity="0.5"/>
      {/* the reused block being set into place */}
      <rect x="43" y="20" width="15" height="10" rx="1.6" fill="var(--accent)" stroke="var(--outline)" strokeWidth="1.8" strokeLinejoin="round" transform="translate(0 -12) rotate(-10 50.5 25)"/>
    </svg>
  );
}