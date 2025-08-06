interface GmilliLogoProps {
  size?: number;
  className?: string;
}

export function GmilliLogo({ size = 32, className = "" }: GmilliLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle */}
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="url(#gradient1)"
        stroke="url(#gradient2)"
        strokeWidth="1"
      />

      {/* Letter G */}
      <path
        d="M12 8.5C12 7.67157 12.6716 7 13.5 7H19.5C20.3284 7 21 7.67157 21 8.5V9.5C21 10.3284 20.3284 11 19.5 11H18V13H20.5C21.3284 13 22 13.6716 22 14.5V22.5C22 23.3284 21.3284 24 20.5 24H13.5C12.6716 24 12 23.3284 12 22.5V19.5H16V21H19V16H17V14H13.5C12.6716 14 12 13.3284 12 12.5V8.5Z"
        fill="white"
      />

      {/* AI Circuit Pattern */}
      <g opacity="0.7">
        {/* Small dots representing neural network */}
        <circle cx="8" cy="10" r="0.8" fill="#38bdf8" />
        <circle cx="24" cy="10" r="0.8" fill="#38bdf8" />
        <circle cx="8" cy="22" r="0.8" fill="#38bdf8" />
        <circle cx="24" cy="22" r="0.8" fill="#38bdf8" />

        {/* Connection lines */}
        <line x1="8.8" y1="10" x2="11.2" y2="12" stroke="#38bdf8" strokeWidth="0.5" />
        <line x1="20.8" y1="12" x2="23.2" y2="10" stroke="#38bdf8" strokeWidth="0.5" />
        <line x1="8.8" y1="22" x2="11.2" y2="20" stroke="#38bdf8" strokeWidth="0.5" />
        <line x1="20.8" y1="20" x2="23.2" y2="22" stroke="#38bdf8" strokeWidth="0.5" />
      </g>

      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
    </svg>
  );
}
