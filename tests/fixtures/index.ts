// Shared test fixtures for Phase 1
export const TEST_USER = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  emailVerified: true,
  image: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  stripeCustomerId: null,
};

export const TEST_PRO_USER = {
  ...TEST_USER,
  id: "test-pro-user-id",
  email: "pro@example.com",
  stripeCustomerId: "cus_test_123",
};

export const TEST_SESSION = {
  user: TEST_USER,
  session: {
    id: "test-session-id",
    token: "test-token",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
};
