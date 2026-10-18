import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, countWatchedInShow, countWatchedInSeason, getEpisodesOfSeason } from '../lib/AppContext';
import ProgressBar from '../components/ProgressBar';
import EpisodeCircle from '../components/EpisodeCircle';
import { Button, Card, Chip } from '../components/ui';
import { useToast } from '../components/Toast';
import { buildCustomShow, slugify } from '../data/shows';
import type { Episode, Season, Show } from '../types';
import { generateAchievementId } from '../lib/storage';

export default function WatchMapPage() {
  const { data, toggleWatched, unlockAchievement, deleteShow } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // expanded season per show: showId -> seasonNumber (-1 = none)
  const [expandedSeasons, setExpandedSeasons] = useState<Record<string, number>>({});
  const [importShowId, setImportShowId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const setExpanded = (showId: string, seasonNumber: number) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [showId]: prev[showId] === seasonNumber ? -1 : seasonNumber,
    }));
  };

  const handleToggle = (ep: Episode) => {
    toggleWatched(ep.id);
    if (!ep.watched) {
      showToast('又点亮了一集！', '✨');
      const show = data.shows.find((s) => s.id === ep.showId);
      const season = show?.seasons.find((s) => s.id === ep.seasonId);
      if (season && show) {
        const remaining = getEpisodesOfSeason(season, data.episodes).filter((e) => !e.watched && e.id !== ep.id).length;
        if (remaining === 0) {
          unlockAchievement({
            id: generateAchievementId('season_completed', show.id, season.id),
            type: 'season_completed',
            showId: show.id,
            seasonId: season.id,
            label: `${show.title} Season ${season.seasonNumber} 完成`,
          });
          showToast(`Season ${season.seasonNumber} 全部完成！`, '🏅');
        }
        const totalRemaining = show.seasons.reduce(
          (sum, s) => sum + getEpisodesOfSeason(s, data.episodes).filter((e) => !e.watched).length,
          0,
        );
        if (totalRemaining === 0) {
          unlockAchievement({
            id: generateAchievementId('series_completed', show.id),
            type: 'series_completed',
            showId: show.id,
            label: `${show.title} 全部完成`,
          });
          showToast(`你看完了《${show.title}》全部 ${show.totalEpisodes} 集！`, '🏆');
        }
      }
    }
  };

  const handleDeleteShow = (show: Show) => {
    if (confirm(`确定删除《${show.title}》吗？所有观看记录、训练和表达都会被删除，此操作不可撤销。`)) {
      deleteShow(show.id);
      showToast(`已删除《${show.title}》`, '🗑️');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="pt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">🎬 我的追剧地图</h1>
          <p className="text-sm text-ink/50 mt-1">Every episode counts. 每一集，都是一点点进步。</p>
        </div>
      </header>

      {data.shows.map((show) => {
        const watched = countWatchedInShow(show, data.episodes);
        return (
          <ShowSection
            key={show.id}
            show={show}
            watched={watched}
            expandedSeason={expandedSeasons[show.id] ?? 1}
            setExpandedSeason={(n) => setExpanded(show.id, n)}
            onToggle={handleToggle}
            onImport={() => setImportShowId(show.id)}
            onDelete={() => handleDeleteShow(show)}
          />
        );
      })}

      {/* Add new show */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full border-2 border-dashed border-muted rounded-2xl py-6 text-ink/50 hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-xl">＋</span>
        <span className="font-medium">添加新的原声剧</span>
      </button>

      {importShowId && (
        <ImportModal
          show={data.shows.find((s) => s.id === importShowId)!}
          onClose={() => setImportShowId(null)}
        />
      )}

      {showAddModal && (
        <AddShowModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function ShowSection({
  show,
  watched,
  expandedSeason,
  setExpandedSeason,
  onToggle,
  onImport,
  onDelete,
}: {
  show: Show;
  watched: number;
  expandedSeason: number;
  setExpandedSeason: (n: number) => void;
  onToggle: (ep: Episode) => void;
  onImport: () => void;
  onDelete: () => void;
}) {
  const { data } = useApp();
  const pct = Math.round((watched / show.totalEpisodes) * 100);
  const seasonWord = show.seasons.length === 1 ? 'Season' : 'Seasons';
  const actsNote = show.useActs ? ' · 3 Acts per Episode' : '';

  return (
    <section>
      <Card>
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{show.title}</h2>
            <p className="text-xs text-ink/50">
              {show.seasons.length} {seasonWord} · {show.totalEpisodes} Episodes{actsNote}
            </p>
            {show.chineseTitle && show.chineseTitle !== show.title && (
              <p className="text-xs text-ink/40">{show.chineseTitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <button
              onClick={onImport}
              className="text-xs text-accent font-medium hover:underline"
            >
              补录
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-ink/40 hover:text-red-500"
              aria-label="删除该剧"
            >
              删除
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-ink/60">已观看：{watched} / {show.totalEpisodes}</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <ProgressBar value={watched} max={show.totalEpisodes} />
      </Card>

      {/* Season table */}
      <div className="mt-4 bg-card rounded-2xl border border-muted/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-muted/60 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink/70">季度进度</span>
        </div>
        <div className="divide-y divide-muted/40">
          {show.seasons.map((season) => {
            const seasonWatched = countWatchedInSeason(season, data.episodes);
            const seasonPct = Math.round((seasonWatched / season.episodeCount) * 100);
            const expanded = expandedSeason === season.seasonNumber;
            const completed = seasonWatched === season.episodeCount;
            return (
              <div key={season.id}>
                <button
                  onClick={() => setExpandedSeason(expanded ? -1 : season.seasonNumber)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-soft/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">Season {season.seasonNumber}</span>
                      {completed && <Chip color="done">🏅 已完成</Chip>}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar value={seasonWatched} max={season.episodeCount} height="h-1.5" />
                      <span className="text-xs text-ink/50 w-12 text-right shrink-0">
                        {seasonWatched}/{season.episodeCount}
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-ink/40 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expanded && (
                  <div className="px-4 py-4 bg-soft/30 border-t border-muted/40">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">
                        Season {season.seasonNumber} · {seasonWatched} / {season.episodeCount} 已完成
                      </span>
                      <span className="text-xs text-ink/50">{seasonPct}%</span>
                    </div>
                    <EpisodeGridSeason
                      season={season}
                      onToggle={onToggle}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 bg-soft/50 flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">TOTAL</span>
          <span className="text-ink/70">{watched} / {show.totalEpisodes} · {pct}%</span>
        </div>
      </div>
    </section>
  );
}

function EpisodeGridSeason({ season, onToggle }: { season: Season; onToggle: (ep: Episode) => void }) {
  const { data } = useApp();
  const episodes = getEpisodesOfSeason(season, data.episodes);
  return (
    <div className="grid gap-2.5 justify-items-center" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
      {episodes.map((ep) => (
        <div key={ep.id} className="flex flex-col items-center gap-1">
          <EpisodeCircle
            number={ep.episodeNumber}
            watched={ep.watched}
            onClick={() => onToggle(ep)}
            size={42}
          />
          <Link
            to={`/episode/${ep.id}`}
            className="text-[10px] text-ink/40 hover:text-accent"
            onClick={(e) => e.stopPropagation()}
          >
            {String(ep.episodeNumber).padStart(2, '0')}
          </Link>
        </div>
      ))}
    </div>
  );
}

function AddShowModal({ onClose }: { onClose: () => void }) {
  const { data, addShow } = useApp();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [chineseTitle, setChineseTitle] = useState('');
  const [seasonCounts, setSeasonCounts] = useState('22');
  const [useActs, setUseActs] = useState(false);
  const [focus, setFocus] = useState<'listening' | 'speaking'>('listening');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('请输入剧集名称');
      return;
    }
    const counts = seasonCounts
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);
    if (counts.length === 0) {
      setError('请输入每季度的集数，例如 22,22,21');
      return;
    }
    const id = slugify(trimmedTitle) + '-' + Date.now().toString(36);
    // make sure id is unique
    let finalId = id;
    let i = 1;
    while (data.shows.some((s) => s.id === finalId)) {
      finalId = `${id}-${i++}`;
    }
    const { show, episodes } = buildCustomShow({
      id: finalId,
      title: trimmedTitle,
      chineseTitle: chineseTitle.trim(),
      seasonEpisodeCounts: counts,
      useActs,
      trainingFocus: focus,
    });
    addShow(show, episodes);
    showToast(`已添加《${trimmedTitle}》`, '🎉');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md p-5 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-1">添加新的原声剧</h3>
        <p className="text-sm text-ink/50 mb-4">填写基本信息，就可以开始追剧了。</p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-ink/70">剧集名称（英文）</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：Friends"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-muted text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">中文名（可选）</label>
            <input
              type="text"
              value={chineseTitle}
              onChange={(e) => setChineseTitle(e.target.value)}
              placeholder="例如：老友记"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-muted text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">每季集数</label>
            <p className="text-xs text-ink/40 mt-0.5">用逗号分隔各季集数。例如 22,22,21 表示 3 季，分别 22、22、21 集。</p>
            <input
              type="text"
              value={seasonCounts}
              onChange={(e) => setSeasonCounts(e.target.value)}
              placeholder="22,22,21"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-muted text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">训练侧重点</label>
            <div className="mt-1 flex gap-2">
              <button
                onClick={() => setFocus('listening')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                  focus === 'listening' ? 'bg-accent text-white border-accent' : 'bg-card text-ink/70 border-muted'
                }`}
              >
                侧重听力理解
              </button>
              <button
                onClick={() => setFocus('speaking')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                  focus === 'speaking' ? 'bg-accent text-white border-accent' : 'bg-card text-ink/70 border-muted'
                }`}
              >
                侧重口语表达
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer">
            <input
              type="checkbox"
              checked={useActs}
              onChange={(e) => setUseActs(e.target.checked)}
              className="w-4 h-4 rounded border-muted"
            />
            <span>每集包含多个 Act（如《走遍美国》每集 3 幕）</span>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-5 space-y-2">
          <Button variant="done" full onClick={handleSubmit}>添加剧集</Button>
          <Button variant="ghost" full onClick={onClose}>取消</Button>
        </div>
      </div>
    </div>
  );
}

function ImportModal({ show, onClose }: { show: Show; onClose: () => void }) {
  const { batchMark } = useApp();
  const [mode, setMode] = useState<'season' | 'upto' | null>(null);
  const [uptoSeason, setUptoSeason] = useState(1);
  const [uptoEpisode, setUptoEpisode] = useState(1);

  const markSeason = (seasonNumber: number, watched: boolean) => {
    const season = show.seasons.find((s) => s.seasonNumber === seasonNumber);
    if (!season) return;
    batchMark(season.episodeIds, watched);
    onClose();
  };

  const markUpto = () => {
    const ids: string[] = [];
    for (const s of show.seasons) {
      if (s.seasonNumber < uptoSeason) {
        ids.push(...s.episodeIds);
      } else if (s.seasonNumber === uptoSeason) {
        ids.push(...s.episodeIds.slice(0, uptoEpisode));
      }
    }
    batchMark(ids, true);
    onClose();
  };

  const currentSeason = show.seasons.find((s) => s.seasonNumber === uptoSeason);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md p-5 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-1">补录观看进度</h3>
        <p className="text-sm text-ink/50 mb-4">选择一种方式快速标记已经看过的集数。</p>

        <div className="space-y-2">
          <Button variant="secondary" full onClick={() => setMode('season')}>
            按季度批量标记
          </Button>
          <Button variant="secondary" full onClick={() => setMode('upto')}>
            我看到了某一集
          </Button>
        </div>

        {mode === 'season' && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-ink/60">点击季度将其全部标记为已观看：</p>
            {show.seasons.map((s) => (
              <button
                key={s.id}
                onClick={() => markSeason(s.seasonNumber, true)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-muted hover:bg-soft text-left"
              >
                <span className="text-sm">Season {s.seasonNumber}</span>
                <span className="text-xs text-ink/50">{s.episodeCount} 集</span>
              </button>
            ))}
          </div>
        )}

        {mode === 'upto' && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <select
                value={uptoSeason}
                onChange={(e) => { setUptoSeason(Number(e.target.value)); setUptoEpisode(1); }}
                className="flex-1 px-3 py-2 rounded-lg border border-muted text-sm"
              >
                {show.seasons.map((s) => (
                  <option key={s.id} value={s.seasonNumber}>Season {s.seasonNumber}</option>
                ))}
              </select>
              <select
                value={uptoEpisode}
                onChange={(e) => setUptoEpisode(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-lg border border-muted text-sm"
              >
                {currentSeason?.episodeIds.map((_, i) => (
                  <option key={i} value={i + 1}>Episode {i + 1}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-ink/50">
              将标记 Season 1 到 Season {uptoSeason} 第 {uptoEpisode} 集之前的所有集数为已观看。
            </p>
            <Button variant="done" full onClick={markUpto}>确认标记</Button>
          </div>
        )}

        <div className="mt-4">
          <Button variant="ghost" full onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  );
}
