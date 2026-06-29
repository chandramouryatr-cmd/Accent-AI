"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Target, Piano, Volume2, Sparkles, MessageSquare } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { speak } from "@/lib/tts";
import {
  SpeechRecognizer,
  scorePronunciation,
  isSpeechRecognitionAvailable,
  type PronunciationScore,
} from "@/lib/speech-recognition";
import { MicWaveform } from "@/components/widgets/mic-waveform";
import { PronunciationChallenge } from "@/components/widgets/pronunciation-challenge";
import { PhonemeDrill } from "@/components/widgets/phoneme-drill";
import { PhonemeKeyboard } from "@/components/widgets/phoneme-keyboard";

type Difficulty = "easy" | "medium" | "hard";
type PracticeMode = "easy" | "medium" | "hard" | "challenge" | "phoneme-drill";

const PHRASES: Record<Difficulty, { text: string; ipa: string; issues: string[] }[]> = {
  easy: [
    { text: "The weather is nice today", ipa: "/ðə ˈwɛðər ɪz naɪs təˈdeɪ/", issues: ["the", "weather"] },
    { text: "How are you doing?", ipa: "/haʊ ɑːr juː ˈduːɪŋ/", issues: [] },
    { text: "I would like some coffee please", ipa: "/aɪ wʊd laɪk sʌm ˈkɑːfi pliːz/", issues: ["would"] },
    { text: "Have a great day!", ipa: "/hæv ə ɡreɪt deɪ/", issues: [] },
    { text: "Can you help me find this?", ipa: "/kæn juː hɛlp miː faɪnd ðɪs/", issues: ["this"] },
  ],
  medium: [
    { text: "I've been thinking about what you said", ipa: "/aɪv bɪn ˈθɪŋkɪŋ əˈbaʊt wɑːt juː sɛd/", issues: ["thinking", "what"] },
    { text: "Can we schedule a meeting for tomorrow?", ipa: "/kæn wiː ˈskɛdʒuːl ə ˈmiːɾɪŋ fər təˈmɑːroʊ/", issues: ["schedule", "tomorrow"] },
    { text: "The project deadline is approaching quickly", ipa: "/ðə ˈprɑːdʒɛkt ˈdɛdlaɪn ɪz əˈproʊtʃɪŋ ˈkwɪkli/", issues: ["deadline", "approaching"] },
    { text: "Would you mind repeating that for me?", ipa: "/wʊd juː maɪnd rɪˈpiːɾɪŋ ðæt fər miː/", issues: ["repeating", "that"] },
    { text: "I'm really looking forward to seeing you", ipa: "/aɪm ˈrɪəli ˈlʊkɪŋ ˈfɔːrwərd tə ˈsiːɪŋ juː/", issues: ["forward", "really"] },
  ],
  hard: [
    { text: "Whadya think about that whole situation?", ipa: "/ˈwɑːdʒə θɪŋk əˈbaʊt ðæt hoʊl sɪtʃuˈeɪʃən/", issues: ["Whadya", "situation", "that"] },
    { text: "I couldn't care less about the bureaucratic red tape", ipa: "/aɪ ˈkʊdnt kɛr lɛs əˈbaʊt ðə bjʊˈrɑːkrætɪk rɛd teɪp/", issues: ["couldn't", "bureaucratic", "the"] },
    { text: "She sells seashells by the seashore", ipa: "/ʃiː sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔːr/", issues: ["seashells", "seashore", "the"] },
    { text: "Thirty-three thieves thought they thrilled the throne", ipa: "/ˈθɜːrɾiˈθriː θiːvz θɑːt ðeɪ θrɪld ðə θroʊn/", issues: ["Thirty-three", "thieves", "thought", "they", "thrilled", "the", "throne"] },
    { text: "You've gotta be kidding me right now honestly", ipa: "/juːv ˈɡɑːɾə biː ˈkɪɾɪŋ miː raɪt naʊ ˈɑːnɪstli/", issues: ["gotta", "honestly"] },
  ],
};

