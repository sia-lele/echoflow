import type { AppData, Episode, Show, Season, TrainingSession, Expression, ReviewRecord, Achievement, UserSettings } from '../types';
import { DATA_VERSION, REVIEW_INTERVALS } from '../types';
import { createInitialData } from '../data/shows';

const STORAGE_KEY = 'echoflow_data_v1';

const defaultSettings: UserSettings = {
  reducedMotion: false,
  defaultShowId: null,
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createFreshData();
    const parsed = JSON.parse(raw) as AppData;
    // migrate / normalize
    if (!parsed.version || parsed.version < DATA_VERSION) {
      return migrate(parsed);
    }
    return ensureShape(parsed);
  } catch {
    return createFreshData();
  }
}

function createFreshData(): AppData {
  const { shows, episodes } = createInitialData();
  return {
    version: DATA_VERSION,
    shows,
    episodes,
    sessions: {},
    expressions: {},
    reviews: {},
    achievements: {},
    settings: { ...defaultSettings },
  };
}

function ensureShape(data: AppData): AppData {
  const fresh = createFreshData();
  // Merge episodes so newly added episodes exist while preserving user state
  const episodes: Record<string, Episode> = { ...fresh.episodes };
  for (const [id, ep] of Object.entries(data.episodes || {})) {
    if (episodes[id]) {
      episodes[id] = { ...episodes[id], ...ep };
    } else {
      episodes[id] = ep;
    }
  }
  return {
    ...fresh,
    ...data,
    shows: data.shows && data.shows.length ? data.shows : fresh.shows,
    episodes,
    sessions: data.sessions || {},
    expressions: data.expressions || {},
    reviews: data.reviews || {},
    achievements: data.achievements || {},
    settings: { ...defaultSettings, ...(data.settings || {}) },
  };
}

function migrate(data: AppData): AppData {
  return ensureShape({ ...data, version: DATA_VERSION });
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota / private mode
  }
}

export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): AppData {
  const parsed = JSON.parse(json) as AppData;
  if (!parsed.episodes || !parsed.shows) throw new Error('Invalid data file');
  return ensureShape(parsed);
}

// ---------------- Progress calculations ----------------

export function getEpisodesOfSeason(season: Season, episodes: Record<string, Episode>): Episode[] {
  return season.episodeIds.map((id) => episodes[id]).filter(Boolean);
}

export function countWatchedInSeason(season: Season, episodes: Record<string, Episode>): number {
  return getEpisodesOfSeason(season, episodes).filter((e) => e.watched).length;
}

export function countWatchedInShow(show: Show, episodes: Record<string, Episode>): number {
  return show.seasons.reduce((sum, s) => sum + countWatchedInSeason(s, episodes), 0);
}

export function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function nextEpisodeToWatch(show: Show, episodes: Record<string, Episode>): Episode | null {
  // Find first unwatched episode in sequential order
  for (const season of show.seasons) {
    for (const epId of season.episodeIds) {
      const ep = episodes[epId];
      if (ep && !ep.watched) return ep;
    }
  }
  return null;
}

export function getLastWatchedEpisode(show: Show, episodes: Record<string, Episode>): Episode | null {
  if (show.lastWatchedEpisodeId) {
    const ep = episodes[show.lastWatchedEpisodeId];
    if (ep) return ep;
  }
  // fallback: most recent watched by watchedAt
  let latest: Episode | null = null;
  for (const season of show.seasons) {
    for (const epId of season.episodeIds) {
      const ep = episodes[epId];
      if (ep && ep.watched) {
        if (!latest || (ep.watchedAt || 0) > (latest.watchedAt || 0)) latest = ep;
      }
    }
  }
  return latest;
}

export function getContinueEpisode(show: Show, episodes: Record<string, Episode>): Episode | null {
  // Prefer the next episode after the last watched
  const last = getLastWatchedEpisode(show, episodes);
  if (last) {
    // find the season of last
    const season = show.seasons.find((s) => s.id === last.seasonId);
    if (season) {
      const idx = season.episodeIds.indexOf(last.id);
      // next in same season
      if (idx >= 0 && idx < season.episodeIds.length - 1) {
        const next = episodes[season.episodeIds[idx + 1]];
        if (next) return next;
      }
      // next season first episode
      const seasonIdx = show.seasons.indexOf(season);
      if (seasonIdx >= 0 && seasonIdx < show.seasons.length - 1) {
        const nextSeason = show.seasons[seasonIdx + 1];
        const next = episodes[nextSeason.episodeIds[0]];
        if (next) return next;
      }
    }
    // show fully watched
    return null;
  }
  return nextEpisodeToWatch(show, episodes);
}

// ---------------- Review scheduling ----------------

export function scheduleReview(expressionId: string, stage: number, now: number = Date.now()): ReviewRecord {
  const interval = REVIEW_INTERVALS[Math.min(stage, REVIEW_INTERVALS.length - 1)];
  return {
    id: `${expressionId}-review`,
    expressionId,
    reviewStage: stage,
    nextReviewAt: now + interval,
    lastReviewedAt: null,
    completedReviews: 0,
  };
}

export function getDueReviews(reviews: Record<string, ReviewRecord>, expressions: Record<string, Expression>, now: number = Date.now()): Expression[] {
  const result: Expression[] = [];
  for (const review of Object.values(reviews)) {
    if (review.nextReviewAt <= now) {
      const expr = expressions[review.expressionId];
      if (expr) result.push(expr);
    }
  }
  return result;
}

export function markReviewed(review: ReviewRecord, now: number = Date.now()): ReviewRecord {
  const nextStage = review.reviewStage + 1;
  const interval = REVIEW_INTERVALS[Math.min(nextStage, REVIEW_INTERVALS.length - 1)];
  return {
    ...review,
    reviewStage: nextStage,
    completedReviews: review.completedReviews + 1,
    lastReviewedAt: now,
    nextReviewAt: now + interval,
  };
}

// ---------------- Achievement checks ----------------

export function generateAchievementId(type: string, showId?: string, seasonId?: string): string {
  return [type, showId, seasonId].filter(Boolean).join('-');
}
