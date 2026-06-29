import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRole = "system" | "user" | "assistant";

interface IncomingMessage {
  role: ChatRole;
  content: string;
}

interface PhonemeScore {
  phoneme: string;
  example?: string;
  score: number;
  count?: number;
}

interface RequestContext {
  accent?: string;
  xp?: number;
  streak?: number;
  completedLessons?: string[];
  /** Only sent in insights mode — the user's weakest phonemes with scores */
  phonemeMastery?: PhonemeScore[];
}

interface RequestBody {
  messages: IncomingMessage[];
  context?: RequestContext;
  /** "insights" switches to a JSON-practice-plan system prompt */
  mode?: "chat" | "insights";
}

function buildSystemPrompt(ctx: RequestContext | undefined): string {
  const accentLabel =
    ctx?.accent === "uk" ? "British English (RP)" : ctx?.accent === "usa" ? "American English (GenAm)" : "English";
  const xp = typeof ctx?.xp === "number" ? ctx.xp : 0;
  const streak = typeof ctx?.streak === "number" ? ctx.streak : 0;
  const completed = Array.isArray(ctx?.completedLessons) ? ctx.completedLessons : [];
  const completedCount = completed.length;

  return [
    "You are AccentAI Coach — an expert English pronunciation coach embedded inside the AccentAI language learning app.",
    "Your job is to help learners improve their English accent and pronunciation with concrete, actionable advice.",
    "",
    "CORE PRINCIPLES:",
    "1. Always use IPA notation when discussing specific sounds, wrapped in slashes for phonemes (e.g. /θ/, /ð/, /æ/, /ʃ/, /tʃ/) or brackets for narrow transcription (e.g. [ʔ]).",
    "2. Give physical, tactile guidance — tongue position, lip rounding, jaw height, airflow, voicing. Tell the learner exactly what to DO with their mouth.",
    "3. When asked about a specific word, break it down: show the IPA transcription, syllable boundaries, stress marks (ˈ), then explain each sound and give 1-2 practice tips.",
    "4. Be encouraging but honest. Celebrate effort, but also gently correct misconceptions.",
    "5. Keep responses SCANNABLE: 2-4 short paragraphs maximum, use line breaks between ideas, occasional bullet points are fine.",
    "6. Use a friendly tone. Sprinkle in 1-2 relevant emojis per response max (🎯 target, 💡 tip, 👄 mouth, 🔁 repeat, ✅ correct).",
    "7. Distinguish clearly between American (GenAm) and British (RP) pronunciation when relevant — the user is studying " + accentLabel + ".",
    "8. If the user asks something outside pronunciation/accent/phonetics (e.g. grammar, vocabulary, unrelated topics), politely steer back to pronunciation or give a brief answer and offer pronunciation help.",
    "",
    "USER CONTEXT (use naturally when relevant, don't recite it back):",
    "- Target accent: " + accentLabel,
    "- Total XP earned: " + xp,
    "- Current daily streak: " + streak + " day(s)",
    "- Lessons completed so far: " + completedCount,
    completedCount > 0
      ? "- Completed lesson IDs: " + completed.slice(0, 20).join(", ") + (completed.length > 20 ? ", ..." : "")
      : "- This is a new learner who hasn't completed any lessons yet — be extra welcoming and motivating.",
    "",
    "REFERENCE: The app has 32 lessons across 8 phases covering vowels, consonants (θ/ð, r, l, ŋ, ʒ), word stress, rhythm, intonation, and connected speech.",
    "",
    "Remember: concise, scannable, IPA-rich, tactile, encouraging. You're a coach, not a textbook.",
  ].join("\n");
}

const WELCOME_FALLBACK =
  "Hi there! 👄 I'm your AccentAI Coach. Ask me about any English sound, word, or pronunciation challenge and I'll break it down with IPA and concrete practice tips. 🎯";

/**
 * Builds a special system prompt for "insights" mode — asking the model to
 * output a strict JSON practice plan based on the user's phoneme mastery data.
 */
