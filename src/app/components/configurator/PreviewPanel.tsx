import type { CSSProperties, ReactNode } from 'react';
import { Upload } from 'lucide-react';
import { FrameConfig } from '../../App';
import type { ConfiguratorTranslations } from './configurator-translations';
import { useFrameSliceAssets } from './frame-assets';
import { getPreviewStyle } from './preview-styles';
import {
  formatSizePair,
  getEffectiveGlazing,
  getEffectiveMatEnabled,
  getEffectiveMatType,
  getFrameById,
  getMatColorHex,
} from './configurator-utils';

interface PreviewPanelProps {
  config: FrameConfig;
  t: ConfiguratorTranslations;
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

export function PreviewPanel({ config, t }: PreviewPanelProps) {
  const MAX_PREVIEW_WIDTH = 420;
  const MAX_PREVIEW_HEIGHT = 420;

  const frame = getFrameById(config.frameStyle);
  const sliceAssets = useFrameSliceAssets(frame.id);
  const previewStyleDef = getPreviewStyle(frame.previewStyleKey);
  const matEnabled = getEffectiveMatEnabled(config);
  const matType = getEffectiveMatType(config);
  const glazing = getEffectiveGlazing(config);
  const matTopColor = getMatColorHex(config.matColor);
  const matMiddleColor = getMatColorHex(config.matMiddleColor);
  const matBottomColor = getMatColorHex(config.matBottomColor);
  const hasSlicePreview = sliceAssets.isAvailable;

  const artworkWidthCm = config.artworkWidthCm;
  const artworkHeightCm = config.artworkHeightCm;
  const moldingWidthCm = frame.profileWidthMm / 10;
  const matThicknessCm = matEnabled ? config.matThicknessCm : 0;

  const frameRatioX = moldingWidthCm / artworkWidthCm;
  const frameRatioY = moldingWidthCm / artworkHeightCm;
  const matRatioX = matThicknessCm / artworkWidthCm;
  const matRatioY = matThicknessCm / artworkHeightCm;

  const normalizedArtworkScale = Math.min(
    MAX_PREVIEW_WIDTH / artworkWidthCm,
    MAX_PREVIEW_HEIGHT / artworkHeightCm,
  );
  const normalizedArtworkWidth = artworkWidthCm * normalizedArtworkScale;
  const normalizedArtworkHeight = artworkHeightCm * normalizedArtworkScale;

  const normalizedFrameThicknessX = normalizedArtworkWidth * frameRatioX;
  const normalizedFrameThicknessY = normalizedArtworkHeight * frameRatioY;
  const normalizedFrameThickness = Math.min(normalizedFrameThicknessX, normalizedFrameThicknessY);
  const normalizedMatThicknessX = normalizedArtworkWidth * matRatioX;
  const normalizedMatThicknessY = normalizedArtworkHeight * matRatioY;
  const normalizedMatThickness = matEnabled
    ? Math.min(normalizedMatThicknessX, normalizedMatThicknessY)
    : 0;
  const normalizedTotalWidth = normalizedArtworkWidth + (normalizedFrameThickness + normalizedMatThickness) * 2;
  const normalizedTotalHeight = normalizedArtworkHeight + (normalizedFrameThickness + normalizedMatThickness) * 2;

  const previewScale = Math.min(
    1,
    MAX_PREVIEW_WIDTH / normalizedTotalWidth,
    MAX_PREVIEW_HEIGHT / normalizedTotalHeight,
  );

  const displayArtworkWidth = normalizedArtworkWidth * previewScale;
  const displayArtworkHeight = normalizedArtworkHeight * previewScale;
  const displayFrameThicknessX = displayArtworkWidth * frameRatioX;
  const displayFrameThicknessY = displayArtworkHeight * frameRatioY;
  const displayFrameThickness = Math.min(displayFrameThicknessX, displayFrameThicknessY);
  const displayMatThicknessX = displayArtworkWidth * matRatioX;
  const displayMatThicknessY = displayArtworkHeight * matRatioY;
  const displayMatThickness = matEnabled
    ? Math.min(displayMatThicknessX, displayMatThicknessY)
    : 0;
  const displayTotalWidth = displayArtworkWidth + (displayFrameThickness + displayMatThickness) * 2;
  const displayTotalHeight = displayArtworkHeight + (displayFrameThickness + displayMatThickness) * 2;

  const previewStyle: CSSProperties = {
    width: `${displayTotalWidth}px`,
    height: `${displayTotalHeight}px`,
    boxShadow: `0 32px 60px rgba(15, 23, 42, ${0.18 + frame.previewDepth * 0.05}), 0 12px 26px rgba(15, 23, 42, 0.12)`,
  };

  const fallbackArtworkAreaStyle: CSSProperties = {
    position: 'absolute',
    inset: `${displayFrameThickness}px`,
  };

  const sliceInnerAreaStyle: CSSProperties = {
    position: 'absolute',
    left: `${displayFrameThickness}px`,
    top: `${displayFrameThickness}px`,
    width: `${displayTotalWidth - displayFrameThickness * 2}px`,
    height: `${displayTotalHeight - displayFrameThickness * 2}px`,
  };

  const frameShellStyle: CSSProperties = {
    borderStyle: 'solid',
    borderWidth: `${displayFrameThickness}px`,
    borderColor: `${previewStyleDef.borderColors[0]} ${previewStyleDef.borderColors[1]} ${previewStyleDef.borderColors[2]} ${previewStyleDef.borderColors[3]}`,
    boxSizing: 'border-box',
    background: previewStyleDef.shellBackground,
  };

  const topEdgeStyle: CSSProperties = {
    position: 'absolute',
    left: `${displayFrameThickness}px`,
    top: 0,
    width: `${Math.max(displayTotalWidth - displayFrameThickness * 2, 0)}px`,
    height: `${displayFrameThickness}px`,
    backgroundImage: hasSlicePreview ? `url(${sliceAssets.assets.edgeTop})` : undefined,
    backgroundRepeat: 'repeat-x',
    backgroundSize: `auto 100%`,
    backgroundPosition: 'center',
    pointerEvents: 'none',
  };

  const bottomEdgeStyle: CSSProperties = {
    position: 'absolute',
    left: `${displayFrameThickness}px`,
    bottom: 0,
    width: `${Math.max(displayTotalWidth - displayFrameThickness * 2, 0)}px`,
    height: `${displayFrameThickness}px`,
    backgroundImage: hasSlicePreview ? `url(${sliceAssets.assets.edgeBottom})` : undefined,
    backgroundRepeat: 'repeat-x',
    backgroundSize: `auto 100%`,
    backgroundPosition: 'center',
    pointerEvents: 'none',
  };

  const leftEdgeStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: `${displayFrameThickness}px`,
    width: `${displayFrameThickness}px`,
    height: `${Math.max(displayTotalHeight - displayFrameThickness * 2, 0)}px`,
    backgroundImage: hasSlicePreview ? `url(${sliceAssets.assets.edgeLeft})` : undefined,
    backgroundRepeat: 'repeat-y',
    backgroundSize: `100% auto`,
    backgroundPosition: 'center',
    pointerEvents: 'none',
  };

