import { useEffect, useRef, useState } from 'react';
import { ConfigurationPanel } from './components/configurator/ConfigurationPanel';
import { PriceBar } from './components/configurator/PriceBar';
import { PreviewPanel } from './components/configurator/PreviewPanel';
import type { ArtworkCropPresetMap } from './components/configurator/artwork-crop';
import type { Glazing, Unit } from './components/configurator/configurator-data';
import {
  CUSTOM_GALLERY_LAYOUT_ID,
  DEFAULT_GALLERY_SPACING_CM,
  type GalleryCompositionMode,
  type GalleryWallItem,
  createGalleryWallItem,
  getActiveGalleryWallItem,
  getGalleryLayoutRecommendations,
  syncGalleryWallItems,
} from './components/configurator/gallery-wall';
import {
  configuratorTranslations,
  type ConfiguratorLanguage,
} from './components/configurator/configurator-translations';
import { normalizeFrameConfig } from './components/configurator/configurator-utils';

export interface FrameConfig {
  // Wall configuration added for wall‑size feature
  wallWidthCm: number;
  wallHeightCm: number;
  wallSpacingCm: number;
  desiredFrameCount?: number;
  compositionMode: GalleryCompositionMode;
  artworkWidthCm: number;
  artworkHeightCm: number;
  artworkRatioMode: 'detected' | 'standard' | 'custom';
  artworkRatioWidth: number | null;
  artworkRatioHeight: number | null;
  selectedArtworkRatioId: string | null;
  unit: Unit;
  frameStyle: string;
  matEnabled: boolean;
  matType: 'single' | 'double' | 'triple' | 'v_groove' | 'box' | 'multiple';
  matColor: string;
  matBottomColor: string;
  matMiddleColor: string;
  matThicknessCm: number;
  matTopThicknessCm: number;
  matMiddleThicknessCm: number;
  matBottomThicknessCm: number;
  matRevealCm: number;
  matRevealSecondCm: number;
  grooveEnabled: boolean;
  grooveOffsetCm: number;
  boxDepthCm: number;
  glazing: Glazing;
  uploadedArtworkUrl: string | null;
  uploadedArtworkName: string | null;
  uploadedArtworkPixelWidth: number | null;
  uploadedArtworkPixelHeight: number | null;
  uploadedArtworkCropX: number;
  uploadedArtworkCropY: number;
  uploadedArtworkCropScale: number;
  uploadedArtworkCropPresets: ArtworkCropPresetMap;
  galleryItems: GalleryWallItem[];
  activeGalleryItemId: string | null;
  selectedGalleryLayoutId: string | null;
  gallerySpacingCm: number;
}

