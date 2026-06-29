"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Onboarding } from "@/components/onboarding/onboarding";
import { AppShell } from "@/components/app-shell";
import { loadVoices, unlockTTS } from "@/lib/tts";

export default function Home() {
  const onboarded = useAppStore((s) => s.onboarded);
  const [hydrated, setHydrated] = useState(false);

  // Wait for zustand persist to hydrate from localStorage
  useEffect(() => {
    // loadVoices is async but we don't need to await
    loadVoices();

    // Some browsers block speechSynthesis until a user gesture has occurred.
    // Unlock the audio context on the first pointer/keyboard interaction so
    // subsequent programmatic speak() calls work without delay.
    const unlock = () => unlockTTS();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    // small delay to let zustand persist hydrate
    const t = setTimeout(() => setHydrated(true), 50);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="font-d text-2xl font-bold grad-text animate-pulse">AccentAI</div>
      </div>
    );
  }

  if (!onboarded) {
    return <Onboarding />;
  }

  return <AppShell />;
}
