/**
 * Barrel for the sanity suite helpers. Open the ONE lib/ file you need, not this list:
 *
 *   lib/source.ts          read src/**, sourceNamed, globalsCss, stripCssComments, expectNone, classStrings
 *   lib/dom.ts             classTokens, hasClass, typeClassesOf, textNodes
 *   lib/page.ts            EXPECTED_SECTIONS, renderHome, findSection, SUBTITLES/subtitleOf, buttons, nav, kindOf
 *   lib/one-screen.ts      data-fit + screen-fit predicates, desktop flex-chain predicates
 *   lib/css.ts             parseTypeRules, sizeRange, parseToneRules, cssVar, displayFontSelectors
 *   lib/scan-rules.ts      SCAN_RULES = scan-typography + scan-layout + scan-code + scan-colour (+ scan-types, SNAP_RULE)
 *   lib/type-literals.ts   classLiterals, typeLiteralOffenses (stacked type-* classes, leading/tracking overrides)
 *   lib/ban-rules.ts       CONTRAST_BANS (NS-42 source bans), ratchetBan, containsBanSample
 *   lib/colour-math.ts     hexToRgb, contrastRatio, themeColours, evalColour
 *   lib/colour-resolve.ts  class list -> text colour / backdrop resolver (foregroundOf, backdropOf)
 *   lib/contrast-report.ts contrastReport, renderContrastPages, requiredRatio, ratchetContrast
 */
export * from './lib/source';
export * from './lib/dom';
export * from './lib/page';
export * from './lib/one-screen';
export * from './lib/css';
export * from './lib/scan-rules';
export * from './lib/type-literals';
export * from './lib/ban-rules';
export * from './lib/colour-math';
export * from './lib/contrast-report';
