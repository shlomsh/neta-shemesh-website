# Layout primitives

Typed, reusable building blocks that reproduce the Canva DOM exactly. Card migrations
(`src/components/layout/*`) compose these instead of raw `dangerouslySetInnerHTML`.

**Faithful-port rule:** during a Track B port, keep every Canva `id`, `class`, and inline
style **byte-identical** — pass them through these primitives, don't "improve" them. Design /
spacing fixes happen later in the Track C fidelity pass. The computed-style golden +
DOM-fingerprint guard enforce this.

## Components

### `<SectionBand background? style? …props>`
Full-bleed band wrapper: `position:relative; overflow:hidden; display:grid;
align-items:center; grid-template-columns:auto 100rem auto; z-index:0`. Pass `background` for
the band color and any extra `style` (e.g. `marginTop:'-1px'` seam merges). One per section row.

### `<AnimatedBlock animation …props>`
Renders `<div class="animation_container"><div class="animated" style={{animation}}>{children}</div></div>`,
both at `width/height:100%`. **Keeps the literal `animation_container`/`animated` class names** —
`ScrollAnimator` and the tests depend on them. Pass the element's exact Canva `animation` inline
value (the per-element `rise-*`/`linear_fade` string) as `animation`.

### `<Title id spanId tier onDark? text className? style? …props>`
Renders `<p id className><span id={spanId}>{text}</span><br/></p>`.
- `tier`: `'hero' | 'section' | 'sub'` → applies `.hero-title` / `.section-header` / `.sub-header`.
- `onDark`: adds `.on-dark` (cream header on dark bands; default is dark plum). Set for titles on dark surfaces.
- Pass through layout inline styles that aren't governed by the classes (`direction:'rtl'`, `text-align`, `margin-right`). Do **not** set inline `color/font-size/line-height/letter-spacing` — those are governed by the classes + `--header-color` token.

### `<Prose …props>` (children or `text`)
Body paragraph: `<p {...props}>{children ?? text}</p>`. Pass the Canva `id` and inline style
(`font-family:var(--font-canva-primary)`, `line-height`, `letter-spacing`, `text-align`) verbatim.

### `<AspectImage src alt? aspectPct objectPosition? fillId? imgId? fillStyle? imgStyle? children? style? …props>`
The Canva `padding-top:%` aspect-ratio wrapper + absolute-fill image.
- `aspectPct`: number (→ `${n}%`) or string for the wrapper `padding-top`.
- **Resolves relative `images/…` → `/images/…`** (served from `public/`). Pass full paths unchanged.
- `fillId`/`imgId` set the inner wrapper / `<img>` ids; `fillStyle`/`imgStyle` extend their styles.
- `children` replaces the default `<img>` (use for the clip-path SVG overlays).

### `<Badge svgId gId pathId viewBox d fillColor opacity?>`
A single Canva decorative/credential SVG: `<svg id><g id><path id d/></g></svg>` with the Canva
background-url placeholder. Use one per stacked SVG path (e.g. Footer stacks several).

## Notes
- Decorative clip-path / SVG scaffolding: inline it faithfully (often as `AspectImage` children); don't refactor it during a faithful port.
- A section migrates **fully** to JSX (no leftover `dangerouslySetInnerHTML`) — mixing raw-HTML chunks with JSX siblings makes Next.js chunk-inject `<script>` tags (the fingerprint guard already ignores `<script>`, but full JSX is cleaner).
