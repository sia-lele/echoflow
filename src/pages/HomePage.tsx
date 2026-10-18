import { Link, useNavigate } from 'react-router-dom';
import { useApp, countWatchedInShow, getContinueEpisode } from '../lib/AppContext';
import ProgressBar from '../components/ProgressBar';
import { Button, Card } from '../components/ui';
import { useToast } from '../components/Toast';

export default function HomePage() {
  const { data, getDueReviews } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Determine which show to continue: prefer the one with the most recent lastWatchedEpisodeId,
  // else any show with watched episodes, else the first show.
  const continueShow = (() => {
    const withLastWatched = data.shows.filter((s) => s.lastWatchedEpisodeId);
    if (withLastWatched.length > 0) {
      // pick the one with the latest watchedAt
      let best = withLastWatched[0];
      let bestTime = data.episodes[best.lastWatchedEpisodeId!]?.watchedAt || 0;
      for (const s of withLastWatched) {
        const t = data.episodes[s.lastWatchedEpisodeId!]?.watchedAt || 0;
        if (t > bestTime) { best = s; bestTime = t; }
      }
      return best;
    }
    const withWatched = data.shows.find((s) => countWatchedInShow(s, data.episodes) > 0);
    return withWatched || data.shows[0];
  })();

  const continueEp = continueShow ? getContinueEpisode(continueShow, data.episodes) : null;
  const watchedContinue = continueShow ? countWatchedInShow(continueShow, data.episodes) : 0;

  const dueReviews = getDueReviews();

  // check for in-progress training session
  const activeSession = Object.values(data.sessions).find((s) => s.status === 'in_progress');
  const activeSessionShow = activeSession
    ? data.shows.find((s) => s.id === activeSession.showId)
    : null;
  const activeSessionEpisode = activeSession
    ? data.episodes[activeSession.episodeId]
    : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <header className="flex items-start justify-between pt-2 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">EchoFlow</h1>
          <p className="text-sm text-ink/50 mt-0.5">Watch. Listen. Speak. Grow.</p>
        </div>
        <Link
          to="/settings"
          aria-label="设置"
          className="w-10 h-10 rounded-full bg-card border border-muted/60 flex items-center justify-center text-ink/60 hover:bg-soft"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      {/* Card 1: Continue Watching */}
      <Card>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink/50 mb-3">
          <span>🎬</span>
          <span>Continue Watching</span>
        </div>
        {continueEp ? (
          <>
            <h2 className="text-xl font-semibold text-ink">{continueShow.title}</h2>
            <p className="text-ink/60 mt-1">
              Season {continueEp.seasonNumber} · Episode {String(continueEp.episodeNumber).padStart(2, '0')}
            </p>
            <p className="text-xs text-ink/40 mt-0.5">
              {continueEp.title}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-ink/60">
                  已观看 {watchedContinue} / {continueShow.totalEpisodes} 集
                </span>
                <span className="font-medium">
                  {Math.round((watchedContinue / continueShow.totalEpisodes) * 100)}%
                </span>
              </div>
              <ProgressBar value={watchedContinue} max={continueShow.totalEpisodes} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="done" full onClick={() => navigate(`/episode/${continueEp.id}`)}>
                ▶️ 继续观看第 {continueEp.episodeNumber} 集
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-ink">完成啦！</h2>
            <p className="text-ink/60 mt-1">你已经看完了《{continueShow.title}》的全部剧集。</p>
            <div className="mt-4">
              <Button variant="done" full onClick={() => navigate('/watch-map')}>
                查看追剧地图
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Card 2: Today's English */}
      <Card>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink/50 mb-3">
          <span>🎧</span>
          <span>Today's English</span>
        </div>
        {activeSession ? (
          <>
            <h2 className="text-lg font-semibold text-ink">继续上次的训练</h2>
            <p className="text-ink/60 mt-1">上次进行到 STEP {activeSession.currentStep}，点击即可继续。</p>
            {activeSessionShow && activeSessionEpisode && (
              <p className="text-xs text-ink/40 mt-1">
                {activeSessionShow.title} · S{String(activeSessionEpisode.seasonNumber).padStart(2, '0')}E{String(activeSessionEpisode.episodeNumber).padStart(2, '0')}
              </p>
            )}
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="primary" full onClick={() => navigate(`/learning/${activeSession.episodeId}`)}>
                继续训练
              </Button>
              <Button variant="ghost" onClick={() => navigate('/learning')}>
                重新开始一次新训练
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-ink">今天只需要跟着步骤完成一次英语训练。</h2>
            <p className="text-ink/50 text-sm mt-1">不需要决定做什么，系统会一步步引导你。</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="primary" full onClick={() => navigate('/learning')}>
                开始英语训练
              </Button>
              <Button variant="accent" full onClick={() => navigate('/learning/mini')}>
                ⚡ 今天只做 3 分钟
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Card 3: Quick Review */}
      <Card>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink/50 mb-3">
          <span>🔁</span>
          <span>Quick Review</span>
        </div>
        {dueReviews.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold text-ink">
              今天有 {dueReviews.length} 个表达可以复习
            </h2>
            <p className="text-ink/50 text-sm mt-1">每次只看一个，很快就能完成。</p>
            <div className="mt-4">
              <Button variant="secondary" full onClick={() => navigate('/review')}>
                开始复习
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-ink">今天没有必须复习的内容。</h2>
            <p className="text-ink/50 text-sm mt-1">之前的表达都按计划复习过了。</p>
          </>
        )}
      </Card>

      {/* Card 4: Watch Map */}
      <Card>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink/50 mb-3">
          <span>🎬</span>
          <span>我的追剧地图</span>
        </div>
        <div className="space-y-2.5">
          {data.shows.map((show) => {
            const watched = countWatchedInShow(show, data.episodes);
            return (
              <div key={show.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink/70">{show.title}</span>
                  <span className="font-medium text-ink">{watched} / {show.totalEpisodes}</span>
                </div>
                <ProgressBar value={watched} max={show.totalEpisodes} />
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <Button variant="secondary" full onClick={() => navigate('/watch-map')}>
            查看我的追剧地图
          </Button>
        </div>
      </Card>
    </div>
  );
}
