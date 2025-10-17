/**
 * This file is intended for frontend client code
 */

// Sync with apps/webserver/src/client/common/js/config.js
// statusOptions array.
export const USER_STATUS = {
  Draft: 0,
  Pending: 1,
  Active: 2,
  Inactive: 3,
};

// create reverse map automatically
export const USER_STATUS_LABELS = Object.fromEntries(
  Object.entries(USER_STATUS).map(([key, value]) => [value, key])
);
