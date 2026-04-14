import type { CSSProperties, ReactNode } from 'react';
import { Upload } from 'lucide-react';
import type { FrameConfig } from '../../App';
import {
  getArtworkCropImageLayout,
  getCropMemoryTransitionUpdate,
} from './artwork-crop';
import { getArtworkSizeUpdateForInput } from './artwork-ratios';
import type { ConfiguratorTranslations } from './configurator-translations';
import { GalleryWallPreview } from './GalleryWallPreview';
import {
  CUSTOM_GALLERY_LAYOUT_ID,
  convertGalleryWallItemsToCustomLayout,
  evenOutGalleryWallCustomSpacing,
  getGalleryLayoutTemplateById,
  offsetGalleryWallCustomPositions,
  swapGalleryWallItems,
  updateGalleryWallItemCustomPositionWithoutOverlap,
  type GalleryWallItem,
} from './gallery-wall';
import { RoomPreviewModal } from './RoomPreviewModal';
import { getSavedRoomCalibration } from './roomCalibrationStorage';
import { ROOM_TEMPLATES } from './roomTemplates';
import { WallSizeStep } from './steps/WallSizeStep';
import { GalleryWallStep } from './steps/GalleryWallStep';
import { getFrameSliceAssets, useFrameSliceAssets } from './frame-assets';
import { getPreviewStyle } from './preview-styles';
import { generateLayout } from './wall-layout';
import {
  cmToPx,
  getEffectiveGlazing,
  getEffectiveMatEnabled,
  getEffectiveMatThicknesses,
  getEffectiveMatType,
  getFrameById,
  getFrameGeometry,
  getAllowedZoneCmForWallSurface,
  getMatColorHex,
  getPreviewMetrics,
} from './configurator-utils';

interface PreviewPanelProps {
  config: FrameConfig;
  updateConfig: (updates: Partial<FrameConfig>) => void;
  t: ConfiguratorTranslations;
  isRoomPreviewOpen: boolean;
  onRoomPreviewOpenChange: (isOpen: boolean) => void;
}

function FrameSlice({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style: CSSProperties;
}) {
  return <img src={src} alt={alt} className="pointer-events-none absolute block" style={style} />;
}

function formatDisplayValue(value: number) {
  return Math.round(value * 100) / 100;
}

