export function calculateAccountUsagePercentage(accountUsage: number, accountLimit: number) {
  if (accountLimit <= 0) {
    return 100; // Avoid division by zero and negative values
  }

  const usagePercentage = (accountUsage / accountLimit) * 100;

  return Math.min(100, usagePercentage); // Ensure the percentage does not exceed 100%
}