  const rightEdgeStyle: CSSProperties = {
    position: 'absolute',
    right: 0,
    top: `${displayFrameThickness}px`,
    width: `${displayFrameThickness}px`,
    height: `${Math.max(displayTotalHeight - displayFrameThickness * 2, 0)}px`,
    backgroundImage: hasSlicePreview ? `url(${sliceAssets.assets.edgeRight})` : undefined,
    backgroundRepeat: 'repeat-y',
    backgroundSize: `100% auto`,
    backgroundPosition: 'center',
    pointerEvents: 'none',
  };

  const artworkLayer = config.uploadedArtworkUrl ? (
    <img
      src={config.uploadedArtworkUrl}
      alt={config.uploadedArtworkName ?? 'Uploaded artwork'}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="relative flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#cfd4dc,#edf1f5_55%,#c2c7d0)] text-center text-sm text-gray-600">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
      <div className="relative z-10 px-4 leading-6">
        <div className="font-medium text-gray-700">{t.preview.artworkPlaceholder}</div>
        <div>{formatSizePair(config.artworkWidthCm, config.artworkHeightCm, config.unit)}</div>
      </div>
    </div>
  );

  const revealPx = Math.min(config.matRevealCm * previewScale, Math.max(displayMatThickness * 0.45, 0));
  const revealSecondPx = Math.min(config.matRevealSecondCm * previewScale, Math.max(displayMatThickness * 0.3, 0));
  const outerMatPadding = Math.max(displayMatThickness - revealPx - revealSecondPx, 0);
  const middleMatPadding = Math.max(revealPx - revealSecondPx, 0);
  const boxDepthPx = config.boxDepthCm * previewScale;

