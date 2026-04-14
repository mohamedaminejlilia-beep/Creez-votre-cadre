import { useState } from 'react';
import type { FrameConfig } from '../../../App';
import type { ConfiguratorTranslations } from '../configurator-translations';
import { getFramesThatFitWall } from '../configurator-utils';
import { generateLayout } from '../wall-layout';
import { createGalleryWallItem } from '../gallery-wall';

interface WallSizeStepProps {
  config: FrameConfig;
  updateConfig: (updates: Partial<FrameConfig>) => void;
  t: ConfiguratorTranslations;
}

export function WallSizeStep({ config, updateConfig, t }: WallSizeStepProps) {
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    const allowed = getFramesThatFitWall(config.wallWidthCm, config.wallHeightCm);
    if (allowed.length === 0) {
      setError(t.wallSize?.noFitError ?? 'No frame fits the given wall dimensions.');
      return;
    }
    const layout = generateLayout({
      wallWidthCm: config.wallWidthCm,
      wallHeightCm: config.wallHeightCm,
      spacingCm: config.wallSpacingCm,
      frameCount: config.desiredFrameCount,
      allowedFrames: allowed,
    });
    if (layout.length === 0) {
      setError(t.wallSize?.overCountError ?? 'Requested number of frames cannot fit.');
      return;
    }
    // Switch to gallery‑wall mode and set items
    updateConfig({
      compositionMode: 'gallery-wall',
      galleryItems: layout,
      activeGalleryItemId: layout[0]?.id ?? null,
      selectedGalleryLayoutId: null,
    });
    setError(null);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          W
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{t.wallSize?.title ?? 'Wall size'}</h3>
          <p className="text-sm text-muted-foreground">{t.wallSize?.description ?? 'Enter the dimensions of the wall where the frames will be placed.'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground">{t.wallSize?.widthLabel ?? 'Wall width (cm)'}</label>
          <input
            type="number"
            value={config.wallWidthCm}
            onChange={(e) => updateConfig({ wallWidthCm: Number(e.target.value) })}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">{t.wallSize?.heightLabel ?? 'Wall height (cm)'}</label>
          <input
            type="number"
            value={config.wallHeightCm}
            onChange={(e) => updateConfig({ wallHeightCm: Number(e.target.value) })}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">{t.wallSize?.spacingLabel ?? 'Spacing between frames (cm)'}</label>
          <input
            type="number"
            value={config.wallSpacingCm}
            onChange={(e) => updateConfig({ wallSpacingCm: Number(e.target.value) })}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">{t.wallSize?.frameCountLabel ?? 'Number of frames (optional)'}</label>
          <input
            type="number"
            value={config.desiredFrameCount ?? ''}
            onChange={(e) => updateConfig({ desiredFrameCount: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-border px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary"
            min="1"
          />
        </div>
      </div>
      {error && (
        <div className="mt-2 rounded-lg border border-[var(--accent-brand)]/20 bg-[color-mix(in_srgb,var(--accent-brand)_10%,white)] p-3 text-sm text-[var(--accent-brand)]">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleGenerate}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:opacity-90"
      >
        {t.wallSize?.generateButton ?? 'Generate layout'}
      </button>
    </div>
  );
}
