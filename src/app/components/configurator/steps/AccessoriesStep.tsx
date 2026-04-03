import { PackagePlus } from 'lucide-react';
import { FrameConfig } from '../../../App';
import type { ConfiguratorTranslations } from '../configurator-translations';
import { PHOTO_MULTIPLIERS } from '../workbook-pricing';

interface AccessoriesStepProps {
  config: FrameConfig;
  updateConfig: (updates: Partial<FrameConfig>) => void;
  stepNumber: number;
  t: ConfiguratorTranslations;
}

export function AccessoriesStep({ config, updateConfig, stepNumber, t }: AccessoriesStepProps) {
  const multiPhotoDisabled = config.matType !== 'single' || !config.matEnabled;
  const papierPlumeEnabled = config.internalPricing?.papierPlumeEnabled ?? false;
  const photoMultiplier = config.internalPricing?.photoMultiplier ?? 1;

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          {stepNumber}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{t.steps.accessories}</h3>
          <p className="text-sm text-muted-foreground">{t.steps.accessoriesDescription}</p>
        </div>
        <PackagePlus className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        <button
          onClick={() => updateConfig({
            internalPricing: {
              ...config.internalPricing,
              papierPlumeEnabled: !papierPlumeEnabled,
            },
          })}
          className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
            papierPlumeEnabled
              ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,white)]'
              : 'border-border hover:border-primary/50 hover:bg-muted'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                papierPlumeEnabled
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-gray-300'
              }`}
            >
              {papierPlumeEnabled ? (
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : null}
            </div>

            <div className="flex-1">
              <div className="mb-1 font-semibold text-foreground">{t.steps.paperPlume}</div>
              <p className="text-sm text-muted-foreground">{t.steps.paperPlumeDescription}</p>
            </div>
          </div>
        </button>

        <div className={`rounded-lg border p-4 ${multiPhotoDisabled ? 'border-border bg-muted/40' : 'border-border bg-card'}`}>
          <div className="mb-3">
            <div className="font-semibold text-foreground">{t.steps.multiPhoto}</div>
            <p className="text-sm text-muted-foreground">{t.steps.multiPhotoDescription}</p>
          </div>

          <label className="mb-2 block text-sm font-medium text-foreground">{t.steps.photoMultiplier}</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {PHOTO_MULTIPLIERS.map((multiplier) => (
              <button
                key={multiplier}
                disabled={multiPhotoDisabled}
                onClick={() => updateConfig({
                  internalPricing: {
                    ...config.internalPricing,
                    photoMultiplier: multiplier,
                  },
                })}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  photoMultiplier === multiplier
                    ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,white)] text-foreground'
                    : 'border-border bg-white text-muted-foreground'
                } ${multiPhotoDisabled ? 'cursor-not-allowed opacity-60' : 'hover:border-primary/50'}`}
              >
                {multiplier}
              </button>
            ))}
          </div>

          {multiPhotoDisabled ? (
            <p className="mt-2 text-xs text-muted-foreground">{t.steps.multiPhotoDisabled}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