  function renderOpeningFrame(inner: ReactNode) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#d9dde3] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
        {inner}
      </div>
    );
  }

  function renderMatLayer() {
    if (!matEnabled) {
      return renderOpeningFrame(artworkLayer);
    }

    if (matType === 'single') {
      return (
        <div
          className="relative h-full w-full"
          style={{
            backgroundColor: matTopColor,
            padding: `${displayMatThickness}px`,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 18px 22px rgba(255,255,255,0.36)',
          }}
        >
          {renderOpeningFrame(artworkLayer)}
        </div>
      );
    }

    if (matType === 'double') {
      return (
        <div
          className="relative h-full w-full"
          style={{ backgroundColor: matTopColor, padding: `${outerMatPadding}px`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 18px 22px rgba(255,255,255,0.36)' }}
        >
          <div className="relative h-full w-full" style={{ backgroundColor: matBottomColor, padding: `${revealPx}px` }}>
            {renderOpeningFrame(artworkLayer)}
          </div>
        </div>
      );
    }

    if (matType === 'triple') {
      return (
        <div
          className="relative h-full w-full"
          style={{ backgroundColor: matTopColor, padding: `${outerMatPadding}px`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 18px 22px rgba(255,255,255,0.36)' }}
        >
          <div className="relative h-full w-full" style={{ backgroundColor: matMiddleColor, padding: `${middleMatPadding}px` }}>
            <div className="relative h-full w-full" style={{ backgroundColor: matBottomColor, padding: `${revealSecondPx}px` }}>
              {renderOpeningFrame(artworkLayer)}
            </div>
          </div>
        </div>
      );
    }

    if (matType === 'v_groove') {
      const grooveInset = Math.min(config.grooveOffsetCm * previewScale, Math.max(displayMatThickness - 3, 0));
      return (
        <div
          className="relative h-full w-full"
          style={{
            backgroundColor: matTopColor,
            padding: `${displayMatThickness}px`,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 18px 22px rgba(255,255,255,0.36)',
          }}
        >
          {config.grooveEnabled ? (
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

    if (matType === 'box') {
      return (
        <div
          className="relative h-full w-full"
          style={{
            backgroundColor: matTopColor,
            padding: `${displayMatThickness}px`,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05), inset 0 24px 22px rgba(255,255,255,0.34)',
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
          backgroundColor: matTopColor,
          padding: `${displayMatThickness}px`,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04), inset 0 18px 22px rgba(255,255,255,0.36)',
        }}
      >
        {renderOpeningFrame(artworkLayer)}
      </div>
    );
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

        <div className="flex min-h-[620px] items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef0f3_48%,#e3e5e9_100%)] p-8">
          <div className="relative transition-all duration-300" style={previewStyle}>
            {hasSlicePreview ? null : (
              <div className="absolute inset-0 rounded-[10px]" style={frameShellStyle}>
                <div
                  className="pointer-events-none absolute inset-0 rounded-[4px]"
                  style={{ background: previewStyleDef.highlightOverlay }}
                />
                <div
                  className="pointer-events-none absolute"
                  style={{
                    inset: `${Math.max(2, displayFrameThickness * 0.08)}px`,
                    boxShadow: previewStyleDef.innerShadow,
                  }}
                />
                {frame.previewStyleKey === 'walnut-gold-sight-edge' || frame.previewStyleKey === 'black-gold-sight-edge' ? (
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      inset: `${Math.max(3, displayFrameThickness * 0.38)}px`,
                      border: `${Math.max(2, displayFrameThickness * 0.12)}px solid rgba(205, 165, 76, 0.95)`,
                      borderRadius: `${Math.max(2, displayFrameThickness * 0.08)}px`,
                    }}
                  />
                ) : null}
              </div>
            )}

            {hasSlicePreview ? (
              <>
                <div
                  className="absolute overflow-hidden bg-[#f7f7f5]"
                  style={sliceInnerAreaStyle}
                >
                  {renderMatLayer()}
                </div>

                <div className="pointer-events-none absolute inset-0">
                  {hasSlicePreview ? (
                    <>
                      <FrameSlice
                        src={sliceAssets.assets.cornerTl}
                        alt={`${frame.id} top left corner`}
                        style={{ top: 0, left: 0, width: `${displayFrameThickness}px`, height: `${displayFrameThickness}px` }}
                      />
                      <FrameSlice
                        src={sliceAssets.assets.cornerTr}
                        alt={`${frame.id} top right corner`}
                        style={{ top: 0, right: 0, width: `${displayFrameThickness}px`, height: `${displayFrameThickness}px` }}
                      />
                      <FrameSlice
                        src={sliceAssets.assets.cornerBl}
                        alt={`${frame.id} bottom left corner`}
                        style={{ bottom: 0, left: 0, width: `${displayFrameThickness}px`, height: `${displayFrameThickness}px` }}
                      />
                      <FrameSlice
                        src={sliceAssets.assets.cornerBr}
                        alt={`${frame.id} bottom right corner`}
                        style={{ bottom: 0, right: 0, width: `${displayFrameThickness}px`, height: `${displayFrameThickness}px` }}
                      />
                      <div style={topEdgeStyle} />
                      <div style={bottomEdgeStyle} />
                      <div style={leftEdgeStyle} />
                      <div style={rightEdgeStyle} />
                    </>
                  ) : null}
                </div>

                {glazing === 'glass' ? (
                  <div className="pointer-events-none absolute inset-0 bg-white/6">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.10)_30%,rgba(255,255,255,0)_62%)]" />
                  </div>
                ) : null}
              </>
            ) : (
              <div className="absolute overflow-hidden bg-[#f7f7f5]" style={fallbackArtworkAreaStyle}>
                {renderMatLayer()}

                {glazing === 'glass' ? (
                  <div className="pointer-events-none absolute inset-0 bg-white/6">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.10)_30%,rgba(255,255,255,0)_62%)]" />
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
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
              <span className="ml-2 font-medium text-gray-900">{glazing === 'glass' ? t.summary.withGlass : t.summary.withoutGlass}</span>
            </div>
            <div>
              <span className="text-gray-600">{t.summary.artwork}:</span>
              <span className="ml-2 font-medium text-gray-900">{config.uploadedArtworkName ?? t.summary.placeholder}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
