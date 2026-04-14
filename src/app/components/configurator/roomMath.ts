import { getNormalizedPolygonBounds } from './roomCalibrationGeometry';
import type { RoomTemplate } from './roomTemplates';

export interface RoomStageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoomFrameSizePx {
  width: number;
  height: number;
}

export interface RoomPlacementPx {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPlacementInsets(template: RoomTemplate) {
  return {
    left: template.placementTuning.horizontalPaddingPx,
    right: template.placementTuning.horizontalPaddingPx,
    top: template.placementTuning.topPaddingPx,
    bottom: template.placementTuning.bottomPaddingPx,
    offset: template.placementTuning.defaultBottomOffsetPx,
  };
}

function getQuadBoundsPx(
  quad: { x: number; y: number }[],
  widthPx: number,
  heightPx: number,
): RoomStageRect {
  const xs = quad.map((point) => point.x * widthPx);
  const ys = quad.map((point) => point.y * heightPx);

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(1, Math.max(...xs) - Math.min(...xs)),
    height: Math.max(1, Math.max(...ys) - Math.min(...ys)),
  };
}

export function getRenderedImageHeightPx(stageWidth: number, template: RoomTemplate) {
  return stageWidth * (template.imageHeightPx / template.imageWidthPx);
}

export function getWallZoneRectPx(
  renderedImageWidthPx: number,
  renderedImageHeightPx: number,
  template: RoomTemplate,
): RoomStageRect {
  if (template.devWallQuad) {
    return getQuadBoundsPx(
      template.devWallQuad,
      renderedImageWidthPx,
      renderedImageHeightPx,
    );
  }

  return {
    x: renderedImageWidthPx * template.wallSurfacePercent.x,
    y: renderedImageHeightPx * template.wallSurfacePercent.y,
    width: renderedImageWidthPx * template.wallSurfacePercent.width,
    height: renderedImageHeightPx * template.wallSurfacePercent.height,
  };
}

export function getPlacementZoneRectPx(
  renderedImageWidthPx: number,
  renderedImageHeightPx: number,
  template: RoomTemplate,
): RoomStageRect {
  const wall = getWallZoneRectPx(
    renderedImageWidthPx,
    renderedImageHeightPx,
    template,
  );
  const allowedBounds = getNormalizedPolygonBounds(template.devPlacementPolygon);

  if (allowedBounds && allowedBounds.width > 0 && allowedBounds.height > 0) {
    return {
      x: allowedBounds.x * renderedImageWidthPx,
      y: allowedBounds.y * renderedImageHeightPx,
      width: allowedBounds.width * renderedImageWidthPx,
      height: allowedBounds.height * renderedImageHeightPx,
    };
  }

  return wall;
}

export function getPixelsPerCm(wallZoneHeightPx: number, wallHeightCm: number) {
  return wallZoneHeightPx / Math.max(wallHeightCm, 1);
}

export function getRoomFrameSizePx(
  frameOuterWidthCm: number,
  frameOuterHeightCm: number,
  pixelsPerCm: number,
): RoomFrameSizePx {
  return {
    width: frameOuterWidthCm * pixelsPerCm,
    height: frameOuterHeightCm * pixelsPerCm,
  };
}

export function clampRoomPlacement(
  placement: RoomPlacementPx,
  placementZone: RoomStageRect,
  frameSize: RoomFrameSizePx,
  template: RoomTemplate,
): RoomPlacementPx {
  const insets = getPlacementInsets(template);

  const minX = placementZone.x + insets.left;
  const maxX = Math.max(
    placementZone.x + placementZone.width - frameSize.width - insets.right,
    minX,
  );
  const minY = placementZone.y + insets.top;
  const maxY = Math.max(
    placementZone.y + placementZone.height - frameSize.height - insets.bottom,
    minY,
  );

  return {
    x: clamp(placement.x, minX, maxX),
    y: clamp(placement.y, minY, maxY),
  };
}

export function getDefaultRoomPlacement(
  placementZone: RoomStageRect,
  frameSize: RoomFrameSizePx,
  template: RoomTemplate,
): RoomPlacementPx {
  const insets = getPlacementInsets(template);
  const placementBottom = placementZone.y + placementZone.height;
  const frameX =
    placementZone.x +
    placementZone.width * template.defaultPlacementPercent.x -
    frameSize.width / 2;
  const frameY =
    template.placementStyle === 'above-sofa-centered'
      ? placementBottom - frameSize.height - insets.offset
      : placementZone.y +
        placementZone.height * template.defaultPlacementPercent.y -
        frameSize.height -
        insets.offset;

  return clampRoomPlacement(
    {
      x: frameX,
      y: Math.min(frameY, placementBottom - frameSize.height - insets.offset),
    },
    placementZone,
    frameSize,
    template,
  );
}
