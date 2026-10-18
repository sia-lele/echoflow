import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'done' | 'accent';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  full?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white hover:bg-ink/90',
  secondary: 'bg-card text-ink border border-muted hover:bg-soft',
  ghost: 'text-ink/60 hover:bg-soft',
  done: 'bg-done text-white hover:bg-done/90',
  accent: 'bg-accent text-white hover:bg-accent/90',
};

export function Button({ variant = 'primary', full, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`px-5 py-3 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-2xl p-5 shadow-sm border border-muted/60 ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-semibold text-ink">{children}</h2>
      {subtitle && <p className="text-sm text-ink/50 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function Chip({ children, color = 'muted' }: { children: React.ReactNode; color?: 'muted' | 'done' | 'accent' }) {
  const colors = {
    muted: 'bg-muted text-ink/70',
    done: 'bg-done/15 text-done',
    accent: 'bg-accent/15 text-accent',
  };
  return <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${colors[color]}`}>{children}</span>;
}
