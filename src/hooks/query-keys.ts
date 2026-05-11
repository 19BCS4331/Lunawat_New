export const queryKeys = {
  auth: {
    status: () => ['auth', 'status'] as const,
  },
  loans: {
    all: () => ['loans', 'all'] as const,
    outstanding: () => ['loans', 'outstanding'] as const,
    profile: () => ['loans', 'profile'] as const,
    details: (id: string) => ['loans', 'details', id] as const,
  },
  payments: {
    online: () => ['payments', 'online'] as const,
    offline: () => ['payments', 'offline'] as const,
    details: (id: string) => ['payments', 'details', id] as const,
  },
  account: {
    validateToken: () => ['account', 'validateToken'] as const,
    latestVersion: () => ['account', 'latestVersion'] as const,
  },
} as const;
