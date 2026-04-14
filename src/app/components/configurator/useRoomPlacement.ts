import { useEffect, useMemo, useRef, useState } from 'react';
import {
  clampRoomPlacement,
  getDefaultRoomPlacement,
  getPlacementZoneRectPx,
  getPixelsPerCm,
  getRenderedImageHeightPx,
  getRoomFrameSizePx,
  getWallZoneRectPx,
  type RoomPlacementPx,
} from './roomMath';
import {
  isRectAllowedInCalibration,
} from './roomCalibrationGeometry';
import type { RoomTemplate } from './roomTemplates';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function safePositiveNumber(value: unknown, fallback: number) {
  return isFiniteNumber(value) && value > 0 ? value : fallback;
}

function getPlacementBounds(
  placementZone: { x: number; y: number; width: number; height: number },
  frameSize: { width: number; height: number },
  template: RoomTemplate,
) {
  const minX = placementZone.x + template.placementTuning.horizontalPaddingPx;
  const maxX = Math.max(
    minX,
    placementZone.x +
      placementZone.width -
      frameSize.width -
      template.placementTuning.horizontalPaddingPx,
  );
  const minY = placementZone.y + template.placementTuning.topPaddingPx;
  const maxY = Math.max(
    minY,
    placementZone.y +
      placementZone.height -
      frameSize.height -
      template.placementTuning.bottomPaddingPx,
  );

  return {
    minX,
    maxX,
    minY,
    maxY,
  };
}

