import { ShoppingCart } from 'lucide-react';
import { FrameConfig } from '../../App';
import type { ConfiguratorTranslations } from './configurator-translations';
import { calculatePrice, getEffectiveGlazing, getEffectiveMatEnabled, getFrameById, getFrameValidationMessage } from './configurator-utils';

interface PriceBarProps {
  config: FrameConfig;
  t: ConfiguratorTranslations;
}

export function PriceBar({ config, t }: PriceBarProps) {
  const totalPrice = calculatePrice(config);
  const displayedPrice = Math.round(totalPrice);
  const validationMessage = getFrameValidationMessage(config, t);
  const frame = getFrameById(config.frameStyle);
  const glazing = getEffectiveGlazing(config);
  const matEnabled = getEffectiveMatEnabled(config);
  const isDisabled = Boolean(validationMessage);
  const matOptionLabel = {
    single: t.steps.matTypeSingle,
    double: t.steps.matTypeDouble,
    triple: t.steps.matTypeTriple,
    v_groove: t.steps.matTypeVGroove,
    multiple: t.steps.matTypeMultiple,
    box: t.steps.matTypeBox,
  }[config.matType];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-3 text-sm text-muted-foreground sm:grid-cols-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em]">{t.summary.moldingId}</div>
              <div className="mt-1 font-semibold text-foreground">{frame.lookupLabel}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em]">{t.summary.finish}</div>
              <div className="mt-1 font-semibold text-foreground">{frame.finish}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em]">{t.summary.glazing}</div>
              <div className="mt-1 font-semibold text-foreground">{glazing === 'glass' ? t.summary.withGlass : t.summary.withoutGlass}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em]">{t.summary.matOption}</div>
              <div className="mt-1 font-semibold text-foreground">{matEnabled ? matOptionLabel : t.steps.matOptionNone}</div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">{t.summary.estimatedPrice}</div>
              <div className="text-3xl font-bold text-foreground">MAD {displayedPrice}</div>
              {validationMessage ? (
                <div className="mt-1 text-sm text-[var(--accent-brand)]">{validationMessage}</div>
              ) : null}
            </div>

            <button
              disabled={isDisabled}
              className={`flex items-center gap-3 rounded-lg px-8 py-4 font-semibold shadow-md transition ${
                isDisabled
                  ? 'cursor-not-allowed bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {t.summary.addToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
