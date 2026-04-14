import { useState } from 'react';
import { Frame } from 'lucide-react';
import { FrameConfig } from '../../../App';
import type { ConfiguratorTranslations } from '../configurator-translations';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { FRAME_STYLES } from '../configurator-data';
import { useFrameAsset } from '../frame-assets';
import { formatSizePair } from '../configurator-utils';

interface FrameStyleStepProps {
  config: FrameConfig;
  updateConfig: (updates: Partial<FrameConfig>) => void;
  stepNumber: number;
  t: ConfiguratorTranslations;
}

interface FrameStyleCardProps {
  frameId: string;
  isSelected: boolean;
  onSelect: () => void;
  name: string;
  minWidthCm: number;
  minHeightCm: number;
  maxWidthCm: number;
  maxHeightCm: number;
  unit: FrameConfig['unit'];
  t: ConfiguratorTranslations;
}

function FrameStyleCard({
  frameId,
  isSelected,
  onSelect,
  name,
  minWidthCm,
  minHeightCm,
  maxWidthCm,
  maxHeightCm,
  unit,
  t,
}: FrameStyleCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const frontAsset = useFrameAsset(frameId, 'front');
  const closeupAsset = useFrameAsset(frameId, 'closeup');
  const activeImage = isHovered && closeupAsset.isAvailable ? closeupAsset.src : frontAsset.src;
  const showImage = isHovered ? closeupAsset.isAvailable || frontAsset.isAvailable : frontAsset.isAvailable;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`relative rounded-lg border-2 p-4 text-left transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,white)] shadow-sm'
          : 'border-border hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(145deg,#f5f5f5,#e7e7e7)]">
        {showImage ? (
          <ImageWithFallback src={activeImage} alt={`${frameId} frame preview`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[linear-gradient(145deg,#f8f8f8,#ececec)] text-center text-xs text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border bg-white/70 text-sm font-semibold text-foreground">
              {frameId}
            </div>
            <div>{t.steps.renderPlaceholder}</div>
          </div>
        )}
      </div>

      <div className="space-y-1 text-left">
        <div className="text-sm font-semibold text-foreground">{frameId}</div>
        <div className="text-xs text-muted-foreground">{name}</div>
        <div className="text-xs text-muted-foreground">{t.steps.min}: {formatSizePair(minWidthCm, minHeightCm, unit)}</div>
        <div className="text-xs text-muted-foreground">{t.steps.max}: {formatSizePair(maxWidthCm, maxHeightCm, unit)}</div>
      </div>

      {isSelected ? (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      ) : null}
    </button>
  );
}

export function FrameStyleStep({ config, updateConfig, stepNumber, t }: FrameStyleStepProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          {stepNumber}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{t.steps.frameModel}</h3>
          <p className="text-sm text-muted-foreground">{t.steps.frameModelDescription}</p>
        </div>
        <Frame className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="max-h-[34rem] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {FRAME_STYLES.map((style) => (
            <FrameStyleCard
              key={style.id}
              frameId={style.id}
              name={style.name}
              minWidthCm={style.minWidthCm}
              minHeightCm={style.minHeightCm}
              maxWidthCm={style.maxWidthCm}
              maxHeightCm={style.maxHeightCm}
              unit={config.unit}
              t={t}
              isSelected={config.frameStyle === style.id}
              onSelect={() => updateConfig({ frameStyle: style.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
