import type { Episode } from '../types';
import EpisodeCircle from './EpisodeCircle';

interface EpisodeGridProps {
  episodes: Episode[];
  currentEpisodeId?: string | null;
  onToggle: (episode: Episode) => void;
  columns?: number;
}

export default function EpisodeGrid({ episodes, currentEpisodeId, onToggle, columns }: EpisodeGridProps) {
  return (
    <div
      className="grid gap-3 justify-items-center"
      style={{
        gridTemplateColumns: `repeat(${columns || 5}, minmax(0, 1fr))`,
      }}
    >
      {episodes.map((ep) => (
        <EpisodeCircle
          key={ep.id}
          number={ep.episodeNumber}
          watched={ep.watched}
          isCurrent={ep.id === currentEpisodeId}
          onClick={() => onToggle(ep)}
        />
      ))}
    </div>
  );
}
