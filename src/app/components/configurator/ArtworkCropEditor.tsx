import { useEffect, useMemo, useRef } from 'react';
import {
  clampCropCenter,
  getArtworkCropImageLayout,
  getCropRectPercentages,
} from './artwork-crop';

interface ArtworkCropEditorProps {
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  ratioWidth: number;
  ratioHeight: number;
  cropCenterX: number;
  cropCenterY: number;
  cropScale: number;
  onCropChange: (cropCenterX: number, cropCenterY: number) => void;
  onCropScaleChange: (cropScale: number) => void;
  onReset: () => void;
  originalLabel: string;
  croppedLabel: string;
  zoomLabel: string;
  resetLabel: string;
}

export function ArtworkCropEditor({
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
  ratioWidth,
  ratioHeight,
  cropCenterX,
  cropCenterY,
  cropScale,
  onCropChange,
  onCropScaleChange,
  onReset,
  originalLabel,
  croppedLabel,
  zoomLabel,
  resetLabel,
}: ArtworkCropEditorProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const cropRect = useMemo(
    () =>
      getCropRectPercentages(
        imageWidth,
        imageHeight,
        ratioWidth,
        ratioHeight,
        cropCenterX,
        cropCenterY,
        cropScale,
      ),
    [cropCenterX, cropCenterY, cropScale, imageHeight, imageWidth, ratioHeight, ratioWidth],
  );
  const croppedImageLayout = useMemo(
    () =>
      getArtworkCropImageLayout(
        imageWidth,
        imageHeight,
        ratioWidth,
        ratioHeight,
        cropCenterX,
        cropCenterY,
        cropScale,
      ),
    [cropCenterX, cropCenterY, cropScale, imageHeight, imageWidth, ratioHeight, ratioWidth],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId || !frameRef.current) {
        return;
      }

      const rect = frameRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const nextCenter = clampCropCenter(
        imageWidth,
        imageHeight,
        ratioWidth,
        ratioHeight,
        dragState.originX + (event.clientX - dragState.startX) / rect.width,
        dragState.originY + (event.clientY - dragState.startY) / rect.height,
        cropScale,
      );

      onCropChange(nextCenter.x, nextCenter.y);
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (dragStateRef.current?.pointerId === event.pointerId) {
        dragStateRef.current = null;
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [cropScale, imageHeight, imageWidth, onCropChange, ratioHeight, ratioWidth]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/25 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
            {zoomLabel}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={cropScale}
              onChange={(event) => onCropScaleChange(Number.parseFloat(event.target.value))}
              className="w-full accent-[var(--primary)]"
            />
            <div className="w-12 text-right text-sm font-medium text-foreground">
              {cropScale.toFixed(2)}x
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          {resetLabel}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
          {originalLabel}
        </div>
        <div className="rounded-xl border border-border bg-muted/35 p-3">
          <div
            ref={frameRef}
            className="relative mx-auto w-full overflow-hidden rounded-lg bg-white shadow-sm"
            style={{ aspectRatio: `${imageWidth}/${imageHeight}` }}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-[rgba(15,23,42,0.28)]" />
            <div
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: `${cropRect.left}%`,
                top: `${cropRect.top}%`,
                width: `${cropRect.width}%`,
                height: `${cropRect.height}%`,
                boxShadow: '0 0 0 9999px rgba(255,255,255,0.02)',
                border: '2px solid rgba(255,255,255,0.95)',
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                dragStateRef.current = {
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                  originX: cropCenterX,
                  originY: cropCenterY,
                };
              }}
            >
              <div className="pointer-events-none absolute inset-0 border border-[rgba(15,23,42,0.12)]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90 bg-white/25 backdrop-blur-[2px]" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
          {croppedLabel}
        </div>
        <div className="rounded-xl border border-border bg-muted/35 p-3">
          <div
            className="relative mx-auto w-full overflow-hidden rounded-lg bg-white shadow-sm"
            style={{ aspectRatio: `${ratioWidth}/${ratioHeight}` }}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute max-w-none"
              style={croppedImageLayout}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
