import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";
import { resolve } from "path";

// Load .env.local first, then .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("PRISMA_POSTGRES_PARKER_SP_KEY_ANY_CLIENT"),
  },
});
