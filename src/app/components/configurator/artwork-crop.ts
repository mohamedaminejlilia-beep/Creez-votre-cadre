import { getClosestStandardArtworkRatio } from './artwork-ratios';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export interface ArtworkCropPreset {
  x: number;
  y: number;
  scale: number;
}

export type ArtworkCropPresetMap = Record<string, ArtworkCropPreset>;

export interface ArtworkCropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ArtworkCropMemoryConfig {
  artworkWidthCm: number;
  artworkHeightCm: number;
  uploadedArtworkCropX: number;
  uploadedArtworkCropY: number;
  uploadedArtworkCropScale: number;
  uploadedArtworkCropPresets: ArtworkCropPresetMap;
}

export function getCropRectForRatio(
  imageWidth: number,
  imageHeight: number,
  ratioWidth: number,
  ratioHeight: number,
  cropCenterX: number,
  cropCenterY: number,
  cropScale = 1,
): ArtworkCropRect {
  const safeImageWidth = Math.max(imageWidth, 1);
  const safeImageHeight = Math.max(imageHeight, 1);
  const safeRatioWidth = Math.max(ratioWidth, 1);
  const safeRatioHeight = Math.max(ratioHeight, 1);
  const imageRatio = safeImageWidth / safeImageHeight;
  const targetRatio = safeRatioWidth / safeRatioHeight;

  let cropWidth = safeImageWidth;
  let cropHeight = safeImageHeight;

  if (imageRatio > targetRatio) {
    cropWidth = safeImageHeight * targetRatio;
    cropHeight = safeImageHeight;
  } else if (imageRatio < targetRatio) {
    cropWidth = safeImageWidth;
    cropHeight = safeImageWidth / targetRatio;
  }

  const safeCropScale = clamp(cropScale, 1, 4);
  cropWidth = cropWidth / safeCropScale;
  cropHeight = cropHeight / safeCropScale;

  const halfCropWidth = cropWidth / 2;
  const halfCropHeight = cropHeight / 2;
  const centerX = clamp(cropCenterX, halfCropWidth / safeImageWidth, 1 - halfCropWidth / safeImageWidth);
  const centerY = clamp(cropCenterY, halfCropHeight / safeImageHeight, 1 - halfCropHeight / safeImageHeight);
  const x = clamp(centerX * safeImageWidth - halfCropWidth, 0, safeImageWidth - cropWidth);
  const y = clamp(centerY * safeImageHeight - halfCropHeight, 0, safeImageHeight - cropHeight);

  return {
    x,
    y,
    width: cropWidth,
    height: cropHeight,
  };
}

export function getArtworkCropPresetKey(width: number, height: number) {
  const safeWidth = Math.max(width, 0.1);
  const safeHeight = Math.max(height, 0.1);
  const ratio = safeWidth / safeHeight;
  const closestStandardRatio = getClosestStandardArtworkRatio(
    safeWidth,
    safeHeight,
  );
  const closestStandardRatioValue =
    closestStandardRatio.width / closestStandardRatio.height;

  if (Math.abs(closestStandardRatioValue - ratio) <= 0.01) {
    return closestStandardRatio.id;
  }

  if (Math.abs(ratio - 1) <= 0.01) {
    return '1:1';
  }

  if (safeWidth >= safeHeight) {
    return `${(Math.round(ratio * 100) / 100).toFixed(2)}:1`;
  }

  return `1:${(Math.round((safeHeight / safeWidth) * 100) / 100).toFixed(2)}`;
}

export function getDefaultArtworkCropPreset(): ArtworkCropPreset {
  return {
    x: 0.5,
    y: 0.5,
    scale: 1,
  };
}

export function getCropPresetForRatio(
  presets: ArtworkCropPresetMap,
  artworkWidthCm: number,
  artworkHeightCm: number,
) {
  return (
    presets[getArtworkCropPresetKey(artworkWidthCm, artworkHeightCm)] ??
    getDefaultArtworkCropPreset()
  );
}

export function getCropMemoryTransitionUpdate(
  config: ArtworkCropMemoryConfig,
  nextArtworkWidthCm: number,
  nextArtworkHeightCm: number,
) {
  const nextPresets = {
    ...config.uploadedArtworkCropPresets,
    [getArtworkCropPresetKey(config.artworkWidthCm, config.artworkHeightCm)]: {
      x: config.uploadedArtworkCropX,
      y: config.uploadedArtworkCropY,
      scale: config.uploadedArtworkCropScale,
    },
  };
  const nextPreset =
    nextPresets[getArtworkCropPresetKey(nextArtworkWidthCm, nextArtworkHeightCm)] ??
    getDefaultArtworkCropPreset();

  return {
    uploadedArtworkCropPresets: nextPresets,
    uploadedArtworkCropX: nextPreset.x,
    uploadedArtworkCropY: nextPreset.y,
    uploadedArtworkCropScale: nextPreset.scale,
  };
}

export function getCropRectPercentages(
  imageWidth: number,
  imageHeight: number,
  ratioWidth: number,
  ratioHeight: number,
  cropCenterX: number,
  cropCenterY: number,
  cropScale = 1,
) {
  const rect = getCropRectForRatio(
    imageWidth,
    imageHeight,
    ratioWidth,
    ratioHeight,
    cropCenterX,
    cropCenterY,
    cropScale,
  );

  return {
    left: (rect.x / Math.max(imageWidth, 1)) * 100,
    top: (rect.y / Math.max(imageHeight, 1)) * 100,
    width: (rect.width / Math.max(imageWidth, 1)) * 100,
    height: (rect.height / Math.max(imageHeight, 1)) * 100,
  };
}

export function clampCropCenter(
  imageWidth: number,
  imageHeight: number,
  ratioWidth: number,
  ratioHeight: number,
  nextCenterX: number,
  nextCenterY: number,
  cropScale = 1,
) {
  const rect = getCropRectForRatio(
    imageWidth,
    imageHeight,
    ratioWidth,
    ratioHeight,
    nextCenterX,
    nextCenterY,
    cropScale,
  );

  const halfWidth = rect.width / Math.max(imageWidth, 1) / 2;
  const halfHeight = rect.height / Math.max(imageHeight, 1) / 2;

  return {
    x: clamp(nextCenterX, halfWidth, 1 - halfWidth),
    y: clamp(nextCenterY, halfHeight, 1 - halfHeight),
  };
}

export function getArtworkObjectPosition(cropCenterX: number, cropCenterY: number) {
  return `${Math.round(clamp(cropCenterX, 0, 1) * 100)}% ${Math.round(clamp(cropCenterY, 0, 1) * 100)}%`;
}

export function getArtworkCropImageLayout(
  imageWidth: number,
  imageHeight: number,
  ratioWidth: number,
  ratioHeight: number,
  cropCenterX: number,
  cropCenterY: number,
  cropScale = 1,
) {
  const rect = getCropRectPercentages(
    imageWidth,
    imageHeight,
    ratioWidth,
    ratioHeight,
    cropCenterX,
    cropCenterY,
    cropScale,
  );
  const safeWidth = Math.max(rect.width, 0.0001);
  const safeHeight = Math.max(rect.height, 0.0001);

  return {
    width: `${10000 / safeWidth}%`,
    height: `${10000 / safeHeight}%`,
    left: `${-(rect.left / safeWidth) * 100}%`,
    top: `${-(rect.top / safeHeight) * 100}%`,
  };
}
