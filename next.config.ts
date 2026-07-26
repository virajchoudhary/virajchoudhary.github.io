import type { NextConfig } from "next";

const neuralProfile = process.env.NEXT_PUBLIC_NEURAL_PROFILE;

if (neuralProfile !== "original" && neuralProfile !== "public") {
  throw new Error(
    "NEXT_PUBLIC_NEURAL_PROFILE must be set to exactly `original` or `public`. " +
      "Use an npm script such as `npm run dev:public` or `npm run build:public`.",
  );
}

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
