import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CUSTOM_GALLERY_LAYOUT_ID,
  doesGalleryWallItemOverlap,
  getGalleryWallCompositionLayout,
  getGalleryWallCustomCanvasLayout,
  type GalleryWallItem,
} from './gallery-wall';
import type { GalleryWallRoomPlacementMetrics } from './gallery-wall-guidance';
import {
  cloneNormalizedPolygon,
  getPolygonPointsAttribute,
  normalizePolygonPoint,
} from './roomCalibrationGeometry';
import { getSavedRoomCalibration, saveRoomCalibration } from './roomCalibrationStorage';
import type {
  NormalizedPolygon,
  NormalizedQuad,
  RoomTemplate,
} from './roomTemplates';
import { useRoomPlacement } from './useRoomPlacement';

interface GalleryWallRoomSceneProps {
  template: RoomTemplate;
  selectedLayoutId: string | null;
  items: GalleryWallItem[];
  gallerySpacingCm: number;
  onMoveCustomItem: (itemId: string, xCm: number, yCm: number) => void;
  getFrameOuterSizeCm: (item: GalleryWallItem) => {
    widthCm: number;
    heightCm: number;
  };
  getFrameIntrinsicSizePx: (item: GalleryWallItem) => {
    width: number;
    height: number;
  };
  renderFrameContent: (item: GalleryWallItem) => ReactNode;
  onPlacementMetricsChange?: (metrics: GalleryWallRoomPlacementMetrics | null) => void;
  showDevWallEditor?: boolean;
}

type DragTarget =
  | { kind: 'wall'; index: number }
  | { kind: 'placement'; index: number }
  | null;