export function useRoomPlacement(
  template: RoomTemplate,
  frameOuterWidthCm: number,
  frameOuterHeightCm: number,
) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const previousTemplateIdRef = useRef(template.id);
  const [stageWidth, setStageWidth] = useState(980);
  const [placement, setPlacement] = useState<RoomPlacementPx | null>(null);

  const safeStageWidth = useMemo(
    () => safePositiveNumber(stageWidth, 980),
    [stageWidth],
  );

  const renderedImageHeightPx = useMemo(() => {
    const value = getRenderedImageHeightPx(safeStageWidth, template);
    return safePositiveNumber(value, 600);
  }, [safeStageWidth, template]);

  const wallZone = useMemo(
    () => getWallZoneRectPx(safeStageWidth, renderedImageHeightPx, template),
    [renderedImageHeightPx, safeStageWidth, template],
  );

  const basePlacementZone = useMemo(
    () => getPlacementZoneRectPx(safeStageWidth, renderedImageHeightPx, template),
    [renderedImageHeightPx, safeStageWidth, template],
  );

  const wallPolygon = useMemo(
    () => (template.devWallQuad ? template.devWallQuad.map((point) => ({ ...point })) : []),
    [template.devWallQuad],
  );

  const placementPolygon = useMemo(
    () => template.devPlacementPolygon ?? [],
    [template.devPlacementPolygon],
  );
  const placementZone = basePlacementZone;

  const pixelsPerCm = useMemo(() => {
    const value = getPixelsPerCm(wallZone.height, template.wallHeightCm);
    return safePositiveNumber(value, 1);
  }, [template.wallHeightCm, wallZone.height]);

  const frameSize = useMemo(() => {
    const rawSize = getRoomFrameSizePx(
      safePositiveNumber(frameOuterWidthCm, 1),
      safePositiveNumber(frameOuterHeightCm, 1),
      pixelsPerCm,
    );

    return {
      width: safePositiveNumber(rawSize.width, 1),
      height: safePositiveNumber(rawSize.height, 1),
    };
  }, [frameOuterHeightCm, frameOuterWidthCm, pixelsPerCm]);

  const isPlacementAllowed = useMemo(() => {
    return (candidate: RoomPlacementPx) => {
      if (
        !safeStageWidth ||
        !renderedImageHeightPx ||
        frameSize.width <= 0 ||
        frameSize.height <= 0
      ) {
        return false;
      }

      return isRectAllowedInCalibration(
        {
          x: candidate.x / safeStageWidth,
          y: candidate.y / renderedImageHeightPx,
          width: frameSize.width / safeStageWidth,
          height: frameSize.height / renderedImageHeightPx,
        },
        wallPolygon,
        placementPolygon.length >= 3 ? placementPolygon : undefined,
      );
    };
  }, [
    frameSize.height,
    frameSize.width,
    placementPolygon,
    renderedImageHeightPx,
    safeStageWidth,
    wallPolygon,
  ]);

  const findNearestAllowedPlacement = useMemo(() => {
    return (preferred: RoomPlacementPx) => {
      const clampedPreferred = clampRoomPlacement(preferred, placementZone, frameSize, template);

      if (isPlacementAllowed(clampedPreferred)) {
        return clampedPreferred;
      }

      const bounds = getPlacementBounds(placementZone, frameSize, template);
      const xPositions = new Set<number>([clampedPreferred.x, bounds.minX, bounds.maxX]);
      const yPositions = new Set<number>([clampedPreferred.y, bounds.minY, bounds.maxY]);
      const step = 12;

      for (let x = bounds.minX; x <= bounds.maxX; x += step) {
        xPositions.add(x);
      }

      for (let y = bounds.minY; y <= bounds.maxY; y += step) {
        yPositions.add(y);
      }

      let bestCandidate: RoomPlacementPx | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const x of xPositions) {
        for (const y of yPositions) {
          const candidate = clampRoomPlacement({ x, y }, placementZone, frameSize, template);

          if (!isPlacementAllowed(candidate)) {
            continue;
          }

          const distance =
            (candidate.x - clampedPreferred.x) ** 2 +
            (candidate.y - clampedPreferred.y) ** 2;

          if (distance < bestDistance) {
            bestDistance = distance;
            bestCandidate = candidate;
          }
        }
      }

      return bestCandidate ?? clampedPreferred;
    };
  }, [
    frameSize,
    isPlacementAllowed,
    placementZone,
    template,
  ]);

  useEffect(() => {
    if (!stageRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width;
      if (isFiniteNumber(nextWidth) && nextWidth > 0) {
        setStageWidth(nextWidth);
      }
    });

    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setPlacement((currentPlacement) => {
      const templateChanged = previousTemplateIdRef.current !== template.id;
      previousTemplateIdRef.current = template.id;

      if (!isFiniteNumber(frameSize.width) || !isFiniteNumber(frameSize.height)) {
        return null;
      }

      if (!currentPlacement || templateChanged) {
        const base = getDefaultRoomPlacement(placementZone, frameSize, template);
        return findNearestAllowedPlacement(base);
      }

      const clamped = clampRoomPlacement(currentPlacement, placementZone, frameSize, template);

      return isPlacementAllowed(clamped)
        ? clamped
        : findNearestAllowedPlacement(clamped);
    });
  }, [
    findNearestAllowedPlacement,
    frameSize,
    isPlacementAllowed,
    placementZone,
    template,
  ]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }

      const nextX = drag.originX + (event.clientX - drag.startX);
      const nextY = drag.originY + (event.clientY - drag.startY);

      setPlacement((currentPlacement) => {
        const candidate = clampRoomPlacement(
          { x: nextX, y: nextY },
          placementZone,
          frameSize,
          template,
        );

        return isPlacementAllowed(candidate)
          ? candidate
          : currentPlacement;
      });
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (dragRef.current?.pointerId === event.pointerId) {
        dragRef.current = null;
      }
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
    frameSize,
    isPlacementAllowed,
    placementZone,
    template,
  ]);

  function startDrag(pointerId: number, clientX: number, clientY: number) {
    if (!placement) {
      return;
    }

    dragRef.current = {
      pointerId,
      startX: clientX,
      startY: clientY,
      originX: placement.x,
      originY: placement.y,
    };
  }

  function adjustPlacementByDelta(deltaX: number, deltaY: number) {
    setPlacement((currentPlacement) => {
      if (!currentPlacement) {
        return currentPlacement;
      }

      const candidate = clampRoomPlacement(
        {
          x: currentPlacement.x + deltaX,
          y: currentPlacement.y + deltaY,
        },
        placementZone,
        frameSize,
        template,
      );

      return isPlacementAllowed(candidate)
        ? candidate
        : currentPlacement;
    });
  }

  return {
    stageRef,
    wallZone,
    placementZone,
    frameSize,
    placement,
    startDrag,
    adjustPlacementByDelta,
    renderedImageHeightPx,
    pixelsPerCm,
  };
}
