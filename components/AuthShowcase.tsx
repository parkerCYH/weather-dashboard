"use client";

import { env } from "@/env";
import { signIn } from "next-auth/react";

export function AuthShowcase() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">

      <button
        className="rounded-full bg-blue-600 px-10 py-3 font-semibold text-white no-underline transition hover:bg-blue-700 shadow-md"
        onClick={
          () =>
            void signIn("github", {
              callbackUrl: env.NEXT_PUBLIC_API_BASE_URL,
            })
        }
      >
        Sign in by Github
      </button>
    </div>
  );
}
