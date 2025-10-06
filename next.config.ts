import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
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
