/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace package's TypeScript source directly (no separate build step).
  transpilePackages: ["@pmstatus/shared"],
  // No ESLint config bundled; don't let linting block a deploy. Type checking still runs.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
