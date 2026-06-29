// Web Speech API (SpeechRecognition) wrapper + pronunciation scoring.
// Browser-side only — all `window` access is guarded by `typeof window` checks.
//
// Exports:
// - isSpeechRecognitionAvailable()
// - SpeechRecognizer class — wraps the native SpeechRecognition API
// - scorePronunciation(target, transcript) — word-level pronunciation scoring

// ---------------------------------------------------------------------------
// Minimal type declarations for the Web Speech API
// (not part of the standard TS DOM lib, so we declare what we use)
// ---------------------------------------------------------------------------

interface SRAlternative {
  transcript: string;
  confidence: number;
}

interface SRResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SRAlternative;
  [index: number]: SRAlternative;
}

interface SRResultList {
  readonly length: number;
  item(index: number): SRResult;
  [index: number]: SRResult;
}

interface SREvent extends Event {
  readonly resultIndex: number;
  readonly results: SRResultList;
}

interface SRErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SREvent) => void) | null;
  onerror: ((event: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

// ---------------------------------------------------------------------------
// Browser support detection
// ---------------------------------------------------------------------------

export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window
  );
}

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

export interface SpeechRecognitionCallbacks {
  /** Fired on every interim + final result. `isFinal` distinguishes the two. */
  onResult?: (transcript: string, isFinal: boolean) => void;
  /** Fired when the recognizer reports an error (e.g. `no-speech`, `not-allowed`). */
  onError?: (error: string) => void;
  /** Fired when recognition ends naturally (silence) or after `stop()`. */
  onEnd?: () => void;
  /** Fired when recognition successfully starts. */
  onStart?: () => void;
}

// ---------------------------------------------------------------------------
// SpeechRecognizer — wraps a single SpeechRecognition session
// ---------------------------------------------------------------------------

export class SpeechRecognizer {
  private recognition: SpeechRecognitionLike | null;
  private callbacks: SpeechRecognitionCallbacks = {};
  private running = false;

  constructor(opts: { lang?: string; callbacks?: SpeechRecognitionCallbacks } = {}) {
    const Ctor = getSpeechRecognitionCtor();
    if (Ctor) {
      const rec = new Ctor();
      rec.lang = opts.lang || "en-US";
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      this.recognition = rec;
    } else {
      this.recognition = null;
    }
    if (opts.callbacks) this.callbacks = { ...opts.callbacks };
    this.attachHandlers();
  }

  /** Replace / merge in new callbacks. */
  setCallbacks(cb: SpeechRecognitionCallbacks): void {
    this.callbacks = { ...this.callbacks, ...cb };
    this.attachHandlers();
  }

  private attachHandlers(): void {
    const rec = this.recognition;
    if (!rec) return;
    rec.onstart = () => {
      this.running = true;
      this.callbacks.onStart?.();
    };
    rec.onresult = (event: SREvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const alt = res[0];
        const text = alt ? alt.transcript : "";
        if (res.isFinal) final += text;
        else interim += text;
      }
      if (final.trim()) {
        this.callbacks.onResult?.(final.trim(), true);
      } else if (interim.trim()) {
        this.callbacks.onResult?.(interim.trim(), false);
      }
    };
    rec.onerror = (e: SRErrorEvent) => {
      this.callbacks.onError?.(e.error || "unknown");
    };
    rec.onend = () => {
      this.running = false;
      this.callbacks.onEnd?.();
    };
  }

  /** Start listening. Returns false if unavailable or already running. */
  start(): boolean {
    if (!this.recognition) return false;
    if (this.running) return false;
    this.attachHandlers();
    try {
      this.recognition.start();
      this.running = true;
      return true;
    } catch {
      // Throws if already started — swallow.
      return false;
    }
  }

  /** Stop listening. Triggers `onEnd` shortly after. */
  stop(): void {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch {
      // ignore
    }
    this.running = false;
  }

  /** Abort without delivering more results. */
  abort(): void {
    if (!this.recognition) return;
    try {
      this.recognition.abort();
    } catch {
      // ignore
    }
    this.running = false;
  }

  isAvailable(): boolean {
    return this.recognition !== null;
  }

  isRunning(): boolean {
    return this.running;
  }
}

// ---------------------------------------------------------------------------
// Pronunciation scoring
// ---------------------------------------------------------------------------

