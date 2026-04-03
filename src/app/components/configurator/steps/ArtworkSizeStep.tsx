import { Ruler } from 'lucide-react';
import { FrameConfig } from '../../../App';
import type { ConfiguratorTranslations } from '../configurator-translations';
import { FRAME_STYLES, type Unit } from '../configurator-data';
import {
  convertToCm,
  formatSizePair,
  getDisplaySize,
  getFrameValidationMessage,
} from '../configurator-utils';

interface ArtworkSizeStepProps {
  config: FrameConfig;
  updateConfig: (updates: Partial<FrameConfig>) => void;
  t: ConfiguratorTranslations;
}

export function ArtworkSizeStep({ config, updateConfig, t }: ArtworkSizeStepProps) {
  const units: Unit[] = ['mm', 'cm', 'inch'];
  const widthValue = getDisplaySize(config.artworkWidthCm, config.unit);
  const heightValue = getDisplaySize(config.artworkHeightCm, config.unit);
  const selectedFrame = FRAME_STYLES.find((frame) => frame.id === config.frameStyle) ?? FRAME_STYLES[0];
  const error = getFrameValidationMessage(config, t);

  const handleDimensionChange = (key: 'artworkWidthCm' | 'artworkHeightCm', rawValue: string) => {
    const nextValue = Number.parseInt(rawValue, 10);
    const nextCmValue = convertToCm(Number.isFinite(nextValue) ? nextValue : 0, config.unit);

    if (key === 'artworkWidthCm') {
      updateConfig({ artworkWidthCm: nextCmValue });
      return;
    }

    updateConfig({ artworkHeightCm: nextCmValue });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          1
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{t.steps.artworkSize}</h3>
          <p className="text-sm text-muted-foreground">{t.steps.artworkSizeDescription}</p>
        </div>
        <Ruler className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t.steps.width}</label>
            <input
              type="number"
              value={widthValue}
              onChange={(e) => handleDimensionChange('artworkWidthCm', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2 outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary"
              min="1"
              step="1"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t.steps.height}</label>
            <input
              type="number"
              value={heightValue}
              onChange={(e) => handleDimensionChange('artworkHeightCm', e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2 outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary"
              min="1"
              step="1"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">{t.steps.unit}</label>
          <div className="flex gap-2">
            {units.map((unit) => (
              <button
                key={unit}
                onClick={() => updateConfig({ unit })}
                className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
                  config.unit === unit
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:opacity-90'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <div>{t.steps.internalExactSize}: {config.artworkWidthCm} x {config.artworkHeightCm} cm</div>
          <div>{t.steps.allowedForFrame} {selectedFrame.id}: {formatSizePair(selectedFrame.minWidthCm, selectedFrame.minHeightCm, config.unit)} - {formatSizePair(selectedFrame.maxWidthCm, selectedFrame.maxHeightCm, config.unit)}</div>
        </div>

        {error ? (
          <div className="rounded-lg border border-[var(--accent-brand)]/20 bg-[color-mix(in_srgb,var(--accent-brand)_10%,white)] p-3">
            <p className="text-sm text-[var(--accent-brand)]">{error}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
