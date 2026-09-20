import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import {
  MODERATION_SYSTEM_PROMPT,
  ModerationSchema,
  mockModerate,
} from "@/lib/moderation";
import type { ModerationResponse, ModerationResult } from "@/lib/types";

export const runtime = "nodejs";

const PRIMARY_MODEL = process.env.FABLE_MODEL ?? "claude-fable-5-1";
const FALLBACK_MODEL = "claude-opus-5";
const MAX_CHARS = 2000;

function getApiKey() {
  // Server-side only. Never shipped to the browser.
  return process.env.FABLE_API_KEY || process.env.ANTHROPIC_API_KEY || "";
}

async function moderateWithModel(
  client: Anthropic,
  model: string,
  text: string,
): Promise<ModerationResult> {
  const response = await client.messages.parse({
    model,
    max_tokens: 2048,
    system: MODERATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Written patient experience to moderate:\n\n<review>\n${text}\n</review>`,
      },
    ],
    output_config: { format: zodOutputFormat(ModerationSchema), effort: "low" },
  });

  if (response.stop_reason === "refusal") {
    return {
      ...mockModerate(text),
      safeToPublish: false,
      flags: ["Could not be analyzed automatically"],
      userMessage:
        "We could not analyze this review automatically. Please keep it focused on your visit experience and try again.",
    };
  }

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Model returned no structured output");
  return parsed;
}

export async function POST(req: Request) {
  let body: { writtenExperience?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text =
    typeof body.writtenExperience === "string" ? body.writtenExperience.trim() : "";
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `Written experience must be under ${MAX_CHARS} characters.` },
      { status: 400 },
    );
  }

  const apiKey = getApiKey();

  // Demo fallback: no key configured -> deterministic mock. Also used for empty text.
  if (!apiKey || text.length === 0) {
    const payload: ModerationResponse = { result: mockModerate(text), mode: "mock" };
    return NextResponse.json(payload);
  }

  const client = new Anthropic({ apiKey });

  try {
    let model = PRIMARY_MODEL;
    let result: ModerationResult;
    try {
      result = await moderateWithModel(client, model, text);
    } catch (err) {
      // If the configured model isn't available to this key, retry once on the fallback model.
      if (
        (err instanceof Anthropic.NotFoundError ||
          err instanceof Anthropic.PermissionDeniedError ||
          err instanceof Anthropic.BadRequestError) &&
        model !== FALLBACK_MODEL
      ) {
        model = FALLBACK_MODEL;
        result = await moderateWithModel(client, model, text);
      } else {
        throw err;
      }
    }
    const payload: ModerationResponse = { result, mode: "fable", model };
    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Moderation service authentication failed. Check FABLE_API_KEY." },
        { status: 502 },
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Moderation service is busy. Please try again in a moment." },
        { status: 503 },
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[moderate-review]", message);
    return NextResponse.json(
      { error: "Moderation service is unavailable right now. Please try again." },
      { status: 502 },
    );
  }
}
