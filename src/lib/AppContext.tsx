import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react';
import type { AppData, Episode, Show, TrainingSession, Expression, ReviewRecord, Achievement, AchievementType, TrainingMode } from '../types';
import { loadData, saveData, getEpisodesOfSeason, countWatchedInShow, countWatchedInSeason, getContinueEpisode, scheduleReview, markReviewed, getDueReviews, generateAchievementId } from './storage';

interface AppState {
  data: AppData;
}

type Action =
  | { type: 'TOGGLE_WATCHED'; episodeId: string; now?: number }
  | { type: 'MARK_WATCHED'; episodeId: string; now?: number }
  | { type: 'TOGGLE_ACT'; episodeId: string; actId: string }
  | { type: 'SET_LAST_WATCHED'; showId: string; episodeId: string | null }
  | { type: 'SAVE_SESSION'; session: TrainingSession }
  | { type: 'COMPLETE_SESSION'; sessionId: string; now?: number }
  | { type: 'DELETE_SESSION'; sessionId: string }
  | { type: 'SAVE_EXPRESSION'; expression: Expression; now?: number }
  | { type: 'DELETE_EXPRESSION'; expressionId: string }
  | { type: 'MARK_REVIEWED'; expressionId: string; now?: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievement: Achievement }
  | { type: 'IMPORT'; data: AppData }
  | { type: 'RESET' }
  | { type: 'BATCH_MARK'; episodeIds: string[]; watched: boolean; now?: number }
  | { type: 'ADD_SHOW'; show: Show; episodes: Episode[] }
  | { type: 'DELETE_SHOW'; showId: string };

