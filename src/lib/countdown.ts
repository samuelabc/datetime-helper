export interface CountdownValue {
  mode: "until" | "since";
  totalSeconds: number;
  label: string;
}

function formatParts(secondsAbs: number): string {
  const days = Math.floor(secondsAbs / 86400);
  const hours = Math.floor((secondsAbs % 86400) / 3600);
  const minutes = Math.floor((secondsAbs % 3600) / 60);
  const seconds = secondsAbs % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export function getCountdownValue(nowIso: string, targetIso: string): CountdownValue {
  const now = new Date(nowIso).getTime();
  const target = new Date(targetIso).getTime();
  const diffSeconds = Math.floor((target - now) / 1000);
  const mode = diffSeconds >= 0 ? "until" : "since";
  const absSeconds = Math.abs(diffSeconds);
  return {
    mode,
    totalSeconds: absSeconds,
    label: formatParts(absSeconds),
  };
}
