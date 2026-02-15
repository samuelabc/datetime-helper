import type { NaturalLanguageParseResult } from "./naturalLanguageParser";

export interface ConfidenceViewStep {
  operationIndex: number;
  label: string;
  scoreLabel: string;
  lowConfidence: boolean;
  sourceText: string;
}

export interface ConfidenceViewModel {
  summary: string;
  unavailable: boolean;
  steps: ConfidenceViewStep[];
}

const LOW_CONFIDENCE_THRESHOLD = 0.7;

export function toConfidenceViewModel(parsed: NaturalLanguageParseResult): ConfidenceViewModel {
  const confidence = parsed.confidence;
  if (!confidence) {
    return {
      summary: "Confidence unavailable",
      unavailable: true,
      steps: parsed.operations.map((operation, index) => ({
        operationIndex: index,
        label: `${operation.direction} ${operation.amount} ${operation.unit}`,
        scoreLabel: "N/A",
        lowConfidence: false,
        sourceText: "",
      })),
    };
  }

  const scoreByOperation = new Map(confidence.steps.map((step) => [step.operationIndex, step]));
  return {
    summary: confidence.summary,
    unavailable: false,
    steps: parsed.operations.map((operation, index) => {
      const step = scoreByOperation.get(index);
      const score = step?.score;
      return {
        operationIndex: index,
        label: `${operation.direction} ${operation.amount} ${operation.unit}`,
        scoreLabel: typeof score === "number" ? `${Math.round(score * 100)}%` : "N/A",
        lowConfidence: typeof score === "number" && score < LOW_CONFIDENCE_THRESHOLD,
        sourceText: step?.sourceText ?? "",
      };
    }),
  };
}
