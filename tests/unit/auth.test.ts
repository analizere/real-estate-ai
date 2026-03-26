import { describe, it } from "vitest";

describe("AUTH-01: Email/password signup", () => {
  it.todo("creates a user with email and password");
  it.todo("rejects duplicate email");
  it.todo("hashes password before storing");
});

describe("AUTH-02: Google OAuth", () => {
  it.todo("redirects to Google OAuth consent screen");
  it.todo("creates user on first OAuth sign-in");
});

describe("AUTH-03: Email verification", () => {
  it.todo("sends verification email on signup");
  it.todo("marks email as verified after link click");
});

describe("AUTH-04: Password reset", () => {
  it.todo("sends reset email for existing user");
  it.todo("rejects reset with expired token");
});

describe("AUTH-05: Session persistence", () => {
  it.todo("session cookie persists across requests");
  it.todo("expired session returns 401");
});
