import { beforeEach, describe, expect, it, vi } from "vitest";
import { routeAiParseRequest, AiProviderError } from "./aiProviderRouter";
import { saveAiSettings } from "./aiSettings";

describe("aiProviderRouter", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("throws typed missing key error when key is missing", async () => {
    await expect(routeAiParseRequest("add 2 days")).rejects.toBeInstanceOf(AiProviderError);
  });

  it("routes to gemini and normalizes output when key exists", async () => {
    saveAiSettings({ geminiApiKey: "x", allowPromptPersistence: false, telemetryEnabled: false });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      operations: [{ direction: "add", amount: 2, unit: "days" }],
                      startDate: "2026-02-16",
                    }),
                  },
                ],
              },
            },
          ],
        }),
      }),
    );

    const routed = await routeAiParseRequest("add 2 days");
    expect(routed.source).toBe("gemini");
    expect(routed.parsed.operations).toEqual([{ direction: "add", amount: 2, unit: "days" }]);
  });
});
