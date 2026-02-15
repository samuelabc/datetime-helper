import { describe, it, expect } from "vitest";
import {
  parseNaturalLanguagePrompt,
  parsedOperationsToRows,
  NaturalLanguageParseError,
  parseAiProviderOutput,
} from "./naturalLanguageParser";

describe("naturalLanguageParser", () => {
  it("parses single-step prompt", () => {
    const parsed = parseNaturalLanguagePrompt("6 months ago from now");
    expect(parsed.operations).toEqual([{ direction: "subtract", amount: 6, unit: "months" }]);
  });

  it("preserves operation order for multi-step prompts", () => {
    const parsed = parseNaturalLanguagePrompt("add 1 month then subtract 3 days");
    const rows = parsedOperationsToRows(parsed.operations);
    expect(rows.map((row) => `${row.direction}:${row.amount}:${row.unit}`)).toEqual(["add:1:months", "subtract:3:days"]);
  });

  it("throws typed error on ambiguous prompt", () => {
    expect(() => parseNaturalLanguagePrompt("today maybe")).toThrow(NaturalLanguageParseError);
    expect(() => parseNaturalLanguagePrompt("today maybe")).toThrow(/date intent/i);
  });

  it("parses plus/minus aliases and compact operator syntax", () => {
    const parsed = parseNaturalLanguagePrompt("plus 2 hours and -15 minutes");
    expect(parsed.operations).toEqual([
      { direction: "add", amount: 2, unit: "hours" },
      { direction: "subtract", amount: 15, unit: "minutes" },
    ]);
  });

  it("parses later/earlier phrasing", () => {
    const parsed = parseNaturalLanguagePrompt("3 days later then 4 hours earlier");
    expect(parsed.operations).toEqual([
      { direction: "add", amount: 3, unit: "days" },
      { direction: "subtract", amount: 4, unit: "hours" },
    ]);
  });

  it("extracts explicit start date intent from prompt", () => {
    const parsed = parseNaturalLanguagePrompt("from 2026-03-01 add 2 days");
    expect(parsed.startDateIntent).toEqual({ kind: "explicit", value: "2026-03-01" });
  });

  it("maps AI provider output through adapter boundary", () => {
    const parsed = parseAiProviderOutput({
      startDate: "2026-03-01",
      operations: [{ direction: "add", amount: 2, unit: "days" }],
    });
    expect(parsed.startDateIntent).toEqual({ kind: "explicit", value: "2026-03-01" });
    expect(parsed.operations).toEqual([{ direction: "add", amount: 2, unit: "days" }]);
  });
});
