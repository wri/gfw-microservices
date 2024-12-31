export function formatDurationStr(start: number, end: number): string {
  const durationMs = end - start;
  let durationStr: string;

  if (durationMs < 1000) {
    durationStr = `${durationMs.toFixed(2)}ms`;
  } else if (durationMs < 60000) {
    const durationSec = durationMs / 1000;
    durationStr = `${durationSec.toFixed(2)}s`;
  } else {
    const durationMin = durationMs / 60000;
    durationStr = `${durationMin.toFixed(2)}min`;
  }

  return durationStr;
}

export function formatHeapUsed(heapUsed: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;

  while (heapUsed >= 1024 && unitIndex < units.length - 1) {
    heapUsed /= 1024;
    unitIndex++;
  }

  return `${heapUsed.toFixed(2)} ${units[unitIndex]}`;
}
