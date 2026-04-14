import type { FrameConfig } from '../../App';
import type { ConfiguratorTranslations } from './configurator-translations';
import { FRAME_STYLES, MAT_COLORS, type FrameDefinition, type Unit } from './configurator-data';
import { isRectAllowedInCalibration, quadToPolygon } from './roomCalibrationGeometry';
import type { RoomTemplate } from './roomTemplates';
import { calculateWorkbookPricing } from './workbook-pricing';

const CM_PER_INCH = 2.54;
const MM_PER_CM = 10;
const MAX_PREVIEW_WIDTH = 400;
const MAX_PREVIEW_HEIGHT = 400;
const MIN_MAT_LAYER_CM = 2;
const MAX_MAT_LAYER_CM = 10;
const BOX_MAT_SUPPORTED_FRAME_IDS = new Set(['L1408', 'L1926']);
const BOX_ONLY_FRAME_IDS = new Set(['L1408', 'L1926']);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampMatLayer(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_MAT_LAYER_CM;
  }

  return Math.min(MAX_MAT_LAYER_CM, Math.max(MIN_MAT_LAYER_CM, value));
}

export function roundToInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value));
}

export function convertFromCm(cmValue: number, unit: Unit): number {
  switch (unit) {
    case 'mm':
      return cmValue * MM_PER_CM;
    case 'inch':
      return cmValue / CM_PER_INCH;
    case 'cm':
    default:
      return cmValue;
  }
}

export function convertToCm(value: number, unit: Unit): number {
  switch (unit) {
    case 'mm':
      return value / MM_PER_CM;
    case 'inch':
      return value * CM_PER_INCH;
    case 'cm':
    default:
      return value;
  }
}

export function getDisplaySize(cmValue: number, unit: Unit): number {
  return roundToInteger(convertFromCm(cmValue, unit));
}

export function formatSizePair(widthCm: number, heightCm: number, unit: Unit): string {
  return `${getDisplaySize(widthCm, unit)} x ${getDisplaySize(heightCm, unit)} ${unit}`;
}

export function getFrameById(frameId: string): FrameDefinition {
  return FRAME_STYLES.find((frame) => frame.id === frameId) ?? FRAME_STYLES[0];
}

/**
 * Returns the list of frame definitions that can fit inside a wall of the given dimensions.
 * A frame fits if its minimum artwork size is less than or equal to the wall dimensions
 * and its maximum artwork size is greater than or equal to the wall dimensions.
 */
export function getFramesThatFitWall(wallWidthCm: number, wallHeightCm: number): FrameDefinition[] {
  return FRAME_STYLES.filter((frame) =>
    frame.minWidthCm <= wallWidthCm &&
    frame.minHeightCm <= wallHeightCm,
  );
}

function getNormalizedQuadBounds(
  quad: RoomTemplate['devWallQuad'] | RoomTemplate['devFurnitureBlockerQuad'],
) {
  if (!quad || quad.length !== 4) {
    return null;
  }

  const xs = quad.map((point) => point.x);
  const ys = quad.map((point) => point.y);

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

export function getAllowedZoneCmForWallSurface(
  template: RoomTemplate,
  wallWidthCm: number,
  wallHeightCm: number,
) {
  const wallBounds = getNormalizedQuadBounds(template.devWallQuad);
  const allowedPolygon = template.devPlacementPolygon;

  if (
    !wallBounds ||
    wallBounds.width <= 0 ||
    wallBounds.height <= 0 ||
    !allowedPolygon ||
    allowedPolygon.length < 3
  ) {
    return null;
  }

  const wallPolygon = quadToPolygon(template.devWallQuad);
  const relativeXValues = new Set<number>([0, 1]);
  const relativeYValues = new Set<number>([0, 1]);
  const sampleSteps = 24;

  for (let step = 0; step <= sampleSteps; step += 1) {
    const ratio = step / sampleSteps;
    relativeXValues.add(ratio);
    relativeYValues.add(ratio);
  }

  allowedPolygon.forEach((point) => {
    const relativeX = (point.x - wallBounds.x) / wallBounds.width;
    const relativeY = (point.y - wallBounds.y) / wallBounds.height;

    if (Number.isFinite(relativeX)) {
      relativeXValues.add(clamp(relativeX, 0, 1));
    }

    if (Number.isFinite(relativeY)) {
      relativeYValues.add(clamp(relativeY, 0, 1));
    }
  });

  const xValues = [...relativeXValues].sort((a, b) => a - b);
  const yValues = [...relativeYValues].sort((a, b) => a - b);

  let bestRect:
    | {
        xCm: number;
        yCm: number;
        widthCm: number;
        heightCm: number;
        area: number;
      }
    | null = null;

  for (let leftIndex = 0; leftIndex < xValues.length - 1; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < xValues.length; rightIndex += 1) {
      const left = xValues[leftIndex];
      const right = xValues[rightIndex];
      const widthRatio = right - left;

      if (widthRatio <= 0) {
        continue;
      }

      for (let topIndex = 0; topIndex < yValues.length - 1; topIndex += 1) {
        for (let bottomIndex = topIndex + 1; bottomIndex < yValues.length; bottomIndex += 1) {
          const top = yValues[topIndex];
          const bottom = yValues[bottomIndex];
          const heightRatio = bottom - top;

          if (heightRatio <= 0) {
            continue;
          }

          const candidateRect = {
            x: wallBounds.x + left * wallBounds.width,
            y: wallBounds.y + top * wallBounds.height,
            width: widthRatio * wallBounds.width,
            height: heightRatio * wallBounds.height,
          };

          if (
            !isRectAllowedInCalibration(
              candidateRect,
              wallPolygon,
              allowedPolygon,
            )
          ) {
            continue;
          }

          const xCm = clamp(left * wallWidthCm, 0, wallWidthCm);
          const yCm = clamp(top * wallHeightCm, 0, wallHeightCm);
          const widthCm = clamp(widthRatio * wallWidthCm, 0, wallWidthCm - xCm);
          const heightCm = clamp(heightRatio * wallHeightCm, 0, wallHeightCm - yCm);
          const area = widthCm * heightCm;

          if (widthCm <= 0 || heightCm <= 0) {
            continue;
          }

          if (!bestRect || area > bestRect.area) {
            bestRect = {
              xCm,
              yCm,
              widthCm,
              heightCm,
              area,
            };
          }
        }
      }
    }
  }

  if (!bestRect) {
    return null;
  }

  return {
    xCm: bestRect.xCm,
    yCm: bestRect.yCm,
    widthCm: bestRect.widthCm,
    heightCm: bestRect.heightCm,
  };
}