export function PreviewPanel({
  config,
  updateConfig,
  t,
  isRoomPreviewOpen,
  onRoomPreviewOpenChange,
}: PreviewPanelProps) {
  const frame = getFrameById(config.frameStyle);
  const isGalleryWallMode = config.compositionMode === 'gallery-wall';
  const selectedGalleryLayout = getGalleryLayoutTemplateById(config.selectedGalleryLayoutId);
  const selectedGalleryLayoutLabel =
    config.selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID
      ? 'Custom Layout'
      : (selectedGalleryLayout?.title ?? 'Pending');
  const sliceAssets = useFrameSliceAssets(frame.id);
  const previewStyleDef = getPreviewStyle(frame.previewStyleKey);
  const geometry = getFrameGeometry(config);
  const metrics = getPreviewMetrics(config);
  const matEnabled = getEffectiveMatEnabled(config);
  const matType = getEffectiveMatType(config);
  const glazing = getEffectiveGlazing(config);
  const matThicknesses = getEffectiveMatThicknesses(config);
  const matTopColor = getMatColorHex(config.matColor);
  const matMiddleColor = getMatColorHex(config.matMiddleColor);
  const matBottomColor = getMatColorHex(config.matBottomColor);
  const hasSlicePreview = sliceAssets.isAvailable;
  const frameWidthPaddingCm = Math.max(0, geometry.frameOuterWidthCm - geometry.artworkWidthCm);
  const frameHeightPaddingCm = Math.max(0, geometry.frameOuterHeightCm - geometry.artworkHeightCm);

  function getRenderConfigForGalleryItem(item: GalleryWallItem): FrameConfig {
    return {
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
    };
  }

  function getGalleryFrameOuterSizeCm(item: GalleryWallItem) {
    const renderConfig = getRenderConfigForGalleryItem(item);
    const renderGeometry = getFrameGeometry(renderConfig);

    return {
      widthCm: renderGeometry.frameOuterWidthCm,
      heightCm: renderGeometry.frameOuterHeightCm,
    };
  }

  function getGalleryFrameIntrinsicSizePx(item: GalleryWallItem) {
    const renderConfig = getRenderConfigForGalleryItem(item);
    const renderMetrics = getPreviewMetrics(renderConfig);

    return {
      width: renderMetrics.frameOuterWidthPx,
      height: renderMetrics.frameOuterHeightPx,
    };
  }

  function getArtworkLayer(renderConfig: FrameConfig) {
    const renderGeometry = getFrameGeometry(renderConfig);
    const uploadedArtworkLayout =
      renderConfig.uploadedArtworkPixelWidth && renderConfig.uploadedArtworkPixelHeight
        ? getArtworkCropImageLayout(
            renderConfig.uploadedArtworkPixelWidth,
            renderConfig.uploadedArtworkPixelHeight,
            Math.max(renderGeometry.artworkWidthCm, 0.1),
            Math.max(renderGeometry.artworkHeightCm, 0.1),
            renderConfig.uploadedArtworkCropX,
            renderConfig.uploadedArtworkCropY,
            renderConfig.uploadedArtworkCropScale,
          )
        : null;

    if (renderConfig.uploadedArtworkUrl) {
      return (
        <img
          src={renderConfig.uploadedArtworkUrl}
          alt={renderConfig.uploadedArtworkName ?? 'Uploaded artwork'}
          className="absolute max-w-none"
          style={
            uploadedArtworkLayout ?? {
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
              objectFit: 'cover',
            }
          }
        />
      );
    }

    return (
      <div className="relative flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#cfd4dc,#edf1f5_55%,#c2c7d0)] text-center text-sm text-gray-600">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="relative z-10 px-4 leading-6">
          <div className="font-medium text-gray-700">{t.preview.artworkPlaceholder}</div>
          <div>
            {`${formatDisplayValue(renderGeometry.artworkWidthCm)} x ${formatDisplayValue(renderGeometry.artworkHeightCm)} cm`}
          </div>
        </div>
      </div>
    );
  }

  function renderOpeningFrame(inner: ReactNode) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#d9dde3] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
        {inner}
      </div>
    );
  }

  function renderMatLayer(renderConfig: FrameConfig, renderMetrics = getPreviewMetrics(renderConfig)) {
    const renderMatEnabled = getEffectiveMatEnabled(renderConfig);
    const renderMatType = getEffectiveMatType(renderConfig);
    const renderMatThicknesses = getEffectiveMatThicknesses(renderConfig);
    const renderMatTopColor = getMatColorHex(renderConfig.matColor);
    const renderMatMiddleColor = getMatColorHex(renderConfig.matMiddleColor);
    const renderMatBottomColor = getMatColorHex(renderConfig.matBottomColor);
    const topMatPx = cmToPx(renderMatThicknesses.topBand, renderMetrics.scale);
    const middleMatPx = cmToPx(renderMatThicknesses.middleBand, renderMetrics.scale);
    const bottomMatPx = cmToPx(renderMatThicknesses.bottomBand, renderMetrics.scale);
    const boxDepthPx = cmToPx(renderConfig.boxDepthCm, renderMetrics.scale);
    const artworkLayer = getArtworkLayer(renderConfig);

    if (!renderMatEnabled) {
      return renderOpeningFrame(artworkLayer);
    }

    if (renderMatType === 'single') {
      return (
        <div
          className="relative h-full w-full"
          style={{
            backgroundColor: renderMatTopColor,
            padding: `${topMatPx}px`,
            boxShadow:
              'inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 18px 22px rgba(255,255,255,0.36)',
          }}
        >
          {renderOpeningFrame(artworkLayer)}
        </div>
      );
    }

    if (renderMatType === 'double') {
      return (
        <div
          className="relative h-full w-full"
          style={{
            backgroundColor: renderMatTopColor,
            padding: `${topMatPx}px`,
            boxShadow:
              'inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 18px 22px rgba(255,255,255,0.36)',
          }}
        >
          <div
            className="relative h-full w-full"
            style={{ backgroundColor: renderMatBottomColor, padding: `${bottomMatPx}px` }}
          >
            {renderOpeningFrame(artworkLayer)}
          </div>
        </div>
      );
    }

    if (renderMatType === 'triple') {
      return (
        <div
          className="relative h-full w-full"
          style={{
            backgroundColor: renderMatTopColor,
            padding: `${topMatPx}px`,
            boxShadow:
              'inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 18px 22px rgba(255,255,255,0.36)',
          }}
        >
          <div
            className="relative h-full w-full"
            style={{ backgroundColor: renderMatMiddleColor, padding: `${middleMatPx}px` }}
          >
            <div
              className="relative h-full w-full"
              style={{ backgroundColor: renderMatBottomColor, padding: `${bottomMatPx}px` }}
            >
              {renderOpeningFrame(artworkLayer)}
            </div>
          </div>
        </div>
      );
    }

    if (renderMatType === 'v_groove') {
      const grooveInset = Math.min(
        cmToPx(renderConfig.grooveOffsetCm, renderMetrics.scale),
        Math.max(renderMetrics.matThicknessPx - 3, 0),
      );

      return (
        <div
          className="relative h-full w-full"
          style={{
            backgroundColor: renderMatTopColor,
            padding: `${topMatPx}px`,
            boxShadow:
              'inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 18px 22px rgba(255,255,255,0.36)',
          }}
        >
          {renderConfig.grooveEnabled ? (
            <div
              className="pointer-events-none absolute"
              style={{
                inset: `${Math.max(grooveInset, 2)}px`,
                border: '1px solid rgba(122, 106, 88, 0.45)',
              }}
            />
          ) : null}
          {renderOpeningFrame(artworkLayer)}
        </div>
      );
    }

    if (renderMatType === 'box') {
      return (
        <div
          className="relative h-full w-full"
          style={{
            backgroundColor: renderMatTopColor,
            padding: `${topMatPx}px`,
            boxShadow:
              'inset 0 0 0 1px rgba(0,0,0,0.05), inset 0 24px 22px rgba(255,255,255,0.34)',
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              boxShadow: `inset 0 ${Math.max(boxDepthPx, 3)}px ${Math.max(boxDepthPx * 2.5, 8)}px rgba(0,0,0,0.14), inset 0 0 0 1px rgba(0,0,0,0.08)`,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0) 28%)',
            }}
          >
            {renderOpeningFrame(artworkLayer)}
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative h-full w-full"
        style={{
          backgroundColor: renderMatTopColor,
          padding: `${topMatPx}px`,
          boxShadow:
            'inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 18px 22px rgba(255,255,255,0.36)',
        }}
      >
        {renderOpeningFrame(artworkLayer)}
      </div>
    );
  }

  function renderConfiguredFrame(renderConfig: FrameConfig = config) {
    const renderFrame = getFrameById(renderConfig.frameStyle);
    const renderGeometry = getFrameGeometry(renderConfig);
    const renderMetrics = getPreviewMetrics(renderConfig);
    const renderGlazing = getEffectiveGlazing(renderConfig);
    const renderPreviewStyleDef = getPreviewStyle(renderFrame.previewStyleKey);
    const renderSliceAssets =
      renderFrame.id === frame.id ? sliceAssets.assets : getFrameSliceAssets(renderFrame.id);
    const renderHasSlicePreview =
      renderFrame.id === frame.id ? hasSlicePreview : Boolean(renderFrame.previewSliceAssets);
    const hasSightEdge =
      renderFrame.previewStyleKey === 'walnut-gold-sight-edge' ||
      renderFrame.previewStyleKey === 'black-gold-sight-edge';

    const frameShellStyle: CSSProperties = {
      borderStyle: 'solid',
      borderWidth: `${renderMetrics.frameThicknessPx}px`,
      borderColor: `${renderPreviewStyleDef.borderColors[0]} ${renderPreviewStyleDef.borderColors[1]} ${renderPreviewStyleDef.borderColors[2]} ${renderPreviewStyleDef.borderColors[3]}`,
      boxSizing: 'border-box',
      background: renderPreviewStyleDef.shellBackground,
    };

    const innerAreaStyle: CSSProperties = {
      position: 'absolute',
      left: `${renderMetrics.frameThicknessPx}px`,
      top: `${renderMetrics.frameThicknessPx}px`,
      width: `${renderMetrics.matOuterWidthPx}px`,
      height: `${renderMetrics.matOuterHeightPx}px`,
    };
    const sightEdgeThicknessPx = Math.max(1.5, Math.min(renderMetrics.frameThicknessPx * 0.16, 5));
    const sightEdgeInsetPx = Math.max(renderMetrics.frameThicknessPx - sightEdgeThicknessPx * 1.1, 1);
    const sightEdgeStyle: CSSProperties = {
      position: 'absolute',
      inset: `${sightEdgeInsetPx}px`,
      border: `${sightEdgeThicknessPx}px solid rgba(214, 174, 78, 0.98)`,
      boxShadow:
        '0 0 0 1px rgba(255, 239, 191, 0.38), inset 0 0 0 1px rgba(116, 77, 13, 0.25)',
      pointerEvents: 'none',
    };

    const topEdgeStyle: CSSProperties = {
      position: 'absolute',
      left: `${renderMetrics.frameThicknessPx}px`,
      top: 0,
      width: `${Math.max(renderMetrics.frameOuterWidthPx - renderMetrics.frameThicknessPx * 2, 0)}px`,
      height: `${renderMetrics.frameThicknessPx}px`,
      backgroundImage: renderHasSlicePreview ? `url(${renderSliceAssets.edgeTop})` : undefined,
      backgroundRepeat: 'repeat-x',
      backgroundSize: 'auto 100%',
      backgroundPosition: 'center',
      pointerEvents: 'none',
    };

    const bottomEdgeStyle: CSSProperties = {
      position: 'absolute',
      left: `${renderMetrics.frameThicknessPx}px`,
      bottom: 0,
      width: `${Math.max(renderMetrics.frameOuterWidthPx - renderMetrics.frameThicknessPx * 2, 0)}px`,
      height: `${renderMetrics.frameThicknessPx}px`,
      backgroundImage: renderHasSlicePreview ? `url(${renderSliceAssets.edgeBottom})` : undefined,
      backgroundRepeat: 'repeat-x',
      backgroundSize: 'auto 100%',
      backgroundPosition: 'center',
      pointerEvents: 'none',
    };

    const leftEdgeStyle: CSSProperties = {
      position: 'absolute',
      left: 0,
      top: `${renderMetrics.frameThicknessPx}px`,
      width: `${renderMetrics.frameThicknessPx}px`,
      height: `${Math.max(renderMetrics.frameOuterHeightPx - renderMetrics.frameThicknessPx * 2, 0)}px`,
      backgroundImage: renderHasSlicePreview ? `url(${renderSliceAssets.edgeLeft})` : undefined,
      backgroundRepeat: 'repeat-y',
      backgroundSize: '100% auto',
      backgroundPosition: 'center',
      pointerEvents: 'none',
    };

    const rightEdgeStyle: CSSProperties = {
      position: 'absolute',
      right: 0,
      top: `${renderMetrics.frameThicknessPx}px`,
      width: `${renderMetrics.frameThicknessPx}px`,
      height: `${Math.max(renderMetrics.frameOuterHeightPx - renderMetrics.frameThicknessPx * 2, 0)}px`,
      backgroundImage: renderHasSlicePreview ? `url(${renderSliceAssets.edgeRight})` : undefined,
      backgroundRepeat: 'repeat-y',
      backgroundSize: '100% auto',
      backgroundPosition: 'center',
      pointerEvents: 'none',
    };

    return (
      <div
        className="relative transition-all duration-300"
        style={{
          width: `${renderMetrics.frameOuterWidthPx}px`,
          height: `${renderMetrics.frameOuterHeightPx}px`,
          boxShadow: `0 32px 60px rgba(15, 23, 42, ${0.18 + renderGeometry.previewDepth * 0.05}), 0 12px 26px rgba(15, 23, 42, 0.12)`,
        }}
      >
        {renderHasSlicePreview ? null : (
          <div className="absolute inset-0 rounded-[10px]" style={frameShellStyle}>
            <div
              className="pointer-events-none absolute inset-0 rounded-[4px]"
              style={{ background: renderPreviewStyleDef.highlightOverlay }}
            />
            <div
              className="pointer-events-none absolute"
              style={{
                inset: `${Math.max(2, renderMetrics.frameThicknessPx * 0.08)}px`,
                boxShadow: renderPreviewStyleDef.innerShadow,
              }}
            />
          </div>
        )}

        {renderHasSlicePreview ? (
          <>
            <div className="absolute overflow-hidden bg-[#f7f7f5]" style={innerAreaStyle}>
              {renderMatLayer(renderConfig, renderMetrics)}
            </div>
            <div className="pointer-events-none absolute inset-0">
              <FrameSlice
                src={renderSliceAssets.cornerTl}
                alt={`${renderFrame.id} top left corner`}
                style={{ top: 0, left: 0, width: `${renderMetrics.frameThicknessPx}px`, height: `${renderMetrics.frameThicknessPx}px` }}
              />
              <FrameSlice
                src={renderSliceAssets.cornerTr}
                alt={`${renderFrame.id} top right corner`}
                style={{ top: 0, right: 0, width: `${renderMetrics.frameThicknessPx}px`, height: `${renderMetrics.frameThicknessPx}px` }}
              />
              <FrameSlice
                src={renderSliceAssets.cornerBl}
                alt={`${renderFrame.id} bottom left corner`}
                style={{ bottom: 0, left: 0, width: `${renderMetrics.frameThicknessPx}px`, height: `${renderMetrics.frameThicknessPx}px` }}
              />
              <FrameSlice
                src={renderSliceAssets.cornerBr}
                alt={`${renderFrame.id} bottom right corner`}
                style={{ bottom: 0, right: 0, width: `${renderMetrics.frameThicknessPx}px`, height: `${renderMetrics.frameThicknessPx}px` }}
              />
              <div style={topEdgeStyle} />
              <div style={bottomEdgeStyle} />
              <div style={leftEdgeStyle} />
              <div style={rightEdgeStyle} />
            </div>
          </>
        ) : (
          <div className="absolute overflow-hidden bg-[#f7f7f5]" style={innerAreaStyle}>
            {renderMatLayer(renderConfig, renderMetrics)}
          </div>
        )}

        {hasSightEdge ? <div style={sightEdgeStyle} /> : null}

        {renderGlazing === 'glass' ? (
          <div className="pointer-events-none absolute bg-white/6" style={innerAreaStyle}>
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.10)_30%,rgba(255,255,255,0)_62%)]" />
          </div>
        ) : null}
      </div>
    );
  }

  const mainFrame = renderConfiguredFrame();

  function clampArtworkWidth(nextWidth: number) {
    return Math.min(Math.max(nextWidth, frame.minWidthCm), frame.maxWidthCm);
  }

  function clampArtworkHeight(nextHeight: number) {
    return Math.min(Math.max(nextHeight, frame.minHeightCm), frame.maxHeightCm);
  }

  function handleArtworkWidthCommit(nextWidth: number) {
    const nextConfigUpdate = getArtworkSizeUpdateForInput(
      config,
      'artworkWidthCm',
      nextWidth,
    );
    const clampedWidth = Math.round(clampArtworkWidth(nextConfigUpdate.artworkWidthCm) * 10) / 10;
    const clampedHeight = Math.round(clampArtworkHeight(nextConfigUpdate.artworkHeightCm) * 10) / 10;

    updateConfig({
      artworkWidthCm: clampedWidth,
      artworkHeightCm: clampedHeight,
      ...getCropMemoryTransitionUpdate(config, clampedWidth, clampedHeight),
    });
  }

  function handleArtworkHeightCommit(nextHeight: number) {
    const nextConfigUpdate = getArtworkSizeUpdateForInput(
      config,
      'artworkHeightCm',
      nextHeight,
    );
    const clampedWidth = Math.round(clampArtworkWidth(nextConfigUpdate.artworkWidthCm) * 10) / 10;
    const clampedHeight = Math.round(clampArtworkHeight(nextConfigUpdate.artworkHeightCm) * 10) / 10;

    updateConfig({
      artworkWidthCm: clampedWidth,
      artworkHeightCm: clampedHeight,
      ...getCropMemoryTransitionUpdate(config, clampedWidth, clampedHeight),
    });
  }

  function handleGenerateWallLayout() {
    const layout = generateLayout({
      wallWidthCm: config.wallWidthCm,
      wallHeightCm: config.wallHeightCm,
      spacingCm: config.wallSpacingCm,
      frameCount: config.desiredFrameCount,
      frameWidthPaddingCm,
      frameHeightPaddingCm,
      minArtworkWidthCm: frame.minWidthCm,
      minArtworkHeightCm: frame.minHeightCm,
      maxArtworkWidthCm: frame.maxWidthCm,
      maxArtworkHeightCm: frame.maxHeightCm,
      targetAspectRatio: config.artworkWidthCm / Math.max(config.artworkHeightCm, 0.1),
    });

    if (layout.length === 0) {
      return;
    }

    updateConfig({
      compositionMode: 'gallery-wall',
      galleryItems: layout,
      activeGalleryItemId: layout[0]?.id ?? null,
      selectedGalleryLayoutId: CUSTOM_GALLERY_LAYOUT_ID,
      gallerySpacingCm: config.wallSpacingCm,
    });
  }

  function handleGenerateWallLayoutForRoom(selectedRoomTemplateId?: string) {
    const baseRoomTemplate =
      ROOM_TEMPLATES.find((template) => template.id === selectedRoomTemplateId) ?? null;
    const savedCalibration = baseRoomTemplate
      ? getSavedRoomCalibration(baseRoomTemplate.id)
      : null;
    const selectedRoomTemplate = baseRoomTemplate
      ? {
          ...baseRoomTemplate,
          devWallQuad: savedCalibration?.wallQuad ?? baseRoomTemplate.devWallQuad,
          devPlacementPolygon:
            savedCalibration?.placementPolygon ?? baseRoomTemplate.devPlacementPolygon,
        }
      : null;

    const layout = generateLayout({
      wallWidthCm: config.wallWidthCm,
      wallHeightCm: config.wallHeightCm,
      spacingCm: config.wallSpacingCm,
      frameCount: config.desiredFrameCount,
      frameWidthPaddingCm,
      frameHeightPaddingCm,
      minArtworkWidthCm: frame.minWidthCm,
      minArtworkHeightCm: frame.minHeightCm,
      maxArtworkWidthCm: frame.maxWidthCm,
      maxArtworkHeightCm: frame.maxHeightCm,
      targetAspectRatio: config.artworkWidthCm / Math.max(config.artworkHeightCm, 0.1),
      allowedZoneCm: selectedRoomTemplate
        ? getAllowedZoneCmForWallSurface(
            selectedRoomTemplate,
            config.wallWidthCm,
            config.wallHeightCm,
          )
        : null,
    });

    if (layout.length === 0) {
      return;
    }

    updateConfig({
      compositionMode: 'gallery-wall',
      galleryItems: layout,
      activeGalleryItemId: layout[0]?.id ?? null,
      selectedGalleryLayoutId: CUSTOM_GALLERY_LAYOUT_ID,
      gallerySpacingCm: config.wallSpacingCm,
    });
  }

  return (
    <div className="h-fit lg:sticky lg:top-8">
      <div className="rounded-2xl border border-border bg-white p-8 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t.preview.title}</h3>
            <p className="text-sm text-muted-foreground">{t.preview.description}</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
            <Upload className="h-4 w-4" />
            {config.uploadedArtworkName ?? t.preview.noArtworkUploaded}
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              {t.preview.modeLabel}
            </div>
            <p className="text-sm text-gray-500">
              {isGalleryWallMode && config.selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID
                ? 'Drag each frame to build your own gallery wall, then see the full arrangement in a room.'
                : isGalleryWallMode
                  ? 'Preview the full composition inside a styled room scene.'
                  : t.preview.roomDescription}
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onRoomPreviewOpenChange(true)}
              className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
            >
              {t.preview.roomView}
            </button>
          </div>
        </div>

        {isGalleryWallMode ? (
          <div className="mb-5 space-y-4">
            <WallSizeStep config={config} updateConfig={updateConfig} t={t} />
            <GalleryWallStep
              config={config}
              updateConfig={updateConfig}
              stepNumber={1}
              t={t}
            />
          </div>
        ) : null}

        {isGalleryWallMode ? (
          <GalleryWallPreview
            selectedLayoutId={config.selectedGalleryLayoutId}
            items={config.galleryItems}
            activeItemId={config.activeGalleryItemId}
            onSelectItem={(itemId) => updateConfig({ activeGalleryItemId: itemId })}
            onSwapItems={(sourceItemId, targetItemId) =>
              updateConfig({
                galleryItems: swapGalleryWallItems(
                  config.galleryItems,
                  sourceItemId,
                  targetItemId,
                ),
              })
            }
            onMoveCustomItem={(itemId, xCm, yCm) =>
              updateConfig({
                galleryItems: updateGalleryWallItemCustomPositionWithoutOverlap(
                  config.galleryItems,
                  itemId,
                  xCm,
                  yCm,
                  getGalleryFrameOuterSizeCm,
                ),
              })
            }
            onMoveAllCustomItems={(deltaXcm, deltaYcm) =>
              updateConfig({
                galleryItems: offsetGalleryWallCustomPositions(
                  config.galleryItems,
                  deltaXcm,
                  deltaYcm,
                  getGalleryFrameOuterSizeCm,
                ),
              })
            }
            getFrameOuterSize={getGalleryFrameOuterSizeCm}
            getFrameIntrinsicSize={(item) => {
              const renderConfig = getRenderConfigForGalleryItem(item);
              const renderMetrics = getPreviewMetrics(renderConfig);
              return {
                width: renderMetrics.frameOuterWidthPx,
                height: renderMetrics.frameOuterHeightPx,
              };
            }}
            renderFrameContent={(item) => renderConfiguredFrame(getRenderConfigForGalleryItem(item))}
          />
        ) : (
          <div className="flex min-h-[620px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef0f3_48%,#e3e5e9_100%)] p-8">
            {mainFrame}
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t.summary.composition}:</span>
              <span className="ml-2 font-medium text-gray-900">
                {isGalleryWallMode ? t.summary.galleryWall : t.summary.singleFrame}
              </span>
            </div>
            {isGalleryWallMode ? (
              <div>
                <span className="text-gray-600">{t.summary.frames}:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {config.galleryItems.length}
                </span>
              </div>
            ) : null}
            <div>
              <span className="text-gray-600">Artwork size:</span>
              <span className="ml-2 font-medium text-gray-900">
                {`${formatDisplayValue(geometry.artworkWidthCm)} x ${formatDisplayValue(geometry.artworkHeightCm)} cm`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Final size:</span>
              <span className="ml-2 font-medium text-gray-900">
                {`${formatDisplayValue(geometry.frameOuterWidthCm)} x ${formatDisplayValue(geometry.frameOuterHeightCm)} cm`}
              </span>
            </div>
            {isGalleryWallMode ? (
              <div>
                <span className="text-gray-600">{t.summary.layout}:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {selectedGalleryLayoutLabel}
                </span>
              </div>
            ) : null}
            <div>
              <span className="text-gray-600">{t.summary.moldingId}:</span>
              <span className="ml-2 font-medium text-gray-900">{frame.id}</span>
            </div>
            <div>
              <span className="text-gray-600">{t.summary.finish}:</span>
              <span className="ml-2 font-medium text-gray-900">{frame.finish}</span>
            </div>
            <div>
              <span className="text-gray-600">{t.summary.glazing}:</span>
              <span className="ml-2 font-medium text-gray-900">
                {glazing === 'glass' ? t.summary.withGlass : t.summary.withoutGlass}
              </span>
            </div>
            <div>
              <span className="text-gray-600">{t.summary.artwork}:</span>
              <span className="ml-2 font-medium text-gray-900">
                {config.uploadedArtworkName ?? t.summary.placeholder}
              </span>
            </div>
          </div>
        </div>
      </div>

      <RoomPreviewModal
        isOpen={isRoomPreviewOpen}
        onClose={() => onRoomPreviewOpenChange(false)}
        t={t}
        compositionMode={config.compositionMode}
        frameOuterWidthCm={geometry.frameOuterWidthCm}
        frameOuterHeightCm={geometry.frameOuterHeightCm}
        frameIntrinsicWidthPx={metrics.frameOuterWidthPx}
        frameIntrinsicHeightPx={metrics.frameOuterHeightPx}
        artworkWidthCm={geometry.artworkWidthCm}
        artworkHeightCm={geometry.artworkHeightCm}
        galleryItems={config.galleryItems}
        activeGalleryItemId={config.activeGalleryItemId}
        selectedGalleryLayoutId={config.selectedGalleryLayoutId}
        gallerySpacingCm={config.gallerySpacingCm}
        onGallerySpacingCmChange={(value) => updateConfig({ gallerySpacingCm: value })}
        onSelectedGalleryLayoutIdChange={(layoutId) =>
          updateConfig({ selectedGalleryLayoutId: layoutId })
        }
        onActivateCustomGalleryLayout={() =>
          updateConfig({
            galleryItems: convertGalleryWallItemsToCustomLayout(
              config.galleryItems,
              config.selectedGalleryLayoutId,
              config.gallerySpacingCm,
              getGalleryFrameOuterSizeCm,
            ),
            selectedGalleryLayoutId: CUSTOM_GALLERY_LAYOUT_ID,
          })
        }
        onMoveGalleryWallItemCustomPosition={(itemId, xCm, yCm) =>
          updateConfig({
            galleryItems: updateGalleryWallItemCustomPositionWithoutOverlap(
              config.galleryItems,
              itemId,
              xCm,
              yCm,
              getGalleryFrameOuterSizeCm,
            ),
          })
        }
        onEvenOutGalleryWallSpacing={() =>
          updateConfig({
            galleryItems: evenOutGalleryWallCustomSpacing(
              config.galleryItems,
              config.gallerySpacingCm,
              getGalleryFrameOuterSizeCm,
            ),
          })
        }
        getGalleryFrameOuterSizeCm={getGalleryFrameOuterSizeCm}
        getGalleryFrameIntrinsicSizePx={getGalleryFrameIntrinsicSizePx}
        renderGalleryFrameContent={(item) => renderConfiguredFrame(getRenderConfigForGalleryItem(item))}
        wallWidthCm={config.wallWidthCm}
        wallHeightCm={config.wallHeightCm}
        wallSpacingCm={config.wallSpacingCm}
        desiredFrameCount={config.desiredFrameCount}
        onWallWidthCmChange={(value) => updateConfig({ wallWidthCm: value })}
        onWallHeightCmChange={(value) => updateConfig({ wallHeightCm: value })}
        onWallSpacingCmChange={(value) => updateConfig({ wallSpacingCm: value })}
        onDesiredFrameCountChange={(value) => updateConfig({ desiredFrameCount: value })}
        onGenerateWallLayout={handleGenerateWallLayoutForRoom}
        artworkRatioMode={config.artworkRatioMode}
        artworkRatioWidth={config.artworkRatioWidth}
        artworkRatioHeight={config.artworkRatioHeight}
        selectedArtworkRatioId={config.selectedArtworkRatioId}
        frameContent={renderConfiguredFrame()}
        onArtworkWidthCommit={handleArtworkWidthCommit}
        onArtworkHeightCommit={handleArtworkHeightCommit}
      />
    </div>
  );
}
