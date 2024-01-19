export function calculateAccountUsagePercentage(accountUsage: number, accountLimit: number) {
  if (accountUsage === 0 || accountLimit === 0) {
    return 0; // Avoid division by zero
  }

  const usagePercentage = (accountUsage / accountLimit) * 100;

  return Math.min(100, usagePercentage); // Ensure the percentage does not exceed 100%
}
