/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Don't leak server framework to clients.
  poweredByHeader: false,

  // gzip / brotli on Vercel's edge — keeps First Load JS snappy.
  compress: true,

  // Skip source map uploads on production builds (smaller deploys, faster cold starts).
  productionBrowserSourceMaps: false,

  // pdfjs-dist ships a worker; we copy it manually to /public in a postinstall step.
  // We also strip the canvas backend (browser-only).
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },

  // Tree-shake icon/animation libraries more aggressively. Saves a few KB
  // off the First Load JS for both / and /analyzer.
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