export function getWallSurfaceCmForTemplate(
  template: RoomTemplate,
  wallWidthCm: number,
  wallHeightCm: number,
) {
  const wallBounds = getNormalizedQuadBounds(template.devWallQuad);

  if (!wallBounds || wallBounds.width <= 0 || wallBounds.height <= 0) {
    return {
      widthCm: wallWidthCm,
      heightCm: wallHeightCm,
    };
  }

  return {
    widthCm: wallWidthCm,
    heightCm: wallHeightCm,
  };
}

export function getEffectiveMatEnabled(config: FrameConfig): boolean {
  const frame = getFrameById(config.frameStyle);
  return frame.supportsMat && config.matEnabled;
}

export function getEffectiveGlazing(config: FrameConfig): FrameConfig['glazing'] {
  const frame = getFrameById(config.frameStyle);
  return frame.supportsGlass ? config.glazing : 'none';
}

export function getEffectiveMatType(config: FrameConfig): FrameConfig['matType'] {
  const frame = getFrameById(config.frameStyle);
  return frame.supportsMat && config.matEnabled ? config.matType : 'single';
}

export function supportsBoxMat(frame: FrameDefinition): boolean {
  return BOX_MAT_SUPPORTED_FRAME_IDS.has(frame.id);
}

export function getAvailableMatTypes(frame: FrameDefinition): FrameConfig['matType'][] {
  if (!frame.supportsMat) {
    return ['single'];
  }

  if (BOX_ONLY_FRAME_IDS.has(frame.id)) {
    return ['box'];
  }

  const matTypes: FrameConfig['matType'][] = ['single', 'double', 'v_groove', 'triple', 'multiple'];

  if (supportsBoxMat(frame)) {
    matTypes.push('box');
  }

  return matTypes;
}

export function getEffectiveMatThicknesses(config: FrameConfig) {
  if (!getEffectiveMatEnabled(config)) {
    return { top: 0, middle: 0, bottom: 0, topBand: 0, middleBand: 0, bottomBand: 0, total: 0 };
  }

  const matType = getEffectiveMatType(config);
  const top = clampMatLayer(config.matTopThicknessCm ?? config.matThicknessCm);
  const middle = clampMatLayer(config.matMiddleThicknessCm ?? config.matThicknessCm);
  const bottom = clampMatLayer(config.matBottomThicknessCm ?? config.matThicknessCm);

  switch (matType) {
    case 'double':
      return {
        top,
        middle: 0,
        bottom,
        topBand: top,
        middleBand: 0,
        bottomBand: Math.max(bottom - top, 0),
        total: Math.max(top, bottom),
      };
    case 'triple':
      return {
        top,
        middle,
        bottom,
        topBand: top,
        middleBand: Math.max(middle - top, 0),
        bottomBand: Math.max(bottom - Math.max(top, middle), 0),
        total: Math.max(top, middle, bottom),
      };
    case 'single':
    case 'multiple':
    case 'v_groove':
    case 'box':
    default:
      return { top, middle: 0, bottom: 0, topBand: top, middleBand: 0, bottomBand: 0, total: top };
  }
}

