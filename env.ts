import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PARKER_GCP_TEST_API_KEY: z.string(),
    PRISMA_POSTGRES_PARKER_SP_ORM_KEY: z.string(),
    PRISMA_POSTGRES_PARKER_SP_KEY_ANY_CLIENT: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().url(),
  },

  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    PARKER_GCP_TEST_API_KEY: process.env.PARKER_GCP_TEST_API_KEY,
    PRISMA_POSTGRES_PARKER_SP_ORM_KEY:
      process.env.PRISMA_POSTGRES_PARKER_SP_ORM_KEY,
    PRISMA_POSTGRES_PARKER_SP_KEY_ANY_CLIENT:
      process.env.PRISMA_POSTGRES_PARKER_SP_KEY_ANY_CLIENT,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true,
});
