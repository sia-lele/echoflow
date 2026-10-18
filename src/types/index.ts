// EchoFlow TypeScript data models

export interface Act {
  id: string;
  actNumber: number;
  watched: boolean;
}

export interface Episode {
  id: string;
  showId: string;
  seasonId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  watched: boolean;
  watchedAt: number | null;
  acts?: Act[]; // for Family Album, USA
  trainingStatus: TrainingStatus;
  trainingMode?: TrainingMode;
}

export interface Season {
  id: string;
  showId: string;
  seasonNumber: number;
  episodeCount: number;
  episodeIds: string[];
}

export interface Show {
  id: string;
  title: string;
  chineseTitle: string;
  totalEpisodes: number;
  seasons: Season[];
  lastWatchedEpisodeId: string | null;
  useActs: boolean; // Family Album uses Acts
  trainingFocus: 'listening' | 'speaking';
}

export type TrainingStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type TrainingMode = 'standard' | 'mini';

export interface TrainingSession {
  id: string;
  episodeId: string;
  showId: string;
  mode: TrainingMode;
  currentStep: number;
  completedSteps: number[];
  startedAt: number;
  completedAt: number | null;
  status: TrainingStatus;
}

export interface Expression {
  id: string;
  text: string;
  meaning: string;
  example: string;
  sourceType: 'show' | 'generic';
  showId: string;
  episodeId: string;
  createdAt: number;
}

export interface ReviewRecord {
  id: string;
  expressionId: string;
  reviewStage: number; // 0,1,2,3 - how many reviews completed
  nextReviewAt: number;
  lastReviewedAt: number | null;
  completedReviews: number;
}

export type AchievementType = 'episode_5' | 'episode_10' | 'season_completed' | 'series_completed' | 'training_10' | 'mini_5';

export interface Achievement {
  id: string;
  type: AchievementType;
  showId?: string;
  seasonId?: string;
  label: string;
  unlockedAt: number;
}

export interface UserSettings {
  reducedMotion: boolean;
  defaultShowId: string | null;
}

export interface AppData {
  version: number;
  shows: Show[];
  episodes: Record<string, Episode>;
  sessions: Record<string, TrainingSession>;
  expressions: Record<string, Expression>;
  reviews: Record<string, ReviewRecord>;
  achievements: Record<string, Achievement>;
  settings: UserSettings;
}

export const DATA_VERSION = 1;

// Review schedule: after saving expression, review at day 1, 3, 7 (intervals in ms)
export const REVIEW_INTERVALS = [
  24 * 60 * 60 * 1000,       // day 1
  2 * 24 * 60 * 60 * 1000,   // day 3 (2 days after day 1)
  4 * 24 * 60 * 60 * 1000,   // day 7 (4 days after day 3)
];

export function episodeKey(showId: string, seasonNumber: number, episodeNumber: number): string {
  return `${showId}-s${String(seasonNumber).padStart(2, '0')}e${String(episodeNumber).padStart(2, '0')}`;
}

export function seasonKey(showId: string, seasonNumber: number): string {
  return `${showId}-s${String(seasonNumber).padStart(2, '0')}`;
}
