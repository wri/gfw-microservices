export const getDurationAsString = (start: number, end: number) => {
  // Convert duration to seconds and minutes if needed
  const durationMs = end - start;

  if (durationMs < 0) {
    return '';
  } else if (durationMs < 1000) {
    return `${durationMs.toFixed(2)}ms`;
  } else if (durationMs < 60000) {
    const durationSec = durationMs / 1000;
    return `${durationSec.toFixed(2)}s`;
  } else {
    const durationMin = durationMs / 60000;
    return `${durationMin.toFixed(2)}min`;
  }
};
