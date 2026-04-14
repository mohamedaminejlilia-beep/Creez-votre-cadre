import { ArrowLeft, ArrowRight, Copy, LayoutGrid, Minus, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FrameConfig } from '../../../App';
import {
  addGalleryWallItem,
  assignGalleryWallItemToSlot,
  convertGalleryWallItemsToCustomLayout,
  CUSTOM_GALLERY_LAYOUT_ID,
  duplicateGalleryWallItem,
  evenOutGalleryWallCustomSpacing,
  GALLERY_WALL_PRESETS_STORAGE_KEY,
  getActiveGalleryWallItem,
  getGalleryLayoutTemplateById,
  getGalleryLayoutRecommendations,
  MAX_GALLERY_WALL_ITEMS,
  moveGalleryWallItem,
  removeGalleryWallItem,
  type GalleryWallPreset,
  type GalleryLayoutTemplate,
} from '../gallery-wall';
import { getFrameGeometry } from '../configurator-utils';
import type { ConfiguratorTranslations } from '../configurator-translations';

interface GalleryWallStepProps {
  config: FrameConfig;
  updateConfig: (updates: Partial<FrameConfig>) => void;
  stepNumber: number;
  t: ConfiguratorTranslations;
}

function LayoutThumbnail({ template }: { template: GalleryLayoutTemplate }) {
  return (
    <div className="relative aspect-[1.2/0.82] overflow-hidden rounded-lg border border-gray-200 bg-[linear-gradient(180deg,#faf8f3,#f1ede6)]">
      {template.slots.map((slot) => (
        <div
          key={slot.id}
          className={`absolute rounded-[6px] border-2 ${
            slot.priority === 'hero'
              ? 'border-[var(--primary)] bg-[rgba(27,76,143,0.06)]'
              : 'border-gray-500/70 bg-white/85'
          }`}
          style={{
            left: `${slot.x}%`,
            top: `${slot.y}%`,
            width: `${slot.width}%`,
            height: `${slot.height}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

export function GalleryWallStep({
  config,
  updateConfig,
  stepNumber,
  t,
}: GalleryWallStepProps) {
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<GalleryWallPreset[]>([]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') {
        return;
      }

      const rawValue = window.localStorage.getItem(GALLERY_WALL_PRESETS_STORAGE_KEY);
      if (!rawValue) {
        return;
      }

      const parsed = JSON.parse(rawValue) as GalleryWallPreset[];
      if (Array.isArray(parsed)) {
        setSavedPresets(parsed);
      }
    } catch {
      setSavedPresets([]);
    }
  }, []);

  const defaultPresetName = useMemo(
    () => `Composition ${savedPresets.length + 1}`,
    [savedPresets.length],
  );

  function persistPresets(nextPresets: GalleryWallPreset[]) {
    setSavedPresets(nextPresets);

    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      GALLERY_WALL_PRESETS_STORAGE_KEY,
      JSON.stringify(nextPresets),
    );
  }

  function handleSavePreset() {
    const trimmedName = presetName.trim() || defaultPresetName;
    const nextPreset: GalleryWallPreset = {
      id: `gallery-preset-${Date.now()}`,
      name: trimmedName,
      createdAt: new Date().toISOString(),
      compositionMode: config.compositionMode,
      galleryItems: config.galleryItems.map((item) => ({
        ...item,
        uploadedArtworkCropPresets: { ...item.uploadedArtworkCropPresets },
      })),
      activeGalleryItemId: config.activeGalleryItemId,
      selectedGalleryLayoutId: config.selectedGalleryLayoutId,
      gallerySpacingCm: config.gallerySpacingCm,
      frameStyle: config.frameStyle,
      matEnabled: config.matEnabled,
      matType: config.matType,
      matColor: config.matColor,
      matBottomColor: config.matBottomColor,
      matMiddleColor: config.matMiddleColor,
      matThicknessCm: config.matThicknessCm,
      matTopThicknessCm: config.matTopThicknessCm,
      matMiddleThicknessCm: config.matMiddleThicknessCm,
      matBottomThicknessCm: config.matBottomThicknessCm,
      matRevealCm: config.matRevealCm,
      matRevealSecondCm: config.matRevealSecondCm,
      grooveEnabled: config.grooveEnabled,
      grooveOffsetCm: config.grooveOffsetCm,
      boxDepthCm: config.boxDepthCm,
      glazing: config.glazing,
    };

    persistPresets([nextPreset, ...savedPresets].slice(0, 8));
    setPresetName('');
  }

  function handleLoadPreset(preset: GalleryWallPreset) {
    updateConfig({
      compositionMode: preset.compositionMode,
      galleryItems: preset.galleryItems.map((item) => ({
        ...item,
        uploadedArtworkCropPresets: { ...item.uploadedArtworkCropPresets },
      })),
      activeGalleryItemId: preset.activeGalleryItemId,
      selectedGalleryLayoutId: preset.selectedGalleryLayoutId,
      gallerySpacingCm: preset.gallerySpacingCm,
      frameStyle: preset.frameStyle,
      matEnabled: preset.matEnabled,
      matType: preset.matType,
      matColor: preset.matColor,
      matBottomColor: preset.matBottomColor,
      matMiddleColor: preset.matMiddleColor,
      matThicknessCm: preset.matThicknessCm,
      matTopThicknessCm: preset.matTopThicknessCm,
      matMiddleThicknessCm: preset.matMiddleThicknessCm,
      matBottomThicknessCm: preset.matBottomThicknessCm,
      matRevealCm: preset.matRevealCm,
      matRevealSecondCm: preset.matRevealSecondCm,
      grooveEnabled: preset.grooveEnabled,
      grooveOffsetCm: preset.grooveOffsetCm,
      boxDepthCm: preset.boxDepthCm,
      glazing: preset.glazing,
    });
  }

  function handleDeletePreset(presetId: string) {
    persistPresets(savedPresets.filter((preset) => preset.id !== presetId));
  }

  function ensureGalleryModeState() {
    let nextItems = [...config.galleryItems];

    if (nextItems.length === 0) {
      nextItems = [
        {
          id: `gallery-item-${Date.now()}-1`,
          label: 'Frame 1',
          artworkWidthCm: config.artworkWidthCm,
          artworkHeightCm: config.artworkHeightCm,
          artworkRatioMode: config.artworkRatioMode,
          artworkRatioWidth: config.artworkRatioWidth,
          artworkRatioHeight: config.artworkRatioHeight,
          selectedArtworkRatioId: config.selectedArtworkRatioId,
          uploadedArtworkUrl: config.uploadedArtworkUrl,
          uploadedArtworkName: config.uploadedArtworkName,
          uploadedArtworkPixelWidth: config.uploadedArtworkPixelWidth,
          uploadedArtworkPixelHeight: config.uploadedArtworkPixelHeight,
          uploadedArtworkCropX: config.uploadedArtworkCropX,
          uploadedArtworkCropY: config.uploadedArtworkCropY,
          uploadedArtworkCropScale: config.uploadedArtworkCropScale,
          uploadedArtworkCropPresets: config.uploadedArtworkCropPresets,
          customLayoutXcm: null,
          customLayoutYcm: null,
        },
      ];
    }

    while (nextItems.length < 2 && nextItems.length < MAX_GALLERY_WALL_ITEMS) {
      nextItems = addGalleryWallItem(
        nextItems,
        nextItems[0] ?? {
          artworkWidthCm: config.artworkWidthCm,
          artworkHeightCm: config.artworkHeightCm,
          artworkRatioMode: config.artworkRatioMode,
          artworkRatioWidth: config.artworkRatioWidth,
          artworkRatioHeight: config.artworkRatioHeight,
          selectedArtworkRatioId: config.selectedArtworkRatioId,
          uploadedArtworkUrl: config.uploadedArtworkUrl,
          uploadedArtworkName: config.uploadedArtworkName,
          uploadedArtworkPixelWidth: config.uploadedArtworkPixelWidth,
          uploadedArtworkPixelHeight: config.uploadedArtworkPixelHeight,
          uploadedArtworkCropX: config.uploadedArtworkCropX,
          uploadedArtworkCropY: config.uploadedArtworkCropY,
          uploadedArtworkCropScale: config.uploadedArtworkCropScale,
          uploadedArtworkCropPresets: config.uploadedArtworkCropPresets,
        },
      );
    }

    const recommendations = getGalleryLayoutRecommendations(nextItems);
    const nextSelectedLayoutId =
      config.selectedGalleryLayoutId && (
        config.selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID ||
        recommendations.some((entry) => entry.template.id === config.selectedGalleryLayoutId)
      )
        ? config.selectedGalleryLayoutId
        : (recommendations[0]?.template.id ?? CUSTOM_GALLERY_LAYOUT_ID);

    const nextActiveItemId =
      config.activeGalleryItemId && nextItems.some((item) => item.id === config.activeGalleryItemId)
        ? config.activeGalleryItemId
        : (nextItems[0]?.id ?? null);

    updateConfig({
      compositionMode: 'gallery-wall',
      galleryItems: nextItems,
      activeGalleryItemId: nextActiveItemId,
      selectedGalleryLayoutId: nextSelectedLayoutId,
    });
  }

  function handleSelectSingleMode() {
    updateConfig({
      compositionMode: 'single',
    });
  }

  const recommendations = getGalleryLayoutRecommendations(config.galleryItems);
  const activeItem = getActiveGalleryWallItem(
    config.galleryItems,
    config.activeGalleryItemId,
  );
  const selectedLayout = getGalleryLayoutTemplateById(config.selectedGalleryLayoutId);
  const selectedLayoutLabel =
    config.selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID
      ? t.steps.galleryWallCustomLayout
      : (selectedLayout?.title ?? null);

  function getGalleryItemOuterSize(item: (typeof config.galleryItems)[number]) {
    const geometry = getFrameGeometry({
      ...config,
      artworkWidthCm: item.artworkWidthCm,
      artworkHeightCm: item.artworkHeightCm,
      artworkRatioMode: item.artworkRatioMode,
      artworkRatioWidth: item.artworkRatioWidth,
      artworkRatioHeight: item.artworkRatioHeight,
      selectedArtworkRatioId: item.selectedArtworkRatioId,
      uploadedArtworkUrl: item.uploadedArtworkUrl,
      uploadedArtworkName: item.uploadedArtworkName,
      uploadedArtworkPixelWidth: item.uploadedArtworkPixelWidth,
      uploadedArtworkPixelHeight: item.uploadedArtworkPixelHeight,
      uploadedArtworkCropX: item.uploadedArtworkCropX,
      uploadedArtworkCropY: item.uploadedArtworkCropY,
      uploadedArtworkCropScale: item.uploadedArtworkCropScale,
      uploadedArtworkCropPresets: item.uploadedArtworkCropPresets,
    });

    return {
      widthCm: geometry.frameOuterWidthCm,
      heightCm: geometry.frameOuterHeightCm,
    };
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
          {stepNumber}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{t.steps.galleryWall}</h3>
          <p className="text-sm text-muted-foreground">{t.steps.galleryWallDescription}</p>
        </div>
        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground">
            {t.steps.galleryWallModeLabel}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleSelectSingleMode}
              className={`rounded-xl border p-4 text-left transition ${
                config.compositionMode === 'single'
                  ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,white)]'
                  : 'border-border bg-white hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <div className="font-semibold text-foreground">{t.steps.galleryWallSingleMode}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.steps.galleryWallSingleModeDescription}
              </p>
            </button>

            <button
              type="button"
              onClick={ensureGalleryModeState}
              className={`rounded-xl border p-4 text-left transition ${
                config.compositionMode === 'gallery-wall'
                  ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,white)]'
                  : 'border-border bg-white hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <div className="font-semibold text-foreground">{t.steps.galleryWallMultiMode}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.steps.galleryWallMultiModeDescription}
              </p>
            </button>
          </div>
        </div>

        {config.compositionMode === 'gallery-wall' ? (
          <div className="animate-in slide-in-from-top-2 fade-in space-y-5 duration-300">
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">{t.steps.galleryWallSharedSettings}</div>
              <p className="mt-1">{t.steps.galleryWallSharedSettingsDescription}</p>
              {activeItem ? (
                <p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-sm text-foreground">
                  <span className="font-medium">{t.steps.galleryWallEditingItem}:</span>{' '}
                  {activeItem.label}. {t.steps.galleryWallEditingHint}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-foreground">{t.steps.galleryWallFrames}</div>
                  <p className="text-sm text-muted-foreground">
                    {t.steps.galleryWallFramesDescription}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig({
                        galleryItems: removeGalleryWallItem(config.galleryItems),
                      })
                    }
                    disabled={config.galleryItems.length <= 2}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-foreground transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={t.steps.galleryWallRemoveFrame}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig({
                        galleryItems: addGalleryWallItem(config.galleryItems, activeItem ?? {
                          artworkWidthCm: config.artworkWidthCm,
                          artworkHeightCm: config.artworkHeightCm,
                          artworkRatioMode: config.artworkRatioMode,
                          artworkRatioWidth: config.artworkRatioWidth,
                          artworkRatioHeight: config.artworkRatioHeight,
                          selectedArtworkRatioId: config.selectedArtworkRatioId,
                          uploadedArtworkUrl: config.uploadedArtworkUrl,
                          uploadedArtworkName: config.uploadedArtworkName,
                          uploadedArtworkPixelWidth: config.uploadedArtworkPixelWidth,
                          uploadedArtworkPixelHeight: config.uploadedArtworkPixelHeight,
                          uploadedArtworkCropX: config.uploadedArtworkCropX,
                          uploadedArtworkCropY: config.uploadedArtworkCropY,
                          uploadedArtworkCropScale: config.uploadedArtworkCropScale,
                          uploadedArtworkCropPresets: config.uploadedArtworkCropPresets,
                        }),
                      })
                    }
                    disabled={config.galleryItems.length >= MAX_GALLERY_WALL_ITEMS}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-medium text-foreground transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {t.steps.galleryWallAddFrame}
                  </button>
                </div>
              </div>

              <div
                className="mt-4 grid gap-3"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
              >
                {config.galleryItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateConfig({ activeGalleryItemId: item.id })}
                    className={`rounded-xl border p-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                      config.activeGalleryItemId === item.id
                        ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,white)]'
                        : 'border-border bg-[#fcfbf8] hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 break-words font-medium text-foreground">
                        {item.label}
                      </div>
                      {config.activeGalleryItemId === item.id ? (
                        <span className="shrink-0 rounded-full bg-[rgba(27,76,143,0.08)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                          {t.steps.galleryWallEditingBadge}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          updateConfig({
                            galleryItems: moveGalleryWallItem(
                              config.galleryItems,
                              item.id,
                              'left',
                            ),
                            activeGalleryItemId: item.id,
                          });
                        }}
                        disabled={config.galleryItems[0]?.id === item.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-foreground transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={t.steps.galleryWallMoveLeft}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          const nextItems = duplicateGalleryWallItem(
                            config.galleryItems,
                            item.id,
                          );
                          const duplicatedIndex = Math.min(
                            config.galleryItems.findIndex((entry) => entry.id === item.id) + 1,
                            nextItems.length - 1,
                          );
                          updateConfig({
                            galleryItems: nextItems,
                            activeGalleryItemId: nextItems[duplicatedIndex]?.id ?? item.id,
                          });
                        }}
                        disabled={config.galleryItems.length >= MAX_GALLERY_WALL_ITEMS}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-foreground transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={t.steps.galleryWallDuplicateFrame}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          updateConfig({
                            galleryItems: moveGalleryWallItem(
                              config.galleryItems,
                              item.id,
                              'right',
                            ),
                            activeGalleryItemId: item.id,
                          });
                        }}
                        disabled={config.galleryItems[config.galleryItems.length - 1]?.id === item.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-foreground transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={t.steps.galleryWallMoveRight}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 break-words text-sm text-muted-foreground">
                      {item.artworkWidthCm} x {item.artworkHeightCm} cm
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {item.uploadedArtworkName ?? t.steps.usingPlaceholderArtwork}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{t.steps.galleryWallSpacing}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {config.selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID
                      ? t.steps.galleryWallSpacingCustomDescription
                      : t.steps.galleryWallSpacingDescription}
                  </p>
                </div>
                <div className="shrink-0 rounded-full border border-gray-200 bg-[#fcfbf8] px-3 py-1 text-sm font-medium text-foreground">
                  {config.gallerySpacingCm} cm
                </div>
              </div>

              <input
                type="range"
                min={2}
                max={12}
                step={0.5}
                value={config.gallerySpacingCm}
                onChange={(event) =>
                  updateConfig({
                    gallerySpacingCm: Number.parseFloat(event.target.value),
                  })
                }
                className="mt-4 w-full accent-[var(--primary)]"
                aria-label={t.steps.galleryWallSpacing}
              />

              {config.selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID ? (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-200 bg-[#fcfbf8] px-3 py-3">
                  <p className="text-sm text-muted-foreground">
                    {t.steps.galleryWallEvenSpacingDescription}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig({
                        galleryItems: evenOutGalleryWallCustomSpacing(
                          config.galleryItems,
                          config.gallerySpacingCm,
                          getGalleryItemOuterSize,
                        ),
                      })
                    }
                    className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/50"
                  >
                    {t.steps.galleryWallEvenSpacing}
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <div className="mb-3">
                <div>
                  <div className="font-medium text-foreground">{t.steps.galleryWallRecommendedLayouts}</div>
                  <p className="text-sm text-muted-foreground">
                    {t.steps.galleryWallRecommendedLayoutsDescription}
                  </p>
                </div>
                {selectedLayoutLabel ? (
                  <div className="mt-3 inline-block max-w-full whitespace-normal rounded-2xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium leading-5 text-[var(--primary)] break-words">
                    {t.steps.galleryWallSelectedLayout}: {selectedLayoutLabel}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateConfig({
                      galleryItems: convertGalleryWallItemsToCustomLayout(
                        config.galleryItems,
                        config.selectedGalleryLayoutId,
                        config.gallerySpacingCm,
                        getGalleryItemOuterSize,
                      ),
                      selectedGalleryLayoutId: CUSTOM_GALLERY_LAYOUT_ID,
                    })
                  }
                  className={`rounded-2xl border p-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                    config.selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID
                      ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,white)] shadow-sm'
                      : 'border-border bg-white hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground">
                        {t.steps.galleryWallCustomLayout}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t.steps.galleryWallCustomLayoutDescription}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[rgba(27,76,143,0.08)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                      {t.steps.galleryWallCustomLayoutBadge}
                    </span>
                  </div>
                </button>

                {recommendations.map((entry) => {
                  const isSelected = config.selectedGalleryLayoutId === entry.template.id;

                  return (
                    <button
                      key={entry.template.id}
                      type="button"
                      onClick={() => updateConfig({ selectedGalleryLayoutId: entry.template.id })}
                      className={`rounded-2xl border p-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                        isSelected
                          ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_8%,white)] shadow-sm'
                          : 'border-border bg-white hover:border-primary/50 hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-[88px] shrink-0">
                          <LayoutThumbnail template={entry.template} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="min-w-0 flex-1 font-semibold text-foreground">
                              {entry.template.title}
                            </div>
                            <span className="shrink-0 rounded-full bg-[rgba(27,76,143,0.08)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                              {entry.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-5 text-muted-foreground">
                            {entry.reason}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedLayout ? (
              <div className="rounded-xl border border-border bg-white p-4">
                <div className="mb-3">
                  <div className="font-medium text-foreground">{t.steps.galleryWallSlotAssignment}</div>
                  <p className="text-sm text-muted-foreground">
                    {t.steps.galleryWallSlotAssignmentDescription}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.steps.galleryWallSlotAssignmentHint}
                  </p>
                </div>

                <div className="grid gap-3">
                  {selectedLayout.slots.slice(0, config.galleryItems.length).map((slot, index) => {
                    const assignedItem = config.galleryItems[index];

                    return (
                      <label
                        key={slot.id}
                        className="rounded-xl border border-border bg-[#fcfbf8] p-3"
                      >
                        <div className="flex flex-col items-start gap-2">
                          <div className="font-medium text-foreground">
                            {t.steps.galleryWallSlotLabel} {index + 1}
                          </div>
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">
                            {slot.priority === 'hero'
                              ? t.steps.galleryWallSlotHero
                              : t.steps.galleryWallSlotSecondary}
                          </span>
                        </div>

                        <select
                          value={assignedItem?.id ?? ''}
                          onChange={(event) => {
                            const nextItemId = event.target.value;
                            updateConfig({
                              galleryItems: assignGalleryWallItemToSlot(
                                config.galleryItems,
                                nextItemId,
                                index,
                              ),
                              activeGalleryItemId: nextItemId,
                            });
                          }}
                          className="mt-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
                        >
                          {config.galleryItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label} - {item.artworkWidthCm} x {item.artworkHeightCm} cm
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-border bg-white p-4">
              <div className="mb-3">
                <div className="font-medium text-foreground">{t.steps.galleryWallSavedPresets}</div>
                <p className="text-sm text-muted-foreground">
                  {t.steps.galleryWallSavedPresetsDescription}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                  placeholder={defaultPresetName}
                  className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleSavePreset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/50"
                >
                  <Save className="h-4 w-4" />
                  {t.steps.galleryWallSavePreset}
                </button>
              </div>

              {savedPresets.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-[#fcfbf8] p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="font-medium text-foreground">{preset.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {preset.galleryItems.length} {t.summary.frames.toLowerCase()} - {getGalleryLayoutTemplateById(preset.selectedGalleryLayoutId)?.title ?? 'Layout'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadPreset(preset)}
                          className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/50"
                        >
                          {t.steps.galleryWallLoadPreset}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePreset(preset.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-foreground transition hover:border-primary/50"
                          aria-label={t.steps.galleryWallDeletePreset}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-border bg-[#fcfbf8] px-4 py-6 text-sm text-muted-foreground">
                  {t.steps.galleryWallNoSavedPresets}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
