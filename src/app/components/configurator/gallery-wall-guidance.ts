import {
  CUSTOM_GALLERY_LAYOUT_ID,
  type GalleryLayoutTemplate,
  type GalleryWallItem,
} from './gallery-wall';
import { getRoomPlacementCapacityCm } from './room-recommendations';
import type { RoomFrameSizePx, RoomPlacementPx, RoomStageRect } from './roomMath';
import type { RoomArchetype, RoomTemplate } from './roomTemplates';

export type GalleryWallGuidanceCode =
  | 'scale-strong'
  | 'too-narrow'
  | 'too-wide'
  | 'too-low'
  | 'too-high'
  | 'off-center'
  | 'uniform-layout-mismatch'
  | 'mixed-layout-mismatch';

export interface GalleryWallGuidanceItem {
  code: GalleryWallGuidanceCode;
  tone: 'good' | 'warn';
}

export interface GalleryWallCompositionGuidance {
  summary: 'strong' | 'adjust';
  items: GalleryWallGuidanceItem[];
}

export interface GalleryWallRoomPlacementMetrics {
  placementZone: RoomStageRect;
  wallZone: RoomStageRect;
  placement: RoomPlacementPx | null;
  objectSizePx: RoomFrameSizePx;
  pixelsPerCm: number;
}

interface RoomCompositionRule {
  idealWidthMin: number;
  idealWidthMax: number;
  minBottomGapCm: number;
  minTopGapCm: number;
  maxCenterOffsetCm: number;
}

const ROOM_COMPOSITION_RULES: Record<RoomArchetype, RoomCompositionRule> = {
  'sofa-wall': {
    idealWidthMin: 0.5,
    idealWidthMax: 0.8,
    minBottomGapCm: 14,
    minTopGapCm: 10,
    maxCenterOffsetCm: 10,
  },
  'bed-wall': {
    idealWidthMin: 0.44,
    idealWidthMax: 0.72,
    minBottomGapCm: 12,
    minTopGapCm: 10,
    maxCenterOffsetCm: 9,
  },
  'desk-wall': {
    idealWidthMin: 0.42,
    idealWidthMax: 0.78,
    minBottomGapCm: 10,
    minTopGapCm: 8,
    maxCenterOffsetCm: 10,
  },
  'accent-wall': {
    idealWidthMin: 0.3,
    idealWidthMax: 0.68,
    minBottomGapCm: 8,
    minTopGapCm: 8,
    maxCenterOffsetCm: 16,
  },
  hallway: {
    idealWidthMin: 0.24,
    idealWidthMax: 0.56,
    minBottomGapCm: 8,
    minTopGapCm: 8,
    maxCenterOffsetCm: 14,
  },
  staircase: {
    idealWidthMin: 0.3,
    idealWidthMax: 0.72,
    minBottomGapCm: 8,
    minTopGapCm: 8,
    maxCenterOffsetCm: 22,
  },
};

function isUniformSizeSet(
  items: GalleryWallItem[],
  getItemOuterSizeCm: (item: GalleryWallItem) => { widthCm: number; heightCm: number },
) {
  if (items.length <= 1) {
    return true;
  }

  const widths = items.map((item) => getItemOuterSizeCm(item).widthCm);
  const heights = items.map((item) => getItemOuterSizeCm(item).heightCm);
  const averageWidth = widths.reduce((sum, value) => sum + value, 0) / widths.length;
  const averageHeight = heights.reduce((sum, value) => sum + value, 0) / heights.length;

  return items.every((item) => {
    const size = getItemOuterSizeCm(item);
    return (
      Math.abs(size.widthCm - averageWidth) <= averageWidth * 0.12 &&
      Math.abs(size.heightCm - averageHeight) <= averageHeight * 0.12
    );
  });
}

function isMixedSizeSet(
  items: GalleryWallItem[],
  getItemOuterSizeCm: (item: GalleryWallItem) => { widthCm: number; heightCm: number },
) {
  if (items.length <= 1) {
    return false;
  }

  const areas = items.map((item) => {
    const size = getItemOuterSizeCm(item);
    return size.widthCm * size.heightCm;
  });
  const largest = Math.max(...areas);
  const smallest = Math.max(Math.min(...areas), 0.1);

  return largest / smallest >= 1.45;
}

