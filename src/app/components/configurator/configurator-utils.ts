import type { FrameConfig } from '../../App';
import type { ConfiguratorTranslations } from './configurator-translations';
import { FRAME_STYLES, MAT_COLORS, type FrameDefinition, type Unit } from './configurator-data';
import { calculateWorkbookPricing } from './workbook-pricing';

const CM_PER_INCH = 2.54;
const MM_PER_CM = 10;
const MAX_PREVIEW_WIDTH = 400;
const MAX_PREVIEW_HEIGHT = 400;

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
  return frame.profileWidthMm >= 20;
}

export function normalizeFrameConfig(config: FrameConfig): FrameConfig {
  const frame = getFrameById(config.frameStyle);
  const matEnabled = frame.supportsMat ? config.matEnabled : false;
  const matType = !frame.supportsMat
    ? 'single'
    : config.matType === 'multiple'
      ? 'single'
      : config.matType === 'box' && !supportsBoxMat(frame)
        ? 'single'
        : config.matType;
  const internalPricing = {
    papierPlumeEnabled: config.internalPricing?.papierPlumeEnabled ?? false,
    photoMultiplier: config.internalPricing?.photoMultiplier ?? 1,
  } as const;

  return {
    ...config,
    matEnabled,
    matType,
    glazing: frame.supportsGlass ? config.glazing : 'none',
    internalPricing,
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

export function getPreviewMetrics(config: FrameConfig) {
  const frame = getFrameById(config.frameStyle);
  const matEnabled = getEffectiveMatEnabled(config);
  const widthCm = config.artworkWidthCm;
  const heightCm = config.artworkHeightCm;
  const moldingWidthCm = frame.profileWidthMm / MM_PER_CM;
  const matThicknessCm = matEnabled ? config.matThicknessCm : 0;
  const totalWidthCm = widthCm + (moldingWidthCm + matThicknessCm) * 2;
  const totalHeightCm = heightCm + (moldingWidthCm + matThicknessCm) * 2;
  const scale = Math.min(
    MAX_PREVIEW_WIDTH / totalWidthCm,
    MAX_PREVIEW_HEIGHT / totalHeightCm,
  );
  const artworkWidthPx = widthCm * scale;
  const artworkHeightPx = heightCm * scale;
  const matThicknessPx = matThicknessCm * scale;
  const frameThicknessPx = moldingWidthCm * scale;
  const totalWidthPx = totalWidthCm * scale;
  const totalHeightPx = totalHeightCm * scale;

  return {
    artworkWidthPx,
    artworkHeightPx,
    matThicknessPx,
    frameThicknessPx,
    totalWidthPx,
    totalHeightPx,
    scale,
    previewDepth: frame.previewDepth,
  };
}
