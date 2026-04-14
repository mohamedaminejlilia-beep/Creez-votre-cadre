import type { NormalizedPoint, NormalizedPolygon, NormalizedQuad } from './roomTemplates';

interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function cloneNormalizedPoint(point: NormalizedPoint): NormalizedPoint {
  return {
    x: clamp01(point.x),
    y: clamp01(point.y),
  };
}

export function cloneNormalizedPolygon(polygon: NormalizedPolygon): NormalizedPolygon {
  return polygon.map(cloneNormalizedPoint);
}

export function quadToPolygon(quad?: NormalizedQuad | null): NormalizedPolygon {
  return quad ? quad.map(cloneNormalizedPoint) : [];
}

export function normalizePolygonPoint(x: number, y: number): NormalizedPoint {
  return {
    x: clamp01(x),
    y: clamp01(y),
  };
}

export function isValidNormalizedPoint(value: unknown): value is NormalizedPoint {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { x?: unknown }).x === 'number' &&
    Number.isFinite((value as { x: number }).x) &&
    typeof (value as { y?: unknown }).y === 'number' &&
    Number.isFinite((value as { y: number }).y)
  );
}

export function isValidNormalizedPolygon(value: unknown): value is NormalizedPolygon {
  return Array.isArray(value) && value.every(isValidNormalizedPoint);
}

export function getPolygonPointsAttribute(polygon: NormalizedPolygon, scale = 100) {
  return polygon.map((point) => `${point.x * scale},${point.y * scale}`).join(' ');
}

export function getNormalizedPolygonBounds(polygon?: NormalizedPolygon | null) {
  if (!polygon || polygon.length === 0) {
    return null;
  }

  const xs = polygon.map((point) => point.x);
  const ys = polygon.map((point) => point.y);

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

function isPointInsidePolygon(point: NormalizedPoint, polygon: NormalizedPolygon) {
  if (polygon.length < 3) {
    return false;
  }

  let isInside = false;

  for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index, index += 1) {
    const current = polygon[index];
    const previous = polygon[previousIndex];
    const intersects =
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) /
          ((previous.y - current.y) || Number.EPSILON) +
          current.x;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function isPointInsideRect(point: NormalizedPoint, rect: RectLike) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function getRectSamplePoints(rect: RectLike): NormalizedPoint[] {
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;
  const centerX = left + rect.width / 2;
  const centerY = top + rect.height / 2;

  return [
    { x: left, y: top },
    { x: centerX, y: top },
    { x: right, y: top },
    { x: left, y: centerY },
    { x: centerX, y: centerY },
    { x: right, y: centerY },
    { x: left, y: bottom },
    { x: centerX, y: bottom },
    { x: right, y: bottom },
  ];
}

function orientation(a: NormalizedPoint, b: NormalizedPoint, c: NormalizedPoint) {
  const value = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  if (Math.abs(value) < 1e-9) {
    return 0;
  }

  return value > 0 ? 1 : 2;
}

function isPointOnSegment(a: NormalizedPoint, b: NormalizedPoint, c: NormalizedPoint) {
  return (
    b.x <= Math.max(a.x, c.x) + 1e-9 &&
    b.x + 1e-9 >= Math.min(a.x, c.x) &&
    b.y <= Math.max(a.y, c.y) + 1e-9 &&
    b.y + 1e-9 >= Math.min(a.y, c.y)
  );
}

function doSegmentsIntersect(
  p1: NormalizedPoint,
  q1: NormalizedPoint,
  p2: NormalizedPoint,
  q2: NormalizedPoint,
) {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  if (o1 === 0 && isPointOnSegment(p1, p2, q1)) return true;
  if (o2 === 0 && isPointOnSegment(p1, q2, q1)) return true;
  if (o3 === 0 && isPointOnSegment(p2, p1, q2)) return true;
  if (o4 === 0 && isPointOnSegment(p2, q1, q2)) return true;

  return false;
}

function getPolygonEdges(polygon: NormalizedPolygon) {
  if (polygon.length < 2) {
    return [];
  }

  return polygon.map((point, index) => {
    const nextPoint = polygon[(index + 1) % polygon.length];
    return [point, nextPoint] as const;
  });
}

function doesPolygonIntersectRect(rect: RectLike, polygon: NormalizedPolygon) {
  if (polygon.length < 3) {
    return false;
  }

  const rectPoints: NormalizedPolygon = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];
  const rectEdges = getPolygonEdges(rectPoints);
  const polygonEdges = getPolygonEdges(polygon);

  if (getRectSamplePoints(rect).some((point) => isPointInsidePolygon(point, polygon))) {
    return true;
  }

  if (polygon.some((point) => isPointInsideRect(point, rect))) {
    return true;
  }

  return polygonEdges.some(([a, b]) =>
    rectEdges.some(([c, d]) => doSegmentsIntersect(a, b, c, d)),
  );
}

export function isRectAllowedInCalibration(
  rect: RectLike,
  wallPolygon: NormalizedPolygon,
  allowedPolygon?: NormalizedPolygon | null,
) {
  const wall = wallPolygon.length >= 3 ? wallPolygon : [];
  const allowed = allowedPolygon && allowedPolygon.length >= 3 ? allowedPolygon : [];

  if (wall.length >= 3) {
    const isInsideWall = getRectSamplePoints(rect).every((point) => isPointInsidePolygon(point, wall));
    if (!isInsideWall) {
      return false;
    }
  }

  if (allowed.length >= 3) {
    const isInsideAllowed = getRectSamplePoints(rect).every((point) => isPointInsidePolygon(point, allowed));
    if (!isInsideAllowed) {
      return false;
    }
  }

  return true;
}