const TIPS: Record<Difficulty, string[]> = {
  easy: [
    "Speak slowly and clearly — there is no rush",
    "Focus on the 'th' sound: put tongue between teeth",
    "Relax your jaw for better vowel sounds",
  ],
  medium: [
    "Link words together naturally: 'want to' → 'wanna'",
    "Stress the right syllable: to-MOR-row not TO-mor-row",
    "Reduce unstressed vowels to schwa /ə/",
  ],
  hard: [
    "Practice fast speech by starting slow then building up",
    "Use elision: drop sounds in fast natural speech",
    "Match the native speaker's rhythm, not just pronunciation",
  ],
};

function PracticeContent() {
  const accent = useAppStore((s) => s.accent);
  const addSpeakingTime = useAppStore((s) => s.addSpeakingTime);
  const [diff, setDiff] = useState<Difficulty>("medium");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [step, setStep] = useState<"listen" | "speak" | "results">("listen");
  const [recording, setRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  // Track previous difficulty so we can reset the practice flow when it
  // changes — using the official "adjust state during render" pattern
  // instead of setState-in-effect (react-hooks/set-state-in-effect).
  const [prevDiff, setPrevDiff] = useState<Difficulty>(diff);

  const phrases = PHRASES[diff];
  const phrase = phrases[phraseIdx];
  const tip = TIPS[diff][phraseIdx % TIPS[diff].length];

  const nextPhrase = () => {
    setPhraseIdx((i) => (i + 1) % phrases.length);
    setStep("listen");
    setScore(null);
    setRecording(false);
  };

  const handleSpeak = useCallback(() => {
    speak(phrase.text, { accent, rate: speed });
    setStep("speak");
  }, [phrase, accent, speed]);

  const SPEED_PRESETS: { label: string; value: number }[] = [
    { label: "0.6×", value: 0.6 },
    { label: "0.75×", value: 0.75 },
    { label: "Normal", value: 1 },
    { label: "1.2×", value: 1.2 },
  ];

  const handleRecord = () => {
    if (recording) {
      setRecording(false);
      const s = 65 + Math.floor(Math.random() * 30);
      setScore(s);
      setStep("results");
      addSpeakingTime(5);
    } else {
      setRecording(true);
      setTimeout(() => {
        setRecording(false);
        const s = 65 + Math.floor(Math.random() * 30);
        setScore(s);
        setStep("results");
        addSpeakingTime(5);
      }, 4000);
    }
  };

  // Reset the practice flow when difficulty changes.
  // Official React pattern: adjust state during render based on a tracked
  // previous value (avoids setState-in-effect cascades).
  if (diff !== prevDiff) {
    setPrevDiff(diff);
    setStep("listen");
    setScore(null);
    setRecording(false);
  }

  const stepLabels = ["Listen", "Speak", "Results"];

  return (
    <>
      {/* Step flow */}
      <div className="flex items-center justify-between px-2">
        {stepLabels.map((lbl, i) => {
          const stepIdx = ["listen", "speak", "results"].indexOf(step);
          const isActive = i === stepIdx;
          const isDone = i < stepIdx;
          return (
            <div key={lbl} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isActive
                      ? "bg-[var(--grad-btn)] text-white"
                      : isDone
                      ? "bg-[rgba(16,185,129,0.2)] text-[#10b981]"
                      : "bg-[var(--card)] text-[var(--t3)] border border-[var(--border)]"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] ${isActive ? "text-[var(--p3)] font-bold" : "text-[var(--t3)]"}`}>
                  {lbl}
                </span>
              </div>
              {i < 2 && (
                <div className="flex-1 h-0.5 mx-2 bg-[var(--border)] relative overflow-hidden">
                  {i < stepIdx && (
                    <motion.div
                      className="absolute inset-0 bg-[#10b981]"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Phrase card */}
      <div className={`rounded-2xl p-5 bg-[rgba(99,102,241,0.06)] border border-[var(--border)] ${step === "listen" ? "animate-border-pulse" : ""}`}>
        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-2">
          {accent === "usa" ? "🇺🇸" : "🇬🇧"} {accent.toUpperCase()} · {diff}
        </div>
        <div className="font-d text-xl text-[var(--t1)] mb-2">{phrase.text}</div>
        <div className="font-mono text-sm text-[var(--t3)] mb-4">{phrase.ipa}</div>

        {/* Speed control — segmented slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[var(--t3)] font-mono uppercase tracking-wider">Speed</span>
            <span className="text-[10px] font-mono font-bold text-[var(--p3)]">
              {speed < 1 ? `${speed}× slower` : speed > 1 ? `${speed}× faster` : "Native"}
            </span>
          </div>
          <div className="flex p-0.5 rounded-lg bg-[var(--bg2)] border border-[var(--border)]">
            {SPEED_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setSpeed(p.value)}
                className={`relative flex-1 py-1.5 rounded-md text-[11px] font-semibold transition ${
                  speed === p.value ? "text-white" : "text-[var(--t3)] hover:text-[var(--t2)]"
                }`}
              >
                {speed === p.value && (
                  <motion.div
                    layoutId="speed-pill"
                    className="absolute inset-0 rounded-md bg-[var(--grad-btn)]"
                    style={{ boxShadow: "0 0 10px rgba(99,102,241,0.35)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Listen button */}
        <button
          onClick={handleSpeak}
          className="w-full py-3 rounded-xl bg-[var(--grad-btn)] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition mb-3"
        >
          <span className="text-lg">▶</span> Play Native Audio
        </button>

        {/* Mic + waveform */}
        <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg2)] mb-3">
          <MicWaveform height={80} active={recording} />
        </div>

        <button
          onClick={handleRecord}
          className={`w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition ${recording ? "animate-red-pulse" : ""}`}
          style={{
            background: recording
              ? "radial-gradient(circle, #ef4444, #dc2626)"
              : "var(--card-h)",
            border: recording ? "none" : "1px solid var(--border2)",
          }}
        >
          {recording ? "■ Stop Recording" : "🎙 Record Yourself"}
        </button>

        {score !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="mt-3 rounded-xl p-4 text-center bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] relative overflow-hidden"
          >
            {/* Celebration particles when score >= 80 */}
            {score >= 80 && (
              <>
                {[...Array(8)].map((_, pi) => (
                  <motion.div
                    key={pi}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      background: ["#f59e0b", "#22d3ee", "#a78bfa", "#10b981", "#6366f1", "#ef4444", "#8b5cf6", "#67e8f9"][pi],
                      top: "50%",
                      left: "50%",
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: [0, (Math.cos((pi / 8) * Math.PI * 2) * 60)],
                      y: [0, (Math.sin((pi / 8) * Math.PI * 2) * 40)],
                      opacity: [1, 0],
                      scale: [1, 0.5],
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                ))}
              </>
            )}
            <motion.div
              animate={score >= 80 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="font-d text-2xl font-bold text-[#10b981]">{score}%</div>
            </motion.div>
            <div className="text-xs text-[var(--t2)] mt-1">
              {score >= 80 ? "Excellent! Native-like." : score >= 70 ? "Good job — keep practicing." : "Keep going, you'll get there!"}
            </div>
            {phrase.issues.length > 0 && (
              <div className="mt-2 text-[10px] text-[var(--t3)]">
                Watch: {phrase.issues.join(", ")}
              </div>
            )}
          </motion.div>
        )}

        {/* Tip */}
        <div className="mt-3 rounded-xl p-3 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] text-xs text-[var(--t2)]">
          <strong className="text-[#f59e0b]">💡 Tip:</strong> {tip}
        </div>

        {/* Next phrase */}
        <button
          onClick={nextPhrase}
          className="mt-3 w-full py-2.5 rounded-xl bg-[var(--card-h)] border border-[var(--border)] text-xs font-semibold text-[var(--t2)] hover:bg-[var(--card)] transition"
        >
          → Next Phrase
        </button>
      </div>
    </>
  );
}

export function PracticeView() {
  const [mode, setMode] = useState<PracticeMode>("medium");

  const TABS: {
    id: PracticeMode;
    label: string;
    icon?: React.ReactNode;
    isChallenge?: boolean;
    isDrill?: boolean;
  }[] = [
    { id: "easy", label: "Easy" },
    { id: "medium", label: "Medium" },
    { id: "hard", label: "Hard" },
    {
      id: "phoneme-drill",
      label: "Drill",
      icon: <Target className="w-3 h-3" />,
      isDrill: true,
    },
    {
      id: "challenge",
      label: "Challenge",
      icon: <Zap className="w-3 h-3" />,
      isChallenge: true,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="font-d text-3xl font-bold mb-1">
          Infinite <span className="grad-text">Practice</span>
        </h1>
        <p className="text-sm text-[var(--t2)]">
          {mode === "challenge"
            ? "Timed drills with combo multipliers"
            : mode === "phoneme-drill"
            ? "Targeted practice for stubborn sounds"
            : "Listen to the native speaker, then record yourself"}
        </p>
      </div>

      {/* Mode toggle — Easy / Medium / Hard / 🎯 Drill / ⚡ Challenge */}
      <div className="flex p-1 rounded-xl bg-[var(--card)] border border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            className={`relative flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${
              mode === t.id
                ? "text-white"
                : t.isChallenge
                ? "text-[#f59e0b]"
                : t.isDrill
                ? "text-[var(--c)]"
                : "text-[var(--t2)]"
            }`}
          >
            {mode === t.id && (
              <motion.div
                layoutId="diff-pill"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: t.isChallenge
                    ? "linear-gradient(135deg, #f59e0b, #f97316)"
                    : t.isDrill
                    ? "linear-gradient(135deg, #22d3ee, #6366f1)"
                    : "var(--grad-btn)",
                  boxShadow: t.isChallenge
                    ? "0 0 16px rgba(245,158,11,0.4)"
                    : t.isDrill
                    ? "0 0 16px rgba(34,211,238,0.4)"
                    : "0 0 16px rgba(99,102,241,0.4)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-1">
              {t.icon}
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {mode === "challenge" ? (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PronunciationChallenge />
          </motion.div>
        ) : mode === "phoneme-drill" ? (
          <motion.div
            key="phoneme-drill"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PhonemeDrill />
          </motion.div>
        ) : (
          <motion.div
            key={`practice-${mode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <PracticeContentWithDiff diff={mode as Difficulty} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrapper that injects difficulty into PracticeContent
function PracticeContentWithDiff({ diff: initialDiff }: { diff: Difficulty }) {
  const accent = useAppStore((s) => s.accent);
  const addSpeakingTime = useAppStore((s) => s.addSpeakingTime);
  const [diff, setDiff] = useState<Difficulty>(initialDiff);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [step, setStep] = useState<"listen" | "speak" | "results">("listen");
  const [recording, setRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [prevDiff, setPrevDiff] = useState<Difficulty>(diff);
  const [showPhonemes, setShowPhonemes] = useState(false);
  // Speech-recognition result state
  const [transcript, setTranscript] = useState<string>("");
  const [pronScore, setPronScore] = useState<PronunciationScore | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Refs for managing the active SpeechRecognition session across renders
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const transcriptRef = useRef<string>("");
  const finalizedRef = useRef<boolean>(true); // start finalized=true (nothing in flight)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phrases = PHRASES[diff];
  const phrase = phrases[phraseIdx];
  const tip = TIPS[diff][phraseIdx % TIPS[diff].length];

  // Tear down any active recognizer + timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      try {
        recognizerRef.current?.abort();
      } catch {
        /* noop */
      }
      recognizerRef.current = null;
    };
  }, []);

  // Shared helper — stops the recognizer, computes the score, advances to results.
  // Captures the current `phrase.text` so the right target is scored even if
  // the user changes phrase mid-record (edge case).
  const finalizeScoring = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    setRecording(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const finalTranscript = transcriptRef.current.trim();
    const recognizer = recognizerRef.current;

    // Fall back to a simulated score when:
    //   - SpeechRecognition API isn't available in this browser, OR
    //   - we got no usable transcript (e.g. mic blocked, no speech detected)
    if (
      !isSpeechRecognitionAvailable() ||
      !recognizer ||
      !recognizer.isAvailable() ||
      !finalTranscript
    ) {
      try {
        recognizer?.abort();
      } catch {
        /* noop */
      }
      recognizerRef.current = null;
      const s = 65 + Math.floor(Math.random() * 30);
      setScore(s);
      setDemoMode(true);
      setTranscript("");
      setPronScore(null);
      setStep("results");
      addSpeakingTime(5);
      return;
    }

    try {
      recognizer.stop();
    } catch {
      /* noop */
    }
    recognizerRef.current = null;

    const result = scorePronunciation(phrase.text, finalTranscript);
    setScore(result.score);
    setDemoMode(false);
    setTranscript(finalTranscript);
    setPronScore(result);
    setStep("results");
    addSpeakingTime(5);
  }, [phrase.text, addSpeakingTime]);

  // Reset when initial diff changes (from parent tab)
  if (initialDiff !== diff) {
    setDiff(initialDiff);
    setStep("listen");
    setScore(null);
    setRecording(false);
    setPhraseIdx(0);
    setTranscript("");
    setPronScore(null);
    setDemoMode(false);
    // Abort any in-flight recognition
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      recognizerRef.current?.abort();
    } catch {
      /* noop */
    }
    recognizerRef.current = null;
    finalizedRef.current = true;
    transcriptRef.current = "";
  }

  // Reset when internal diff changes
  if (diff !== prevDiff) {
    setPrevDiff(diff);
    setStep("listen");
    setScore(null);
    setRecording(false);
    setTranscript("");
    setPronScore(null);
    setDemoMode(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      recognizerRef.current?.abort();
    } catch {
      /* noop */
    }
    recognizerRef.current = null;
    finalizedRef.current = true;
    transcriptRef.current = "";
  }

  const nextPhrase = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      recognizerRef.current?.abort();
    } catch {
      /* noop */
    }
    recognizerRef.current = null;
    finalizedRef.current = true;
    transcriptRef.current = "";
    setPhraseIdx((i) => (i + 1) % phrases.length);
    setStep("listen");
    setScore(null);
    setRecording(false);
    setTranscript("");
    setPronScore(null);
    setDemoMode(false);
  };

  const handleSpeak = useCallback(() => {
    speak(phrase.text, { accent, rate: speed });
    setStep("speak");
  }, [phrase, accent, speed]);

  const SPEED_PRESETS: { label: string; value: number }[] = [
    { label: "0.6×", value: 0.6 },
    { label: "0.75×", value: 0.75 },
    { label: "Normal", value: 1 },
    { label: "1.2×", value: 1.2 },
  ];

  const handleRecord = () => {
    // Toggle off → finalize scoring now
    if (recording) {
      finalizeScoring();
      return;
    }
    // Start recording
    setRecording(true);
    setScore(null);
    setTranscript("");
    setPronScore(null);
    setDemoMode(false);
    transcriptRef.current = "";
    finalizedRef.current = false;

    const recognizer = new SpeechRecognizer({
      lang: accent === "uk" ? "en-GB" : "en-US",
      callbacks: {
        onResult: (text) => {
          // Keep the latest transcript (interim or final). The final result
          // for a session supersedes any interim ones.
          transcriptRef.current = text;
        },
        onEnd: () => {
          // Browser stopped on its own (silence / end-of-utterance).
          finalizeScoring();
        },
        // onError: leave to the safety timer / explicit stop so we don't
        // double-finalize on transient errors like "no-speech".
      },
    });
    recognizerRef.current = recognizer;

    if (recognizer.isAvailable()) {
      recognizer.start();
    }

    // Safety-net auto-stop after 6 seconds (in case the recognizer never fires
    // `onend`, e.g. continuous background noise).
    timerRef.current = setTimeout(() => {
      finalizeScoring();
    }, 6000);
  };

  const stepLabels = ["Listen", "Speak", "Results"];

  return (
    <>
      {/* Step flow */}
      <div className="flex items-center justify-between px-2">
        {stepLabels.map((lbl, i) => {
          const stepIdx = ["listen", "speak", "results"].indexOf(step);
          const isActive = i === stepIdx;
          const isDone = i < stepIdx;
          return (
            <div key={lbl} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isActive
                      ? "bg-[var(--grad-btn)] text-white"
                      : isDone
                      ? "bg-[rgba(16,185,129,0.2)] text-[#10b981]"
                      : "bg-[var(--card)] text-[var(--t3)] border border-[var(--border)]"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] ${isActive ? "text-[var(--p3)] font-bold" : "text-[var(--t3)]"}`}>
                  {lbl}
                </span>
              </div>
              {i < 2 && (
                <div className="flex-1 h-0.5 mx-2 bg-[var(--border)] relative overflow-hidden">
                  {i < stepIdx && (
                    <motion.div
                      className="absolute inset-0 bg-[#10b981]"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Phrase card */}
      <div className={`rounded-2xl p-5 bg-[rgba(99,102,241,0.06)] border border-[var(--border)] ${step === "listen" ? "animate-border-pulse" : ""}`}>
        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-2">
          {accent === "usa" ? "🇺🇸" : "🇬🇧"} {accent.toUpperCase()} · {diff}
        </div>
        <div className="font-d text-xl text-[var(--t1)] mb-2">{phrase.text}</div>
        <div className="font-mono text-sm text-[var(--t3)] mb-2">{phrase.ipa}</div>

        {/* Phoneme keyboard toggle */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowPhonemes((v) => !v)}
          className="w-full mb-3 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition"
          style={{
            background: showPhonemes
              ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.12))"
              : "var(--card-h)",
            border: showPhonemes
              ? "1px solid rgba(99,102,241,0.3)"
              : "1px solid var(--border)",
            color: showPhonemes ? "var(--p3)" : "var(--t3)",
            boxShadow: showPhonemes ? "0 0 12px rgba(99,102,241,0.2)" : "none",
          }}
          aria-label={showPhonemes ? "Hide phoneme keyboard" : "Show phoneme keyboard"}
          aria-expanded={showPhonemes}
        >
          <Piano className="w-3.5 h-3.5" />
          <span>Phonemes</span>
          <Volume2 className="w-3 h-3 opacity-50" />
        </motion.button>

        {/* Phoneme keyboard */}
        <AnimatePresence>
          {showPhonemes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden mb-3"
            >
              <PhonemeKeyboard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speed control */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[var(--t3)] font-mono uppercase tracking-wider">Speed</span>
            <span className="text-[10px] font-mono font-bold text-[var(--p3)]">
              {speed < 1 ? `${speed}× slower` : speed > 1 ? `${speed}× faster` : "Native"}
            </span>
          </div>
          <div className="flex p-0.5 rounded-lg bg-[var(--bg2)] border border-[var(--border)]">
            {SPEED_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setSpeed(p.value)}
                className={`relative flex-1 py-1.5 rounded-md text-[11px] font-semibold transition ${
                  speed === p.value ? "text-white" : "text-[var(--t3)] hover:text-[var(--t2)]"
                }`}
              >
                {speed === p.value && (
                  <motion.div
                    layoutId="speed-pill"
                    className="absolute inset-0 rounded-md bg-[var(--grad-btn)]"
                    style={{ boxShadow: "0 0 10px rgba(99,102,241,0.35)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Listen button */}
        <button
          onClick={handleSpeak}
          className="w-full py-3 rounded-xl bg-[var(--grad-btn)] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition mb-3"
        >
          <span className="text-lg">▶</span> Play Native Audio
        </button>

        {/* Mic + waveform */}
        <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg2)] mb-3">
          <MicWaveform height={80} active={recording} />
        </div>

        <button
          onClick={handleRecord}
          className={`w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition ${recording ? "animate-red-pulse" : ""}`}
          style={{
            background: recording
              ? "radial-gradient(circle, #ef4444, #dc2626)"
              : "var(--card-h)",
            border: recording ? "none" : "1px solid var(--border2)",
          }}
        >
          {recording ? "■ Stop Recording" : "🎙 Record Yourself"}
        </button>

        {score !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="mt-3 rounded-2xl p-5 text-center relative overflow-hidden"
            style={{
              background: score >= 80
                ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(34,211,238,0.08))"
                : score >= 70
                ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.08))"
                : "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.08))",
              border: `1px solid ${score >= 80 ? "rgba(16,185,129,0.35)" : score >= 70 ? "rgba(245,158,11,0.35)" : "rgba(239,68,68,0.35)"}`,
            }}
          >
            {/* Celebration particles when score >= 80 */}
            {score >= 80 && (
              <>
                {[...Array(8)].map((_, pi) => (
                  <motion.div
                    key={pi}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: ["#f59e0b", "#22d3ee", "#a78bfa", "#10b981", "#6366f1", "#ef4444", "#8b5cf6", "#67e8f9"][pi],
                      top: "50%",
                      left: "50%",
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: [0, (Math.cos((pi / 8) * Math.PI * 2) * 70)],
                      y: [0, (Math.sin((pi / 8) * Math.PI * 2) * 45)],
                      opacity: [1, 0],
                      scale: [1, 0.3],
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                ))}
              </>
            )}

            {/* Demo mode badge — shown when speech recognition wasn't available */}
            {demoMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-1 px-2 py-0.5 mb-2 rounded-full text-[10px] font-semibold font-mono uppercase tracking-wider"
                style={{
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.35)",
                  color: "#fbbf24",
                }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                Demo Mode
              </motion.div>
            )}

            {/* Score ring */}
            <div className="flex items-center justify-center mb-3">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--overlay-1)" strokeWidth="6" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={score >= 80 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 6px ${score >= 80 ? "#10b98188" : score >= 70 ? "#f59e0b88" : "#ef444488"})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, ...(score >= 80 ? { scale: [0, 1.2, 1] } : {}) }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
                  >
                    <span className="font-d text-2xl font-bold" style={{ color: score >= 80 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444" }}>
                      {score}%
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="text-sm font-semibold text-[var(--t1)]">
              {score >= 80 ? "🎉 Excellent! Native-like." : score >= 70 ? "👍 Good job — keep practicing." : "💪 Keep going, you'll get there!"}
            </div>
            {phrase.issues.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[10px] text-[var(--t3)]">Watch:</span>
                {phrase.issues.map((issue, ii) => (
                  <span key={ii} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.25)] text-[#f87171] font-mono">
                    {issue}
                  </span>
                ))}
              </div>
            )}

            {/* Transcript of recognized speech + word-by-word correctness */}
            {!demoMode && transcript && pronScore && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="mt-4 rounded-xl p-3 text-left"
                style={{
                  background: "var(--card-h)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
                  <MessageSquare className="w-3 h-3" />
                  You said
                </div>
                <div className="text-sm text-[var(--t2)] mb-3 italic leading-relaxed">
                  &ldquo;{transcript}&rdquo;
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1.5">
                  Word match
                </div>
                <div className="flex flex-wrap gap-1">
                  {pronScore.targetWords.map((w, i) => {
                    const matched = pronScore.matchedMask[i];
                    return (
                      <motion.span
                        key={`tw-${i}-${w}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 0.2 }}
                        className={`px-2 py-0.5 rounded-md text-xs font-mono ${
                          matched
                            ? "bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.35)] text-[#10b981]"
                            : "bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.32)] text-[#f87171] line-through"
                        }`}
                      >
                        {w}
                      </motion.span>
                    );
                  })}
                </div>
                {pronScore.extraWords.length > 0 && (
                  <div className="mt-2">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1.5">
                      Extra words
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pronScore.extraWords.map((w, i) => (
                        <motion.span
                          key={`ew-${i}-${w}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + i * 0.05, duration: 0.2 }}
                          className="px-2 py-0.5 rounded-md text-xs font-mono bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-[#fbbf24]"
                        >
                          {w}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Demo mode explanation when speech recognition wasn't available */}
            {demoMode && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 rounded-xl p-3 text-left"
                style={{
                  background: "rgba(245,158,11,0.06)",
                  border: "1px solid rgba(245,158,11,0.25)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-[#fbbf24] font-mono">
                  <Sparkles className="w-3 h-3" />
                  Simulated score
                </div>
                <div className="text-[11px] text-[var(--t3)] leading-relaxed">
                  Speech recognition isn&apos;t available in this browser, so this score is a simulated demo. Try Chrome or Edge for real pronunciation feedback.
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Tip */}
        <div className="mt-3 rounded-xl p-3 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] text-xs text-[var(--t2)] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-y-0 w-1/4"
              style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.08), transparent)" }}
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
            />
          </div>
          <strong className="text-[#f59e0b]">💡 Tip:</strong> {tip}
        </div>

        {/* Next phrase */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={nextPhrase}
          className="mt-3 w-full py-2.5 rounded-xl bg-[var(--card-h)] border border-[var(--border)] text-xs font-semibold text-[var(--t2)] hover:bg-[var(--card)] transition flex items-center justify-center gap-2"
        >
          → Next Phrase
        </motion.button>
      </div>
    </>
  );
}
