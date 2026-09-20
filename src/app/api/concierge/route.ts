import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import { describeError, getClient, withModelFallback } from "@/lib/ai";
import { COMMUNITIES, DOCTORS } from "@/lib/demo-data";
import {
  ConciergeSchema,
  buildSystemPrompt,
  mockConcierge,
  type ConciergeContext,
} from "@/lib/concierge";
import type { Community, ConciergeMessage, ConciergeResponse, ConciergeResult, Review } from "@/lib/types";
import { reviewerLabelFor } from "@/lib/utils";

export const runtime = "nodejs";

interface Body {
  messages?: ConciergeMessage[];
  selectedCommunityIds?: string[];
  customCommunities?: Community[];
  extraReviews?: Review[];
  city?: string;
  area?: string;
}

const MAX_TURNS = 12;
const MAX_CHARS = 1500;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Send at least one user message." }, { status: 400 });
  }

  const ctx: ConciergeContext = {
    selectedCommunityIds: body.selectedCommunityIds ?? [],
    communities: [...COMMUNITIES, ...(body.customCommunities ?? [])],
    extraReviews: (body.extraReviews ?? []).filter((r) => r && r.safeToPublish),
    city: body.city,
    area: body.area,
  };
  const circlesConsulted = ctx.communities
    .filter((c) => ctx.selectedCommunityIds.includes(c.id))
    .map((c) => reviewerLabelFor(c));

  const client = getClient();
  if (!client) {
    const payload: ConciergeResponse = { result: mockConcierge(messages, ctx), mode: "mock", circlesConsulted };
    return NextResponse.json(payload);
  }

  try {
    const { result, model } = await withModelFallback(async (m) => {
      const response = await client.messages.parse({
        model: m,
        max_tokens: 4096,
        system: [{ type: "text", text: buildSystemPrompt(ctx), cache_control: { type: "ephemeral" } }],
        messages: messages as Anthropic.MessageParam[],
        output_config: { format: zodOutputFormat(ConciergeSchema), effort: "medium" },
      });
      if (response.stop_reason === "refusal") {
        return {
          type: "question",
          message: "I can only help with finding a doctor based on community experiences. Could you tell me what kind of doctor you're looking for and where?",
          understood: { specialty: null, city: null, need: null },
          reasoning: [],
          recommendations: [],
          caveats: ["Community experience, not medical advice."],
        } satisfies ConciergeResult;
      }
      const parsed = response.parsed_output;
      if (!parsed) throw new Error("No structured output");
      // Guard against hallucinated ids.
      const valid = new Set(DOCTORS.map((d) => d.id));
      return { ...parsed, recommendations: parsed.recommendations.filter((r) => valid.has(r.doctorId)) };
    });
    const payload: ConciergeResponse = { result, mode: "fable", model, circlesConsulted };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[concierge]", err instanceof Error ? err.message : err);
    const { status, error } = describeError(err);
    return NextResponse.json({ error }, { status });
  }
}
