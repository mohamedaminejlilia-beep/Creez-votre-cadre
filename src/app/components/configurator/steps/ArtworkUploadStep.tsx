import { ImagePlus, RotateCcw } from 'lucide-react';
import { ChangeEvent } from 'react';
import { FrameConfig } from '../../../App';
import type { ConfiguratorTranslations } from '../configurator-translations';

interface ArtworkUploadStepProps {
  config: FrameConfig;
  updateConfig: (updates: Partial<FrameConfig>) => void;
  stepNumber: number;
  t: ConfiguratorTranslations;
}

export function ArtworkUploadStep({ config, updateConfig, stepNumber, t }: ArtworkUploadStepProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (config.uploadedArtworkUrl) {
      URL.revokeObjectURL(config.uploadedArtworkUrl);
    }

    updateConfig({
      uploadedArtworkUrl: URL.createObjectURL(file),
      uploadedArtworkName: file.name,
    });

    event.target.value = '';
  };

  const handleClear = () => {
    if (config.uploadedArtworkUrl) {
      URL.revokeObjectURL(config.uploadedArtworkUrl);
    }

    updateConfig({
      uploadedArtworkUrl: null,
      uploadedArtworkName: null,
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          {stepNumber}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{t.steps.artworkUpload}</h3>
          <p className="text-sm text-muted-foreground">{t.steps.artworkUploadDescription}</p>
        </div>
        <ImagePlus className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center transition hover:border-primary/50 hover:bg-muted">
          <div>
            <div className="font-medium text-foreground">{t.steps.chooseArtworkImage}</div>
            <div className="mt-1 text-sm text-muted-foreground">{t.steps.fileTypes}</div>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>

        <div className="rounded-lg bg-muted p-3">
          <div className="text-sm text-muted-foreground">{t.steps.currentArtwork}</div>
          <div className="font-medium text-foreground">{config.uploadedArtworkName ?? t.steps.usingPlaceholderArtwork}</div>
        </div>

        {config.uploadedArtworkUrl ? (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            {t.steps.removeUpload}
          </button>
        ) : null}
      </div>
    </div>
  );
}
