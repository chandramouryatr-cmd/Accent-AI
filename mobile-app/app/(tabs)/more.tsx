// More — settings, progress summary, build info, reset.

import React from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TrendingUp,
  Award,
  Flame,
  Star,
  Target,
  ChevronRight,
  RotateCcw,
  Info,
  Settings,
  Heart,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { ALL_LESSONS } from "@/lib/lessons";
import { colors, typography } from "@/lib/theme";

export default function More() {
  const { xp, streak, lessons, badges, dailyGoal, dailyGoalCompleted, accent, userName, resetAll, setDailyGoal } = useAppStore();
  const completedCount = Object.values(lessons).filter((l) => l.completed).length;
  const avgScore = (() => {
    const completed = Object.values(lessons).filter((l) => l.completed && l.score > 0);
    if (completed.length === 0) return 0;
    return Math.round(completed.reduce((acc, l) => acc + l.score, 0) / completed.length);
  })();

  const handleReset = () => {
    Alert.alert(
      "Reset all progress?",
      "This will erase your XP, streak, lesson progress, and badges. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => resetAll() },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
        <Text style={[typography.h1, { marginBottom: 24 }]}>More</Text>

        {/* Profile card */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            padding: 16,
            backgroundColor: colors.surface,
            borderRadius: 18,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24 }}>{accent === "uk" ? "🇬🇧" : "🇺🇸"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h3, { fontSize: 17 }]}>{userName}</Text>
            <Text style={[typography.caption, { color: colors.muted }]}>
              {accent === "uk" ? "British English" : "American English"} · {completedCount} lessons complete
            </Text>
          </View>
        </View>

        {/* Progress stats */}
        <Text style={[typography.h3, { marginBottom: 12 }]}>Your progress</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          <StatBox icon={<Star size={18} color={colors.primary} />} value={xp} label="Total XP" />
          <StatBox icon={<Flame size={18} color="#f59e0b" />} value={streak} label="Day streak" />
          <StatBox icon={<Award size={18} color="#8b5cf6" />} value={completedCount} label={`of ${ALL_LESSONS.length} lessons`} />
          <StatBox icon={<TrendingUp size={18} color="#3b82f6" />} value={`${avgScore}%`} label="Avg score" />
          <StatBox icon={<Target size={18} color="#ec4899" />} value={`${dailyGoalCompleted}/${dailyGoal}`} label="Today's goal" />
          <StatBox icon={<Heart size={18} color="#ef4444" />} value={badges.length} label="Badges" />
        </View>

        {/* Daily goal slider */}
        <Text style={[typography.h3, { marginBottom: 12 }]}>Daily goal</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <View>
            <Text style={[typography.body, { fontWeight: "600" }]}>Lessons per day</Text>
            <Text style={[typography.caption, { color: colors.muted }]}>Set a sustainable pace</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              onPress={() => setDailyGoal(dailyGoal - 1)}
              style={({ pressed }) => ({
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: colors.surface,
                alignItems: "center", justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ fontSize: 20, fontWeight: "700" }}>−</Text>
            </Pressable>
            <Text style={[typography.h2, { minWidth: 24, textAlign: "center" }]}>{dailyGoal}</Text>
            <Pressable
              onPress={() => setDailyGoal(dailyGoal + 1)}
              style={({ pressed }) => ({
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: colors.surface,
                alignItems: "center", justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ fontSize: 20, fontWeight: "700" }}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Badges */}
        {badges.length > 0 && (
          <>
            <Text style={[typography.h3, { marginBottom: 12 }]}>Badges earned</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {badges.map((b, i) => (
                <View
                  key={i}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: colors.primarySoft,
                    borderRadius: 100,
                  }}
                >
                  <Text style={[typography.caption, { color: colors.primary, fontWeight: "600" }]}>
                    {b}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Settings */}
        <Text style={[typography.h3, { marginBottom: 12 }]}>Settings</Text>
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
          <SettingRow
            icon={<RotateCcw size={18} color={colors.danger} />}
            label="Reset all progress"
            onPress={handleReset}
            danger
          />
        </View>

        {/* About */}
        <Text style={[typography.h3, { marginBottom: 12 }]}>About</Text>
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: "hidden" }}>
          <SettingRow icon={<Info size={18} color={colors.muted} />} label="Version" value="1.0.0" />
          <SettingRow icon={<Settings size={18} color={colors.muted} />} label="Build" value="React Native + Expo" last />
        </View>

        <Text style={[typography.caption, { color: colors.subtle, textAlign: "center", marginTop: 24 }]}>
          AccentAI Mobile · Built with Expo SDK 52
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <View
      style={{
        width: "47%",
        flexGrow: 1,
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: colors.surface,
        borderRadius: 14,
        gap: 6,
      }}
    >
      {icon}
      <Text style={[typography.h2, { fontSize: 22 }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  last,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: pressed ? colors.surface : "#fff",
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      })}
    >
      {icon}
      <Text style={[typography.body, { flex: 1, color: danger ? colors.danger : colors.foreground }]}>
        {label}
      </Text>
      {value && <Text style={[typography.body, { color: colors.muted }]}>{value}</Text>}
      {onPress && <ChevronRight size={18} color={colors.muted} />}
    </Pressable>
  );
}