function reducer(state: AppState, action: Action): AppState {
  const { data } = state;
  switch (action.type) {
    case 'TOGGLE_WATCHED': {
      const ep = data.episodes[action.episodeId];
      if (!ep) return state;
      const now = action.now || Date.now();
      const watched = !ep.watched;
      const newEp: Episode = {
        ...ep,
        watched,
        watchedAt: watched ? now : null,
        acts: ep.acts ? ep.acts.map((a) => ({ ...a, watched })) : undefined,
      };
      const episodes = { ...data.episodes, [ep.id]: newEp };
      // update last watched show
      const shows = data.shows.map((s) =>
        s.id === ep.showId && watched ? { ...s, lastWatchedEpisodeId: ep.id } : s,
      );
      return { data: { ...data, episodes, shows } };
    }
    case 'MARK_WATCHED': {
      const ep = data.episodes[action.episodeId];
      if (!ep) return state;
      const now = action.now || Date.now();
      const newEp: Episode = {
        ...ep,
        watched: true,
        watchedAt: now,
        acts: ep.acts ? ep.acts.map((a) => ({ ...a, watched: true })) : undefined,
      };
      const episodes = { ...data.episodes, [ep.id]: newEp };
      const shows = data.shows.map((s) =>
        s.id === ep.showId ? { ...s, lastWatchedEpisodeId: ep.id } : s,
      );
      return { data: { ...data, episodes, shows } };
    }
    case 'TOGGLE_ACT': {
      const ep = data.episodes[action.episodeId];
      if (!ep || !ep.acts) return state;
      const acts = ep.acts.map((a) =>
        a.id === action.actId ? { ...a, watched: !a.watched } : a,
      );
      const allDone = acts.every((a) => a.watched);
      const newEp: Episode = {
        ...ep,
        acts,
        watched: allDone,
        watchedAt: allDone ? Date.now() : null,
      };
      const episodes = { ...data.episodes, [ep.id]: newEp };
      const shows = data.shows.map((s) =>
        s.id === ep.showId && allDone ? { ...s, lastWatchedEpisodeId: ep.id } : s,
      );
      return { data: { ...data, episodes, shows } };
    }
    case 'SET_LAST_WATCHED': {
      const shows = data.shows.map((s) =>
        s.id === action.showId ? { ...s, lastWatchedEpisodeId: action.episodeId } : s,
      );
      return { data: { ...data, shows } };
    }
    case 'SAVE_SESSION': {
      const sessions = { ...data.sessions, [action.session.id]: action.session };
      return { data: { ...data, sessions } };
    }
    case 'COMPLETE_SESSION': {
      const sess = data.sessions[action.sessionId];
      if (!sess) return state;
      const now = action.now || Date.now();
      const sessions = {
        ...data.sessions,
        [sess.id]: { ...sess, status: 'completed' as const, completedAt: now },
      };
      // mark episode training completed
      const ep = data.episodes[sess.episodeId];
      const episodes = ep
        ? { ...data.episodes, [ep.id]: { ...ep, trainingStatus: 'completed' as const, trainingMode: sess.mode } }
        : data.episodes;
      return { data: { ...data, sessions, episodes } };
    }
    case 'DELETE_SESSION': {
      const sessions = { ...data.sessions };
      delete sessions[action.sessionId];
      return { data: { ...data, sessions } };
    }
    case 'SAVE_EXPRESSION': {
      const now = action.now || Date.now();
      const expressions = { ...data.expressions, [action.expression.id]: action.expression };
      const reviewId = `${action.expression.id}-review`;
      const reviews = { ...data.reviews, [reviewId]: scheduleReview(action.expression.id, 0, now) };
      return { data: { ...data, expressions, reviews } };
    }
    case 'DELETE_EXPRESSION': {
      const expressions = { ...data.expressions };
      delete expressions[action.expressionId];
      const reviews = { ...data.reviews };
      delete reviews[`${action.expressionId}-review`];
      return { data: { ...data, expressions, reviews } };
    }
    case 'MARK_REVIEWED': {
      const reviewId = `${action.expressionId}-review`;
      const review = data.reviews[reviewId];
      if (!review) return state;
      const reviews = { ...data.reviews, [reviewId]: markReviewed(review, action.now) };
      return { data: { ...data, reviews } };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      if (data.achievements[action.achievement.id]) return state;
      const achievements = { ...data.achievements, [action.achievement.id]: action.achievement };
      return { data: { ...data, achievements } };
    }
    case 'IMPORT':
      return { data: action.data };
    case 'RESET':
      return { data: loadData() };
    case 'BATCH_MARK': {
      const now = action.now || Date.now();
      const episodes = { ...data.episodes };
      const watched = action.watched;
      action.episodeIds.forEach((id) => {
        const ep = episodes[id];
        if (ep) {
          episodes[id] = {
            ...ep,
            watched,
            watchedAt: watched ? now : null,
            acts: ep.acts ? ep.acts.map((a) => ({ ...a, watched })) : undefined,
          };
        }
      });
      return { data: { ...data, episodes } };
    }
    case 'ADD_SHOW': {
      const episodes = { ...data.episodes };
      action.episodes.forEach((e) => {
        episodes[e.id] = e;
      });
      const shows = [...data.shows, action.show];
      return { data: { ...data, shows, episodes } };
    }
    case 'DELETE_SHOW': {
      const show = data.shows.find((s) => s.id === action.showId);
      if (!show) return state;
      const episodes = { ...data.episodes };
      show.seasons.forEach((s) => {
        s.episodeIds.forEach((id) => delete episodes[id]);
      });
      const shows = data.shows.filter((s) => s.id !== action.showId);
      const sessions = Object.fromEntries(
        Object.entries(data.sessions).filter(([, sess]) => sess.showId !== action.showId),
      );
      const expressions = Object.fromEntries(
        Object.entries(data.expressions).filter(([, expr]) => expr.showId !== action.showId),
      );
      const exprIds = new Set(Object.keys(expressions));
      const reviews = Object.fromEntries(
        Object.entries(data.reviews).filter(([, r]) => exprIds.has(r.expressionId)),
      );
      const achievements = Object.fromEntries(
        Object.entries(data.achievements).filter(([, a]) => a.showId !== action.showId),
      );
      return { data: { ...data, shows, episodes, sessions, expressions, reviews, achievements } };
    }
    default:
      return state;
  }
}

