import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRole = "system" | "user" | "assistant";

interface IncomingMessage {
  role: ChatRole;
  content: string;
}

interface RequestContext {
  accent?: string;
  xp?: number;
  streak?: number;
  completedLessons?: string[];
}

interface RequestBody {
  messages: IncomingMessage[];
  context?: RequestContext;
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

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
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

  if (sanitized.length === 0) {
    return NextResponse.json(
      { error: "No valid messages provided." },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(body.context);

  // Build the final message list: system prompt first, then any user-supplied
  // system messages get merged into our prompt to avoid multiple system roles.
  const finalMessages: { role: ChatRole; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...sanitized.filter((m) => m.role !== "system"),
  ];

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: finalMessages,
      temperature: 0.7,
      max_tokens: 800,
    } as unknown as Parameters<typeof zai.chat.completions.create>[0]);

    // The SDK may return either an OpenAI-style response or a plain string
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

    return NextResponse.json({ reply, role: "assistant" as const });
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
    schema: {
      messages: "{ role: 'user'|'assistant'|'system', content: string }[]",
      context: "{ accent?, xp?, streak?, completedLessons?: string[] }",
    },
  });
}