function buildInsightsSystemPrompt(ctx: RequestContext | undefined): string {
  const accentLabel =
    ctx?.accent === "uk" ? "British English (RP)" : ctx?.accent === "usa" ? "American English (GenAm)" : "English";
  const xp = typeof ctx?.xp === "number" ? ctx.xp : 0;
  const streak = typeof ctx?.streak === "number" ? ctx.streak : 0;
  const completed = Array.isArray(ctx?.completedLessons) ? ctx.completedLessons : [];
  const completedCount = completed.length;
  const phonemes = Array.isArray(ctx?.phonemeMastery) ? ctx.phonemeMastery : [];

  // Format phoneme data as readable text for the model
  const phonemeLines = phonemes.length
    ? phonemes.map((p) => {
        const ex = p.example ? ` (e.g. ${p.example})` : "";
        const ct = typeof p.count === "number" ? ` — ${p.count} lesson(s)` : "";
        return `  • /${p.phoneme}/ — avg score ${p.score}%${ex}${ct}`;
      }).join("\n")
    : "  • (no phoneme mastery data yet — the user hasn't completed enough lessons)";

  return [
    "You are AccentAI Coach analyzing a learner's progress. Based on their phoneme mastery data,",
    "provide a concise personalized practice plan. Format your response as JSON with:",
    "- focusAreas: array of {phoneme, score, reason} (top 3 weakest)",
    "- recommendedLessons: array of {phase, lesson, reason} (2-3 lessons to take next)",
    "- tips: array of strings (3 actionable practice tips)",
    "Keep it encouraging and specific.",
    "",
    "USER CONTEXT:",
    `- Target accent: ${accentLabel}`,
    `- Total XP earned: ${xp}`,
    `- Current daily streak: ${streak} day(s)`,
    `- Lessons completed so far: ${completedCount}`,
    "",
    "PHONEME MASTERY DATA (weakest first):",
    phonemeLines,
    "",
    "LESSON CATALOG (8 phases × 4 lessons = 32 total):",
    "  Phase 1 — Basic Sound Awareness: Vowel Sounds A–E, Consonant Clusters, Mouth Positioning, Listening Recognition",
    "  Phase 2 — Word Pronunciation: 100 Core Words, Syllable Stress Rules, Silent Letters, Slow Repetition Drills",
    "  Phase 3 — Sentence Rhythm: Linking Words, Sentence Melody, Rhythm Patterns, Chunking Speech",
    "  Phase 4 — Conversational Patterns: Casual Greetings, Expressing Emotions, Questions & Answers, Small Talk Mastery",
    "  Phase 5 — Native Compression: Gonna & Wanna, Reduced Vowels, Elision & Assimilation, Fast Speech Decoding",
    "  Phase 6 — Accent Mimicking: Shadowing Technique, Prosody Copying, Tone Matching, Character Voices",
    "  Phase 7 — Real-World Scenarios: Job Interview English, Presentation Skills, Phone Communication, Public Speaking",
    "  Phase 8 — Advanced Native Fluency: Tone Adaptation, Humor & Irony, Regional Variants, Master Performance",
    "",
    "STRICT OUTPUT REQUIREMENTS:",
    "1. Output ONLY a single valid JSON object — no markdown fences, no commentary before or after.",
    "2. Start with { and end with }.",
    "3. All keys MUST be exactly: focusAreas, recommendedLessons, tips.",
    "4. focusAreas items: { phoneme: string (without slashes), score: number, reason: string (1 sentence, tactile & specific) }",
    "5. recommendedLessons items: { phase: number (1-8), lesson: string (exact lesson title from catalog), reason: string (1 sentence) }",
    "6. tips items: strings, 3 items max, each a concrete actionable practice tip (≤ 18 words).",
    "7. Pick focus areas from the user's actual weakest phonemes listed above. If no data, suggest foundational ones (/θ/, /ð/, /æ/).",
    "8. Recommended lessons should be the user's NEXT step — prefer phase 1-3 lessons for new learners, advance for experienced.",
    "9. Keep tone warm and motivating in reasons/tips. Use IPA symbols directly without slashes inside the JSON values.",
  ].join("\n");
}

/**
 * Fallback: get the full non-streaming response, then simulate streaming
 * by emitting word-by-word with short delays.
 */
