import type { NextConfig } from "next";

// No custom domain for this project, so GitHub Pages serves it at
// https://nvastano.github.io/nyhl-shifts/ — Next needs basePath set to that
// subpath or every asset/link resolves against the wrong root.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/nyhl-shifts",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
