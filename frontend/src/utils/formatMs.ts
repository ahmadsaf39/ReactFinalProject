/** Formats an execution time in milliseconds to a human-readable string */
export const formatMs = (value: number): string => {
  if (value < 1) return `${(value * 1000).toFixed(2)} µs`;
  if (value >= 1000) return `${(value / 1000).toFixed(3)} s`;
  return `${value.toFixed(3)} ms`;
};
