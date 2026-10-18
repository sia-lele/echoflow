import type { Show } from '../types';
import { useApp, countWatchedInShow } from '../lib/AppContext';
import ProgressBar from './ProgressBar';
import { Link } from 'react-router-dom';

export default function ShowProgressCard({ show }: { show: Show }) {
  const { data } = useApp();
  const watched = countWatchedInShow(show, data.episodes);
  const pct = show.totalEpisodes > 0 ? Math.round((watched / show.totalEpisodes) * 100) : 0;

  return (
    <div className="bg-card rounded-2xl p-4 border border-muted/60 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-ink">{show.title}</h3>
          <p className="text-xs text-ink/50">{show.chineseTitle}</p>
        </div>
        <Link
          to="/watch-map"
          className="text-xs text-accent font-medium hover:underline"
        >
          查看 →
        </Link>
      </div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-ink/60">已观看 {watched} / {show.totalEpisodes} 集</span>
        <span className="font-medium text-ink">{pct}%</span>
      </div>
      <ProgressBar value={watched} max={show.totalEpisodes} />
    </div>
  );
}
