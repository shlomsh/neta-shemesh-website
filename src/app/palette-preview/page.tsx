'use client';

interface PaletteOption {
  id: string;
  label: string;
  subtitle: string;
  colors: {
    dark: string;
    mid: string;
    light: string;
    cream: string;
  };
  analysis: string;
}

const palettes: PaletteOption[] = [
  {
    id: 'E',
    label: 'Heather, lifted',
    subtitle: 'Conservative evolution',
    colors: {
      dark: '#6F5867',
      mid: '#A98B98',
      light: '#D9C3CC',
      cream: '#fff0e4',
    },
    analysis:
      'Same mauve identity as your original C, but anchor raised in lightness (+10%) and nudged warmer. The mood survives, the gloom drains out. Lowest risk if you love the mauve but want it to breathe. Works well for editorial, wellness, personal brands.',
  },
  {
    id: 'F',
    label: 'Rosé',
    subtitle: 'Warm & romantic',
    colors: {
      dark: '#834E5E',
      mid: '#BC8595',
      light: '#E8C9D2',
      cream: '#fff0e4',
    },
    analysis:
      'Hue rotated toward rose, chroma raised across the stack. Romantic, warm, inviting — the current popular palette for beauty, wellness, and lifestyle brands. Bold shift from C but unmistakably sophisticated. Highest visual impact of the three.',
  },
  {
    id: 'G',
    label: 'Mauve & honey',
    subtitle: 'Warm/cool contrast',
    colors: {
      dark: '#5E4B57',
      mid: '#9D8597',
      light: '#D8B79E',
      cream: '#fff0e4',
    },
    analysis:
      'Keeps C\'s cool plum anchor, but swaps light tone to warm honey. The warm/cool contrast is what kills the gloom — sunlight against shadow. Most distinctive of the three. Works especially well for mixed-tone sections and creates natural visual rhythm.',
  },
];

export default function PalettePreview() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Header */}
      <div className="px-6 py-12 sm:px-8 sm:py-16 text-center">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: 'var(--color-mauve)' }}
        >
          Netta Site Palette Review
        </p>
        <h1
          className="text-4xl sm:text-5xl font-light mb-4"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-plum)' }}
        >
          Three directions
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg" style={{ color: 'var(--color-mauve)' }}>
          Beyond the gloomy feel of option C. Each pulls a different design lever — choose the
          direction that resonates with Netta&rsquo;s vision.
        </p>
      </div>

      {/* Palette grid */}
      <div className="px-6 sm:px-8 pb-16">
        <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto md:grid-cols-1">
          {palettes.map((palette) => (
            <div key={palette.id} className="bg-white rounded-lg overflow-hidden border border-gray-200/30">
              {/* Label */}
              <div className="px-6 pt-4 pb-2">
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#aaa' }}>
                  Option {palette.id}
                </p>
              </div>

              {/* Color swatches */}
              <div className="flex h-24 sm:h-28">
                {Object.values(palette.colors).map((color, idx) => (
                  <div key={idx} className="flex-1 relative group" style={{ backgroundColor: color }}>
                    <span
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                      }}
                    >
                      {color}
                    </span>
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="px-6 py-6 sm:py-8">
                <div className="mb-4">
                  <h2 className="text-2xl sm:text-3xl font-semibold mb-1" style={{ color: 'var(--color-plum)' }}>
                    {palette.label}
                  </h2>
                  <p className="text-sm sm:text-base" style={{ color: 'var(--color-mauve)' }}>
                    {palette.subtitle}
                  </p>
                </div>

                {/* Analysis */}
                <div className="p-4 rounded" style={{ backgroundColor: 'rgba(200, 170, 170, 0.08)' }}>
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-plum)' }}>
                    {palette.analysis}
                  </p>
                  <p className="text-xs mt-3" style={{ color: 'var(--color-mauve)' }}>
                    <em>— Claude / Impeccable</em>
                  </p>
                </div>

                {/* CSS tokens */}
                <div className="mt-6 p-4 bg-gray-50 rounded font-mono text-xs sm:text-sm overflow-x-auto">
                  <pre style={{ color: 'var(--color-plum)' }}>
{`--color-plum:  ${palette.colors.dark};
--color-mauve: ${palette.colors.mid};
--color-blush: ${palette.colors.light};
--color-cream: ${palette.colors.cream};`}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div
        className="px-6 sm:px-8 py-12 text-center text-sm sm:text-base"
        style={{
          backgroundColor: 'var(--color-plum)',
          color: 'var(--color-cream)',
        }}
      >
        <p className="max-w-2xl mx-auto leading-relaxed">
          To activate any palette, update the color tokens in <code className="bg-black/20 px-2 py-1 rounded font-mono">src/app/globals.css</code> and regenerate snapshots.
          <br />
          <span className="text-xs opacity-80 block mt-3">Not linked from main site — private preview for review.</span>
        </p>
      </div>
    </main>
  );
}
