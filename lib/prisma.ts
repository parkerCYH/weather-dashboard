import { PrismaClient } from "../generated/prisma/client";

// Initialize Prisma Client with Accelerate connection string
// Next.js automatically loads .env.local and .env files
const prisma = new PrismaClient({
  accelerateUrl: process.env.PRISMA_POSTGRES_PARKER_SP_ORM_KEY!,
});

export { prisma };