export function normalizeFrameConfig(config: FrameConfig): FrameConfig {
  const frame = getFrameById(config.frameStyle);
  const matEnabled = frame.supportsMat ? config.matEnabled : false;
  const allowedMatTypes = getAvailableMatTypes(frame);
  const matType = !frame.supportsMat
    ? 'single'
    : allowedMatTypes.includes(config.matType)
      ? config.matType
      : allowedMatTypes[0];
  const matTopThicknessCm = clampMatLayer(config.matTopThicknessCm ?? config.matThicknessCm);
  const matMiddleThicknessCm = clampMatLayer(config.matMiddleThicknessCm ?? config.matThicknessCm);
  const matBottomThicknessCm = clampMatLayer(config.matBottomThicknessCm ?? config.matThicknessCm);

  return {
    ...config,
    matEnabled,
    matType,
    matThicknessCm: matTopThicknessCm,
    matTopThicknessCm,
    matMiddleThicknessCm,
    matBottomThicknessCm,
    glazing: frame.supportsGlass ? config.glazing : 'none',
  };
}

export function getMatColorHex(matColor: string): string {
  return MAT_COLORS.find((option) => option.id === matColor)?.hex ?? MAT_COLORS[2].hex;
}

export function getFrameValidationMessage(config: FrameConfig, t?: ConfiguratorTranslations): string | null {
  const frame = getFrameById(config.frameStyle);
  const widthTooSmall = config.artworkWidthCm < frame.minWidthCm;
  const heightTooSmall = config.artworkHeightCm < frame.minHeightCm;
  const widthTooLarge = config.artworkWidthCm > frame.maxWidthCm;
  const heightTooLarge = config.artworkHeightCm > frame.maxHeightCm;

  if (!widthTooSmall && !heightTooSmall && !widthTooLarge && !heightTooLarge) {
    return null;
  }

  if (widthTooSmall || heightTooSmall) {
    const label = t?.validation.minimumSizeFor ?? 'Minimum size for';
    return `${label} ${frame.id}: ${formatSizePair(frame.minWidthCm, frame.minHeightCm, config.unit)}`;
  }

  const label = t?.validation.maximumSizeFor ?? 'Maximum size for';
  return `${label} ${frame.id}: ${formatSizePair(frame.maxWidthCm, frame.maxHeightCm, config.unit)}`;
}

export function getArtworkAreaCm(config: FrameConfig): number {
  return config.artworkWidthCm * config.artworkHeightCm;
}

export function calculatePrice(config: FrameConfig): number {
  return calculateWorkbookPricing(config).selectedTotal;
}

export function getFrameGeometry(config: FrameConfig) {
  const frame = getFrameById(config.frameStyle);
  const artworkWidthCm = config.artworkWidthCm;
  const artworkHeightCm = config.artworkHeightCm;
  const matCm = getEffectiveMatEnabled(config) ? getEffectiveMatThicknesses(config).total : 0;
  const frameWidthCm = frame.profileWidthMm / MM_PER_CM;
  const matOuterWidthCm = artworkWidthCm + matCm * 2;
  const matOuterHeightCm = artworkHeightCm + matCm * 2;
  const frameOuterWidthCm = matOuterWidthCm + frameWidthCm * 2;
  const frameOuterHeightCm = matOuterHeightCm + frameWidthCm * 2;

  return {
    artworkWidthCm,
    artworkHeightCm,
    matCm,
    matOuterWidthCm,
    matOuterHeightCm,
    frameWidthCm,
    frameOuterWidthCm,
    frameOuterHeightCm,
    previewDepth: frame.previewDepth,
  };
}

export function getPreviewScale(frameOuterWidthCm: number, frameOuterHeightCm: number) {
  return Math.min(
    MAX_PREVIEW_WIDTH / frameOuterWidthCm,
    MAX_PREVIEW_HEIGHT / frameOuterHeightCm,
  );
}

export function cmToPx(cmValue: number, scale: number) {
  return cmValue * scale;
}

export function getPreviewMetrics(config: FrameConfig) {
  const geometry = getFrameGeometry(config);
  const scale = getPreviewScale(geometry.frameOuterWidthCm, geometry.frameOuterHeightCm);
  const artworkWidthPx = cmToPx(geometry.artworkWidthCm, scale);
  const artworkHeightPx = cmToPx(geometry.artworkHeightCm, scale);
  const matThicknessPx = cmToPx(geometry.matCm, scale);
  const frameThicknessPx = cmToPx(geometry.frameWidthCm, scale);
  const matOuterWidthPx = cmToPx(geometry.matOuterWidthCm, scale);
  const matOuterHeightPx = cmToPx(geometry.matOuterHeightCm, scale);
  const frameOuterWidthPx = cmToPx(geometry.frameOuterWidthCm, scale);
  const frameOuterHeightPx = cmToPx(geometry.frameOuterHeightCm, scale);

  return {
    artworkWidthPx,
    artworkHeightPx,
    matThicknessPx,
    frameThicknessPx,
    matOuterWidthPx,
    matOuterHeightPx,
    totalWidthPx: frameOuterWidthPx,
    totalHeightPx: frameOuterHeightPx,
    frameOuterWidthPx,
    frameOuterHeightPx,
    scale,
    previewDepth: geometry.previewDepth,
  };
}
