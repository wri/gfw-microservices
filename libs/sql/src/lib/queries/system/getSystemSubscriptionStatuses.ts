export const getSystemSubscriptionStatuses = `SELECT id, status_name FROM SubscriptionStatuses`;

export type SubscriptionStatuses = Array<{
  id: string;
  status_name: string;
}>;
