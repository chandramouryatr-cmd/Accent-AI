// Journey — phase-by-phase lesson roadmap. Mirrors the web app's journey view.

import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronDown, Lock, Check, Clock, Star } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { PHASES, getLessonDifficulty, type LessonDifficulty } from "@/lib/types";
import { getLessonsForPhase, lessonIdFor } from "@/lib/lessons";
import { colors, typography } from "@/lib/theme";

const DIFFICULTY_COLORS: Record<LessonDifficulty, string> = {
  easy: "#10b981",
  medium: "#f59e0b",
  hard: "#ef4444",
};

export default function Journey() {
  const lessons = useAppStore((s) => s.lessons);
  const [expanded, setExpanded] = useState<number | null>(0);
  const router = useRouter();

  // A phase is unlocked if the previous phase has all lessons completed
  const isPhaseUnlocked = (phaseId: number): boolean => {
    if (phaseId === 0) return true;
    const prevPhaseLessons = getLessonsForPhase(phaseId - 1);
    return prevPhaseLessons.every((l) => lessons[l.id]?.completed);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
        <Text style={[typography.h1, { marginBottom: 4 }]}>Your Journey</Text>
        <Text style={[typography.body, { color: colors.muted, marginBottom: 24 }]}>
          8 phases · 32 lessons · {PHASES.reduce((acc, p) => acc + p.xp, 0)} XP to earn
        </Text>

        {PHASES.map((phase) => {
          const phaseLessons = getLessonsForPhase(phase.id);
          const done = phaseLessons.filter((l) => lessons[l.id]?.completed).length;
          const unlocked = isPhaseUnlocked(phase.id);
          const isExpanded = expanded === phase.id;
          const phaseColor = colors.phase[phase.id];

          return (
            <View
              key={phase.id}
              style={{
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 18,
                overflow: "hidden",
                opacity: unlocked ? 1 : 0.55,
              }}
            >
              {/* Phase header */}
              <Pressable
                onPress={() => setExpanded(isExpanded ? null : phase.id)}
                disabled={!unlocked}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  backgroundColor: pressed ? colors.surface : "#fff",
                  gap: 14,
                })}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: phaseColor + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{phase.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.caption, { color: colors.muted, marginBottom: 2 }]}>
                    Phase {phase.id + 1}
                  </Text>
                  <Text style={[typography.h3, { fontSize: 16 }]}>{phase.name}</Text>
                  <Text style={[typography.caption, { color: colors.muted, marginTop: 2 }]}>
                    {done}/{phaseLessons.length} lessons · {phase.xp} XP
                  </Text>
                </View>
                {unlocked ? (
                  <ChevronDown
                    size={20}
                    color={colors.muted}
                    style={{ transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] }}
                  />
                ) : (
                  <Lock size={18} color={colors.muted} />
                )}
              </Pressable>

              {/* Expanded lessons */}
              {isExpanded && unlocked && (
                <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
                  {phaseLessons.map((lesson, idx) => {
                    const completed = lessons[lesson.id]?.completed;
                    const score = lessons[lesson.id]?.score;
                    const difficulty = getLessonDifficulty(lesson);
                    const diffColor = DIFFICULTY_COLORS[difficulty];
                    return (
                      <Pressable
                        key={lesson.id}
                        onPress={() => router.push(`/lesson/${lesson.id}`)}
                        style={({ pressed }) => ({
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          paddingVertical: 12,
                          paddingHorizontal: 12,
                          borderRadius: 12,
                          backgroundColor: pressed ? colors.surface : "transparent",
                        })}
                      >
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: completed ? colors.primary : colors.surfaceAlt,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {completed ? (
                            <Check size={16} color="#fff" />
                          ) : (
                            <Text style={[typography.caption, { fontWeight: "700", color: colors.muted }]}>
                              {idx + 1}
                            </Text>
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.body, { fontWeight: "600" }]}>{lesson.title}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                              <Clock size={11} color={colors.muted} />
                              <Text style={[typography.caption, { color: colors.muted }]}>
                                {lesson.duration}m
                              </Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                              <Star size={11} color={colors.muted} />
                              <Text style={[typography.caption, { color: colors.muted }]}>
                                {lesson.xp} XP
                              </Text>
                            </View>
                            <View
                              style={{
                                paddingHorizontal: 6,
                                paddingVertical: 1,
                                borderRadius: 4,
                                backgroundColor: diffColor + "20",
                              }}
                            >
                              <Text style={[typography.caption, { color: diffColor, fontWeight: "600", fontSize: 10 }]}>
                                {difficulty.toUpperCase()}
                              </Text>
                            </View>
                          </View>
                        </View>
                        {completed && typeof score === "number" && (
                          <Text style={[typography.h3, { color: colors.primary, fontSize: 14 }]}>
                            {score}%
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
