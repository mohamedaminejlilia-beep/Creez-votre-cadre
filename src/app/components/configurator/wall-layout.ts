import { createGalleryWallItem } from './gallery-wall';
import type { GalleryWallItem } from './gallery-wall';

interface GenerateLayoutParams {
  wallWidthCm: number;
  wallHeightCm: number;
  spacingCm: number;
  frameCount?: number;
  frameWidthPaddingCm?: number;
  frameHeightPaddingCm?: number;
  minArtworkWidthCm: number;
  minArtworkHeightCm: number;
  maxArtworkWidthCm: number;
  maxArtworkHeightCm: number;
  targetAspectRatio: number;
  allowedZoneCm?: {
    xCm: number;
    yCm: number;
    widthCm: number;
    heightCm: number;
  } | null;
}

interface LayoutCandidate {
  columns: number;
  rows: number;
  artworkWidthCm: number;
  artworkHeightCm: number;
  frameOuterWidthCm: number;
  frameOuterHeightCm: number;
  spacingCm: number;
  usedWidthCm: number;
  usedHeightCm: number;
  originXcm: number;
  originYcm: number;
  score: number;
  region: WallRectCm;
}

interface WallRectCm {
  xCm: number;
  yCm: number;
  widthCm: number;
  heightCm: number;
}

const MIN_GENERATED_SPACING_CM = 1;
const SIDE_PADDING_CM = 6;
const TOP_PADDING_CM = 8;
const BOTTOM_PADDING_CM = 28;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSafeAspectRatio(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0.8;
  }

  return value;
}

function getSafeWallWidth(value: number) {
  return Math.max(1, value);
}

function getSafeWallHeight(value: number) {
  return Math.max(1, value);
}

function getEffectiveWallRect(wallWidthCm: number, wallHeightCm: number): WallRectCm {
  const safeWallWidth = getSafeWallWidth(wallWidthCm);
  const safeWallHeight = getSafeWallHeight(wallHeightCm);

  return {
    xCm: SIDE_PADDING_CM,
    yCm: TOP_PADDING_CM,
    widthCm: Math.max(20, safeWallWidth - SIDE_PADDING_CM * 2),
    heightCm: Math.max(20, safeWallHeight - TOP_PADDING_CM - BOTTOM_PADDING_CM),
  };
}

function getUsableWallRegions(
  wallWidthCm: number,
  wallHeightCm: number,
  allowedZoneCm?: GenerateLayoutParams['allowedZoneCm'],
) {
  const baseWallRect = getEffectiveWallRect(wallWidthCm, wallHeightCm);
  const wallRect = allowedZoneCm
    ? {
        xCm: 0,
        yCm: 0,
        widthCm: clamp(allowedZoneCm.widthCm, 0, baseWallRect.widthCm),
        heightCm: clamp(allowedZoneCm.heightCm, 0, baseWallRect.heightCm),
      }
    : {
        xCm: 0,
        yCm: 0,
        widthCm: baseWallRect.widthCm,
        heightCm: baseWallRect.heightCm,
      };

  if (wallRect.widthCm <= 0 || wallRect.heightCm <= 0) {
    return [];
  }

  return [wallRect];
}

function isRectInsideRegion(rect: WallRectCm, region: WallRectCm) {
  return (
    rect.xCm >= region.xCm &&
    rect.yCm >= region.yCm &&
    rect.xCm + rect.widthCm <= region.xCm + region.widthCm &&
    rect.yCm + rect.heightCm <= region.yCm + region.heightCm
  );
}

function validateGeneratedLayout(
  items: GalleryWallItem[],
  candidate: LayoutCandidate,
) {
  return items.every((item) =>
    isRectInsideRegion(
      {
        xCm: candidate.originXcm + (item.customLayoutXcm ?? 0),
        yCm: candidate.originYcm + (item.customLayoutYcm ?? 0),
        widthCm: candidate.frameOuterWidthCm,
        heightCm: candidate.frameOuterHeightCm,
      },
      candidate.region,
    ),
  );
}

