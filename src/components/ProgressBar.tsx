import { Link, useLocation } from 'react-router-dom';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: string;
}

export default function ProgressBar({ value, max, color = 'bg-done', height = 'h-2' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`w-full ${height} bg-muted rounded-full overflow-hidden`}>
      <div
        className={`${color} progress-fill h-full rounded-full`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProgressPercent({ value, max }: { value: number; max: number }) {
  return <span>{max > 0 ? Math.round((value / max) * 100) : 0}%</span>;
}
