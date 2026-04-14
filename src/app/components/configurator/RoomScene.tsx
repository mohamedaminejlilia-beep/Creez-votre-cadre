import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

interface RoomSceneProps {
  template: RoomTemplate;
  frameOuterWidthCm: number;
  frameOuterHeightCm: number;
  frameIntrinsicWidthPx: number;
  frameIntrinsicHeightPx: number;
  frameContent: ReactNode;
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

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
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

export function RoomScene({
  template,
  frameOuterWidthCm,
  frameOuterHeightCm,
  frameIntrinsicWidthPx,
  frameIntrinsicHeightPx,
  frameContent,
  showDevWallEditor = false,
}: RoomSceneProps) {
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

  const { stageRef, frameSize, placement, startDrag } = useRoomPlacement(
    effectiveTemplate,
    frameOuterWidthCm,
    frameOuterHeightCm,
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

  if (frameIntrinsicWidthPx <= 0 || frameIntrinsicHeightPx <= 0) {
    return null;
  }

  const scale = frameSize.width / frameIntrinsicWidthPx;

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

      {placement ? (
        <div
          className="absolute z-[65] select-none cursor-grab active:cursor-grabbing"
          style={{
            left: `${placement.x}px`,
            top: `${placement.y}px`,
            width: `${frameSize.width}px`,
            height: `${frameSize.height}px`,
            boxShadow:
              '0 24px 46px rgba(0,0,0,0.22), 0 10px 20px rgba(0,0,0,0.13), 0 2px 8px rgba(15,23,42,0.10)',
            filter: 'drop-shadow(0 10px 20px rgba(15,23,42,0.12))',
            transform: `translateZ(0) perspective(1200px) rotateX(${effectiveTemplate.placementTuning.frameTiltDeg}deg)`,
            transformOrigin: 'center center',
            touchAction: 'none',
            willChange: 'left, top, transform',
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            startDrag(event.pointerId, event.clientX, event.clientY);
          }}
        >
          <div className="pointer-events-none absolute inset-[2%] translate-y-[5%] rounded-[18px] bg-[rgba(0,0,0,0.10)] blur-[18px]" />
          <div
            className="pointer-events-none absolute inset-0 origin-top-left"
            style={{
              width: `${frameIntrinsicWidthPx}px`,
              height: `${frameIntrinsicHeightPx}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <div className="pointer-events-none absolute inset-[3%] rounded-[14px] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.12),rgba(0,0,0,0)_70%)] opacity-60 blur-[10px]" />
            <div className="pointer-events-none absolute inset-x-[7%] bottom-[-3%] h-[12%] rounded-full bg-[rgba(0,0,0,0.10)] blur-[16px]" />
            {frameContent}
          </div>
        </div>
      ) : null}
    </div>
  );
}
