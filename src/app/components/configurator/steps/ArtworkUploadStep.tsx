import { ChevronDown, Crop, ImagePlus, RotateCcw } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { FrameConfig } from '../../../App';
import { ArtworkCropEditor } from '../ArtworkCropEditor';
import {
  getCropMemoryTransitionUpdate,
  getArtworkCropPresetKey,
} from '../artwork-crop';
import {
  getActiveGalleryWallItem,
  updateGalleryWallItem,
} from '../gallery-wall';
import {
  getArtworkRatioLock,
  getBestFittedArtworkSize,
  getClosestStandardArtworkRatio,
  getDetectedArtworkRatioLabel,
  STANDARD_ARTWORK_RATIOS,
} from '../artwork-ratios';
import type { ConfiguratorTranslations } from '../configurator-translations';

interface ArtworkUploadStepProps {
  config: FrameConfig;
  updateConfig: (updates: Partial<FrameConfig>) => void;
  stepNumber: number;
  t: ConfiguratorTranslations;
}

export function ArtworkUploadStep({ config, updateConfig, stepNumber, t }: ArtworkUploadStepProps) {
  const [isCropPreviewOpen, setIsCropPreviewOpen] = useState(true);
  const activeGalleryItem = getActiveGalleryWallItem(
    config.galleryItems,
    config.activeGalleryItemId,
  );
  const editableConfig =
    config.compositionMode === 'gallery-wall' && activeGalleryItem
      ? {
          ...config,
          artworkWidthCm: activeGalleryItem.artworkWidthCm,
          artworkHeightCm: activeGalleryItem.artworkHeightCm,
          artworkRatioMode: activeGalleryItem.artworkRatioMode,
          artworkRatioWidth: activeGalleryItem.artworkRatioWidth,
          artworkRatioHeight: activeGalleryItem.artworkRatioHeight,
          selectedArtworkRatioId: activeGalleryItem.selectedArtworkRatioId,
          uploadedArtworkUrl: activeGalleryItem.uploadedArtworkUrl,
          uploadedArtworkName: activeGalleryItem.uploadedArtworkName,
          uploadedArtworkPixelWidth: activeGalleryItem.uploadedArtworkPixelWidth,
          uploadedArtworkPixelHeight: activeGalleryItem.uploadedArtworkPixelHeight,
          uploadedArtworkCropX: activeGalleryItem.uploadedArtworkCropX,
          uploadedArtworkCropY: activeGalleryItem.uploadedArtworkCropY,
          uploadedArtworkCropScale: activeGalleryItem.uploadedArtworkCropScale,
          uploadedArtworkCropPresets: activeGalleryItem.uploadedArtworkCropPresets,
        }
      : config;
  const ratioLock = getArtworkRatioLock(editableConfig);
  const closestRatio =
    editableConfig.uploadedArtworkPixelWidth && editableConfig.uploadedArtworkPixelHeight
      ? getClosestStandardArtworkRatio(
          editableConfig.uploadedArtworkPixelWidth,
          editableConfig.uploadedArtworkPixelHeight,
        )
      : null;
  const detectedRatioLabel =
    editableConfig.uploadedArtworkPixelWidth && editableConfig.uploadedArtworkPixelHeight
      ? getDetectedArtworkRatioLabel(
          editableConfig.uploadedArtworkPixelWidth,
          editableConfig.uploadedArtworkPixelHeight,
        )
      : null;
  const selectedStandardRatio = STANDARD_ARTWORK_RATIOS.find(
    (ratio) => ratio.id === editableConfig.selectedArtworkRatioId,
  );
  const currentUploadedRatioValue =
    editableConfig.uploadedArtworkPixelWidth && editableConfig.uploadedArtworkPixelHeight
      ? editableConfig.uploadedArtworkPixelWidth / editableConfig.uploadedArtworkPixelHeight
      : null;
  const currentArtworkRatioValue =
    editableConfig.artworkWidthCm > 0 && editableConfig.artworkHeightCm > 0
      ? editableConfig.artworkWidthCm / editableConfig.artworkHeightCm
      : null;
  const currentArtworkRatioLabel =
    editableConfig.artworkWidthCm > 0 && editableConfig.artworkHeightCm > 0
      ? getDetectedArtworkRatioLabel(editableConfig.artworkWidthCm, editableConfig.artworkHeightCm)
      : null;
  const activeCropRatioWidth = Math.max(editableConfig.artworkWidthCm, 0.1);
  const activeCropRatioHeight = Math.max(editableConfig.artworkHeightCm, 0.1);
  const activeCropRatioLabel =
    editableConfig.artworkRatioMode === 'standard' && selectedStandardRatio
      ? selectedStandardRatio.label
      : currentArtworkRatioLabel;
  const shouldOfferCropPreview =
    Boolean(editableConfig.uploadedArtworkUrl) &&
    Boolean(editableConfig.uploadedArtworkPixelWidth) &&
    Boolean(editableConfig.uploadedArtworkPixelHeight);
  const currentCropPresetKey = getArtworkCropPresetKey(
    editableConfig.artworkWidthCm,
    editableConfig.artworkHeightCm,
  );

  useEffect(() => {
    if (shouldOfferCropPreview) {
      setIsCropPreviewOpen(true);
    }
  }, [shouldOfferCropPreview]);

  function releaseArtworkUrlIfUnused(url: string | null) {
    if (!url) {
      return;
    }

    if (
      config.compositionMode === 'gallery-wall' &&
      activeGalleryItem &&
      config.galleryItems.some(
        (item) => item.id !== activeGalleryItem.id && item.uploadedArtworkUrl === url,
      )
    ) {
      return;
    }

    URL.revokeObjectURL(url);
  }

  function applyArtworkUpdate(
    updates: Partial<typeof activeGalleryItem> & {
      artworkWidthCm?: number;
      artworkHeightCm?: number;
      artworkRatioMode?: FrameConfig['artworkRatioMode'];
      artworkRatioWidth?: number | null;
      artworkRatioHeight?: number | null;
      selectedArtworkRatioId?: string | null;
      uploadedArtworkUrl?: string | null;
      uploadedArtworkName?: string | null;
      uploadedArtworkPixelWidth?: number | null;
      uploadedArtworkPixelHeight?: number | null;
      uploadedArtworkCropX?: number;
      uploadedArtworkCropY?: number;
      uploadedArtworkCropScale?: number;
      uploadedArtworkCropPresets?: FrameConfig['uploadedArtworkCropPresets'];
    },
  ) {
    if (config.compositionMode === 'gallery-wall' && activeGalleryItem) {
      updateConfig({
        galleryItems: updateGalleryWallItem(
          config.galleryItems,
          activeGalleryItem.id,
          updates,
        ),
      });
      return;
    }

    updateConfig(updates);
  }

  const loadImageDimensions = (imageUrl: string) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };
      image.onerror = () => reject(new Error('Unable to load image'));
      image.src = imageUrl;
    });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const uploadedArtworkUrl = URL.createObjectURL(file);

    if (editableConfig.uploadedArtworkUrl) {
      releaseArtworkUrlIfUnused(editableConfig.uploadedArtworkUrl);
    }

    try {
      const dimensions = await loadImageDimensions(uploadedArtworkUrl);
      const nextRatio = getClosestStandardArtworkRatio(
        dimensions.width,
        dimensions.height,
      );
      const bestFittedSize = getBestFittedArtworkSize(
        editableConfig.artworkWidthCm,
        editableConfig.artworkHeightCm,
        dimensions.width,
        dimensions.height,
      );

      applyArtworkUpdate({
        uploadedArtworkUrl,
        uploadedArtworkName: file.name,
        uploadedArtworkPixelWidth: dimensions.width,
        uploadedArtworkPixelHeight: dimensions.height,
        uploadedArtworkCropX: 0.5,
        uploadedArtworkCropY: 0.5,
        uploadedArtworkCropScale: 1,
        uploadedArtworkCropPresets: {},
        artworkRatioMode: 'detected',
        artworkRatioWidth: dimensions.width,
        artworkRatioHeight: dimensions.height,
        selectedArtworkRatioId: nextRatio.id,
        ...bestFittedSize,
      });
    } catch {
      applyArtworkUpdate({
        uploadedArtworkUrl,
        uploadedArtworkName: file.name,
        uploadedArtworkPixelWidth: null,
        uploadedArtworkPixelHeight: null,
        uploadedArtworkCropX: 0.5,
        uploadedArtworkCropY: 0.5,
        uploadedArtworkCropScale: 1,
        uploadedArtworkCropPresets: {},
        artworkRatioMode: 'custom',
        artworkRatioWidth: null,
        artworkRatioHeight: null,
        selectedArtworkRatioId: null,
      });
    }

    input.value = '';
  };

  const handleClear = () => {
    if (editableConfig.uploadedArtworkUrl) {
      releaseArtworkUrlIfUnused(editableConfig.uploadedArtworkUrl);
    }

    applyArtworkUpdate({
      uploadedArtworkUrl: null,
      uploadedArtworkName: null,
      uploadedArtworkPixelWidth: null,
      uploadedArtworkPixelHeight: null,
      uploadedArtworkCropX: 0.5,
      uploadedArtworkCropY: 0.5,
      uploadedArtworkCropScale: 1,
      uploadedArtworkCropPresets: {},
      artworkRatioMode: 'custom',
      artworkRatioWidth: null,
      artworkRatioHeight: null,
      selectedArtworkRatioId: null,
    });
  };

  const applyDetectedRatio = () => {
    if (!editableConfig.uploadedArtworkPixelWidth || !editableConfig.uploadedArtworkPixelHeight) {
      return;
    }
    const nextSize = getBestFittedArtworkSize(
      editableConfig.artworkWidthCm,
      editableConfig.artworkHeightCm,
      editableConfig.uploadedArtworkPixelWidth,
      editableConfig.uploadedArtworkPixelHeight,
    );

    applyArtworkUpdate({
      artworkRatioMode: 'detected',
      artworkRatioWidth: editableConfig.uploadedArtworkPixelWidth,
      artworkRatioHeight: editableConfig.uploadedArtworkPixelHeight,
      ...nextSize,
      ...getCropMemoryTransitionUpdate(
        editableConfig,
        nextSize.artworkWidthCm,
        nextSize.artworkHeightCm,
      ),
    });
  };

  const applyStandardRatio = (ratioId: string) => {
    const selectedRatio = STANDARD_ARTWORK_RATIOS.find(
      (ratio) => ratio.id === ratioId,
    );
    if (!selectedRatio) {
      return;
    }
    const nextSize = getBestFittedArtworkSize(
      editableConfig.artworkWidthCm,
      editableConfig.artworkHeightCm,
      selectedRatio.width,
      selectedRatio.height,
    );

    applyArtworkUpdate({
      artworkRatioMode: 'standard',
      artworkRatioWidth: selectedRatio.width,
      artworkRatioHeight: selectedRatio.height,
      selectedArtworkRatioId: selectedRatio.id,
      ...nextSize,
      ...getCropMemoryTransitionUpdate(
        editableConfig,
        nextSize.artworkWidthCm,
        nextSize.artworkHeightCm,
      ),
    });
  };

  const applyCustomSize = () => {
    applyArtworkUpdate({
      artworkRatioMode: 'custom',
      artworkRatioWidth: null,
      artworkRatioHeight: null,
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
          <div className="font-medium text-foreground">{editableConfig.uploadedArtworkName ?? t.steps.usingPlaceholderArtwork}</div>
        </div>

        {editableConfig.uploadedArtworkPixelWidth && editableConfig.uploadedArtworkPixelHeight ? (
          <div className="space-y-4 rounded-xl border border-border bg-muted/35 p-4">
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">{t.steps.detectedImageSize}:</span>{' '}
                {config.uploadedArtworkPixelWidth} x {config.uploadedArtworkPixelHeight} px
              </div>
              <div>
                <span className="font-medium text-foreground">{t.steps.detectedRatio}:</span>{' '}
                {detectedRatioLabel}
              </div>
              {closestRatio ? (
                <div>
                  <span className="font-medium text-foreground">{t.steps.closestStandardRatio}:</span>{' '}
                  {closestRatio.label}
                </div>
              ) : null}
            </div>

            <div>
              <div className="text-sm font-medium text-foreground">{t.steps.ratioChoiceTitle}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.steps.ratioChoiceDescription}
              </p>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                onClick={applyDetectedRatio}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  editableConfig.artworkRatioMode === 'detected'
                    ? 'border-primary bg-primary/8 text-foreground'
                    : 'border-border bg-white text-foreground hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{t.steps.ratioModeDetected}</div>
                <div className="text-sm text-muted-foreground">{detectedRatioLabel}</div>
              </button>

              <button
                type="button"
                onClick={() => applyStandardRatio(editableConfig.selectedArtworkRatioId ?? closestRatio?.id ?? '2:3')}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  editableConfig.artworkRatioMode === 'standard'
                    ? 'border-primary bg-primary/8 text-foreground'
                    : 'border-border bg-white text-foreground hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{t.steps.ratioModeStandard}</div>
                <div className="text-sm text-muted-foreground">
                  {(STANDARD_ARTWORK_RATIOS.find((ratio) => ratio.id === editableConfig.selectedArtworkRatioId) ?? closestRatio)?.label ?? '2:3'}
                </div>
              </button>

              <button
                type="button"
                onClick={applyCustomSize}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  editableConfig.artworkRatioMode === 'custom'
                    ? 'border-primary bg-primary/8 text-foreground'
                    : 'border-border bg-white text-foreground hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{t.steps.ratioModeCustom}</div>
                <div className="text-sm text-muted-foreground">{t.steps.ratioModeCustomDescription}</div>
              </button>
            </div>

            {editableConfig.artworkRatioMode === 'standard' ? (
              <div>
                <div className="mb-2 text-sm font-medium text-foreground">{t.steps.standardRatios}</div>
                <div className="grid grid-cols-3 gap-2">
                  {STANDARD_ARTWORK_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => applyStandardRatio(ratio.id)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        editableConfig.selectedArtworkRatioId === ratio.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-white text-foreground hover:border-primary/50'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {ratioLock ? (
              <div className="rounded-lg bg-white px-3 py-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t.steps.ratioLockedTo}:</span>{' '}
                {ratioLock.label}. {t.steps.ratioWillUpdate}
              </div>
            ) : null}

            {shouldOfferCropPreview ? (
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Crop className="h-4 w-4" />
                      {t.steps.cropPreviewTitle}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.steps.cropPreviewDescription.replace('{ratio}', activeCropRatioLabel ?? '')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCropPreviewOpen((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    {isCropPreviewOpen ? t.steps.hideCropPreview : t.steps.showCropPreview}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isCropPreviewOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {isCropPreviewOpen ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {t.steps.cropDragHint}
                    </p>
                    <ArtworkCropEditor
                      imageSrc={editableConfig.uploadedArtworkUrl ?? ''}
                      imageAlt={editableConfig.uploadedArtworkName ?? 'Uploaded artwork'}
                      imageWidth={editableConfig.uploadedArtworkPixelWidth}
                      imageHeight={editableConfig.uploadedArtworkPixelHeight}
                      ratioWidth={activeCropRatioWidth}
                      ratioHeight={activeCropRatioHeight}
                      cropCenterX={editableConfig.uploadedArtworkCropX}
                      cropCenterY={editableConfig.uploadedArtworkCropY}
                      cropScale={editableConfig.uploadedArtworkCropScale}
                      originalLabel={t.steps.originalImage}
                      croppedLabel={t.steps.croppedPreview}
                      zoomLabel={t.steps.cropZoom}
                      resetLabel={t.steps.cropReset}
                      onCropChange={(uploadedArtworkCropX, uploadedArtworkCropY) =>
                        applyArtworkUpdate({
                          uploadedArtworkCropX,
                          uploadedArtworkCropY,
                          uploadedArtworkCropPresets: {
                            ...editableConfig.uploadedArtworkCropPresets,
                            [currentCropPresetKey]: {
                              x: uploadedArtworkCropX,
                              y: uploadedArtworkCropY,
                              scale: editableConfig.uploadedArtworkCropScale,
                            },
                          },
                        })
                      }
                      onCropScaleChange={(uploadedArtworkCropScale) =>
                        applyArtworkUpdate({
                          uploadedArtworkCropScale,
                          uploadedArtworkCropPresets: {
                            ...editableConfig.uploadedArtworkCropPresets,
                            [currentCropPresetKey]: {
                              x: editableConfig.uploadedArtworkCropX,
                              y: editableConfig.uploadedArtworkCropY,
                              scale: uploadedArtworkCropScale,
                            },
                          },
                        })
                      }
                      onReset={() =>
                        applyArtworkUpdate({
                          uploadedArtworkCropX: 0.5,
                          uploadedArtworkCropY: 0.5,
                          uploadedArtworkCropScale: 1,
                          uploadedArtworkCropPresets: {
                            ...editableConfig.uploadedArtworkCropPresets,
                            [currentCropPresetKey]: {
                              x: 0.5,
                              y: 0.5,
                              scale: 1,
                            },
                          },
                        })
                      }
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {editableConfig.uploadedArtworkUrl ? (
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