function getBottomGapCm(metrics: GalleryWallRoomPlacementMetrics) {
  const placementBottomPx = metrics.placementZone.y + metrics.placementZone.height;
  const objectBottomPx = metrics.placement
    ? metrics.placement.y + metrics.objectSizePx.height
    : placementBottomPx;

  return (placementBottomPx - objectBottomPx) / Math.max(metrics.pixelsPerCm, 0.1);
}

function getTopGapCm(metrics: GalleryWallRoomPlacementMetrics) {
  if (!metrics.placement) {
    return 0;
  }

  return (metrics.placement.y - metrics.placementZone.y) / Math.max(metrics.pixelsPerCm, 0.1);
}

function getCenterOffsetCm(metrics: GalleryWallRoomPlacementMetrics) {
  if (!metrics.placement) {
    return 0;
  }

  const compositionCenterPx = metrics.placement.x + metrics.objectSizePx.width / 2;
  const placementCenterPx = metrics.placementZone.x + metrics.placementZone.width / 2;

  return Math.abs(compositionCenterPx - placementCenterPx) / Math.max(metrics.pixelsPerCm, 0.1);
}

export function getGalleryWallCompositionGuidance(
  template: RoomTemplate,
  items: GalleryWallItem[],
  compositionWidthCm: number,
  compositionHeightCm: number,
  selectedLayoutId: string | null,
  selectedLayout: GalleryLayoutTemplate | null,
  roomMetrics: GalleryWallRoomPlacementMetrics | null,
  getItemOuterSizeCm: (item: GalleryWallItem) => { widthCm: number; heightCm: number },
): GalleryWallCompositionGuidance | null {
  if (items.length === 0 || compositionWidthCm <= 0 || compositionHeightCm <= 0) {
    return null;
  }

  const roomRules = ROOM_COMPOSITION_RULES[template.roomArchetype];
  const placementCapacity = getRoomPlacementCapacityCm(template);
  const widthOccupancy = compositionWidthCm / Math.max(placementCapacity.widthCm, 0.1);
  const guidanceItems: GalleryWallGuidanceItem[] = [];

  if (widthOccupancy < roomRules.idealWidthMin) {
    guidanceItems.push({ code: 'too-narrow', tone: 'warn' });
  } else if (widthOccupancy > roomRules.idealWidthMax) {
    guidanceItems.push({ code: 'too-wide', tone: 'warn' });
  } else {
    guidanceItems.push({ code: 'scale-strong', tone: 'good' });
  }

  if (roomMetrics?.placement) {
    const bottomGapCm = getBottomGapCm(roomMetrics);
    const topGapCm = getTopGapCm(roomMetrics);
    const centerOffsetCm = getCenterOffsetCm(roomMetrics);

    if (bottomGapCm < roomRules.minBottomGapCm) {
      guidanceItems.push({ code: 'too-low', tone: 'warn' });
    }

    if (topGapCm < roomRules.minTopGapCm) {
      guidanceItems.push({ code: 'too-high', tone: 'warn' });
    }

    if (centerOffsetCm > roomRules.maxCenterOffsetCm) {
      guidanceItems.push({ code: 'off-center', tone: 'warn' });
    }
  }

  const uniformSizeSet = isUniformSizeSet(items, getItemOuterSizeCm);
  const mixedSizeSet = isMixedSizeSet(items, getItemOuterSizeCm);

  if (
    selectedLayoutId !== CUSTOM_GALLERY_LAYOUT_ID &&
    selectedLayout &&
    uniformSizeSet &&
    (selectedLayout.family === 'mondrian' || selectedLayout.family === 'salon')
  ) {
    guidanceItems.push({ code: 'uniform-layout-mismatch', tone: 'warn' });
  }

  if (
    selectedLayoutId !== CUSTOM_GALLERY_LAYOUT_ID &&
    selectedLayout &&
    mixedSizeSet &&
    selectedLayout.family === 'simple-grid'
  ) {
    guidanceItems.push({ code: 'mixed-layout-mismatch', tone: 'warn' });
  }

  const warningItems = guidanceItems.filter((item) => item.tone === 'warn');
  const goodItems = guidanceItems.filter((item) => item.tone === 'good');

  return {
    summary: warningItems.length > 0 ? 'adjust' : 'strong',
    items:
      warningItems.length > 0
        ? warningItems.slice(0, 3)
        : goodItems.slice(0, 2).map((item) => ({
            ...item,
            tone: 'good',
          })),
  };
}