function chooseBestGrid(
  count: number,
  wallWidthCm: number,
  wallHeightCm: number,
  requestedSpacingCm: number,
  frameWidthPaddingCm: number,
  frameHeightPaddingCm: number,
  minArtworkWidthCm: number,
  minArtworkHeightCm: number,
  maxArtworkWidthCm: number,
  maxArtworkHeightCm: number,
  targetAspectRatio: number,
  allowedZoneCm?: GenerateLayoutParams['allowedZoneCm'],
): LayoutCandidate | null {
  const safeRatio = getSafeAspectRatio(targetAspectRatio);
  const spacingCm = Math.max(
    MIN_GENERATED_SPACING_CM,
    Math.max(0, requestedSpacingCm),
  );

  let best: LayoutCandidate | null = null;

  for (const region of getUsableWallRegions(wallWidthCm, wallHeightCm, allowedZoneCm)) {
    const wallAspect = region.widthCm / Math.max(region.heightCm, 0.1);

    for (let columns = 1; columns <= count; columns += 1) {
      const rows = Math.ceil(count / columns);

      const usableWidthAfterGap = region.widthCm - Math.max(0, columns - 1) * spacingCm;
      const usableHeightAfterGap = region.heightCm - Math.max(0, rows - 1) * spacingCm;

      if (usableWidthAfterGap <= 0 || usableHeightAfterGap <= 0) {
        continue;
      }

      const cellWidth = usableWidthAfterGap / columns;
      const cellHeight = usableHeightAfterGap / rows;

      const maxArtworkWidthFromCell = cellWidth - frameWidthPaddingCm;
      const maxArtworkHeightFromCell = cellHeight - frameHeightPaddingCm;

      if (maxArtworkWidthFromCell <= 0 || maxArtworkHeightFromCell <= 0) {
        continue;
      }

      let artworkWidthCm = maxArtworkWidthFromCell;
      let artworkHeightCm = artworkWidthCm / safeRatio;

      if (artworkHeightCm > maxArtworkHeightFromCell) {
        artworkHeightCm = maxArtworkHeightFromCell;
        artworkWidthCm = artworkHeightCm * safeRatio;
      }

      artworkWidthCm = clamp(artworkWidthCm, minArtworkWidthCm, maxArtworkWidthCm);
      artworkHeightCm = clamp(artworkHeightCm, minArtworkHeightCm, maxArtworkHeightCm);

      const frameOuterWidthCm = artworkWidthCm + frameWidthPaddingCm;
      const frameOuterHeightCm = artworkHeightCm + frameHeightPaddingCm;

      if (frameOuterWidthCm > cellWidth || frameOuterHeightCm > cellHeight) {
        continue;
      }

      const usedWidthCm =
        columns * frameOuterWidthCm + Math.max(0, columns - 1) * spacingCm;
      const usedHeightCm =
        rows * frameOuterHeightCm + Math.max(0, rows - 1) * spacingCm;

      if (usedWidthCm > region.widthCm || usedHeightCm > region.heightCm) {
        continue;
      }

      const layoutAspect = usedWidthCm / Math.max(usedHeightCm, 0.1);
      const aspectPenalty = Math.abs(layoutAspect - wallAspect) * 90;
      const widthFill = usedWidthCm / region.widthCm;
      const heightFill = usedHeightCm / region.heightCm;
      const fillScore = widthFill * 40 + heightFill * 60;
      const balancePenalty = Math.abs(columns - rows) * 2;
      const emptySlotsPenalty = (rows * columns - count) * 1.5;
      const wideGridPenalty =
        layoutAspect > wallAspect ? (layoutAspect - wallAspect) * 20 : 0;
      const spacingPenalty = spacingCm * 2;
      const score =
        fillScore -
        aspectPenalty -
        balancePenalty -
        emptySlotsPenalty -
        wideGridPenalty -
        spacingPenalty;

      if (!best || score > best.score) {
        best = {
          columns,
          rows,
          artworkWidthCm,
          artworkHeightCm,
          frameOuterWidthCm,
          frameOuterHeightCm,
          spacingCm,
          usedWidthCm,
          usedHeightCm,
          originXcm: region.xCm,
          originYcm: region.yCm,
          score,
          region,
        };
      }
    }
  }

  return best;
}

export function generateLayout(params: GenerateLayoutParams): GalleryWallItem[] {
  const count = Math.max(1, Math.round(params.frameCount ?? 4));

  const candidate = chooseBestGrid(
    count,
    getSafeWallWidth(params.wallWidthCm),
    getSafeWallHeight(params.wallHeightCm),
    Math.max(0, params.spacingCm),
    Math.max(0, params.frameWidthPaddingCm ?? 0),
    Math.max(0, params.frameHeightPaddingCm ?? 0),
    Math.max(1, params.minArtworkWidthCm),
    Math.max(1, params.minArtworkHeightCm),
    Math.max(params.minArtworkWidthCm, params.maxArtworkWidthCm),
    Math.max(params.minArtworkHeightCm, params.maxArtworkHeightCm),
    params.targetAspectRatio,
    params.allowedZoneCm,
  );

  if (!candidate) {
    return [];
  }

  const items: GalleryWallItem[] = [];

  for (let index = 0; index < count; index += 1) {
    const column = index % candidate.columns;
    const row = Math.floor(index / candidate.columns);

    if (row >= candidate.rows) {
      break;
    }

    const itemsInThisRow =
      row === candidate.rows - 1
        ? count - row * candidate.columns
        : candidate.columns;

    const rowUsedWidthCm =
      itemsInThisRow * candidate.frameOuterWidthCm +
      Math.max(0, itemsInThisRow - 1) * candidate.spacingCm;

    const rowOffsetXcm = Math.max(0, (candidate.usedWidthCm - rowUsedWidthCm) / 2);

    const item = createGalleryWallItem(index, {
      artworkWidthCm: candidate.artworkWidthCm,
      artworkHeightCm: candidate.artworkHeightCm,
      artworkRatioMode: 'custom',
    });

    item.customLayoutXcm =
      rowOffsetXcm +
      column * (candidate.frameOuterWidthCm + candidate.spacingCm);
    item.customLayoutYcm =
      row * (candidate.frameOuterHeightCm + candidate.spacingCm);

    items.push(item);
  }

  return validateGeneratedLayout(items, candidate) ? items : [];
}