interface PanelPosition {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function defaultWallQuad(): NormalizedQuad {
  return [
    { x: 0.22, y: 0.12 },
    { x: 0.78, y: 0.12 },
    { x: 0.78, y: 0.42 },
    { x: 0.22, y: 0.42 },
  ];
}

function updateQuadPoint(quad: NormalizedQuad, index: number, x: number, y: number): NormalizedQuad {
  return quad.map((point, pointIndex) =>
    pointIndex === index ? { x: clamp01(x), y: clamp01(y) } : point,
  ) as NormalizedQuad;
}

function areQuadsEqual(a: NormalizedQuad, b: NormalizedQuad) {
  return a.every(
    (point, index) => point.x === b[index].x && point.y === b[index].y,
  );
}

function arePolygonsEqual(a: NormalizedPolygon, b: NormalizedPolygon) {
  return (
    a.length === b.length &&
    a.every((point, index) => point.x === b[index]?.x && point.y === b[index]?.y)
  );
}

function getInitialCalibration(template: RoomTemplate) {
  const savedCalibration = getSavedRoomCalibration(template.id);

  return {
    wallQuad: savedCalibration?.wallQuad ?? template.devWallQuad ?? defaultWallQuad(),
    placementPolygon:
      savedCalibration?.placementPolygon ??
      template.devPlacementPolygon ??
      [],
  };
}

export function GalleryWallRoomScene({
  template,
  selectedLayoutId,
  items,
  gallerySpacingCm,
  onMoveCustomItem,
  getFrameOuterSizeCm,
  getFrameIntrinsicSizePx,
  renderFrameContent,
  onPlacementMetricsChange,
  showDevWallEditor = false,
}: GalleryWallRoomSceneProps) {
  const [savedCalibration, setSavedCalibration] = useState(() => getInitialCalibration(template));
  const [wallQuad, setWallQuad] = useState<NormalizedQuad>(() => getInitialCalibration(template).wallQuad);
  const [placementPolygon, setPlacementPolygon] = useState<NormalizedPolygon>(
    () => getInitialCalibration(template).placementPolygon,
  );
  const [isDrawingPlacementPolygon, setIsDrawingPlacementPolygon] = useState(false);
  const dragTargetRef = useRef<DragTarget>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelDragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [panelPosition, setPanelPosition] = useState<PanelPosition>({ x: 16, y: 16 });

  useEffect(() => {
    const nextCalibration = getInitialCalibration(template);
    setSavedCalibration(nextCalibration);
    setWallQuad(nextCalibration.wallQuad);
    setPlacementPolygon(nextCalibration.placementPolygon);
    setIsDrawingPlacementPolygon(false);
  }, [
    template.devPlacementPolygon,
    template.devWallQuad,
    template.id,
  ]);

  const resolvedPlacementPolygon = useMemo(
    () => (placementPolygon.length >= 3 && !isDrawingPlacementPolygon ? placementPolygon : []),
    [isDrawingPlacementPolygon, placementPolygon],
  );

  const isDirty =
    !areQuadsEqual(wallQuad, savedCalibration.wallQuad) ||
    !arePolygonsEqual(resolvedPlacementPolygon, savedCalibration.placementPolygon);

  const effectiveTemplate = useMemo<RoomTemplate>(
    () => ({
      ...template,
      devWallQuad: wallQuad,
      devPlacementPolygon: resolvedPlacementPolygon,
    }),
    [resolvedPlacementPolygon, template, wallQuad],
  );

  const isCustomLayout = selectedLayoutId === CUSTOM_GALLERY_LAYOUT_ID;
  const [customDragMode, setCustomDragMode] = useState<'item' | 'group'>('item');

  const composition = useMemo(() => {
    try {
      return getGalleryWallCompositionLayout(
        selectedLayoutId,
        items,
        gallerySpacingCm,
        (item) => getFrameOuterSizeCm(item),
      );
    } catch {
      return null;
    }
  }, [gallerySpacingCm, getFrameOuterSizeCm, items, selectedLayoutId]);

  const customCanvas = useMemo(() => {
    try {
      return isCustomLayout ? getGalleryWallCustomCanvasLayout(items, getFrameOuterSizeCm) : null;
    } catch {
      return null;
    }
  }, [getFrameOuterSizeCm, isCustomLayout, items]);

  const itemDragRef = useRef<{
    itemId: string;
    startX: number;
    startY: number;
    originXcm: number;
    originYcm: number;
    widthCm: number;
    heightCm: number;
  } | null>(null);

  const {
    stageRef,
    wallZone,
    placementZone,
    frameSize,
    placement,
    startDrag,
    pixelsPerCm,
  } = useRoomPlacement(
    effectiveTemplate,
    safeNumber(composition?.widthCm, 0),
    safeNumber(composition?.heightCm, 0),
  );

  useEffect(() => {
    if (!showDevWallEditor) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const dragTarget = dragTargetRef.current;
      if (!dragTarget || !stageRef.current) {
        return;
      }

      const rect = stageRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const x = clamp01((event.clientX - rect.left) / rect.width);
      const y = clamp01((event.clientY - rect.top) / rect.height);

      if (dragTarget.kind === 'wall') {
        setWallQuad((current) => updateQuadPoint(current, dragTarget.index, x, y));
        return;
      }

      setPlacementPolygon((current) =>
        current.map((point, pointIndex) =>
          pointIndex === dragTarget.index ? { x, y } : point,
        ),
      );
    }

    function handlePointerUp() {
      dragTargetRef.current = null;
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [showDevWallEditor, stageRef]);

  useEffect(() => {
    if (!showDevWallEditor) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const drag = panelDragRef.current;
      const stage = stageRef.current;
      const panel = panelRef.current;

      if (!drag || !stage || !panel) {
        return;
      }

      const stageRect = stage.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const nextX = drag.startX + (event.clientX - drag.startClientX);
      const nextY = drag.startY + (event.clientY - drag.startClientY);
      const maxX = Math.max(0, stageRect.width - panelRect.width);
      const maxY = Math.max(0, stageRect.height - panelRect.height);

      setPanelPosition({
        x: Math.min(Math.max(nextX, 0), maxX),
        y: Math.min(Math.max(nextY, 0), maxY),
      });
    }

    function handlePointerUp(event: PointerEvent) {
      if (panelDragRef.current?.pointerId === event.pointerId) {
        panelDragRef.current = null;
      }
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [showDevWallEditor, stageRef]);

  useEffect(() => {
    if (!onPlacementMetricsChange) {
      return;
    }

    if (
      !composition ||
      !placement ||
      !Number.isFinite(frameSize.width) ||
      !Number.isFinite(frameSize.height) ||
      !Number.isFinite(pixelsPerCm) ||
      pixelsPerCm <= 0
    ) {
      onPlacementMetricsChange(null);
      return;
    }

    onPlacementMetricsChange({
      placementZone,
      wallZone,
      placement,
      objectSizePx: frameSize,
      pixelsPerCm,
    });
  }, [
    composition,
    frameSize,
    onPlacementMetricsChange,
    placement,
    placementZone,
    pixelsPerCm,
    wallZone,
  ]);

  useEffect(() => {
    if (!isCustomLayout || !customCanvas || !composition || pixelsPerCm <= 0) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const drag = itemDragRef.current;
      if (!drag) {
        return;
      }

      const nextXcm = clamp(
        drag.originXcm + (event.clientX - drag.startX) / pixelsPerCm,
        0,
        Number.POSITIVE_INFINITY,
      );
      const nextYcm = clamp(
        drag.originYcm + (event.clientY - drag.startY) / pixelsPerCm,
        0,
        Number.POSITIVE_INFINITY,
      );

      let clampedXcm = nextXcm;
      let clampedYcm = nextYcm;

      if (placement) {
        const localMinXcm = Math.max(0, (placementZone.x - placement.x) / pixelsPerCm);
        const localMinYcm = Math.max(0, (placementZone.y - placement.y) / pixelsPerCm);
        const localMaxXcm = Math.max(
          localMinXcm,
          (placementZone.x + placementZone.width - placement.x) / pixelsPerCm - drag.widthCm,
        );
        const localMaxYcm = Math.max(
          localMinYcm,
          (placementZone.y + placementZone.height - placement.y) / pixelsPerCm - drag.heightCm,
        );

        clampedXcm = clamp(nextXcm, localMinXcm, localMaxXcm);
        clampedYcm = clamp(nextYcm, localMinYcm, localMaxYcm);
      }

      if (
        doesGalleryWallItemOverlap(
          items,
          drag.itemId,
          clampedXcm,
          clampedYcm,
          getFrameOuterSizeCm,
        )
      ) {
        return;
      }

      onMoveCustomItem(drag.itemId, clampedXcm, clampedYcm);
    };

    const handlePointerUp = () => {
      itemDragRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [
    composition,
    customCanvas,
    getFrameOuterSizeCm,
    isCustomLayout,
    items,
    onMoveCustomItem,
    placement,
    placementZone,
    pixelsPerCm,
  ]);

  function startCornerDrag(
    event: ReactPointerEvent<SVGCircleElement>,
    kind: DragTarget extends { kind: infer T } ? T : never,
    index: number,
  ) {
    event.preventDefault();
    event.stopPropagation();
    dragTargetRef.current = { kind, index } as DragTarget;
  }

  function handleSaveCalibration() {
    saveRoomCalibration(
      template.id,
      wallQuad,
      resolvedPlacementPolygon,
    );
    setSavedCalibration({
      wallQuad,
      placementPolygon: cloneNormalizedPolygon(resolvedPlacementPolygon),
    });
  }

  function handlePanelDragStart(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    panelDragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: panelPosition.x,
      startY: panelPosition.y,
    };
  }

  function handlePlacementCanvasPointerDown(event: ReactPointerEvent<SVGRectElement>) {
    if (!stageRef.current || !isDrawingPlacementPolygon) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect = stageRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setPlacementPolygon((current) => [...current, normalizePolygonPoint(x, y)]);
  }

  function handleStartPlacementPolygon() {
    setPlacementPolygon([]);
    setIsDrawingPlacementPolygon(true);
  }

  function handleFinishPlacementPolygon() {
    if (placementPolygon.length >= 3) {
      setIsDrawingPlacementPolygon(false);
    }
  }

  function handleClearPlacementPolygon() {
    setPlacementPolygon([]);
    setIsDrawingPlacementPolygon(false);
  }

  function handleUndoPlacementPoint() {
    setPlacementPolygon((current) => current.slice(0, -1));
  }

  function handleClosePlacementPolygon(event: ReactPointerEvent<SVGCircleElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (placementPolygon.length >= 3) {
      setIsDrawingPlacementPolygon(false);
    }
  }

  if (
    !composition ||
    !Number.isFinite(composition.widthCm) ||
    !Number.isFinite(composition.heightCm) ||
    composition.widthCm <= 0 ||
    composition.heightCm <= 0
  ) {
    return (
      <div
        ref={stageRef}
        className="relative z-0 aspect-[3/2] w-full max-w-[1040px] overflow-hidden rounded-[30px] bg-[#d8d3cb] shadow-[0_30px_70px_rgba(15,23,42,0.14),inset_0_0_0_1px_rgba(255,255,255,0.52)]"
      >
        <img
          src={effectiveTemplate.imageSrc}
          alt={effectiveTemplate.title}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: effectiveTemplate.sceneImagePosition,
            transform: `scale(${effectiveTemplate.sceneImageScale})`,
            transformOrigin: 'center center',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(255,255,255,0.28)]">
          <div className="rounded-2xl border border-white/60 bg-white/80 px-5 py-4 text-center text-sm text-gray-700 shadow-sm">
            Gallery layout preview unavailable.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={stageRef}
      className="relative z-0 aspect-[3/2] w-full max-w-[1040px] overflow-hidden rounded-[30px] bg-[#d8d3cb] shadow-[0_30px_70px_rgba(15,23,42,0.14),inset_0_0_0_1px_rgba(255,255,255,0.52)]"
    >
      <img
        src={effectiveTemplate.imageSrc}
        alt={effectiveTemplate.title}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: effectiveTemplate.sceneImagePosition,
          transform: `scale(${effectiveTemplate.sceneImageScale})`,
          transformOrigin: 'center center',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(15,23,42,0.06))]" />

      {showDevWallEditor ? (
        <>
          <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-0 z-[90] h-full w-full"
            preserveAspectRatio="none"
          >
            <polygon
              points={getPolygonPointsAttribute(wallQuad)}
              fill="rgba(34,197,94,0.15)"
              stroke="rgba(34,197,94,0.95)"
              strokeWidth="0.45"
              strokeDasharray="1.5 1"
              pointerEvents="none"
            />
            {placementPolygon.length >= 3 && !isDrawingPlacementPolygon ? (
              <polygon
                points={getPolygonPointsAttribute(placementPolygon)}
                fill="rgba(37,99,235,0.16)"
                stroke="rgba(37,99,235,0.95)"
                strokeWidth="0.45"
                strokeDasharray="1.5 1"
                pointerEvents="none"
              />
            ) : placementPolygon.length >= 2 ? (
              <polyline
                points={getPolygonPointsAttribute(placementPolygon)}
                fill="none"
                stroke="rgba(37,99,235,0.95)"
                strokeWidth="0.45"
                strokeDasharray="1.5 1"
                pointerEvents="none"
              />
            ) : null}

            {wallQuad.map((point, index) => (
              <circle
                key={`wall-${index}`}
                cx={point.x * 100}
                cy={point.y * 100}
                r="1.1"
                fill="rgba(34,197,94,1)"
                stroke="white"
                strokeWidth="0.3"
                className="pointer-events-auto cursor-pointer"
                onPointerDown={(event) => startCornerDrag(event, 'wall', index)}
              />
            ))}

            {!isDrawingPlacementPolygon &&
            placementPolygon.map((point, index) => (
              <circle
                key={`placement-${index}`}
                cx={point.x * 100}
                cy={point.y * 100}
                r="1.05"
                fill="rgba(37,99,235,1)"
                stroke="white"
                strokeWidth="0.3"
                className="pointer-events-auto cursor-pointer"
                onPointerDown={(event) => startCornerDrag(event, 'placement', index)}
              />
            ))}
          </svg>

          {isDrawingPlacementPolygon ? (
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 z-[95] h-full w-full"
              preserveAspectRatio="none"
            >
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="transparent"
                onPointerDown={handlePlacementCanvasPointerDown}
              />
              {placementPolygon.length >= 2 ? (
                <polyline
                  points={getPolygonPointsAttribute(placementPolygon)}
                  fill="none"
                  stroke="rgba(37,99,235,0.95)"
                  strokeWidth="0.45"
                  strokeDasharray="1.5 1"
                />
              ) : null}
              {placementPolygon.map((point, index) => (
                <circle
                  key={`drawing-placement-${index}`}
                  cx={point.x * 100}
                  cy={point.y * 100}
                  r={index === 0 && placementPolygon.length >= 3 ? '1.25' : '1.05'}
                  fill="rgba(37,99,235,1)"
                  stroke="white"
                  strokeWidth="0.3"
                  className="cursor-pointer"
                  onPointerDown={
                    index === 0 && placementPolygon.length >= 3
                      ? handleClosePlacementPolygon
                      : undefined
                  }
                />
              ))}
            </svg>
          ) : null}

          <div
            className="pointer-events-none absolute z-[110] w-[min(360px,calc(100%-1rem))]"
            style={{
              left: `${panelPosition.x}px`,
              top: `${panelPosition.y}px`,
            }}
          >
            <div
              ref={panelRef}
              className="pointer-events-auto rounded-2xl border border-white/70 bg-white/90 p-3 text-[11px] leading-5 text-gray-800 shadow-lg backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="min-w-0 flex-1 cursor-move select-none rounded-xl pr-2 touch-none"
                  onPointerDown={handlePanelDragStart}
                >
                  <div className="font-semibold text-gray-900">Dev wall editor</div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500">
                    Room ID: {template.id}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveCalibration}
                  className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
                    isDirty
                      ? 'border border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[rgba(27,76,143,0.92)]'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Save
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleStartPlacementPolygon}
                  className="rounded-xl border border-blue-600 bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700"
                >
                  Start blue area
                </button>
                <button
                  type="button"
                  onClick={handleFinishPlacementPolygon}
                  disabled={placementPolygon.length < 3}
                  className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Finish
                </button>
                <button
                  type="button"
                  onClick={handleClearPlacementPolygon}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleUndoPlacementPoint}
                  disabled={placementPolygon.length === 0}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Undo
                </button>
              </div>

              <div className="mt-2 text-gray-600">
                Green = full wall surface. Blue = allowed placement polygon. Click to add blue points, click the first blue point again or press Finish to close it.
              </div>
              <div className="mt-2 rounded-xl bg-[#f8f5ef] px-3 py-2 text-[11px] font-medium text-gray-700">
                {isDrawingPlacementPolygon
                  ? 'Blue polygon drawing is active.'
                  : isDirty
                    ? 'Unsaved changes for this room.'
                    : 'Saved for this room.'}
              </div>
              <pre className="mt-3 max-h-48 overflow-auto rounded-xl bg-gray-950/90 p-3 text-[10px] text-green-200">
{`devWallQuad: ${JSON.stringify(wallQuad, null, 2)},
devPlacementPolygon: ${JSON.stringify(resolvedPlacementPolygon, null, 2)},`}
              </pre>
            </div>
          </div>
        </>
      ) : null}

      {isCustomLayout ? (
        <div className="absolute left-4 top-4 z-[66] inline-flex rounded-full border border-gray-200 bg-white/94 p-1 shadow-[0_10px_22px_rgba(15,23,42,0.12)]">
          <button
            type="button"
            onClick={() => setCustomDragMode('item')}
            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
              customDragMode === 'item'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--primary)]'
            }`}
          >
            Frames
          </button>
          <button
            type="button"
            onClick={() => setCustomDragMode('group')}
            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
              customDragMode === 'group'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--primary)]'
            }`}
          >
            Move all
          </button>
        </div>
      ) : null}

      {placement &&
      Number.isFinite(placement.x) &&
      Number.isFinite(placement.y) &&
      Number.isFinite(frameSize.width) &&
      Number.isFinite(frameSize.height) &&
      frameSize.width > 0 &&
      frameSize.height > 0 &&
      Number.isFinite(pixelsPerCm) &&
      pixelsPerCm > 0 ? (
        <div
          className={`absolute z-[65] select-none ${
            isCustomLayout && customDragMode === 'group'
              ? 'cursor-grab active:cursor-grabbing'
              : !isCustomLayout
                ? 'cursor-grab active:cursor-grabbing'
                : ''
          }`}
          style={{
            left: `${placement.x}px`,
            top: `${placement.y}px`,
            width: `${frameSize.width}px`,
            height: `${frameSize.height}px`,
            transform: `translateZ(0) perspective(1200px) rotateX(${effectiveTemplate.placementTuning.frameTiltDeg}deg)`,
            transformOrigin: 'center center',
            touchAction: 'none',
            willChange: 'left, top, transform',
          }}
          onPointerDown={
            isCustomLayout
              ? customDragMode === 'group'
                ? (event) => {
                    event.preventDefault();
                    startDrag(event.pointerId, event.clientX, event.clientY);
                  }
                : undefined
              : (event) => {
                  event.preventDefault();
                  startDrag(event.pointerId, event.clientX, event.clientY);
                }
          }
        >
          {composition.items.map((compositionItem) => {
            const intrinsicSize = getFrameIntrinsicSizePx(compositionItem.item);
            const intrinsicWidth = safeNumber(intrinsicSize.width, 0);
            const intrinsicHeight = safeNumber(intrinsicSize.height, 0);

            if (intrinsicWidth <= 0 || intrinsicHeight <= 0 || pixelsPerCm <= 0) {
              return null;
            }

            const targetWidthPx = compositionItem.widthCm * pixelsPerCm;
            const targetHeightPx = compositionItem.heightCm * pixelsPerCm;

            if (
              !Number.isFinite(targetWidthPx) ||
              !Number.isFinite(targetHeightPx) ||
              targetWidthPx <= 0 ||
              targetHeightPx <= 0
            ) {
              return null;
            }

            const scale = targetWidthPx / intrinsicWidth;

            if (!Number.isFinite(scale) || scale <= 0) {
              return null;
            }

            return (
              <div
                key={compositionItem.slot.id}
                className="absolute"
                style={{
                  left: `${compositionItem.xCm * pixelsPerCm}px`,
                  top: `${compositionItem.yCm * pixelsPerCm}px`,
                  width: `${targetWidthPx}px`,
                  height: `${targetHeightPx}px`,
                }}
              >
                <div
                  className={`absolute inset-0 ${
                    isCustomLayout ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                  onPointerDown={
                    isCustomLayout && customDragMode === 'item'
                      ? (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          const itemSize = getFrameOuterSizeCm(compositionItem.item);
                          itemDragRef.current = {
                            itemId: compositionItem.item.id,
                            startX: event.clientX,
                            startY: event.clientY,
                            originXcm: safeNumber(compositionItem.item.customLayoutXcm, 0),
                            originYcm: safeNumber(compositionItem.item.customLayoutYcm, 0),
                            widthCm: safeNumber(itemSize.widthCm, 0),
                            heightCm: safeNumber(itemSize.heightCm, 0),
                          };
                        }
                      : undefined
                  }
                >
                  <div
                    className="pointer-events-none absolute inset-0 origin-top-left"
                    style={{
                      width: `${intrinsicWidth}px`,
                      height: `${intrinsicHeight}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    {renderFrameContent(compositionItem.item)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
