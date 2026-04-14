export interface StandardArtworkRatio {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface ArtworkRatioAwareConfig {
  artworkWidthCm: number;
  artworkHeightCm: number;
  artworkRatioMode: 'detected' | 'standard' | 'custom';
  artworkRatioWidth: number | null;
  artworkRatioHeight: number | null;
  selectedArtworkRatioId: string | null;
}

export interface ArtworkSizeUpdate {
  artworkWidthCm: number;
  artworkHeightCm: number;
}

export const STANDARD_ARTWORK_RATIOS: StandardArtworkRatio[] = [
  { id: '1:1', label: '1:1', width: 1, height: 1 },
  { id: '4:5', label: '4:5', width: 4, height: 5 },
  { id: '2:3', label: '2:3', width: 2, height: 3 },
  { id: '3:4', label: '3:4', width: 3, height: 4 },
  { id: '5:7', label: '5:7', width: 5, height: 7 },
  { id: '16:9', label: '16:9', width: 16, height: 9 },
];

function gcd(a: number, b: number): number {
  let x = Math.round(Math.abs(a));
  let y = Math.round(Math.abs(b));

  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }

  return x || 1;
}

function roundRatioValue(value: number) {
  return Math.round(value * 100) / 100;
}

function getSafePositiveValue(value: number, fallback: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
}

export function getClosestStandardArtworkRatio(
  width: number,
  height: number,
): StandardArtworkRatio {
  const target = width / Math.max(height, 1);

  return STANDARD_ARTWORK_RATIOS.reduce((closest, option) => {
    const optionValue = option.width / option.height;
    const optionDistance = Math.abs(optionValue - target);
    const closestDistance =
      Math.abs(closest.width / closest.height - target);

    return optionDistance < closestDistance ? option : closest;
  }, STANDARD_ARTWORK_RATIOS[0]);
}

export function getDetectedArtworkRatioLabel(width: number, height: number) {
  const divisor = gcd(width, height);
  const reducedWidth = Math.round(width / divisor);
  const reducedHeight = Math.round(height / divisor);

  if (reducedWidth <= 20 && reducedHeight <= 20) {
    return `${reducedWidth}:${reducedHeight}`;
  }

  const closest = getClosestStandardArtworkRatio(width, height);
  const closestValue = closest.width / closest.height;
  const currentValue = width / Math.max(height, 1);

  if (Math.abs(closestValue - currentValue) <= 0.03) {
    return closest.label;
  }

  if (width >= height) {
    return `${roundRatioValue(width / Math.max(height, 1))}:1`;
  }

  return `1:${roundRatioValue(height / Math.max(width, 1))}`;
}

export function getArtworkRatioLock(config: ArtworkRatioAwareConfig) {
  if (
    config.artworkRatioMode === 'custom' ||
    !config.artworkRatioWidth ||
    !config.artworkRatioHeight
  ) {
    return null;
  }

  const selectedStandardRatio = STANDARD_ARTWORK_RATIOS.find(
    (ratio) => ratio.id === config.selectedArtworkRatioId,
  );

  return {
    width: config.artworkRatioWidth,
    height: config.artworkRatioHeight,
    label:
      config.artworkRatioMode === 'standard' && selectedStandardRatio
        ? selectedStandardRatio.label
        : getDetectedArtworkRatioLabel(
            config.artworkRatioWidth,
            config.artworkRatioHeight,
          ),
  };
}

export function getBestFittedArtworkSize(
  currentWidthCm: number,
  currentHeightCm: number,
  ratioWidth: number,
  ratioHeight: number,
): ArtworkSizeUpdate {
  const safeRatioWidth = getSafePositiveValue(ratioWidth, 1);
  const safeRatioHeight = getSafePositiveValue(ratioHeight, 1);
  const safeWidth = getSafePositiveValue(currentWidthCm, safeRatioWidth);
  const safeHeight = getSafePositiveValue(currentHeightCm, safeRatioHeight);
  const anchorSideCm = Math.max(safeWidth, safeHeight, 1);

  if (safeRatioWidth >= safeRatioHeight) {
    return {
      artworkWidthCm: Math.round(anchorSideCm * 10) / 10,
      artworkHeightCm:
        Math.round(anchorSideCm * (safeRatioHeight / safeRatioWidth) * 10) / 10,
    };
  }

  return {
    artworkWidthCm:
      Math.round(anchorSideCm * (safeRatioWidth / safeRatioHeight) * 10) / 10,
    artworkHeightCm: Math.round(anchorSideCm * 10) / 10,
  };
}

export function getArtworkSizeUpdateForInput(
  config: ArtworkRatioAwareConfig,
  key: 'artworkWidthCm' | 'artworkHeightCm',
  nextValueCm: number,
): ArtworkSizeUpdate {
  const ratioLock = getArtworkRatioLock(config);
  if (!ratioLock || nextValueCm <= 0) {
    if (key === 'artworkWidthCm') {
      return {
        artworkWidthCm: nextValueCm,
        artworkHeightCm: config.artworkHeightCm,
      };
    }

    return {
      artworkWidthCm: config.artworkWidthCm,
      artworkHeightCm: nextValueCm,
    };
  }

  if (key === 'artworkWidthCm') {
    return {
      artworkWidthCm: nextValueCm,
      artworkHeightCm:
        Math.round(nextValueCm * (ratioLock.height / ratioLock.width) * 10) /
        10,
    };
  }

  return {
    artworkWidthCm:
      Math.round(nextValueCm * (ratioLock.width / ratioLock.height) * 10) / 10,
    artworkHeightCm: nextValueCm,
  };
}