export default function App() {
  const [language, setLanguage] = useState<ConfiguratorLanguage>('fr');
  const [isRoomModeOpen, setIsRoomModeOpen] = useState(false);
  const [config, setConfig] = useState<FrameConfig>(() => {
    const initialGalleryItem = createGalleryWallItem(0, {
      artworkWidthCm: 40,
      artworkHeightCm: 50,
      artworkRatioMode: 'custom',
    });

    return {
      compositionMode: 'single',
      artworkWidthCm: 40,
      artworkHeightCm: 50,
      artworkRatioMode: 'custom',
      artworkRatioWidth: null,
      artworkRatioHeight: null,
      selectedArtworkRatioId: null,
      unit: 'cm',
      frameStyle: 'L1532',
      matEnabled: true,
      matType: 'single',
      matColor: 'white',
      matBottomColor: 'black',
      matMiddleColor: 'gray',
      matThicknessCm: 2,
      matTopThicknessCm: 2,
      matMiddleThicknessCm: 2,
      matBottomThicknessCm: 2,
      matRevealCm: 0.4,
      matRevealSecondCm: 0.3,
      grooveEnabled: true,
      grooveOffsetCm: 0.6,
      boxDepthCm: 1.2,
      glazing: 'glass',
      uploadedArtworkUrl: null,
      uploadedArtworkName: null,
      uploadedArtworkPixelWidth: null,
      uploadedArtworkPixelHeight: null,
      uploadedArtworkCropX: 0.5,
      uploadedArtworkCropY: 0.5,
      uploadedArtworkCropScale: 1,
      uploadedArtworkCropPresets: {},
      galleryItems: [initialGalleryItem],
      activeGalleryItemId: initialGalleryItem.id,
      selectedGalleryLayoutId: null,
      gallerySpacingCm: DEFAULT_GALLERY_SPACING_CM,
      // Wall configuration defaults
      wallWidthCm: 200, // 2 m
      wallHeightCm: 400, // 4 m
      wallSpacingCm: 2, // 2 cm gap between frames
      desiredFrameCount: undefined,
    };
  });

  const latestConfigRef = useRef(config);

  useEffect(() => {
    latestConfigRef.current = config;
  }, [config]);

  useEffect(() => {
    return () => {
      const latestConfig = latestConfigRef.current;
      const artworkUrls = new Set<string>();

      if (latestConfig.uploadedArtworkUrl) {
        artworkUrls.add(latestConfig.uploadedArtworkUrl);
      }

      latestConfig.galleryItems.forEach((item) => {
        if (item.uploadedArtworkUrl) {
          artworkUrls.add(item.uploadedArtworkUrl);
        }
      });

      artworkUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const updateConfig = (updates: Partial<FrameConfig>) => {
    setConfig((prev) => {
      const normalized = normalizeFrameConfig({ ...prev, ...updates });
      const gallerySeed = {
        artworkWidthCm: normalized.artworkWidthCm,
        artworkHeightCm: normalized.artworkHeightCm,
        artworkRatioMode: normalized.artworkRatioMode,
        artworkRatioWidth: normalized.artworkRatioWidth,
        artworkRatioHeight: normalized.artworkRatioHeight,
        selectedArtworkRatioId: normalized.selectedArtworkRatioId,
        uploadedArtworkUrl: normalized.uploadedArtworkUrl,
        uploadedArtworkName: normalized.uploadedArtworkName,
        uploadedArtworkPixelWidth: normalized.uploadedArtworkPixelWidth,
        uploadedArtworkPixelHeight: normalized.uploadedArtworkPixelHeight,
        uploadedArtworkCropX: normalized.uploadedArtworkCropX,
        uploadedArtworkCropY: normalized.uploadedArtworkCropY,
        uploadedArtworkCropScale: normalized.uploadedArtworkCropScale,
        uploadedArtworkCropPresets: normalized.uploadedArtworkCropPresets,
      };
      const galleryItems = syncGalleryWallItems(
        normalized.compositionMode,
        normalized.galleryItems,
        gallerySeed,
      );
      const activeGalleryItem =
        getActiveGalleryWallItem(galleryItems, normalized.activeGalleryItemId) ??
        galleryItems[0];
      const recommendations = getGalleryLayoutRecommendations(galleryItems);
      const hasSelectedLayout =
        normalized.selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID ||
        recommendations.some(
          (entry) => entry.template.id === normalized.selectedGalleryLayoutId,
        );

      if (normalized.compositionMode === 'gallery-wall' && activeGalleryItem) {
        return {
          ...normalized,
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
          galleryItems,
          activeGalleryItemId: activeGalleryItem.id,
          selectedGalleryLayoutId:
            hasSelectedLayout
              ? normalized.selectedGalleryLayoutId
              : (recommendations[0]?.template.id ?? null),
        };
      }

      return {
        ...normalized,
        galleryItems,
        activeGalleryItemId: activeGalleryItem?.id ?? normalized.activeGalleryItemId,
        selectedGalleryLayoutId:
          normalized.compositionMode === 'gallery-wall'
            ? hasSelectedLayout
              ? normalized.selectedGalleryLayoutId
              : (recommendations[0]?.template.id ?? null)
            : normalized.selectedGalleryLayoutId,
      };
    });
  };
  const t = configuratorTranslations[language];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className={`border-b border-border bg-card transition ${
          isRoomModeOpen ? 'pointer-events-none invisible opacity-0' : 'opacity-100'
        }`}
        aria-hidden={isRoomModeOpen}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">{t.app.title}</h1>
              <p className="mt-2 text-muted-foreground">
                {t.app.subtitle}
              </p>
            </div>

            <div className="inline-flex rounded-lg border border-border bg-muted p-1">
              {(['fr', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    language === lang
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.language[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:pb-28 lg:px-8 transition ${
          isRoomModeOpen ? 'pointer-events-none invisible opacity-0' : 'opacity-100'
        }`}
        aria-hidden={isRoomModeOpen}
      >
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(420px,1.15fr)_minmax(340px,0.85fr)]">
          <PreviewPanel
            config={config}
            updateConfig={updateConfig}
            t={t}
            isRoomPreviewOpen={isRoomModeOpen}
            onRoomPreviewOpenChange={setIsRoomModeOpen}
          />
          {!isRoomModeOpen ? (
            <ConfigurationPanel config={config} updateConfig={updateConfig} t={t} />
          ) : null}
        </div>
      </main>

      {!isRoomModeOpen ? <PriceBar config={config} t={t} /> : null}
    </div>
  );
}
