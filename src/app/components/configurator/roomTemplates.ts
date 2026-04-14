import { getConfiguratorAssetUrl } from './asset-paths';

export type RoomPlacementStyle =
  | 'above-sofa-centered'
  | 'feature-wall-centered'
  | 'offset-left';

export type RoomArchetype =
  | 'sofa-wall'
  | 'bed-wall'
  | 'accent-wall'
  | 'desk-wall'
  | 'hallway'
  | 'staircase';

export interface NormalizedQuadPoint {
  x: number;
  y: number;
}

export type NormalizedPoint = NormalizedQuadPoint;
export type NormalizedPolygon = NormalizedPoint[];

export type NormalizedQuad = [
  NormalizedQuadPoint,
  NormalizedQuadPoint,
  NormalizedQuadPoint,
  NormalizedQuadPoint,
];

export interface RoomTemplate {
  id: string;
  title: string;
  description: string;
  styleTag: string;
  roomArchetype: RoomArchetype;
  imageSrc: string;
  imageWidthPx: number;
  imageHeightPx: number;
  wallSurfacePercent: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  placementZonePercent: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  wallHeightCm: number;
  defaultPlacementPercent: {
    x: number;
    y: number;
  };
  placementStyle: RoomPlacementStyle;
  placementTuning: {
    horizontalPaddingPx: number;
    topPaddingPx: number;
    bottomPaddingPx: number;
    defaultBottomOffsetPx: number;
    frameTiltDeg: number;
  };
  sceneImageScale: number;
  sceneImagePosition: string;
  thumbnailImageScale: number;
  thumbnailImagePosition: string;
  devWallQuad?: NormalizedQuad;
  devFurnitureBlockerQuad?: NormalizedQuad;
  devPlacementPolygon?: NormalizedPolygon;
}

export const DEV_WALL_EDITOR_ENABLED = true;

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'peaceful-living-room',
    title: 'Peaceful Living Room',
    description: 'Warm sofa scene with a centered hanging position above the seating line.',
    styleTag: 'Warm Minimal',
    roomArchetype: 'sofa-wall',
    imageSrc: getConfiguratorAssetUrl('room-preview/room-perv.jpg'),
    imageWidthPx: 6000,
    imageHeightPx: 4000,
    wallSurfacePercent: {
      x: 0.15,
      y: 0.03,
      width: 0.7,
      height: 0.56,
    },
    placementZonePercent: {
      x: 0.18,
      y: 0.05,
      width: 0.64,
      height: 0.38,
    },
    wallHeightCm: 210,
    defaultPlacementPercent: {
      x: 0.5,
      y: 0.72,
    },
    placementStyle: 'above-sofa-centered',
    placementTuning: {
      horizontalPaddingPx: 18,
      topPaddingPx: 12,
      bottomPaddingPx: 60,
      defaultBottomOffsetPx: 40,
      frameTiltDeg: 0.5,
    },
    sceneImageScale: 1,
    sceneImagePosition: '50% 50%',
    thumbnailImageScale: 1,
    thumbnailImagePosition: '50% 50%',
    devWallQuad: [
      { x: 0.21, y: 0.08 },
      { x: 0.79, y: 0.08 },
      { x: 0.77, y: 0.42 },
      { x: 0.23, y: 0.42 },
    ],
    devFurnitureBlockerQuad: [
      { x: 0.24, y: 0.44 },
      { x: 0.76, y: 0.44 },
      { x: 0.72, y: 0.58 },
      { x: 0.28, y: 0.58 },
    ],
  },
  {
    id: 'soft-suite-bedroom',
    title: 'Soft Suite Bedroom',
    description: 'Symmetrical bedroom wall centered above the upholstered headboard.',
    styleTag: 'Suite Bedroom',
    roomArchetype: 'bed-wall',
    imageSrc: getConfiguratorAssetUrl('room-preview/soft-suite-bedroom.jpg'),
    imageWidthPx: 3001,
    imageHeightPx: 2401,
    wallSurfacePercent: {
      x: 0.3,
      y: 0.01,
      width: 0.42,
      height: 0.45,
    },
    placementZonePercent: {
      x: 0.315,
      y: 0.08,
      width: 0.39,
      height: 0.25,
    },
    wallHeightCm: 155,
    defaultPlacementPercent: {
      x: 0.5,
      y: 0.7,
    },
    placementStyle: 'above-sofa-centered',
    placementTuning: {
      horizontalPaddingPx: 6,
      topPaddingPx: 12,
      bottomPaddingPx: 70,
      defaultBottomOffsetPx: 35,
      frameTiltDeg: 0.15,
    },
    sceneImageScale: 1,
    sceneImagePosition: '50% 50%',
    thumbnailImageScale: 1.06,
    thumbnailImagePosition: '50% 48%',
    devWallQuad: [
      { x: 0.33, y: 0.09 },
      { x: 0.69, y: 0.09 },
      { x: 0.67, y: 0.31 },
      { x: 0.35, y: 0.31 },
    ],
    devFurnitureBlockerQuad: [
      { x: 0.31, y: 0.33 },
      { x: 0.69, y: 0.33 },
      { x: 0.67, y: 0.47 },
      { x: 0.33, y: 0.47 },
    ],
  },
  {
    id: 'wood-panel-bedroom',
    title: 'Wood Panel Bedroom',
    description: 'Wide timber feature wall with a calm centered hanging position above the bed.',
    styleTag: 'Wood Spa',
    roomArchetype: 'bed-wall',
    imageSrc: getConfiguratorAssetUrl('room-preview/wood-panel-bedroom.jpg'),
    imageWidthPx: 1920,
    imageHeightPx: 1080,
    wallSurfacePercent: {
      x: 0.22,
      y: 0.18,
      width: 0.58,
      height: 0.42,
    },
    placementZonePercent: {
      x: 0.22,
      y: 0.22,
      width: 0.56,
      height: 0.26,
    },
    wallHeightCm: 145,
    defaultPlacementPercent: {
      x: 0.5,
      y: 0.68,
    },
    placementStyle: 'above-sofa-centered',
    placementTuning: {
      horizontalPaddingPx: 4,
      topPaddingPx: 10,
      bottomPaddingPx: 65,
      defaultBottomOffsetPx: 28,
      frameTiltDeg: 0.1,
    },
    sceneImageScale: 1.01,
    sceneImagePosition: '50% 50%',
    thumbnailImageScale: 1.08,
    thumbnailImagePosition: '50% 44%',
    devWallQuad: [
      { x: 0.24, y: 0.22 },
      { x: 0.76, y: 0.22 },
      { x: 0.74, y: 0.43 },
      { x: 0.26, y: 0.43 },
    ],
    devFurnitureBlockerQuad: [
      { x: 0.26, y: 0.45 },
      { x: 0.74, y: 0.45 },
      { x: 0.72, y: 0.59 },
      { x: 0.28, y: 0.59 },
    ],
  },
];

export const DEFAULT_ROOM_TEMPLATE = ROOM_TEMPLATES[0];
