import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      "styled/index": "src/styled/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
    splitting: false,
    treeshake: true,
  },
  {
    entry: ["src/styled/styles.css"],
    outDir: "dist",
    // pass CSS through unchanged
    loader: { ".css": "copy" },
  },
]);
