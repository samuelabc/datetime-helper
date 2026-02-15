import type { AiAvailabilityResult } from "./aiAvailability";
import { loadAiSettings } from "./aiSettings";
import {
  parseAiProviderOutput,
  parseNaturalLanguagePrompt,
  type AiProviderParseOutput,
  type NaturalLanguageParseResult,
  NaturalLanguageParseError,
} from "./naturalLanguageParser";

export class AiProviderError extends Error {
  readonly code: "MISSING_KEY" | "INVALID_KEY" | "RATE_LIMITED" | "NETWORK" | "TIMEOUT" | "PROVIDER";

  constructor(code: AiProviderError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

async function parseWithGemini(prompt: string, signal?: AbortSignal): Promise<NaturalLanguageParseResult> {
  const settings = loadAiSettings();
  if (!settings.geminiApiKey) {
    throw new AiProviderError("MISSING_KEY", "No Gemini API key configured.");
  }

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), 15000);
  const onAbort = () => timeoutController.abort();
  signal?.addEventListener("abort", onAbort);
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.geminiApiKey,
      },
      signal: timeoutController.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  "Return only strict JSON object with keys startDate (optional ISO date), operations (required), confidence (optional). " +
                  `Prompt: ${prompt}`,
              },
            ],
          },
        ],
      }),
    });
  } catch {
    if (signal?.aborted) throw new AiProviderError("TIMEOUT", "Request was cancelled.");
    if (timeoutController.signal.aborted) throw new AiProviderError("TIMEOUT", "Gemini request timed out. Try again.");
    throw new AiProviderError("NETWORK", "Network error while contacting Gemini.");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AiProviderError("INVALID_KEY", "Gemini key rejected. Check and try again.");
  }
  if (response.status === 429) {
    throw new AiProviderError("RATE_LIMITED", "Gemini rate limit reached. Try again shortly.");
  }
  if (!response.ok) {
    throw new AiProviderError("PROVIDER", "Gemini provider request failed.");
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };
  const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new AiProviderError("PROVIDER", "AI provider returned an empty response.");
  }
  let normalized: AiProviderParseOutput;
  try {
    normalized = JSON.parse(rawText) as AiProviderParseOutput;
  } catch {
    throw new AiProviderError("PROVIDER", "AI provider returned non-JSON output.");
  }

  return parseAiProviderOutput(normalized);
}

export async function routeAiParseRequest(
  prompt: string,
  availability: AiAvailabilityResult,
  signal?: AbortSignal,
): Promise<{ parsed: NaturalLanguageParseResult; source: "local" | "gemini" }> {
  if (availability.state === "ready") {
    return { parsed: parseNaturalLanguagePrompt(prompt), source: "local" };
  }

  const settings = loadAiSettings();
  if (!settings.geminiApiKey) {
    throw new AiProviderError("MISSING_KEY", "AI unavailable locally. Add optional Gemini key in settings.");
  }

  try {
    const parsed = await parseWithGemini(prompt, signal);
    return { parsed, source: "gemini" };
  } catch (error) {
    if (error instanceof NaturalLanguageParseError || error instanceof AiProviderError) throw error;
    throw new AiProviderError("PROVIDER", "AI provider returned an invalid response.");
  }
}
