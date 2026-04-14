import { Square } from 'lucide-react';
import { FrameConfig } from '../../../App';
import type { ConfiguratorTranslations } from '../configurator-translations';
import { MAT_COLORS } from '../configurator-data';
import { getAvailableMatTypes, getFrameById, supportsBoxMat } from '../configurator-utils';

interface MatStepProps {
  config: FrameConfig;
  updateConfig: (updates: Partial<FrameConfig>) => void;
  stepNumber: number;
  t: ConfiguratorTranslations;
}

type MatTypeCard = {
  id: FrameConfig['matType'];
  title: string;
  description: string;
  disabled?: boolean;
  badge?: string;
};

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-foreground">{label}</label>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {MAT_COLORS.map((color) => (
          <button
            key={color.id}
            onClick={() => onChange(color.id)}
            className={`group relative aspect-square rounded-lg transition-all ${
              value === color.id
                ? 'scale-105 ring-2 ring-primary ring-offset-2'
                : 'hover:scale-105'
            }`}
            title={color.name}
          >
            <div
              className="h-full w-full rounded-lg border-2 border-gray-300"
              style={{ backgroundColor: color.hex }}
            />

            {value === color.id ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-foreground">
        {label}: <span className="text-primary">{value.toFixed(1)} cm</span>
      </label>
      <input
        type="range"
        min={String(min)}
        max={String(max)}
        step={String(step)}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value) || min)}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[var(--primary)]"
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{min.toFixed(1)} cm</span>
        <span>{max.toFixed(1)} cm</span>
      </div>
    </div>
  );
}

function LayerThicknessField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <RangeField
      label={label}
      value={value}
      min={2}
      max={10}
      step={0.5}
      onChange={onChange}
    />
  );
}

export function MatStep({ config, updateConfig, stepNumber, t }: MatStepProps) {
  const frame = getFrameById(config.frameStyle);
  const boxCompatible = supportsBoxMat(frame);
  const allowedMatTypes = getAvailableMatTypes(frame);
  const cards: MatTypeCard[] = [
    { id: 'single', title: t.steps.matTypeSingle, description: t.steps.matTypeSingleDescription, disabled: !allowedMatTypes.includes('single') },
    { id: 'double', title: t.steps.matTypeDouble, description: t.steps.matTypeDoubleDescription, disabled: !allowedMatTypes.includes('double') },
    { id: 'v_groove', title: t.steps.matTypeVGroove, description: t.steps.matTypeVGrooveDescription, disabled: !allowedMatTypes.includes('v_groove') },
    { id: 'triple', title: t.steps.matTypeTriple, description: t.steps.matTypeTripleDescription, disabled: !allowedMatTypes.includes('triple') },
    { id: 'multiple', title: t.steps.matTypeMultiple, description: t.steps.matTypeMultipleDescription, disabled: true, badge: t.steps.comingSoon },
    { id: 'box', title: t.steps.matTypeBox, description: t.steps.matTypeBoxDescription, disabled: !allowedMatTypes.includes('box') || !boxCompatible, badge: !boxCompatible ? t.steps.boxIncompatible : undefined },
  ];

  const isDouble = config.matType === 'double';
  const isTriple = config.matType === 'triple';
  const isVGroove = config.matType === 'v_groove';
  const isBox = config.matType === 'box';

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          {stepNumber}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{t.steps.mat}</h3>
          <p className="text-sm text-muted-foreground">{t.steps.matDescription}</p>
        </div>
        <Square className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
          <div>
            <div className="font-medium text-foreground">{t.steps.enableMat}</div>
            <div className="text-sm text-muted-foreground">{t.steps.matToggleDescription}</div>
          </div>

          <button
            onClick={() => updateConfig({ matEnabled: !config.matEnabled })}
            className={`relative h-8 w-14 rounded-full transition-colors ${
              config.matEnabled ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                config.matEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {config.matEnabled ? (
          <div className="animate-in slide-in-from-top-2 fade-in space-y-6 duration-300">
            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">{t.steps.matTypeLabel}</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    disabled={card.disabled}
                    onClick={() => updateConfig({ matType: card.id })}
                    className={`rounded-xl border p-4 text-left transition ${
                      config.matType === card.id
                        ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,white)]'
                        : 'border-border bg-white'
                    } ${
                      card.disabled
                        ? 'cursor-not-allowed opacity-60'
                        : 'hover:border-primary/50 hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-foreground">{card.title}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                      </div>
                      {card.badge ? (
                        <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                          {card.badge}
                        </span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <LayerThicknessField
              label={t.steps.matTopThickness}
              value={config.matTopThicknessCm}
              onChange={(value) => updateConfig({ matTopThicknessCm: value, matThicknessCm: value })}
            />

            <ColorPicker
              label={t.steps.matTopColor}
              value={config.matColor}
              onChange={(value) => updateConfig({ matColor: value })}
            />

            {isDouble || isTriple ? (
              <>
                {isDouble ? (
                  <>
                    <LayerThicknessField
                      label={t.steps.matBottomThickness}
                      value={config.matBottomThicknessCm}
                      onChange={(value) => updateConfig({ matBottomThicknessCm: value })}
                    />
                    <ColorPicker
                      label={t.steps.matBottomColor}
                      value={config.matBottomColor}
                      onChange={(value) => updateConfig({ matBottomColor: value })}
                    />
                  </>
                ) : null}
                {isTriple ? (
                  <>
                    <LayerThicknessField
                      label={t.steps.matMiddleThickness}
                      value={config.matMiddleThicknessCm}
                      onChange={(value) => updateConfig({ matMiddleThicknessCm: value })}
                    />
                    <ColorPicker
                      label={t.steps.matMiddleColor}
                      value={config.matMiddleColor}
                      onChange={(value) => updateConfig({ matMiddleColor: value })}
                    />
                    <LayerThicknessField
                      label={t.steps.matBottomThickness}
                      value={config.matBottomThicknessCm}
                      onChange={(value) => updateConfig({ matBottomThicknessCm: value })}
                    />
                    <ColorPicker
                      label={t.steps.matBottomColor}
                      value={config.matBottomColor}
                      onChange={(value) => updateConfig({ matBottomColor: value })}
                    />
                  </>
                ) : null}
              </>
            ) : null}

            {isVGroove ? (
              <>
                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                  <div>
                    <div className="font-medium text-foreground">{t.steps.grooveEnabled}</div>
                    <div className="text-sm text-muted-foreground">{t.steps.matTypeVGrooveDescription}</div>
                  </div>
                  <button
                    onClick={() => updateConfig({ grooveEnabled: !config.grooveEnabled })}
                    className={`relative h-8 w-14 rounded-full transition-colors ${
                      config.grooveEnabled ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                        config.grooveEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <RangeField
                  label={t.steps.grooveOffset}
                  value={config.grooveOffsetCm}
                  min={0.3}
                  max={2}
                  step={0.1}
                  onChange={(value) => updateConfig({ grooveOffsetCm: value })}
                />
              </>
            ) : null}

            {isBox ? (
              <RangeField
                label={t.steps.boxDepth}
                value={config.boxDepthCm}
                min={0.5}
                max={3}
                step={0.1}
                onChange={(value) => updateConfig({ boxDepthCm: value })}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
