import { useState } from 'react';

interface EpisodeCircleProps {
  number: number;
  watched: boolean;
  isCurrent?: boolean;
  onClick: () => void;
  size?: number;
}

export default function EpisodeCircle({ number, watched, isCurrent, onClick, size = 44 }: EpisodeCircleProps) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (animating) return;
    setAnimating(true);
    onClick();
    setTimeout(() => setAnimating(false), 400);
  };

  const num = String(number).padStart(2, '0');

  return (
    <button
      onClick={handleClick}
      aria-label={`Episode ${num} ${watched ? 'watched' : 'not watched'}`}
      className={`relative flex items-center justify-center rounded-full transition-all duration-200 select-none focus:outline-none ${
        animating ? 'animate-pop' : ''
      } ${watched ? 'bg-done text-white shadow-sm' : 'bg-white text-ink/60 border-2 border-muted hover:border-done/40'} ${
        isCurrent && !watched ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''
      }`}
      style={{ width: size, height: size, minWidth: size }}
    >
      {watched ? (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span className="text-xs font-semibold">{num}</span>
      )}
      {isCurrent && watched && (
        <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-accent" />
      )}
    </button>
  );
}
