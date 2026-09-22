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
  // asset" when it tries to bundle it anyway. pdfjs-dist is included too as
  // a defensive measure alongside the worker-registration fix in
  // lib/physics-exam-extraction.ts -- this class of PDF-processing library
  // has been observed needing both mitigations together on Vercel.
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
  // One canonical address. Clerk binds a production instance to a single
  // domain and its cookies only work there, so anyone arriving on the
  // *.vercel.app address would be unable to sign in once that move happens.
  //
  // Deliberately NOT permanent: a 308 is cached hard by browsers, and undoing
  // one means asking people to clear site data. Switch to permanent: true once
  // studytrack.win has proven itself.
  //
  // Only the two production aliases are matched. Preview deployments keep
  // their own generated hostnames so they stay reachable.
  async redirects() {
    const canonical = "https://studytrack.win";
    return ["studytrack-cambridge-planner.vercel.app", "studytrack-cambridge-planner-mo-0b56.vercel.app"].map(
      (host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: `${canonical}/:path*`,
        permanent: false,
      }),
    );
  },
};

export default nextConfig;
