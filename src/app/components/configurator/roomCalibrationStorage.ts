import type { NormalizedPolygon, NormalizedQuad } from './roomTemplates';
import {
  cloneNormalizedPolygon,
  isValidNormalizedPolygon,
} from './roomCalibrationGeometry';

const ROOM_CALIBRATION_STORAGE_KEY = 'frame-configurator:room-calibrations';

interface StoredRoomCalibration {
  wallQuad: NormalizedQuad;
  placementPolygon: NormalizedPolygon;
}

type StoredRoomCalibrationMap = Record<string, StoredRoomCalibration>;

function isValidQuadPoint(value: unknown): value is { x: number; y: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { x?: unknown }).x === 'number' &&
    Number.isFinite((value as { x: number }).x) &&
    typeof (value as { y?: unknown }).y === 'number' &&
    Number.isFinite((value as { y: number }).y)
  );
}

function isValidQuad(value: unknown): value is NormalizedQuad {
  return Array.isArray(value) && value.length === 4 && value.every(isValidQuadPoint);
}

function cloneQuad(quad: NormalizedQuad): NormalizedQuad {
  return quad.map((point) => ({ x: point.x, y: point.y })) as NormalizedQuad;
}

function normalizeStoredCalibration(value: unknown): StoredRoomCalibration | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !isValidQuad((value as { wallQuad?: unknown }).wallQuad)
  ) {
    return null;
  }

  return {
    wallQuad: cloneQuad((value as { wallQuad: NormalizedQuad }).wallQuad),
    placementPolygon: isValidNormalizedPolygon(
      (value as { placementPolygon?: unknown }).placementPolygon,
    )
      ? cloneNormalizedPolygon(
          (value as { placementPolygon: NormalizedPolygon }).placementPolygon,
        )
      : [],
  };
}

function loadCalibrationMap(): StoredRoomCalibrationMap {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(ROOM_CALIBRATION_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(parsed).reduce<StoredRoomCalibrationMap>((accumulator, [roomId, value]) => {
      const normalized = normalizeStoredCalibration(value);
      if (normalized) {
        accumulator[roomId] = normalized;
      }
      return accumulator;
    }, {});
  } catch {
    return {};
  }
}

function saveCalibrationMap(value: StoredRoomCalibrationMap) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ROOM_CALIBRATION_STORAGE_KEY, JSON.stringify(value));
}

export function getSavedRoomCalibration(roomId: string) {
  const calibrations = loadCalibrationMap();
  return calibrations[roomId] ?? null;
}

export function saveRoomCalibration(
  roomId: string,
  wallQuad: NormalizedQuad,
  placementPolygon: NormalizedPolygon = [],
) {
  const calibrations = loadCalibrationMap();
  calibrations[roomId] = {
    wallQuad: cloneQuad(wallQuad),
    placementPolygon: cloneNormalizedPolygon(placementPolygon),
  };
  saveCalibrationMap(calibrations);
}
