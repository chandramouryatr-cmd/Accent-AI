"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Accent } from "./types";

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number; // 0-100 best score
  completedAt: number | null;
  stepsViewed: number;
}

export interface AppState {
  // onboarding
  onboarded: boolean;
  accent: Accent;
  userName: string;

  // progress
  xp: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  speakingSecondsToday: number;
  speakingDate: string; // YYYY-MM-DD for daily reset
  lessons: Record<string, LessonProgress>;
  badges: string[]; // earned badge ids
  history: { date: string; score: number; lessonId: string }[];

  // daily goals
  dailyGoal: number; // lessons per day target
  dailyGoalCompleted: number; // lessons completed today
  dailyGoalDate: string; // YYYY-MM-DD for daily reset

  // bookmarks
  bookmarkedLessons: string[]; // array of lesson IDs

  // ui
  activeTab: "dashboard" | "journey" | "practice" | "progress" | "more";
  activeLessonId: string | null;
  expandedPhase: number | null;

  // actions
  setOnboarded: (v: boolean) => void;
  setAccent: (a: Accent) => void;
  setUserName: (n: string) => void;
  setActiveTab: (t: AppState["activeTab"]) => void;
  setActiveLesson: (id: string | null) => void;
  setExpandedPhase: (i: number | null) => void;

  completeLesson: (lessonId: string, score: number, xp: number, badge?: string) => void;
  markStepViewed: (lessonId: string, totalSteps: number) => void;
  addSpeakingTime: (seconds: number) => void;
  setDailyGoal: (n: number) => void;
  toggleBookmark: (lessonId: string) => void;
  isBookmarked: (lessonId: string) => boolean;
  resetAll: () => void;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      accent: "usa",
      userName: "Alex",

      xp: 0,
      streak: 0,
      lastActiveDate: "",
      speakingSecondsToday: 0,
      speakingDate: todayStr(),
      lessons: {},
      badges: [],
      history: [],

      dailyGoal: 3,
      dailyGoalCompleted: 0,
      dailyGoalDate: todayStr(),

      bookmarkedLessons: [],

      activeTab: "dashboard",
      activeLessonId: null,
      expandedPhase: null,

      setOnboarded: (v) => set({ onboarded: v }),
      setAccent: (a) => set({ accent: a }),
      setUserName: (n) => set({ userName: n }),
      setActiveTab: (t) => set({ activeTab: t }),
      setActiveLesson: (id) => set({ activeLessonId: id }),
      setExpandedPhase: (i) => set({ expandedPhase: i }),

      completeLesson: (lessonId, score, xp, badge) => {
        const state = get();
        const existing = state.lessons[lessonId];
        // only award XP the first time
        const isFirstTime = !existing?.completed;
        const newScore = existing ? Math.max(existing.score, score) : score;

        // streak logic
        const today = todayStr();
        let newStreak = state.streak;
        if (state.lastActiveDate !== today) {
          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .slice(0, 10);
          if (state.lastActiveDate === yesterday) {
            newStreak = state.streak + 1;
          } else {
            newStreak = 1;
          }
        } else if (state.streak === 0) {
          newStreak = 1;
        }

        const newBadges = badge && !state.badges.includes(badge)
          ? [...state.badges, badge]
          : state.badges;

        // daily goal logic — reset if new day, increment if first completion today
        let goalDate = state.dailyGoalDate;
        let goalCompleted = state.dailyGoalCompleted;
        if (goalDate !== today) {
          goalDate = today;
          goalCompleted = 1; // this is the first lesson completed today
        } else if (isFirstTime) {
          goalCompleted = state.dailyGoalCompleted + 1;
        }

        set({
          lessons: {
            ...state.lessons,
            [lessonId]: {
              lessonId,
              completed: true,
              score: newScore,
              completedAt: Date.now(),
              stepsViewed: existing?.stepsViewed ?? 0,
            },
          },
          xp: state.xp + (isFirstTime ? xp : 0),
          streak: newStreak,
          lastActiveDate: today,
          badges: newBadges,
          history: [
            { date: today, score, lessonId },
            ...state.history,
          ].slice(0, 50),
          dailyGoalDate: goalDate,
          dailyGoalCompleted: goalCompleted,
        });
      },

      markStepViewed: (lessonId, _totalSteps) => {
        const state = get();
        const existing = state.lessons[lessonId];
        if (!existing) {
          set({
            lessons: {
              ...state.lessons,
              [lessonId]: {
                lessonId,
                completed: false,
                score: 0,
                completedAt: null,
                stepsViewed: 1,
              },
            },
          });
        } else {
          set({
            lessons: {
              ...state.lessons,
              [lessonId]: {
                ...existing,
                stepsViewed: Math.max(existing.stepsViewed, existing.stepsViewed + 1),
              },
            },
          });
        }
      },

      addSpeakingTime: (seconds) => {
        const state = get();
        const today = todayStr();
        if (state.speakingDate !== today) {
          set({ speakingDate: today, speakingSecondsToday: seconds });
        } else {
          set({ speakingSecondsToday: state.speakingSecondsToday + seconds });
        }
      },

      setDailyGoal: (n) => set({ dailyGoal: Math.max(1, Math.min(10, n)) }),

      toggleBookmark: (lessonId) => {
        const state = get();
        const isCurrentlyBookmarked = state.bookmarkedLessons.includes(lessonId);
        set({
          bookmarkedLessons: isCurrentlyBookmarked
            ? state.bookmarkedLessons.filter((id) => id !== lessonId)
            : [...state.bookmarkedLessons, lessonId],
        });
      },

      isBookmarked: (lessonId) => {
        return get().bookmarkedLessons.includes(lessonId);
      },

      resetAll: () => {
        set({
          onboarded: false,
          xp: 0,
          streak: 0,
          lastActiveDate: "",
          speakingSecondsToday: 0,
          speakingDate: todayStr(),
          lessons: {},
          badges: [],
          history: [],
          dailyGoal: 3,
          dailyGoalCompleted: 0,
          dailyGoalDate: todayStr(),
          bookmarkedLessons: [],
          activeLessonId: null,
          expandedPhase: null,
          activeTab: "dashboard",
        });
      },
    }),
    {
      name: "accentai-store",
      partialize: (s) => ({
        onboarded: s.onboarded,
        accent: s.accent,
        userName: s.userName,
        xp: s.xp,
        streak: s.streak,
        lastActiveDate: s.lastActiveDate,
        speakingSecondsToday: s.speakingSecondsToday,
        speakingDate: s.speakingDate,
        lessons: s.lessons,
        badges: s.badges,
        history: s.history,
        dailyGoal: s.dailyGoal,
        dailyGoalCompleted: s.dailyGoalCompleted,
        dailyGoalDate: s.dailyGoalDate,
        bookmarkedLessons: s.bookmarkedLessons,
      }),
    }
  )
);

// ─── Derived helpers ───

export function usePhaseProgress(phaseId: number, lessonIds: string[]) {
  const lessons = useAppStore((s) => s.lessons);
  const total = lessonIds.length;
  const done = lessonIds.filter((id) => lessons[id]?.completed).length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function useOverallProgress(allLessonIds: string[]) {
  const lessons = useAppStore((s) => s.lessons);
  const total = allLessonIds.length;
  const done = allLessonIds.filter((id) => lessons[id]?.completed).length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}
