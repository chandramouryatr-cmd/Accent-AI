// Zustand store for AccentAI mobile — mirrors the web app's store.ts but uses
// AsyncStorage for persistence. Drives onboarding state, XP, streaks, lesson
// progress, bookmarks, and the AI coach context.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Accent } from "./types";

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  completedAt: number | null;
  stepsViewed: number;
  lastReviewedAt: number | null;
  timeSpentSeconds: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AppState {
  // onboarding
  onboarded: boolean;
  accent: Accent;
  userName: string;

  // progress
  xp: number;
  streak: number;
  lastActiveDate: string;
  lessons: Record<string, LessonProgress>;
  badges: string[];
  history: { date: string; score: number; lessonId: string }[];

  // daily goals
  dailyGoal: number;
  dailyGoalCompleted: number;
  dailyGoalDate: string;

  // bookmarks
  bookmarkedLessons: string[];

  // challenge
  challengeHighScore: number;

  // chat
  chatMessages: ChatMessage[];

  // actions
  setOnboarded: (v: boolean) => void;
  setAccent: (a: Accent) => void;
  setUserName: (n: string) => void;
  completeLesson: (lessonId: string, score: number, xp: number, badge?: string) => void;
  markStepViewed: (lessonId: string) => void;
  toggleBookmark: (lessonId: string) => void;
  isBookmarked: (lessonId: string) => boolean;
  setDailyGoal: (n: number) => void;
  setChallengeHighScore: (score: number) => void;
  addXP: (amount: number, source?: string) => void;
  addChatMessage: (m: ChatMessage) => void;
  clearChat: () => void;
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
      userName: "Learner",

      xp: 0,
      streak: 0,
      lastActiveDate: "",
      lessons: {},
      badges: [],
      history: [],

      dailyGoal: 3,
      dailyGoalCompleted: 0,
      dailyGoalDate: todayStr(),

      bookmarkedLessons: [],
      challengeHighScore: 0,
      chatMessages: [],

      setOnboarded: (v) => set({ onboarded: v }),
      setAccent: (a) => set({ accent: a }),
      setUserName: (n) => set({ userName: n || "Learner" }),

      completeLesson: (lessonId, score, xp, badge) => {
        const state = get();
        const existing = state.lessons[lessonId];
        const isFirstTime = !existing?.completed;
        const newScore = existing ? Math.max(existing.score, score) : score;
        const earnedXP = isFirstTime ? xp : 0;

        const today = todayStr();
        let newStreak = state.streak;
        if (state.lastActiveDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
        } else if (state.streak === 0) {
          newStreak = 1;
        }

        const newBadges = badge && !state.badges.includes(badge)
          ? [...state.badges, badge]
          : state.badges;

        let goalCompleted = state.dailyGoalCompleted;
        if (state.dailyGoalDate !== today) {
          goalCompleted = 1;
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
              lastReviewedAt: existing?.lastReviewedAt ?? null,
              timeSpentSeconds: (existing?.timeSpentSeconds ?? 0),
            },
          },
          xp: state.xp + earnedXP,
          streak: newStreak,
          lastActiveDate: today,
          badges: newBadges,
          history: [{ date: today, score, lessonId }, ...state.history].slice(0, 50),
          dailyGoalDate: state.dailyGoalDate !== today ? today : state.dailyGoalDate,
          dailyGoalCompleted: goalCompleted,
        });
      },

      markStepViewed: (lessonId) => {
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
                lastReviewedAt: null,
                timeSpentSeconds: 0,
              },
            },
          });
        } else {
          set({
            lessons: {
              ...state.lessons,
              [lessonId]: { ...existing, stepsViewed: existing.stepsViewed + 1 },
            },
          });
        }
      },

      toggleBookmark: (lessonId) => {
        const state = get();
        const isBookmarked = state.bookmarkedLessons.includes(lessonId);
        set({
          bookmarkedLessons: isBookmarked
            ? state.bookmarkedLessons.filter((id) => id !== lessonId)
            : [...state.bookmarkedLessons, lessonId],
        });
      },

      isBookmarked: (lessonId) => get().bookmarkedLessons.includes(lessonId),

      setDailyGoal: (n) => set({ dailyGoal: Math.max(1, Math.min(10, n)) }),

      setChallengeHighScore: (score) => {
        if (score > get().challengeHighScore) set({ challengeHighScore: score });
      },

      addXP: (amount) => {
        if (amount <= 0) return;
        set({ xp: get().xp + amount });
      },

      addChatMessage: (m) => set({ chatMessages: [...get().chatMessages, m] }),
      clearChat: () => set({ chatMessages: [] }),

      resetAll: () => {
        set({
          onboarded: false,
          xp: 0,
          streak: 0,
          lastActiveDate: "",
          lessons: {},
          badges: [],
          history: [],
          dailyGoal: 3,
          dailyGoalCompleted: 0,
          dailyGoalDate: todayStr(),
          bookmarkedLessons: [],
          challengeHighScore: 0,
          chatMessages: [],
        });
      },
    }),
    {
      name: "accentai-mobile-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        accent: s.accent,
        userName: s.userName,
        xp: s.xp,
        streak: s.streak,
        lastActiveDate: s.lastActiveDate,
        lessons: s.lessons,
        badges: s.badges,
        history: s.history,
        dailyGoal: s.dailyGoal,
        dailyGoalCompleted: s.dailyGoalCompleted,
        dailyGoalDate: s.dailyGoalDate,
        bookmarkedLessons: s.bookmarkedLessons,
        challengeHighScore: s.challengeHighScore,
        chatMessages: s.chatMessages,
      }),
    }
  )
);
