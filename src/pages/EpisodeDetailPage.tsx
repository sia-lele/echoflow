import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp, countWatchedInShow, getContinueEpisode } from '../lib/AppContext';
import { Button, Card, Chip } from '../components/ui';
import ProgressBar from '../components/ProgressBar';
import { useToast } from '../components/Toast';
import { useState } from 'react';

export default function EpisodeDetailPage() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const { data, markWatched, toggleAct, toggleWatched } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [justCompleted, setJustCompleted] = useState(false);

  const ep = episodeId ? data.episodes[episodeId] : undefined;
  if (!ep) {
    return (
      <div className="text-center py-20 text-ink/50">
        <p>未找到该集。</p>
        <Link to="/watch-map" className="text-accent mt-2 inline-block">返回追剧地图</Link>
      </div>
    );
  }

  const show = data.shows.find((s) => s.id === ep.showId)!;
  const season = show.seasons.find((s) => s.id === ep.seasonId)!;
  const watched = countWatchedInShow(show, data.episodes);
  const continueEp = getContinueEpisode(show, data.episodes);

  const handleMarkWatched = () => {
    markWatched(ep.id);
    setJustCompleted(true);
    showToast('又点亮了一集！', '✨');
  };

  const handleNextEpisode = () => {
    if (continueEp) navigate(`/episode/${continueEp.id}`);
  };

  if (justCompleted && ep.watched) {
    return (
      <div className="space-y-4 animate-fade-in pt-4">
        <Card className="text-center py-8">
          <div className="text-5xl mb-3">✨</div>
          <h2 className="text-xl font-bold text-ink mb-1">这一集看完啦！</h2>
          <p className="text-ink/60 mb-1">{show.title}</p>
          <p className="text-ink/50 text-sm">
            S{String(ep.seasonNumber).padStart(2, '0')}E{String(ep.episodeNumber).padStart(2, '0')}
          </p>
          <div className="mt-4">
            <ProgressBar value={watched} max={show.totalEpisodes} />
            <p className="text-sm text-ink/60 mt-2">{watched} / {show.totalEpisodes} 集</p>
          </div>
          <div className="mt-6 space-y-2">
            {continueEp && (
              <Button variant="primary" full onClick={handleNextEpisode}>
                ▶️ 继续下一集 (S{continueEp.seasonNumber}E{String(continueEp.episodeNumber).padStart(2,'0')})
              </Button>
            )}
            <Button variant="accent" full onClick={() => navigate(`/learning/${ep.id}`)}>
              🎧 开始本集英语训练
            </Button>
            <Button variant="ghost" full onClick={() => navigate('/')}>
              🏠 返回首页
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="pt-2">
        <Link to="/watch-map" className="text-sm text-accent hover:underline">← 返回追剧地图</Link>
      </div>

      <Card>
        <div className="text-xs text-ink/50 uppercase tracking-wide">{show.title}</div>
        <h1 className="text-xl font-bold text-ink mt-1">
          Season {ep.seasonNumber} · Episode {String(ep.episodeNumber).padStart(2, '0')}
        </h1>
        <p className="text-sm text-ink/50 mt-1">{ep.title}</p>
        <p className="text-xs text-ink/40 mt-0.5 font-mono">
          S{String(ep.seasonNumber).padStart(2, '0')}E{String(ep.episodeNumber).padStart(2, '0')}
        </p>
      </Card>

      {/* Status */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink/70">观看状态</span>
            {ep.watched ? <Chip color="done">✅ 已观看</Chip> : <Chip>◯ 尚未观看</Chip>}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink/70">英语训练</span>
            {ep.trainingStatus === 'completed' ? (
              <Chip color="done">✅ 已训练</Chip>
            ) : ep.trainingStatus === 'in_progress' ? (
              <Chip color="accent">⏳ 进行中</Chip>
            ) : (
              <Chip>◯ 尚未训练</Chip>
            )}
          </div>
        </div>
      </Card>

      {/* Acts for Family Album */}
      {show.useActs && ep.acts && (
        <Card>
          <h3 className="text-sm font-semibold mb-3">分集进度</h3>
          <div className="space-y-2">
            {ep.acts.map((act) => (
              <button
                key={act.id}
                onClick={() => toggleAct(ep.id, act.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-muted hover:bg-soft text-left"
              >
                <span className="text-sm">Act {act.actNumber}</span>
                {act.watched ? (
                  <span className="text-done text-sm">✓ 已完成</span>
                ) : (
                  <span className="text-ink/40 text-sm">未完成</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink/50 mt-3">
            三幕全部完成时，整集会自动标记为已观看。
          </p>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {!ep.watched ? (
          <Button variant="done" full onClick={handleMarkWatched}>
            ✅ 我已经看完了
          </Button>
        ) : (
          <Button variant="secondary" full onClick={() => { toggleWatched(ep.id); showToast('已撤销观看标记', '↩️'); }}>
            ↩️ 撤销观看标记
          </Button>
        )}
        <Button variant="accent" full onClick={() => navigate(`/learning/${ep.id}`)}>
          🎧 进行本集英语训练
        </Button>
      </div>

      {/* Extra info (collapsed by default) */}
      <Card>
        <details className="text-sm">
          <summary className="cursor-pointer text-ink/70 font-medium">观看记录</summary>
          <div className="mt-3 text-ink/50 text-sm space-y-1">
            <p>观看状态：{ep.watched ? '已观看' : '未观看'}</p>
            {ep.watchedAt && (
              <p>观看时间：{new Date(ep.watchedAt).toLocaleString('zh-CN')}</p>
            )}
            <p>训练状态：{ep.trainingStatus}</p>
          </div>
        </details>
      </Card>
    </div>
  );
}
