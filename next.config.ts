import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ["@prisma/adapter-better-sqlite3", "better-sqlite3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.weatherbit.io",
        port: "",
        pathname: "/static/img/icons/**",
      },
    ],
  },
};

export default nextConfig;
