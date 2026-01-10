"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // 如果是 401 錯誤，不要重試
              if (error instanceof Error && error.message.includes("Unauthorized")) {
                return false;
              }
              // 其他錯誤最多重試 2 次
              return failureCount < 2;
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              // mutation 遇到 401 錯誤不重試
              if (error instanceof Error && error.message.includes("Unauthorized")) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
