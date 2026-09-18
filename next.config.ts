import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly pin the workspace root. Without this, Next.js can misdetect
  // it by walking up to a sibling project's leftover pnpm config file in
  // the parent folder, which caused a "multiple lockfiles" warning and may
  // have been contributing to path-resolution issues for native modules.
  turbopack: {
    root: path.resolve("."),
  },
  // @napi-rs/canvas ships a compiled native binary (js-binding.js), which
  // cannot be bundled into an ESM chunk the way pure-JS packages can.
  // Without this, Turbopack fails the build with "non-ecmascript placeable
  // asset" when it tries to bundle it anyway. This tells Next.js to leave
  // it as a real Node.js require/import at runtime instead.
  serverExternalPackages: ["@napi-rs/canvas"],
};

export default nextConfig;
