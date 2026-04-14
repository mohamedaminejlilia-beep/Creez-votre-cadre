import type { RoomTemplate } from './roomTemplates';

export interface RoomRecommendation {
  template: RoomTemplate;
  score: number;
  badge: 'Best match' | 'Great fit' | 'Flexible';
  reason: string;
  placementWidthCm: number;
  placementHeightCm: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getRenderableZoneWidthCm(
  template: RoomTemplate,
  zoneWidthPercent: number,
  zoneHeightPercent: number,
) {
  const imageAspect = template.imageHeightPx / template.imageWidthPx;
  return (
    (template.wallHeightCm * zoneWidthPercent) /
    Math.max(zoneHeightPercent * imageAspect, 0.01)
  );
}

export function getRoomPlacementCapacityCm(template: RoomTemplate) {
  const placementHeightCm = template.wallHeightCm * template.placementZonePercent.height;
  const placementWidthCm = getRenderableZoneWidthCm(
    template,
    template.placementZonePercent.width,
    template.wallSurfacePercent.height,
  );

  return {
    widthCm: placementWidthCm,
    heightCm: placementHeightCm,
  };
}

function scoreOccupancy(occupancy: number, ideal: number, tolerance: number) {
  const delta = Math.abs(occupancy - ideal);
  return clamp(1 - delta / tolerance, 0, 1);
}

function getRoomReason(widthOccupancy: number, heightOccupancy: number) {
  if (widthOccupancy > 0.82 || heightOccupancy > 0.82) {
    return 'Bold fit that nearly fills the usable wall zone.';
  }

  if (widthOccupancy < 0.24 && heightOccupancy < 0.24) {
    return 'Lighter editorial scale with more breathing room around the piece.';
  }

  if (heightOccupancy > widthOccupancy + 0.12) {
    return 'Strong vertical balance for taller framed pieces.';
  }

  if (widthOccupancy > heightOccupancy + 0.12) {
    return 'Good width balance for wider or multi-frame compositions.';
  }

  return 'Balanced wall fit with natural breathing room.';
}

function getBadge(index: number, score: number): RoomRecommendation['badge'] {
  if (index === 0) {
    return 'Best match';
  }

  if (score >= 70) {
    return 'Great fit';
  }

  return 'Flexible';
}

export function getRoomRecommendations(
  templates: RoomTemplate[],
  objectWidthCm: number,
  objectHeightCm: number,
) {
  return templates
    .map((template) => {
      const placementCapacity = getRoomPlacementCapacityCm(template);
      const widthOccupancy = objectWidthCm / Math.max(placementCapacity.widthCm, 0.1);
      const heightOccupancy = objectHeightCm / Math.max(placementCapacity.heightCm, 0.1);
      const widthScore = scoreOccupancy(widthOccupancy, 0.48, 0.42);
      const heightScore = scoreOccupancy(heightOccupancy, 0.42, 0.38);
      const oversizePenalty =
        (widthOccupancy > 1 ? (widthOccupancy - 1) * 140 : 0) +
        (heightOccupancy > 1 ? (heightOccupancy - 1) * 160 : 0);
      const score = Math.max(0, Math.round(widthScore * 48 + heightScore * 42 - oversizePenalty));

      return {
        template,
        score,
        reason: getRoomReason(widthOccupancy, heightOccupancy),
        placementWidthCm: placementCapacity.widthCm,
        placementHeightCm: placementCapacity.heightCm,
      };
    })
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({
      ...entry,
      badge: getBadge(index, entry.score),
    }));
}
