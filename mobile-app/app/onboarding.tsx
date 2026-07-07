// Onboarding — accent selection + name entry. Mirrors the web app's first-run flow.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Check, ChevronRight, Mic, Volume2, Sparkles } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { colors, typography } from "@/lib/theme";
import type { Accent } from "@/lib/types";

const ACCENTS: { id: Accent; label: string; flag: string; desc: string }[] = [
  { id: "usa", label: "American English", flag: "🇺🇸", desc: "General American (GenAm)" },
  { id: "uk", label: "British English", flag: "🇬🇧", desc: "Received Pronunciation (RP)" },
];

export default function Onboarding() {
  const router = useRouter();
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const setAccent = useAppStore((s) => s.setAccent);
  const setUserName = useAppStore((s) => s.setUserName);

  const [name, setName] = useState("");
  const [accent, setAccentState] = useState<Accent>("usa");

  const handleBegin = () => {
    setAccent(accent);
    setUserName(name.trim() || "Learner");
    setOnboarded(true);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Sparkles size={36} color={colors.primary} />
          </View>
          <Text style={[typography.hero, { textAlign: "center", marginBottom: 8 }]}>
            Welcome to AccentAI
          </Text>
          <Text style={[typography.body, { color: colors.muted, textAlign: "center", maxWidth: 280 }]}>
            Master native-level English pronunciation with real-time feedback, IPA phonetics, and AI coaching.
          </Text>
        </View>

        {/* Features row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
          <FeaturePill icon={<Mic size={16} color={colors.primary} />} label="Speech recognition" />
          <FeaturePill icon={<Volume2 size={16} color={colors.primary} />} label="Native audio" />
          <FeaturePill icon={<Sparkles size={16} color={colors.primary} />} label="AI coach" />
        </View>

        {/* Name */}
        <View style={{ marginBottom: 28 }}>
          <Text style={[typography.h3, { marginBottom: 10 }]}>What's your name?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.subtle}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              backgroundColor: colors.surface,
            }}
          />
        </View>

        {/* Accent */}
        <View style={{ marginBottom: 32 }}>
          <Text style={[typography.h3, { marginBottom: 12 }]}>Choose your target accent</Text>
          {ACCENTS.map((a) => {
            const selected = accent === a.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => setAccentState(a.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderWidth: 2,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: 16,
                  backgroundColor: selected ? colors.primarySoft : "#fff",
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text style={{ fontSize: 28 }}>{a.flag}</Text>
                  <View>
                    <Text style={[typography.body, { fontWeight: "600" }]}>{a.label}</Text>
                    <Text style={[typography.caption, { color: colors.muted }]}>{a.desc}</Text>
                  </View>
                </View>
                {selected && (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: colors.primary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* CTA */}
        <Pressable
          onPress={handleBegin}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Begin Journey</Text>
          <ChevronRight size={20} color="#fff" />
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: colors.surface,
        borderRadius: 100,
      }}
    >
      {icon}
      <Text style={[typography.caption, { fontWeight: "600", flexShrink: 1 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
