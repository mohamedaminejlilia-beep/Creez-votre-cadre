import { Sparkles } from 'lucide-react';
import { FrameConfig } from '../../../App';
import type { ConfiguratorTranslations } from '../configurator-translations';
import { getFrameById } from '../configurator-utils';

interface GlazingStepProps {
  config: FrameConfig;
  stepNumber: number;
  t: ConfiguratorTranslations;
}

export function GlazingStep({ config, stepNumber, t }: GlazingStepProps) {
  const frame = getFrameById(config.frameStyle);
  const supportsGlass = frame.supportsGlass;

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          {stepNumber}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{t.steps.glazing}</h3>
          <p className="text-sm text-muted-foreground">{t.steps.glazingDescription}</p>
        </div>
        <Sparkles className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${
        supportsGlass
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      }`}>
        {supportsGlass ? t.steps.glassIncludedNote : t.steps.noGlassNote}
      </div>
    </div>
  );
}
