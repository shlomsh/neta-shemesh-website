import { readdirSync } from "node:fs";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Component layering (src/components/README.md):
//   content -> lib -> motion -> primitives -> site -> (sections | blog) -> app
// A layer may import only from the layers before it. Each block below forbids the layers after it
// (and `app`), for both the "@/..." alias and relative paths ("**/layer/**" matches both).
const COMPONENT_LAYERS = ["motion", "primitives", "site", "sections", "blog"];
const unknownLayers = readdirSync(new URL("./src/components", import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !COMPONENT_LAYERS.includes(d.name))
  .map((d) => d.name);
if (unknownLayers.length) {
  throw new Error(`eslint.config.mjs: src/components/${unknownLayers.join(", ")} is not a known layer; add it to COMPONENT_LAYERS and to the layer rules below (and src/components/README.md).`);
}
const layerPatterns = (...layers) =>
  layers.flatMap((layer) => {
    const dir = layer === "content" || layer === "lib" || layer === "app" ? layer : `components/${layer}`;
    return [`@/${dir}`, `@/${dir}/**`, `**/${layer}/**`];
  });
// `no-restricted-imports` does not look at a dynamic `import("...")`, so the same globs are turned into a
// `no-restricted-syntax` selector (an esquery regex literal cannot contain "/", hence \x2f).
const globToRegex = (glob) =>
  "^" + glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/^\*\*\//, "(?:.*/)?").replace(/\/\*\*$/, "/.*").replace(/\//g, "\\x2f") + "$";
const restrict = (globs, message) => ({
  "no-restricted-imports": ["error", { patterns: [{ group: globs, message }] }],
  "no-restricted-syntax": ["error", { selector: `ImportExpression[source.value=/${globs.map(globToRegex).join("|")}/]`, message }],
});
const layerRule = (from, forbidden) => ({
  files: [`src/${from}/**/*.{ts,tsx}`],
  rules: restrict(layerPatterns(...forbidden), `Layer direction: ${from.replace("components/", "")} must not import ${forbidden.join(", ")} (src/components/README.md).`),
});
const components = (layer, forbidden) => ({
  ...layerRule(`components/${layer}`, forbidden),
});
// Sections are independent units: a section folder never imports another one.
const sectionUnits = readdirSync(new URL("./src/components/sections", import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const sectionRules = sectionUnits.map((unit) => ({
  files: [`src/components/sections/${unit}/**/*.{ts,tsx}`],
  rules: restrict(
    [
      ...layerPatterns("blog", "app"),
      ...sectionUnits.filter((u) => u !== unit).flatMap((u) => [`@/components/sections/${u}/**`, `**/sections/${u}/**`, `../${u}/**`]),
    ],
    `Layer direction: sections must not import blog, app or another section (${unit} is a self-contained unit).`,
  ),
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Git-ignored local scratch: the archived design reference and agent screenshot dirs.
    "reference/**",
    "**/*-out/**",
  ]),
  {
    // Standalone Node utilities run by hand (CommonJS, never bundled into the app).
    files: ["scripts/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  layerRule("content", ["lib", "motion", "primitives", "site", "sections", "blog", "app"]),
  layerRule("lib", ["motion", "primitives", "site", "sections", "blog", "app"]),
  components("motion", ["content", "primitives", "site", "sections", "blog", "app"]),
  components("primitives", ["content", "site", "sections", "blog", "app"]),
  components("site", ["sections", "blog", "app"]),
  ...sectionRules,
  components("blog", ["sections", "app"]),
]);

export default eslintConfig;
