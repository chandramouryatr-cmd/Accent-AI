// Home / Dashboard — streak, XP, daily goal, current lesson, quick actions.

import React from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Flame,
  Star,
  Target,
  ChevronRight,
  TrendingUp,
  Award,
  Map,
  Mic,
  MessageCircle,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { ALL_LESSONS, getLesson } from "@/lib/lessons";
import { PHASES, getLessonDifficulty } from "@/lib/types";
import { colors, typography } from "@/lib/theme";
import { ProgressRing } from "@/components/ProgressRing";

export default function Dashboard() {
  const router = useRouter();
  const { xp, streak, dailyGoal, dailyGoalCompleted, lessons, accent, userName } = useAppStore();

  // Find the next incomplete lesson
  const nextLesson = ALL_LESSONS.find((l) => !lessons[l.id]?.completed) ?? ALL_LESSONS[0];
  const completedCount = Object.values(lessons).filter((l) => l.completed).length;
  const overallPct = Math.round((completedCount / ALL_LESSONS.length) * 100);
  const dailyPct = Math.min(100, Math.round((dailyGoalCompleted / dailyGoal) * 100));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <View>
            <Text style={[typography.caption, { color: colors.muted, marginBottom: 2 }]}>
              {greeting()}, {userName}
            </Text>
            <Text style={[typography.h1, { fontSize: 26 }]}>AccentAI</Text>
          </View>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20 }}>{accent === "uk" ? "🇬🇧" : "🇺🇸"}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <StatChip icon={<Flame size={18} color="#f59e0b" />} value={streak} label="day streak" />
          <StatChip icon={<Star size={18} color={colors.primary} />} value={xp} label="total XP" />
          <StatChip icon={<Award size={18} color="#8b5cf6" />} value={completedCount} label="lessons done" />
        </View>

        {/* Daily goal ring */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            padding: 16,
            backgroundColor: colors.surface,
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          <ProgressRing progress={dailyPct / 100} size={72} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Target size={16} color={colors.foreground} />
              <Text style={[typography.h3, { fontSize: 15 }]}>Daily goal</Text>
            </View>
            <Text style={[typography.body, { color: colors.muted }]}>
              {dailyGoalCompleted} / {dailyGoal} lessons today
            </Text>
          </View>
        </View>

        {/* Continue lesson card */}
        <Text style={[typography.h3, { marginBottom: 12 }]}>Continue learning</Text>
        <Pressable
          onPress={() => router.push(`/lesson/${nextLesson.id}`)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            padding: 16,
            backgroundColor: colors.foreground,
            borderRadius: 20,
            marginBottom: 24,
            opacity: pressed ? 0.88 : 1,
          })}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.12)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 26 }}>{PHASES[nextLesson.phaseId].emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: "rgba(255,255,255,0.7)", marginBottom: 2 }]}>
              Phase {nextLesson.phaseId + 1} · Lesson {nextLesson.lessonIndex + 1}
            </Text>
            <Text style={[typography.h3, { color: "#fff", fontSize: 17 }]}>{nextLesson.title}</Text>
            <Text style={[typography.caption, { color: "rgba(255,255,255,0.7)", marginTop: 2 }]}>
              {nextLesson.duration} min · +{nextLesson.xp} XP
            </Text>
          </View>
          <ChevronRight size={22} color="#fff" />
        </Pressable>

        {/* Overall progress */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TrendingUp size={20} color={colors.primary} />
            <View>
              <Text style={[typography.body, { fontWeight: "600" }]}>Overall progress</Text>
              <Text style={[typography.caption, { color: colors.muted }]}>
                {completedCount} of {ALL_LESSONS.length} lessons complete
              </Text>
            </View>
          </View>
          <Text style={[typography.h2, { color: colors.primary }]}>{overallPct}%</Text>
        </View>

        {/* Quick actions */}
        <Text style={[typography.h3, { marginBottom: 12 }]}>Quick actions</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <QuickAction
            label="Browse journey"
            icon={<Map size={20} color={colors.primary} />}
            onPress={() => router.push("/(tabs)/journey")}
          />
          <QuickAction
            label="Free practice"
            icon={<Mic size={20} color={colors.primary} />}
            onPress={() => router.push("/(tabs)/practice")}
          />
          <QuickAction
            label="Ask coach"
            icon={<MessageCircle size={20} color={colors.primary} />}
            onPress={() => router.push("/(tabs)/coach")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function StatChip({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: colors.surface,
        borderRadius: 14,
        alignItems: "center",
        gap: 4,
      }}
    >
      {icon}
      <Text style={[typography.h3, { fontSize: 18 }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.muted, textAlign: "center" }]}>{label}</Text>
    </View>
  );
}

function QuickAction({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 14,
        backgroundColor: colors.surface,
        borderRadius: 14,
        alignItems: "center",
        gap: 8,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icon}
      <Text style={[typography.caption, { fontWeight: "600", textAlign: "center" }]}>{label}</Text>
    </Pressable>
  );
}
