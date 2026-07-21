import "@testing-library/jest-dom";

// Mock env variables for T3 Env validation
process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = "mock-token";
process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://mock.posthog.com";
process.env.DATABASE_URL =
  "postgres://postgres:postgres@localhost:5432/oge-eng";
process.env.AUTH_SECRET = "mock-auth-secret-minimum-32-characters-long";
