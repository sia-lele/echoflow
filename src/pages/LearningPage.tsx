import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { Button, Card } from '../components/ui';
import { useToast } from '../components/Toast';
import TrainingWizard from '../features/training/TrainingWizard';
import MiniPractice from '../features/training/MiniPractice';
import type { TrainingMode, Episode } from '../types';

export default function LearningPage() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, getShow } = useApp();
  const isMini = location.pathname.endsWith('/mini') || episodeId === 'mini';
  const actualEpisodeId = episodeId && episodeId !== 'mini' ? episodeId : null;

  // Find an episode to train with
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(actualEpisodeId);
  const [mode] = useState<TrainingMode>(isMini ? 'mini' : 'standard');

  // If no episode selected, find the last watched or next episode across all shows
  useEffect(() => {
    if (selectedEpisodeId) return;
    // find the most recently watched episode across all shows
    const allWatched = data.shows
      .filter((s) => s.lastWatchedEpisodeId)
      .map((s) => data.episodes[s.lastWatchedEpisodeId!])
      .filter(Boolean)
      .sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0));
    if (allWatched.length > 0) {
      setSelectedEpisodeId(allWatched[0].id);
      return;
    }
    // fallback: first unwatched episode of the first show
    const firstShow = data.shows[0];
    if (firstShow) {
      const firstUnwatched = firstShow.seasons[0].episodeIds
        .map((id) => data.episodes[id])
        .find((e) => e && !e.watched);
      if (firstUnwatched) setSelectedEpisodeId(firstUnwatched.id);
    }
  }, [selectedEpisodeId, data.episodes, data.shows]);

  const episode = selectedEpisodeId ? data.episodes[selectedEpisodeId] : null;

  if (!episode) {
    return (
      <div className="text-center py-20 text-ink/50">
        <p>正在准备训练…</p>
      </div>
    );
  }

  const show = data.shows.find((s) => s.id === episode.showId)!;

  // Episode picker
  if (!actualEpisodeId && !selectedEpisodeId) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold pt-2">选择训练剧集</h1>
        <EpisodePicker onSelect={(id) => { setSelectedEpisodeId(id); }} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ShowSwitcher
        currentShowId={show.id}
        onSelectShow={(showId) => {
          const target = data.shows.find((s) => s.id === showId);
          if (!target) return;
          // pick the last watched episode of this show, or first unwatched
          const last = target.lastWatchedEpisodeId ? data.episodes[target.lastWatchedEpisodeId] : null;
          if (last) {
            setSelectedEpisodeId(last.id);
          } else {
            const firstUnwatched = target.seasons[0]?.episodeIds
              .map((id) => data.episodes[id])
              .find((e) => e && !e.watched);
            if (firstUnwatched) setSelectedEpisodeId(firstUnwatched.id);
          }
        }}
      />
      {mode === 'mini' ? (
        <MiniPractice episode={episode} showTitle={show.title} focus={show.trainingFocus} />
      ) : (
        <TrainingWizard episode={episode} showTitle={show.title} focus={show.trainingFocus} />
      )}
    </div>
  );
}

function ShowSwitcher({
  currentShowId,
  onSelectShow,
}: {
  currentShowId: string;
  onSelectShow: (showId: string) => void;
}) {
  const { data } = useApp();
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {data.shows.map((s) => {
        const active = s.id === currentShowId;
        return (
          <button
            key={s.id}
            onClick={() => onSelectShow(s.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              active
                ? 'bg-accent text-white border-accent'
                : 'bg-card text-ink/60 border-muted hover:bg-soft'
            }`}
          >
            {s.title}
          </button>
        );
      })}
    </div>
  );
}

function EpisodePicker({ onSelect }: { onSelect: (id: string) => void }) {
  const { data } = useApp();
  const recentWatched = Object.values(data.episodes)
    .filter((e) => e.watched)
    .sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0))
    .slice(0, 10);

  return (
    <Card>
      <p className="text-sm text-ink/60 mb-3">选择一集最近看过的剧集进行训练：</p>
      {recentWatched.length === 0 ? (
        <p className="text-sm text-ink/50">还没有观看记录。先去追剧地图标记几集吧。</p>
      ) : (
        <div className="space-y-2">
          {recentWatched.map((ep) => {
            const show = data.shows.find((s) => s.id === ep.showId)!;
            return (
              <button
                key={ep.id}
                onClick={() => onSelect(ep.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-muted hover:bg-soft text-left"
              >
                <div>
                  <div className="text-sm font-medium">{show.title}</div>
                  <div className="text-xs text-ink/50">
                    S{String(ep.seasonNumber).padStart(2,'0')}E{String(ep.episodeNumber).padStart(2,'0')} · {ep.title}
                  </div>
                </div>
                <span className="text-accent">→</span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
