import Anthropic from "@anthropic-ai/sdk";

/** Shared server-side Claude client helpers. Never imported from client components. */

export const PRIMARY_MODEL = process.env.FABLE_MODEL ?? "claude-fable-5-1";
export const FALLBACK_MODEL = "claude-opus-5";

export function getApiKey() {
  return process.env.FABLE_API_KEY || process.env.ANTHROPIC_API_KEY || "";
}

export function getClient() {
  const apiKey = getApiKey();
  return apiKey ? new Anthropic({ apiKey }) : null;
}

/**
 * Run `fn` with the primary model; if that model is unavailable to this key,
 * retry once on the fallback model. Returns the model that actually answered.
 */
export async function withModelFallback<T>(
  fn: (model: string) => Promise<T>,
): Promise<{ result: T; model: string }> {
  try {
    return { result: await fn(PRIMARY_MODEL), model: PRIMARY_MODEL };
  } catch (err) {
    const retryable =
      err instanceof Anthropic.NotFoundError ||
      err instanceof Anthropic.PermissionDeniedError ||
      err instanceof Anthropic.BadRequestError;
    if (!retryable || PRIMARY_MODEL === FALLBACK_MODEL) throw err;
    return { result: await fn(FALLBACK_MODEL), model: FALLBACK_MODEL };
  }
}

/** Map SDK errors to a user-safe message and HTTP status. */
export function describeError(err: unknown): { status: number; error: string } {
  if (err instanceof Anthropic.AuthenticationError)
    return { status: 502, error: "AI service authentication failed. Check FABLE_API_KEY." };
  if (err instanceof Anthropic.RateLimitError)
    return { status: 503, error: "AI service is busy. Please try again in a moment." };
  return { status: 502, error: "AI service is unavailable right now. Please try again." };
}
