/** Formats a cost value (meters) as a human-readable string */
export const formatCost = (value: number): string => {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} km`;
  return `${value} m`;
};