interface AppContextValue {
  data: AppData;
  toggleWatched: (episodeId: string) => void;
  markWatched: (episodeId: string) => void;
  toggleAct: (episodeId: string, actId: string) => void;
  setLastWatched: (showId: string, episodeId: string | null) => void;
  saveSession: (session: TrainingSession) => void;
  completeSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  saveExpression: (expr: Omit<Expression, 'id' | 'createdAt'>) => Expression;
  deleteExpression: (id: string) => void;
  markReviewed: (expressionId: string) => void;
  unlockAchievement: (achievement: Omit<Achievement, 'unlockedAt'>) => void;
  importData: (data: AppData) => void;
  resetData: () => void;
  batchMark: (episodeIds: string[], watched: boolean) => void;
  addShow: (show: Show, episodes: Episode[]) => void;
  deleteShow: (showId: string) => void;
  // helpers
  getShow: (id: string) => Show | undefined;
  getEpisode: (id: string) => Episode | undefined;
  getDueReviews: () => Expression[];
  getSessionForEpisode: (episodeId: string) => TrainingSession | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ data: loadData() }));
  const stateRef = useRef(state);
  stateRef.current = state;

  // persist
  useEffect(() => {
    saveData(state.data);
  }, [state.data]);

  const toggleWatched = useCallback((episodeId: string) => {
    dispatch({ type: 'TOGGLE_WATCHED', episodeId });
  }, []);

  const markWatched = useCallback((episodeId: string) => {
    dispatch({ type: 'MARK_WATCHED', episodeId });
  }, []);

  const toggleAct = useCallback((episodeId: string, actId: string) => {
    dispatch({ type: 'TOGGLE_ACT', episodeId, actId });
  }, []);

  const setLastWatched = useCallback((showId: string, episodeId: string | null) => {
    dispatch({ type: 'SET_LAST_WATCHED', showId, episodeId });
  }, []);

  const saveSession = useCallback((session: TrainingSession) => {
    dispatch({ type: 'SAVE_SESSION', session });
  }, []);

  const completeSession = useCallback((sessionId: string) => {
    dispatch({ type: 'COMPLETE_SESSION', sessionId });
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    dispatch({ type: 'DELETE_SESSION', sessionId });
  }, []);

  const saveExpression = useCallback((expr: Omit<Expression, 'id' | 'createdAt'>) => {
    const full: Expression = {
      ...expr,
      id: `expr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };
    dispatch({ type: 'SAVE_EXPRESSION', expression: full });
    return full;
  }, []);

  const deleteExpression = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EXPRESSION', expressionId: id });
  }, []);

  const markReviewed = useCallback((expressionId: string) => {
    dispatch({ type: 'MARK_REVIEWED', expressionId });
  }, []);

  const unlockAchievement = useCallback((achievement: Omit<Achievement, 'unlockedAt'>) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievement: { ...achievement, unlockedAt: Date.now() } });
  }, []);

  const importData = useCallback((data: AppData) => {
    dispatch({ type: 'IMPORT', data });
  }, []);

  const resetData = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const batchMark = useCallback((episodeIds: string[], watched: boolean) => {
    dispatch({ type: 'BATCH_MARK', episodeIds, watched });
  }, []);

  const addShow = useCallback((show: Show, episodes: Episode[]) => {
    dispatch({ type: 'ADD_SHOW', show, episodes });
  }, []);

  const deleteShow = useCallback((showId: string) => {
    dispatch({ type: 'DELETE_SHOW', showId });
  }, []);

  const value: AppContextValue = {
    data: state.data,
    toggleWatched,
    markWatched,
    toggleAct,
    setLastWatched,
    saveSession,
    completeSession,
    deleteSession,
    saveExpression,
    deleteExpression,
    markReviewed,
    unlockAchievement,
    importData,
    resetData,
    batchMark,
    addShow,
    deleteShow,
    getShow: (id) => state.data.shows.find((s) => s.id === id),
    getEpisode: (id) => state.data.episodes[id],
    getDueReviews: () => getDueReviews(state.data.reviews, state.data.expressions),
    getSessionForEpisode: (episodeId) =>
      Object.values(state.data.sessions).find((s) => s.episodeId === episodeId && s.status !== 'completed'),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// Re-export progress helpers for components
export { getEpisodesOfSeason, countWatchedInShow, countWatchedInSeason, getContinueEpisode, getDueReviews, generateAchievementId };
