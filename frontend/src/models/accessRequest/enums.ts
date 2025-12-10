export const AccessRequestStatus = {
  requested: "requested",
  granted: "granted",
  revoked: "revoked",
  denied: "denied",
} as const;

export type AccessRequestStatus = typeof AccessRequestStatus[keyof typeof AccessRequestStatus];