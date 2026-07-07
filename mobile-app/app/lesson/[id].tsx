// Lesson player — renders the lesson's step sequence with progress bar,
// Back/Continue navigation, and per-step interactive widgets.
//
// Supports: intro, concept, mouth-diagram (image), example, tap-pronounce,
// tip, practice (with speech recognition), quiz, completion.

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Mic,
  Square,
  Check,
  Sparkles,
  Award,
  Info,
  Lightbulb,
} from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { getLesson } from "@/lib/lessons";
import { PHASES } from "@/lib/types";
import type { LessonStep } from "@/lib/types";
import { speak, stopSpeaking } from "@/lib/tts";
import { speechRecognition } from "@/lib/recognition";
import { colors, typography } from "@/lib/theme";

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lesson = useMemo(() => (id ? getLesson(id) : undefined), [id]);

  const accent = useAppStore((s) => s.accent);
  const completeLesson = useAppStore((s) => s.completeLesson);
  const markStepViewed = useAppStore((s) => s.markStepViewed);

  const [stepIdx, setStepIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  useEffect(() => {
    if (lesson && stepIdx < lesson.steps.length) {
      markStepViewed(lesson.id);
    }
  }, [stepIdx, lesson]);

  if (!lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
        <Text style={[typography.body, { color: colors.muted }]}>Lesson not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const step = lesson.steps[stepIdx];
  const isLast = stepIdx === lesson.steps.length - 1;
  const phase = PHASES[lesson.phaseId];

  const handleContinue = () => {
    stopSpeaking();
    if (listening) {
      speechRecognition.stop();
      setListening(false);
    }
    if (isLast) {
      // Mark complete with score (use practice score if available, else 100)
      const finalScore = score ?? 100;
      completeLesson(lesson.id, finalScore, lesson.xp, undefined);
      router.back();
    } else {
      setStepIdx(stepIdx + 1);
      setTranscript("");
      setScore(null);
      setQuizAnswer(null);
    }
  };

  const handleBack = () => {
    stopSpeaking();
    if (listening) {
      speechRecognition.stop();
      setListening(false);
    }
    if (stepIdx === 0) {
      router.back();
    } else {
      setStepIdx(stepIdx - 1);
      setTranscript("");
      setScore(null);
      setQuizAnswer(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <ChevronLeft size={26} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1, height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3, overflow: "hidden" }}>
          <View
            style={{
              height: "100%",
              width: `${((stepIdx + 1) / lesson.steps.length) * 100}%`,
              backgroundColor: colors.primary,
              borderRadius: 3,
            }}
          />
        </View>
        <Text style={[typography.caption, { color: colors.muted, minWidth: 36, textAlign: "right" }]}>
          {stepIdx + 1}/{lesson.steps.length}
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <X size={22} color={colors.muted} />
        </Pressable>
      </View>

      {/* Step content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <StepRenderer
          step={step}
          accent={accent}
          listening={listening}
          transcript={transcript}
          score={score}
          quizAnswer={quizAnswer}
          onSpeak={(text) => speak(text, { accent, rate: 0.9 })}
          onListen={async (phrase: string) => {
            if (listening) {
              speechRecognition.stop();
              setListening(false);
              return;
            }
            const ok = await speechRecognition.requestPermissions();
            if (!ok) {
              Alert.alert("Permission required", "Microphone access is needed for pronunciation practice.");
              return;
            }
            setTranscript("");
            setScore(null);
            setListening(true);
            speechRecognition.start(
              {
                onResult: (result) => setTranscript(result.transcript),
                onEnd: () => {
                  setListening(false);
                  setTranscript((t) => {
                    const target = phrase.toLowerCase().replace(/[^a-z\s]/g, "");
                    const heard = t.toLowerCase().replace(/[^a-z\s]/g, "");
                    const targetWords = target.split(/\s+/).filter(Boolean);
                    const heardWords = heard.split(/\s+/).filter(Boolean);
                    const matched = targetWords.filter((w) => heardWords.includes(w)).length;
                    const pct = targetWords.length > 0 ? Math.round((matched / targetWords.length) * 100) : 0;
                    setScore(pct);
                    return t;
                  });
                },
                onError: () => setListening(false),
              },
              accent
            );
          }}
          onQuizAnswer={(idx) => setQuizAnswer(idx)}
        />
      </ScrollView>

      {/* Footer nav */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 28,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            width: 52,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ChevronLeft size={22} color={colors.foreground} />
        </Pressable>
        <Pressable
          onPress={handleContinue}
          disabled={step.type === "quiz" && quizAnswer === null}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingVertical: 14,
            backgroundColor: step.type === "quiz" && quizAnswer === null ? colors.surfaceAlt : colors.foreground,
            borderRadius: 14,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            {isLast ? "Complete" : "Continue"}
          </Text>
          {!isLast && <ChevronRight size={20} color="#fff" />}
          {isLast && <Check size={20} color="#fff" />}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Step renderer ───

interface StepRendererProps {
  step: LessonStep;
  accent: "usa" | "uk";
  listening: boolean;
  transcript: string;
  score: number | null;
  quizAnswer: number | null;
  onSpeak: (text: string) => void;
  onListen: (phrase: string) => void;
  onQuizAnswer: (idx: number) => void;
}

function StepRenderer(props: StepRendererProps) {
  switch (props.step.type) {
    case "intro":
      return <IntroStepView step={props.step} onSpeak={props.onSpeak} />;
    case "concept":
      return <ConceptStepView step={props.step} onSpeak={props.onSpeak} />;
    case "mouth-diagram":
      return <MouthDiagramStepView step={props.step} onSpeak={props.onSpeak} />;
    case "example":
      return <ExampleStepView step={props.step} onSpeak={props.onSpeak} />;
    case "tap-pronounce":
      return <TapPronounceStepView step={props.step} onSpeak={props.onSpeak} />;
    case "tip":
      return <TipStepView step={props.step} />;
    case "practice":
      return (
        <PracticeStepView
          step={props.step}
          listening={props.listening}
          transcript={props.transcript}
          score={props.score}
          onSpeak={props.onSpeak}
          onListen={props.onListen}
        />
      );
    case "quiz":
      return (
        <QuizStepView
          step={props.step}
          selected={props.quizAnswer}
          onSelect={props.onQuizAnswer}
        />
      );
    case "completion":
      return <CompletionStepView step={props.step} />;
    default:
      return (
        <View>
          <Text style={typography.body}>
            (Step type "{props.step.type}" not yet implemented in mobile preview.)
          </Text>
        </View>
      );
  }
}

// ─── Individual step views ───

function IntroStepView({ step, onSpeak }: { step: Extract<LessonStep, { type: "intro" }>; onSpeak: (t: string) => void }) {
  return (
    <View>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 36 }}>{step.emoji ?? "🔤"}</Text>
      </View>
      <Text style={[typography.caption, { color: colors.muted, marginBottom: 6 }]}>INTRODUCTION</Text>
      <Text style={[typography.h1, { marginBottom: 6 }]}>{step.title}</Text>
      <Text style={[typography.h3, { color: colors.primary, marginBottom: 16 }]}>{step.subtitle}</Text>
      <Pressable
        onPress={() => onSpeak(step.description)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 10,
          paddingHorizontal: 14,
          backgroundColor: colors.surface,
          borderRadius: 100,
          alignSelf: "flex-start",
          marginBottom: 16,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Volume2 size={16} color={colors.primary} />
        <Text style={[typography.caption, { fontWeight: "600", color: colors.primary }]}>Listen</Text>
      </Pressable>
      <Text style={[typography.body, { color: colors.foreground }]}>{step.description}</Text>
    </View>
  );
}

function ConceptStepView({ step, onSpeak }: { step: Extract<LessonStep, { type: "concept" }>; onSpeak: (t: string) => void }) {
  return (
    <View>
      <Text style={[typography.caption, { color: colors.muted, marginBottom: 6 }]}>CONCEPT</Text>
      <Text style={[typography.h1, { marginBottom: 16 }]}>{step.title}</Text>
      {step.body.map((p, i) => (
        <Text key={i} style={[typography.body, { marginBottom: 12 }]}>
          {p}
        </Text>
      ))}
      {step.bulletPoints && step.bulletPoints.length > 0 && (
        <View style={{ gap: 8, marginTop: 8 }}>
          {step.bulletPoints.map((b, i) => (
            <Pressable
              key={i}
              onPress={() => onSpeak(b)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                padding: 12,
                backgroundColor: colors.surface,
                borderRadius: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.primary,
                  marginTop: 8,
                }}
              />
              <Text style={[typography.body, { flex: 1 }]}>{b}</Text>
              <Volume2 size={14} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function MouthDiagramStepView({ step, onSpeak }: { step: Extract<LessonStep, { type: "mouth-diagram" }>; onSpeak: (t: string) => void }) {
  const imageName = step.image?.split("/").pop();
  // For now, render the description + sound card. Image rendering from the
  // web app's /public/vowels/ folder would require bundling the assets —
  // the recurring dev task will wire this up with require() assets.
  return (
    <View>
      <Text style={[typography.caption, { color: colors.muted, marginBottom: 6 }]}>MOUTH POSITION</Text>
      <Text style={[typography.h1, { marginBottom: 16 }]}>{step.title ?? `Sound /${step.sound}/`}</Text>

      {step.sound && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            padding: 20,
            backgroundColor: colors.primarySoft,
            borderRadius: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 56, fontWeight: "700", color: colors.primary }}>
            /{step.sound}/
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.primary, fontWeight: "700", marginBottom: 2 }]}>
              IPA SYMBOL
            </Text>
            <Text style={[typography.body, { color: colors.foreground }]}>
              {step.exampleWord ?? "Practice this sound"}
            </Text>
          </View>
          <Pressable
            onPress={() => step.sound && onSpeak(step.exampleWord?.split(" / ")[0] ?? step.sound)}
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: colors.primary,
              alignItems: "center", justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Volume2 size={20} color="#fff" />
          </Pressable>
        </View>
      )}

      <Text style={[typography.body, { marginBottom: 16 }]}>{step.description}</Text>

      <View style={{ gap: 10 }}>
        <InfoChip label="Tongue" value={step.tonguePosition.replace(/-/g, " ")} />
        <InfoChip label="Lips" value={step.lipShape} />
      </View>

      {imageName && (
        <Text style={[typography.caption, { color: colors.subtle, marginTop: 16, fontStyle: "italic" }]}>
          📷 Reference image: {imageName} (bundled in next update)
        </Text>
      )}
    </View>
  );
}

function ExampleStepView({ step, onSpeak }: { step: Extract<LessonStep, { type: "example" }>; onSpeak: (t: string) => void }) {
  return (
    <View>
      <Text style={[typography.caption, { color: colors.muted, marginBottom: 6 }]}>EXAMPLE</Text>
      {step.title && <Text style={[typography.h2, { marginBottom: 16 }]}>{step.title}</Text>}

      <View
        style={{
          backgroundColor: colors.foreground,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <Text style={[typography.h2, { color: "#fff", marginBottom: 8 }]}>{step.phrase}</Text>
        <Text style={[typography.ipa, { color: "rgba(255,255,255,0.8)" }]}>{step.ipa}</Text>
        <Pressable
          onPress={() => onSpeak(step.phrase)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 100,
            alignSelf: "flex-start",
            marginTop: 14,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Volume2 size={16} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Listen</Text>
        </Pressable>
      </View>

      {step.tapWords && step.tapWords.length > 0 && (
        <View>
          <Text style={[typography.caption, { color: colors.muted, marginBottom: 8 }]}>TAP TO HEAR</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {step.tapWords.map((w, i) => (
              <Pressable
                key={i}
                onPress={() => onSpeak(w.word)}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={[typography.body, { fontWeight: "600" }]}>{w.word}</Text>
                <Text style={[typography.caption, { color: colors.muted }]}>{w.ipa}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {step.tip && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16, padding: 12, backgroundColor: "#fef3c7", borderRadius: 12 }}>
          <Lightbulb size={16} color="#f59e0b" />
          <Text style={[typography.bodySmall, { flex: 1, color: "#92400e" }]}>{step.tip}</Text>
        </View>
      )}
    </View>
  );
}

function TapPronounceStepView({ step, onSpeak }: { step: Extract<LessonStep, { type: "tap-pronounce" }>; onSpeak: (t: string) => void }) {
  return (
    <View>
      <Text style={[typography.caption, { color: colors.muted, marginBottom: 6 }]}>TAP TO HEAR</Text>
      {step.title && <Text style={[typography.h2, { marginBottom: 12 }]}>{step.title}</Text>}
      {step.description && (
        <Text style={[typography.body, { color: colors.muted, marginBottom: 16 }]}>{step.description}</Text>
      )}
      <View style={{ gap: 8 }}>
        {step.words.map((w, i) => (
          <Pressable
            key={i}
            onPress={() => onSpeak(w.word)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
              paddingHorizontal: 16,
              backgroundColor: colors.surface,
              borderRadius: 14,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View>
              <Text style={[typography.body, { fontWeight: "600" }]}>{w.word}</Text>
              <Text style={[typography.caption, { color: colors.muted }]}>{w.ipa}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {w.meaning && (
                <Text style={[typography.caption, { color: colors.primary, fontWeight: "600" }]}>
                  {w.meaning}
                </Text>
              )}
              <Volume2 size={16} color={colors.primary} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function TipStepView({ step }: { step: Extract<LessonStep, { type: "tip" }> }) {
  const bg = step.variant === "warning" ? "#fef3c7" : step.variant === "success" ? colors.primarySoft : "#dbeafe";
  const fg = step.variant === "warning" ? "#92400e" : step.variant === "success" ? colors.primaryDark : "#1e40af";
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          padding: 20,
          backgroundColor: bg,
          borderRadius: 20,
        }}
      >
        <Lightbulb size={24} color={fg} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: fg, marginBottom: 6 }]}>{step.title ?? "Tip"}</Text>
          <Text style={[typography.body, { color: fg }]}>{step.body}</Text>
        </View>
      </View>
    </View>
  );
}

function PracticeStepView({
  step,
  listening,
  transcript,
  score,
  onSpeak,
  onListen,
}: {
  step: Extract<LessonStep, { type: "practice" }>;
  listening: boolean;
  transcript: string;
  score: number | null;
  onSpeak: (t: string) => void;
  onListen: (phrase: string) => void;
}) {
  return (
    <View>
      <Text style={[typography.caption, { color: colors.muted, marginBottom: 6 }]}>PRACTICE</Text>
      <Text style={[typography.h1, { marginBottom: 16 }]}>{step.title ?? "Now you try"}</Text>

      <View style={{ backgroundColor: colors.foreground, borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <Text style={[typography.h2, { color: "#fff", marginBottom: 6 }]}>{step.phrase}</Text>
        <Text style={[typography.ipa, { color: "rgba(255,255,255,0.85)" }]}>{step.ipa}</Text>
      </View>

      {step.tip && (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, padding: 12, backgroundColor: "#fef3c7", borderRadius: 12 }}>
          <Lightbulb size={16} color="#f59e0b" />
          <Text style={[typography.bodySmall, { flex: 1, color: "#92400e" }]}>{step.tip}</Text>
        </View>
      )}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={() => onSpeak(step.phrase)}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Volume2 size={18} color={colors.foreground} />
          <Text style={{ fontWeight: "600" }}>Listen</Text>
        </Pressable>
        <Pressable
          onPress={() => onListen(step.phrase)}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 14,
            backgroundColor: listening ? colors.danger : colors.primary,
            borderRadius: 14,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          {listening ? <Square size={18} color="#fff" /> : <Mic size={18} color="#fff" />}
          <Text style={{ color: "#fff", fontWeight: "700" }}>{listening ? "Stop" : "Speak"}</Text>
        </Pressable>
      </View>

      {transcript ? (
        <View style={{ marginTop: 16, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 12 }}>
          <Text style={[typography.caption, { color: colors.muted, marginBottom: 4 }]}>YOU SAID</Text>
          <Text style={typography.body}>{transcript}</Text>
        </View>
      ) : null}

      {score !== null && (
        <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: score >= 70 ? colors.primarySoft : "#fef3c7", borderRadius: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: score >= 70 ? colors.primary : colors.warning }}>
            {score}%
          </Text>
          <View>
            <Text style={[typography.body, { fontWeight: "600" }]}>
              {score >= 80 ? "Excellent!" : score >= 60 ? "Good effort" : "Keep practicing"}
            </Text>
            <Text style={[typography.caption, { color: colors.muted }]}>
              {score >= (step.passScore ?? 70) ? "Passed — continue to finish" : `Score ${step.passScore ?? 70}%+ to pass`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function QuizStepView({
  step,
  selected,
  onSelect,
}: {
  step: Extract<LessonStep, { type: "quiz" }>;
  selected: number | null;
  onSelect: (idx: number) => void;
}) {
  const answered = selected !== null;
  return (
    <View>
      <Text style={[typography.caption, { color: colors.muted, marginBottom: 6 }]}>QUIZ</Text>
      <Text style={[typography.h2, { marginBottom: 20 }]}>{step.question}</Text>
      <View style={{ gap: 10 }}>
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === step.correct;
          const showCorrect = answered && isCorrect;
          const showWrong = answered && isSelected && !isCorrect;
          return (
            <Pressable
              key={i}
              onPress={() => !answered && onSelect(i)}
              disabled={answered}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderWidth: 2,
                borderColor: showCorrect ? colors.primary : showWrong ? colors.danger : isSelected ? colors.primary : colors.border,
                backgroundColor: showCorrect ? colors.primarySoft : showWrong ? "#fee2e2" : "#fff",
                borderRadius: 14,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: showCorrect ? colors.primary : showWrong ? colors.danger : colors.surfaceAlt,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showCorrect ? (
                  <Check size={16} color="#fff" />
                ) : showWrong ? (
                  <X size={16} color="#fff" />
                ) : (
                  <Text style={{ fontWeight: "700", color: colors.muted }}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                )}
              </View>
              <Text style={[typography.body, { flex: 1, fontWeight: "500" }]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
      {answered && (
        <View style={{ marginTop: 16, padding: 14, backgroundColor: colors.surface, borderRadius: 12 }}>
          <Text style={[typography.caption, { color: colors.muted, marginBottom: 4 }]}>EXPLANATION</Text>
          <Text style={typography.body}>{step.explanation}</Text>
        </View>
      )}
    </View>
  );
}

function CompletionStepView({ step }: { step: Extract<LessonStep, { type: "completion" }> }) {
  return (
    <View style={{ alignItems: "center", paddingTop: 20 }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 30,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Award size={48} color={colors.primary} />
      </View>
      <Sparkles size={20} color={colors.primary} style={{ marginBottom: 8 }} />
      <Text style={[typography.h1, { textAlign: "center", marginBottom: 8 }]}>{step.title}</Text>
      <Text style={[typography.body, { color: colors.muted, textAlign: "center", marginBottom: 20 }]}>
        {step.subtitle}
      </Text>
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          paddingVertical: 16,
          paddingHorizontal: 24,
          backgroundColor: colors.primarySoft,
          borderRadius: 20,
          marginBottom: 16,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={[typography.h1, { color: colors.primary, fontSize: 28 }]}>+{step.xp}</Text>
          <Text style={[typography.caption, { color: colors.primary, fontWeight: "600" }]}>XP EARNED</Text>
        </View>
      </View>
      {step.badge && (
        <View style={{ paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.foreground, borderRadius: 100 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{step.badge}</Text>
        </View>
      )}
      {step.nextLessonTitle && (
        <Text style={[typography.caption, { color: colors.muted, marginTop: 16 }]}>
          Next up: {step.nextLessonTitle}
        </Text>
      )}
    </View>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 12 }}>
      <Text style={[typography.caption, { color: colors.muted, fontWeight: "700", minWidth: 60 }]}>{label.toUpperCase()}</Text>
      <Text style={[typography.body, { flex: 1, textTransform: "capitalize" }]}>{value}</Text>
    </View>
  );
}