export interface PronunciationScore {
  /** 0–100 integer score */
  score: number;
  /** Target words the user successfully said (in target order) */
  matchedWords: string[];
  /** Target words the user missed */
  missedWords: string[];
  /** Words the user said that weren't in the target phrase */
  extraWords: string[];
  /** Normalized words of the target phrase (in order) */
  targetWords: string[];
  /** Normalized words of the transcript (in order) */
  transcriptWords: string[];
  /**
   * Parallel to `targetWords` — `true` if that target word index was matched.
   * Use this in the UI instead of `matchedWords.includes(w)` so duplicate
   * target words render correctly.
   */
  matchedMask: boolean[];
}

/** Lowercase, strip punctuation, collapse whitespace. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** True if two normalized words should count as a match (with small tolerance). */
function wordsMatch(target: string, candidate: string): boolean {
  if (target === candidate) return true;
  // Plurals / simple variations for longer words: "doing" vs "doings"
  if (target.length >= 4 && candidate.length >= 4) {
    if (target.startsWith(candidate) || candidate.startsWith(target)) {
      return Math.abs(target.length - candidate.length) <= 2;
    }
  }
  // Single-character substitution / insertion / deletion for words ≥ 3 chars
  if (
    target.length >= 3 &&
    candidate.length >= 3 &&
    Math.abs(target.length - candidate.length) <= 1
  ) {
    return levenshteinAtMost1(target, candidate);
  }
  return false;
}

function levenshteinAtMost1(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  if (la === lb) {
    let diff = 0;
    for (let i = 0; i < la; i++) {
      if (a[i] !== b[i]) {
        diff++;
        if (diff > 1) return false;
      }
    }
    return diff === 1;
  }
  // One is one char longer than the other → insertion/deletion
  const longer = la > lb ? a : b;
  const shorter = la > lb ? b : a;
  let i = 0;
  let j = 0;
  let diff = 0;
  while (i < longer.length && j < shorter.length) {
    if (longer[i] === shorter[j]) {
      i++;
      j++;
    } else {
      i++;
      diff++;
      if (diff > 1) return false;
    }
  }
  return true;
}

/**
 * Score how well a transcript matches a target phrase.
 * Score = (matchedWords / totalTargetWords) * 100
 *       + small sequence-correctness bonus (up to 10)
 *       − small penalty for extra words
 * Clamped to 0–100.
 */
export function scorePronunciation(
  target: string,
  transcript: string
): PronunciationScore {
  const targetWords = normalize(target).split(" ").filter(Boolean);
  const transcriptWords = normalize(transcript).split(" ").filter(Boolean);

  if (targetWords.length === 0) {
    return {
      score: 0,
      matchedWords: [],
      missedWords: [],
      extraWords: [],
      targetWords,
      transcriptWords,
      matchedMask: [],
    };
  }

  // Greedy left-to-right match: each target word takes the first unused
  // transcript word that matches it.
  const used = new Set<number>();
  const matchedMask: boolean[] = new Array(targetWords.length).fill(false);
  const matchedWords: string[] = [];
  targetWords.forEach((t, ti) => {
    let foundIdx = -1;
    for (let i = 0; i < transcriptWords.length; i++) {
      if (used.has(i)) continue;
      if (wordsMatch(t, transcriptWords[i])) {
        foundIdx = i;
        break;
      }
    }
    if (foundIdx !== -1) {
      used.add(foundIdx);
      matchedMask[ti] = true;
      matchedWords.push(t);
    }
  });

  const missedWords = targetWords.filter((w) => !matchedWords.includes(w));
  const extraWords = transcriptWords.filter((_, i) => !used.has(i));

  // Base score from matched ratio
  const matchedRatio = matchedWords.length / targetWords.length;

  // Sequence bonus: how many consecutive matched words are in increasing
  // transcript order (preserves phrase ordering).
  const usedIndices = Array.from(used).sort((a, b) => a - b);
  let sequenceCorrect = 0;
  for (let i = 1; i < usedIndices.length; i++) {
    if (usedIndices[i] > usedIndices[i - 1]) sequenceCorrect++;
  }
  const maxSeqBonus = matchedWords.length > 1 ? matchedWords.length - 1 : 1;
  const seqBonus =
    maxSeqBonus > 0 ? (sequenceCorrect / maxSeqBonus) * 10 : 0; // up to +10

  // Penalty for extra (unexpected) words — small, capped
  const extraPenalty = Math.min(10, extraWords.length * 3);

  let score = matchedRatio * 100 + seqBonus - extraPenalty;
  // Edge case: transcript empty but no error → score 0
  if (matchedWords.length === 0) score = 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    matchedWords,
    missedWords,
    extraWords,
    targetWords,
    transcriptWords,
    matchedMask,
  };
}
