"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { ALL_LESSONS, getLesson } from "@/lib/lessons";

/**
 * Watches the Zustand app store and fires celebratory toasts when:
 * - A new lesson is completed (🎉 +XP)
 * - A new badge is awarded (🏅)
 * - The daily goal is met for the first time today (🎯)
 * - The streak hits a milestone (3, 7, 14, 30, 60, 100 days) (🔥)
 *
 * Pure side-effect component — renders nothing.
 */
export function ToastWatcher() {
  const lessons = useAppStore((s) => s.lessons);
  const badges = useAppStore((s) => s.badges);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const dailyGoal = useAppStore((s) => s.dailyGoal);
  const dailyGoalCompleted = useAppStore((s) => s.dailyGoalCompleted);

  // Track previously-seen values so we only fire on *changes*
  const prevLessonCount = useRef<number>(0);
  const prevBadges = useRef<string[]>([]);
  const prevStreak = useRef<number>(0);
  const prevGoalMet = useRef<boolean>(false);
  const pushToast = useToastStore((s) => s.push);

  // Wait briefly after mount so we don't fire toasts from rehydrated state.
  // Runs only on mount — refs are mutated to set the initial baseline.
  // The empty deps array is intentional; the values used inside are only
  // read once to seed refs and don't need to re-trigger this effect.
  const armedRef = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      // Initialize the baseline counts AFTER hydration so we don't
      // immediately fire toasts for already-completed lessons on reload.
      const completedCount = Object.values(lessons).filter(
        (l) => l.completed
      ).length;
      prevLessonCount.current = completedCount;
      prevBadges.current = [...badges];
      prevStreak.current = streak;
      prevGoalMet.current = dailyGoalCompleted >= dailyGoal && dailyGoal > 0;
      armedRef.current = true;
    }, 400);
    return () => clearTimeout(t);
  }, []);

  // Track lesson completions
  useEffect(() => {
    if (!armedRef.current) return;
    const completed = Object.values(lessons).filter((l) => l.completed);
    if (completed.length > prevLessonCount.current) {
      // Find the most recently completed lesson (by completedAt)
      const sorted = [...completed].sort(
        (a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)
      );
      const latest = sorted[0];
      const lesson = latest ? getLesson(latest.lessonId) : undefined;
      const xpGained = lesson
        ? (lesson.steps.find((s) => s.type === "completion") as
            | { xp?: number }
            | undefined)?.xp ?? 0
        : 0;
      pushToast({
        variant: "lesson",
        emoji: "🎉",
        title: "Lesson Complete!",
        subtitle: lesson
          ? `${lesson.title}${xpGained ? ` · +${xpGained} XP` : ""}`
          : `+XP earned`,
      });
    }
    prevLessonCount.current = completed.length;
  }, [lessons, pushToast]);

  // Track new badges
  useEffect(() => {
    if (!armedRef.current) return;
    if (badges.length > prevBadges.current.length) {
      const newBadges = badges.filter(
        (b) => !prevBadges.current.includes(b)
      );
      // Pick the first new badge for the toast
      const latest = newBadges[newBadges.length - 1];
      pushToast({
        variant: "badge",
        emoji: "🏅",
        title: "Badge Earned!",
        subtitle: latest ? prettyBadge(latest) : "New achievement unlocked",
      });
    }
    prevBadges.current = [...badges];
  }, [badges, pushToast]);

  // Track streak milestones
  useEffect(() => {
    if (!armedRef.current) return;
    if (streak > prevStreak.current) {
      const milestones = [3, 7, 14, 30, 60, 100, 365];
      if (milestones.includes(streak)) {
        pushToast({
          variant: "streak",
          emoji: "🔥",
          title: `${streak}-Day Streak!`,
          subtitle: "You're on fire — keep it up!",
        });
      }
    }
    prevStreak.current = streak;
  }, [streak, pushToast]);

  // Track daily goal completion (transitions from not-met → met)
  useEffect(() => {
    if (!armedRef.current) return;
    const goalMet = dailyGoalCompleted >= dailyGoal && dailyGoal > 0;
    if (goalMet && !prevGoalMet.current) {
      pushToast({
        variant: "goal",
        emoji: "🎯",
        title: "Daily Goal Complete!",
        subtitle: `You hit ${dailyGoal} lessons today 🙌`,
      });
    }
    prevGoalMet.current = goalMet;
  }, [dailyGoalCompleted, dailyGoal, pushToast]);

  return null;
}

function prettyBadge(badgeId: string): string {
  // Convert slug like "vowel-pioneer" → "Vowel Pioneer"
  return badgeId
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Silence unused-import warning in some lint configs
void ALL_LESSONS;
