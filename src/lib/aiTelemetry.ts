export interface AiTelemetryEvent {
  source: "local" | "gemini";
  status: "success" | "error" | "cancelled";
  durationMs: number;
}

const events: AiTelemetryEvent[] = [];
const MAX_EVENT_BUFFER = 200;

export function emitAiTelemetry(event: AiTelemetryEvent, enabled: boolean): void {
  if (!enabled) return;
  if (events.length >= MAX_EVENT_BUFFER) {
    events.shift();
  }
  events.push(event);
}

export function getAiTelemetryEvents(): AiTelemetryEvent[] {
  return [...events];
}

export function clearAiTelemetryEvents(): void {
  events.length = 0;
}