function simulateStreamFromFullText(fullText: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const words = fullText.split(/(?<=\s)/); // split keeping whitespace attached

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: word })}\n\n`));
        // 35ms delay for natural typewriter feel
        await new Promise((r) => setTimeout(r, 35));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const isInsights = body.mode === "insights";

  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json(
      { error: "Missing 'messages' array." },
      { status: 400 }
    );
  }

  // In insights mode we synthesize a user message if none was provided, so an
  // empty array is allowed. Otherwise require at least one message.
  if (!isInsights && body.messages.length === 0) {
    return NextResponse.json(
      { error: "Missing 'messages' array." },
      { status: 400 }
    );
  }

  // Sanitize and cap message history (last 20 messages to control cost)
  const sanitized: IncomingMessage[] = body.messages
    .slice(-20)
    .filter(
      (m) =>
        m &&
        typeof m.content === "string" &&
        (m.role === "user" || m.role === "assistant" || m.role === "system")
    )
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  if (!isInsights && sanitized.length === 0) {
    return NextResponse.json(
      { error: "No valid messages provided." },
      { status: 400 }
    );
  }

  const systemPrompt = isInsights
    ? buildInsightsSystemPrompt(body.context)
    : buildSystemPrompt(body.context);

  // For insights mode, synthesize the user "message" if none was provided —
  // the practice plan is fully derived from the context, not from chat input.
  let finalSanitized = sanitized;
  if (isInsights) {
    // Filter out any system messages from the client (we use our own)
    const nonSystem = sanitized.filter((m) => m.role !== "system");
    if (nonSystem.length === 0) {
      finalSanitized = [
        {
          role: "user" as ChatRole,
          content:
            "Please analyze my phoneme mastery data and generate my personalized practice plan now.",
        },
      ];
    } else {
      finalSanitized = nonSystem;
    }
  }

  // Build the final message list: system prompt first, then any user-supplied
  // system messages get merged into our prompt to avoid multiple system roles.
  const finalMessages: { role: ChatRole; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...finalSanitized.filter((m) => m.role !== "system"),
  ];

  try {
    const zai = await ZAI.create();

    // Attempt native streaming from the SDK
    // Insights mode uses lower temperature for more consistent JSON output.
    const completion = await zai.chat.completions.create({
      messages: finalMessages,
      temperature: isInsights ? 0.45 : 0.7,
      max_tokens: isInsights ? 900 : 800,
      stream: true,
    } as unknown as Parameters<typeof zai.chat.completions.create>[0]);

    // If the SDK returns a ReadableStream (native streaming), pipe it through
    if (completion && typeof completion === "object" && completion instanceof ReadableStream) {
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      // Hold the upstream reader in an outer scope so the cancel() handler
      // can release it when the client disconnects (e.g. user clicks Stop).
      let upstreamReader: ReadableStreamDefaultReader<Uint8Array> | null = null;

      const transformedStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          upstreamReader = completion.getReader();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await upstreamReader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              // Keep the last incomplete line in the buffer
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith("data:")) continue;

                const dataStr = trimmed.slice(5).trim();
                if (dataStr === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  continue;
                }

                try {
                  const parsed = JSON.parse(dataStr);
                  // OpenAI-style streaming: choices[0].delta.content
                  const token = parsed?.choices?.[0]?.delta?.content;
                  if (token) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
                  }
                  // If finish_reason is set, we'll also handle [DONE] if it appears
                } catch {
                  // Non-JSON line, skip
                }
              }
            }

            // Process any remaining buffer
            if (buffer.trim()) {
              const trimmed = buffer.trim();
              if (trimmed.startsWith("data:")) {
                const dataStr = trimmed.slice(5).trim();
                if (dataStr === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                } else {
                  try {
                    const parsed = JSON.parse(dataStr);
                    const token = parsed?.choices?.[0]?.delta?.content;
                    if (token) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
                    }
                  } catch {
                    // skip
                  }
                }
              }
            }

            // Always ensure we send [DONE] at the end
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (streamErr) {
            console.error("[ai-coach] Stream reading error:", streamErr);
            // Send error token then close
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`)
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        },
        // Client disconnected — release the upstream SDK reader so the
        // underlying connection is cleaned up promptly instead of
        // continuing to consume tokens.
        async cancel() {
          if (upstreamReader) {
            try {
              await upstreamReader.cancel();
            } catch {
              /* already closed */
            }
          }
        },
      });

      return new Response(transformedStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Fallback: SDK returned a non-streaming response (full JSON object)
    // Extract the reply text and simulate streaming word-by-word
    let reply = "";
    if (typeof completion === "string") {
      reply = completion;
    } else if (completion && typeof completion === "object") {
      const anyComp = completion as {
        choices?: Array<{ message?: { content?: string } }>;
        content?: string;
        text?: string;
        response?: string;
      };
      reply =
        anyComp.choices?.[0]?.message?.content ??
        anyComp.content ??
        anyComp.text ??
        anyComp.response ??
        "";
    }

    if (!reply || !reply.trim()) {
      reply = WELCOME_FALLBACK;
    }

    const simulatedStream = simulateStreamFromFullText(reply);

    return new Response(simulatedStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown SDK error";
    console.error("[ai-coach] SDK call failed:", message);
    return NextResponse.json(
      {
        error: "The coach is taking a quick break. Please try again in a moment.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "ai-coach",
    method: "POST",
    streaming: true,
    schema: {
      messages: "{ role: 'user'|'assistant'|'system', content: string }[]",
      context: "{ accent?, xp?, streak?, completedLessons?: string[], phonemeMastery?: { phoneme, score, example?, count? }[] }",
      mode: "'chat' (default) | 'insights' (returns JSON practice plan)",
    },
    streamFormat: "SSE — data: { token: string } | [DONE]",
    modes: {
      chat: "Conversational coach with IPA-rich advice (default).",
      insights:
        "Returns a JSON practice plan: { focusAreas: [{phoneme, score, reason}], recommendedLessons: [{phase, lesson, reason}], tips: string[] }. Pass user's weakest phonemes via context.phonemeMastery.",
    },
  });
}
