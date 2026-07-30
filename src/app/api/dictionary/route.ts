import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dictionary lookup API.
 *
 * Proxies the free, key-less Free Dictionary API
 *   https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 *
 * Adds:
 *  - Server-side in-memory caching (24h TTL) so repeat lookups are instant
 *    and we don't hammer the upstream service.
 *  - A normalized response shape so the client doesn't have to deal with the
 *    upstream's slightly awkward array-of-entries structure.
 *  - Friendly error messaging for 404s (word not found) and network failures.
 */

interface UpstreamPhonetic {
  text?: string;
  audio?: string;
}
interface UpstreamDefinition {
  definition?: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}
interface UpstreamMeaning {
  partOfSpeech?: string;
  definitions?: UpstreamDefinition[];
  synonyms?: string[];
  antonyms?: string[];
}
interface UpstreamEntry {
  word?: string;
  phonetic?: string;
  phonetics?: UpstreamPhonetic[];
  origin?: string;
  meanings?: UpstreamMeaning[];
  sourceUrls?: string[];
}

export interface NormalizedMeaning {
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryResponse {
  word: string;
  phonetic?: string;
  /** IPA text, e.g. "/rɪˈkɔːd/" — stripped of leading/trailing whitespace. */
  ipa?: string;
  /** Direct audio URL from the upstream (may be undefined). */
  audioUrl?: string;
  meanings: NormalizedMeaning[];
  origin?: string;
  sourceUrl?: string;
  fromCache?: boolean;
}

interface CacheEntry {
  data: DictionaryResponse | { notFound: true; suggestion?: string };
  expires: number;
}

// Module-level cache — survives across requests within the same Node process.
// 24h TTL keeps memory bounded while making repeat lookups instant.
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Normalize the raw upstream entries into our cleaner DictionaryResponse. */
function normalize(word: string, entries: UpstreamEntry[]): DictionaryResponse {
  // Merge across all entries — the upstream sometimes splits an entry across
  // multiple objects (e.g. different etymologies).
  let phonetic: string | undefined;
  let ipa: string | undefined;
  let audioUrl: string | undefined;
  let origin: string | undefined;
  let sourceUrl: string | undefined;
  const meanings: NormalizedMeaning[] = [];

  for (const entry of entries) {
    if (!phonetic && entry.phonetic) phonetic = entry.phonetic.trim();
    if (!origin && entry.origin) origin = entry.origin;
    if (!sourceUrl && entry.sourceUrls?.[0]) sourceUrl = entry.sourceUrls[0];

    // Pick the first non-empty IPA text + first usable audio URL from phonetics.
    for (const p of entry.phonetics ?? []) {
      if (!ipa && p.text && p.text.trim()) ipa = p.text.trim();
      if (!audioUrl && p.audio && p.audio.startsWith("http")) audioUrl = p.audio;
    }

    for (const m of entry.meanings ?? []) {
      if (!m.definitions || m.definitions.length === 0) continue;
      meanings.push({
        partOfSpeech: m.partOfSpeech || "unknown",
        definitions: m.definitions
          .filter((d) => d.definition && d.definition.trim())
          .map((d) => ({
            definition: d.definition!.trim(),
            example: d.example?.trim() || undefined,
            synonyms: d.synonyms?.filter(Boolean).slice(0, 5),
            antonyms: d.antonyms?.filter(Boolean).slice(0, 5),
          })),
        synonyms: m.synonyms?.filter(Boolean).slice(0, 8),
        antonyms: m.antonyms?.filter(Boolean).slice(0, 8),
      });
    }
  }

  return {
    word: entries[0]?.word || word,
    phonetic,
    ipa,
    audioUrl,
    meanings,
    origin,
    sourceUrl,
  };
}

/** Simple "did you mean" suggestion using Levenshtein distance. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/** A tiny fallback suggestion list for common English typos / near-misses. */
const SUGGESTION_POOL = [
  "record", "please", "through", "though", "thought", "their", "there",
  "rhythm", "schedule", "comfortable", "vegetable", "Wednesday",
  "pronunciation", "language", "beautiful", "restaurant", "necessary",
  "definitely", "separate", "tomorrow", "embarrass", "occurrence",
];

function suggest(word: string): string | undefined {
  const w = word.toLowerCase();
  let best: string | undefined;
  let bestDist = Infinity;
  for (const cand of SUGGESTION_POOL) {
    const d = levenshtein(w, cand);
    if (d < bestDist) {
      bestDist = d;
      best = cand;
    }
  }
  // Only return if reasonably close (≤ 2 edits or half the word length).
  if (best && bestDist <= Math.max(2, Math.floor(w.length / 2))) return best;
  return undefined;
}

export async function GET(req: NextRequest) {
  const word = (req.nextUrl.searchParams.get("word") || "").trim();

  if (!word) {
    return NextResponse.json(
      { error: "Missing 'word' query parameter." },
      { status: 400 }
    );
  }

  // Basic sanitization — reject anything that's clearly not a word
  // (allows letters, apostrophes, hyphens; max 64 chars).
  if (word.length > 64 || !/^[A-Za-z][A-Za-z''\-]*$/.test(word)) {
    return NextResponse.json(
      { error: "Please select a single word to look up." },
      { status: 400 }
    );
  }

  const key = word.toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    const data = cached.data;
    if ("notFound" in data) {
      return NextResponse.json(
        { error: "Word not found.", suggestion: data.suggestion },
        { status: 404 }
      );
    }
    return NextResponse.json({ ...data, fromCache: true });
  }

  try {
    const upstreamUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`;
    const res = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      // Fresh fetch every time (we manage our own cache).
      cache: "no-store",
    });

    if (res.status === 404) {
      const suggestion = suggest(key);
      cache.set(key, { data: { notFound: true, suggestion }, expires: Date.now() + CACHE_TTL_MS });
      return NextResponse.json(
        { error: "Word not found.", suggestion },
        { status: 404 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Dictionary service returned ${res.status}. Please try again.` },
        { status: 502 }
      );
    }

    const raw = (await res.json()) as UpstreamEntry[];
    if (!Array.isArray(raw) || raw.length === 0) {
      cache.set(key, { data: { notFound: true }, expires: Date.now() + CACHE_TTL_MS });
      return NextResponse.json({ error: "Word not found." }, { status: 404 });
    }

    const normalized = normalize(word, raw);
    cache.set(key, { data: normalized, expires: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(normalized);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[dictionary] lookup failed:", message);
    return NextResponse.json(
      { error: "Couldn't reach the dictionary service. Check your connection and try again." },
      { status: 503 }
    );
  }
}
