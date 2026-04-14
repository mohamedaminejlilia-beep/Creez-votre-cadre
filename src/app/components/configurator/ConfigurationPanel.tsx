import { FrameConfig } from '../../App';
import type { ConfiguratorTranslations } from './configurator-translations';
import { getFrameById, getFrameValidationMessage } from './configurator-utils';
import { ArtworkSizeStep } from './steps/ArtworkSizeStep';
import { ArtworkUploadStep } from './steps/ArtworkUploadStep';
import { FrameStyleStep } from './steps/FrameStyleStep';
import { GlazingStep } from './steps/GlazingStep';
import { MatStep } from './steps/MatStep';

interface ConfigurationPanelProps {
  config: FrameConfig;
  updateConfig: (updates: Partial<FrameConfig>) => void;
  t: ConfiguratorTranslations;
}

export function ConfigurationPanel({ config, updateConfig, t }: ConfigurationPanelProps) {
  const validationMessage = getFrameValidationMessage(config, t);
  const frameSupportsMat = getFrameById(config.frameStyle).supportsMat;
  const glazingStepNumber = frameSupportsMat ? (config.matEnabled ? 4 : 3) : 3;
  const artworkUploadStepNumber = frameSupportsMat ? (config.matEnabled ? 5 : 4) : 4;

  return (
    <div className="space-y-6">
      <ArtworkSizeStep config={config} updateConfig={updateConfig} t={t} />

      <FrameStyleStep config={config} updateConfig={updateConfig} stepNumber={2} t={t} />

      {validationMessage ? (
        <div className="rounded-lg border border-[var(--accent-brand)]/20 bg-[color-mix(in_srgb,var(--accent-brand)_8%,white)] px-4 py-3 text-sm text-[var(--accent-brand)]">
          {validationMessage}
        </div>
      ) : null}

      {frameSupportsMat ? (
        <MatStep
          config={config}
          updateConfig={updateConfig}
          stepNumber={3}
          t={t}
        />
      ) : null}

      <GlazingStep
        config={config}
        stepNumber={glazingStepNumber}
        t={t}
      />

      <ArtworkUploadStep
        config={config}
        updateConfig={updateConfig}
        stepNumber={artworkUploadStepNumber}
        t={t}
      />
    </div>
  );
}