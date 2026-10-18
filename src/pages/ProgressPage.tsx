import { Link } from 'react-router-dom';
import { useApp, countWatchedInShow } from '../lib/AppContext';
import { Card } from '../components/ui';
import ProgressBar from '../components/ProgressBar';
import type { Achievement } from '../types';

export default function ProgressPage() {
  const { data } = useApp();

  const showStats = data.shows.map((show) => ({
    title: show.title,
    watched: countWatchedInShow(show, data.episodes),
    total: show.totalEpisodes,
  }));
  const totalWatched = showStats.reduce((sum, s) => sum + s.watched, 0);

  const standardSessions = Object.values(data.sessions).filter((s) => s.mode === 'standard' && s.status === 'completed').length;
  const miniSessions = Object.values(data.sessions).filter((s) => s.mode === 'mini' && s.status === 'completed').length;

  const expressions = Object.values(data.expressions);
  const reviewedCount = Object.values(data.reviews).filter((r) => r.completedReviews > 0).length;

  const achievements = Object.values(data.achievements);

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-ink">🌱 我的成长</h1>
        <p className="text-sm text-ink/50 mt-1">记录每一次小小的进步。</p>
      </header>

      {/* Watching growth */}
      <Card>
        <h2 className="text-sm font-semibold text-ink/70 mb-3 flex items-center gap-2">
          <span>🎬</span> Episodes Watched
        </h2>
        <div className="space-y-4">
          {showStats.map((s) => (
            <ShowLine key={s.title} title={s.title} watched={s.watched} total={s.total} />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-muted/60 flex items-center justify-between">
          <span className="text-sm text-ink/60">Total Watched</span>
          <span className="text-2xl font-bold text-ink">{totalWatched} <span className="text-sm font-normal text-ink/50">Episodes</span></span>
        </div>
      </Card>

      {/* English practice growth */}
      <Card>
        <h2 className="text-sm font-semibold text-ink/70 mb-3 flex items-center gap-2">
          <span>🎧</span> English Practice
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-soft rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-ink">{standardSessions}</div>
            <div className="text-xs text-ink/50 mt-1">完整训练</div>
          </div>
          <div className="bg-soft rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-ink">{miniSessions}</div>
            <div className="text-xs text-ink/50 mt-1">3 分钟训练</div>
          </div>
        </div>
      </Card>

      {/* Expressions collected */}
      <Card>
        <h2 className="text-sm font-semibold text-ink/70 mb-3 flex items-center gap-2">
          <span>💬</span> Expressions Collected
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-soft rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-ink">{expressions.length}</div>
            <div className="text-xs text-ink/50 mt-1">已保存表达</div>
          </div>
          <div className="bg-soft rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-ink">{reviewedCount}</div>
            <div className="text-xs text-ink/50 mt-1">已复习表达</div>
          </div>
        </div>
        {expressions.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-accent">查看我的表达收藏</summary>
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {expressions.map((e) => (
                <div key={e.id} className="bg-soft rounded-lg p-3">
                  <div className="text-sm font-medium">{e.text}</div>
                  <div className="text-xs text-ink/50 mt-0.5">{e.meaning}</div>
                </div>
              ))}
            </div>
          </details>
        )}
      </Card>

      {/* Achievements */}
      <Card>
        <h2 className="text-sm font-semibold text-ink/70 mb-3 flex items-center gap-2">
          <span>🏆</span> My Achievements
        </h2>
        {achievements.length === 0 ? (
          <p className="text-sm text-ink/50 py-4 text-center">
            每完成一集、一季或一部剧，成就会自动出现在这里。
          </p>
        ) : (
          <div className="space-y-2">
            {achievements.map((a) => (
              <AchievementRow key={a.id} achievement={a} />
            ))}
          </div>
        )}
      </Card>

      <p className="text-xs text-ink/40 text-center pb-4">
        这里记录的是学习活动和进步轨迹，不等同于真实语言能力。
      </p>
    </div>
  );
}

function ShowLine({ title, watched, total }: { title: string; watched: number; total: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-ink/70">{title}</span>
        <span className="font-medium">{watched} / {total}</span>
      </div>
      <ProgressBar value={watched} max={total} />
    </div>
  );
}

function AchievementRow({ achievement }: { achievement: Achievement }) {
  const emoji = achievement.type === 'season_completed' ? '🏅' : achievement.type === 'series_completed' ? '🏆' : '🌱';
  return (
    <div className="flex items-center gap-3 bg-soft rounded-xl p-3">
      <div className="text-2xl">{emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink">{achievement.label}</div>
        <div className="text-xs text-ink/50">{new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}</div>
      </div>
    </div>
  );
}
