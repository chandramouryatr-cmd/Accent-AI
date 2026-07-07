// Practice — free practice mode with phoneme drills and quick exercises.

import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mic, Volume2, Square, RefreshCw, Zap, Target } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { speak, stopSpeaking } from "@/lib/tts";
import { speechRecognition } from "@/lib/recognition";
import { colors, typography } from "@/lib/theme";
import { PHONEME_DRILL_DATA } from "@/lib/phoneme-data";

const QUICK_PHRASES = [
  { phrase: "She sees the green sheep near the stream", ipa: "/ʃiː siːz ðə ɡriːn ʃiːp/" },
  { phrase: "Pat met Kate at the gate", ipa: "/pæt mɛt keɪt æt ðə ɡeɪt/" },
  { phrase: "How now brown cow", ipa: "/haʊ naʊ braʊn kaʊ/" },
  { phrase: "The thick ship sank", ipa: "/ðə θɪk ʃɪp sæŋk/" },
  { phrase: "Red leather, yellow leather", ipa: "/rɛd lɛðər jɛloʊ lɛðər/" },
];

export default function Practice() {
  const accent = useAppStore((s) => s.accent);
  const addXP = useAppStore((s) => s.addXP);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [currentPhrase, setCurrentPhrase] = useState(QUICK_PHRASES[0]);
  const [customText, setCustomText] = useState("");

  const handlePlay = (text: string) => {
    speak(text, { accent, rate: 0.92 });
  };

  const handleListen = async () => {
    if (listening) {
      speechRecognition.stop();
      setListening(false);
      return;
    }
    const available = speechRecognition.isAvailable();
    if (!available) {
      alert("Speech recognition is not available on this device.");
      return;
    }
    const granted = await speechRecognition.requestPermissions();
    if (!granted) {
      alert("Microphone permission is required for pronunciation practice.");
      return;
    }
    setTranscript("");
    setScore(null);
    setListening(true);

    let accumulated = "";
    speechRecognition.start(
      {
        onResult: (result) => {
          accumulated = result.transcript;
          setTranscript(result.transcript);
        },
        onEnd: () => {
          setListening(false);
          // Simple word-overlap scoring
          const target = currentPhrase.phrase.toLowerCase().replace(/[^a-z\s]/g, "");
          const heard = accumulated.toLowerCase().replace(/[^a-z\s]/g, "");
          const targetWords = target.split(/\s+/).filter(Boolean);
          const heardWords = heard.split(/\s+/).filter(Boolean);
          const matched = targetWords.filter((w) => heardWords.includes(w)).length;
          const pct = targetWords.length > 0 ? Math.round((matched / targetWords.length) * 100) : 0;
          setScore(pct);
          if (pct >= 70) addXP(10, "practice");
        },
        onError: () => setListening(false),
      },
      accent
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
        <Text style={[typography.h1, { marginBottom: 4 }]}>Practice</Text>
        <Text style={[typography.body, { color: colors.muted, marginBottom: 24 }]}>
          Free pronunciation drills with instant feedback.
        </Text>

        {/* Current phrase card */}
        <View
          style={{
            backgroundColor: colors.foreground,
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text style={[typography.caption, { color: "rgba(255,255,255,0.7)", marginBottom: 8 }]}>
            CURRENT PHRASE
          </Text>
          <Text style={[typography.h2, { color: "#fff", marginBottom: 8 }]}>
            {currentPhrase.phrase}
          </Text>
          <Text style={[typography.ipa, { color: "rgba(255,255,255,0.85)", fontFamily: "System" }]}>
            {currentPhrase.ipa}
          </Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <Pressable
              onPress={() => handlePlay(currentPhrase.phrase)}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 12,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Volume2 size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600" }}>Listen</Text>
            </Pressable>
            <Pressable
              onPress={handleListen}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 12,
                backgroundColor: listening ? colors.danger : colors.primary,
                borderRadius: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              {listening ? <Square size={16} color="#fff" /> : <Mic size={16} color="#fff" />}
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {listening ? "Stop" : "Speak"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Transcript + score */}
        {(transcript || score !== null) && (
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <Text style={[typography.caption, { color: colors.muted, marginBottom: 6 }]}>
              YOU SAID
            </Text>
            <Text style={[typography.body, { marginBottom: 12 }]}>{transcript || "(no speech detected)"}</Text>
            {score !== null && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: score >= 70 ? colors.primarySoft : "#fef3c7",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: score >= 70 ? colors.primary : colors.warning,
                    }}
                  >
                    {score}
                  </Text>
                </View>
                <View>
                  <Text style={[typography.body, { fontWeight: "600" }]}>
                    {score >= 80 ? "Excellent!" : score >= 60 ? "Good effort" : "Keep practicing"}
                  </Text>
                  <Text style={[typography.caption, { color: colors.muted }]}>
                    {score >= 70 ? "+10 XP earned" : "Score 70%+ to earn XP"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Phrase picker */}
        <Text style={[typography.h3, { marginBottom: 12 }]}>Try another phrase</Text>
        <View style={{ gap: 8, marginBottom: 24 }}>
          {QUICK_PHRASES.map((p, i) => (
            <Pressable
              key={i}
              onPress={() => {
                setCurrentPhrase(p);
                setTranscript("");
                setScore(null);
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: currentPhrase.phrase === p.phrase ? colors.primary : colors.border,
                borderRadius: 12,
                backgroundColor: currentPhrase.phrase === p.phrase ? colors.primarySoft : "#fff",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { fontWeight: "500" }]} numberOfLines={1}>
                  {p.phrase}
                </Text>
              </View>
              <Volume2 size={16} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        {/* Phoneme quick reference */}
        <Text style={[typography.h3, { marginBottom: 12 }]}>Phoneme quick reference</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {PHONEME_DRILL_DATA.slice(0, 12).map((p) => (
            <Pressable
              key={p.phoneme}
              onPress={() => handlePlay(p.example)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: colors.surface,
                borderRadius: 100,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={[typography.ipa, { fontSize: 16 }]}>/{p.phoneme}/</Text>
              <Text style={[typography.caption, { color: colors.muted }]}>{p.example}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
