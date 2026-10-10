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
// RTL guard (CLAUDE.md, Layout): the site is <html dir="rtl">, so a physical-direction utility (text-right, ml-4,
// pr-*, border-r, rounded-l, left-0 ...) is a bug the day the direction flips and reads backwards beside the logical
// utilities already used (ps-*, me-*, start-*, text-start ...). Matches a class token (any variant prefix, optional
// leading "-") inside any string or template literal of a .tsx file. Deliberately no "/" in the regex (an esquery
// regex literal cannot contain one). A genuine physical need is waved through on its own line with
// `// eslint-disable-next-line no-restricted-syntax -- <reason>`.
const PHYSICAL_UTILITY = String.raw`(?<![\w-])-?(?:text-(?:left|right)|(?:float|clear)-(?:left|right)|(?:scroll-)?[mp][lr]-|border-[lr](?!\w)|rounded-(?:[lr]|tl|tr|bl|br)(?!\w)|(?:left|right)-(?:\d|\[|\(|auto(?![\w-])|px(?![\w-])|full(?![\w-])))`;
const PHYSICAL_MESSAGE =
  "Physical-direction utility on a dir=rtl site: use the logical one (text-start/end, ms-/me-, ps-/pe-, border-s/e, rounded-s/e, start-/end-N). Intentional exception: `// eslint-disable-next-line no-restricted-syntax -- reason`.";
const physicalSelectors = [
  { selector: `Literal[value=/${PHYSICAL_UTILITY}/]`, message: PHYSICAL_MESSAGE },
  { selector: `TemplateElement[value.raw=/${PHYSICAL_UTILITY}/]`, message: PHYSICAL_MESSAGE },
];
const restrict = (globs, message, { physical = false } = {}) => ({
  "no-restricted-imports": ["error", { patterns: [{ group: globs, message }] }],
  "no-restricted-syntax": [
    "error",
    { selector: `ImportExpression[source.value=/${globs.map(globToRegex).join("|")}/]`, message },
    ...(physical ? physicalSelectors : []),
  ],
});
// A later config replaces an earlier `no-restricted-syntax` list instead of merging, so every block that sets it
// (the layer rules) must carry the physical-direction selectors itself: .ts files get the import rule only, .tsx both.
const restrictBlocks = (dir, globs, message) => [
  { files: [`src/${dir}/**/*.ts`], rules: restrict(globs, message) },
  { files: [`src/${dir}/**/*.tsx`], rules: restrict(globs, message, { physical: true }) },
];
const layerRule = (from, forbidden) =>
  restrictBlocks(from, layerPatterns(...forbidden), `Layer direction: ${from.replace("components/", "")} must not import ${forbidden.join(", ")} (src/components/README.md).`);
const components = (layer, forbidden) => layerRule(`components/${layer}`, forbidden);
// Sections are independent units: a section folder never imports another one.
const sectionUnits = readdirSync(new URL("./src/components/sections", import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const sectionRules = sectionUnits.flatMap((unit) =>
  restrictBlocks(
    `components/sections/${unit}`,
    [
      ...layerPatterns("blog", "app"),
      ...sectionUnits.filter((u) => u !== unit).flatMap((u) => [`@/components/sections/${u}/**`, `**/sections/${u}/**`, `../${u}/**`]),
    ],
    `Layer direction: sections must not import blog, app or another section (${unit} is a self-contained unit).`,
  ),
);

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
  // src/app (pages, layout) sits outside the layer rules: it only gets the physical-direction guard.
  { files: ["src/app/**/*.tsx"], rules: { "no-restricted-syntax": ["error", ...physicalSelectors] } },
  ...layerRule("content", ["lib", "motion", "primitives", "site", "sections", "blog", "app"]),
  ...layerRule("lib", ["motion", "primitives", "site", "sections", "blog", "app"]),
  ...components("motion", ["content", "primitives", "site", "sections", "blog", "app"]),
  ...components("primitives", ["content", "site", "sections", "blog", "app"]),
  ...components("site", ["sections", "blog", "app"]),
  ...sectionRules,
  ...components("blog", ["sections", "app"]),
]);

export default eslintConfig;
