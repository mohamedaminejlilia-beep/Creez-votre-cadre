import type { ArtworkCropPresetMap } from './artwork-crop';
import type { RoomArchetype } from './roomTemplates';

export type GalleryCompositionMode = 'single' | 'gallery-wall';

export type GalleryOrientation = 'portrait' | 'landscape' | 'square';
export type GallerySizeBand = 'small' | 'medium' | 'large';

export interface GalleryWallItem {
  id: string;
  label: string;
  artworkWidthCm: number;
  artworkHeightCm: number;
  artworkRatioMode: 'detected' | 'standard' | 'custom';
  artworkRatioWidth: number | null;
  artworkRatioHeight: number | null;
  selectedArtworkRatioId: string | null;
  uploadedArtworkUrl: string | null;
  uploadedArtworkName: string | null;
  uploadedArtworkPixelWidth: number | null;
  uploadedArtworkPixelHeight: number | null;
  uploadedArtworkCropX: number;
  uploadedArtworkCropY: number;
  uploadedArtworkCropScale: number;
  uploadedArtworkCropPresets: ArtworkCropPresetMap;
  customLayoutXcm: number | null;
  customLayoutYcm: number | null;
}

export interface GalleryLayoutSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  priority: 'hero' | 'secondary';
}

export type GalleryLayoutFamily =
  | 'perfect-pair'
  | 'classic-trio'
  | 'simple-grid'
  | 'centered-hero'
  | 'axis'
  | 'mondrian'
  | 'salon';

export interface GalleryLayoutTemplate {
  id: string;
  title: string;
  description: string;
  family: GalleryLayoutFamily;
  symmetry: 'symmetric' | 'balanced' | 'asymmetric';
  recommendedCounts: number[];
  preferredOrientations: GalleryOrientation[];
  preferredSizeBands: GallerySizeBand[];
  preferredRoomArchetypes: RoomArchetype[];
  slots: GalleryLayoutSlot[];
}

export interface GalleryLayoutRecommendation {
  template: GalleryLayoutTemplate;
  score: number;
  badge: 'Best match' | 'Balanced' | 'Flexible';
  reason: string;
}

export interface GalleryWallItemSize {
  widthCm: number;
  heightCm: number;
}

export interface GalleryWallCompositionSlot<TItem> {
  item: TItem;
  slot: GalleryLayoutSlot;
  xCm: number;
  yCm: number;
  widthCm: number;
  heightCm: number;
}

export interface GalleryWallCompositionLayout<TItem> {
  widthCm: number;
  heightCm: number;
  items: GalleryWallCompositionSlot<TItem>[];
}

export interface GalleryWallPreset {
  id: string;
  name: string;
  createdAt: string;
  compositionMode: GalleryCompositionMode;
  galleryItems: GalleryWallItem[];
  activeGalleryItemId: string | null;
  selectedGalleryLayoutId: string | null;
  gallerySpacingCm: number;
  frameStyle: string;
  matEnabled: boolean;
  matType: 'single' | 'double' | 'triple' | 'v_groove' | 'box' | 'multiple';
  matColor: string;
  matBottomColor: string;
  matMiddleColor: string;
  matThicknessCm: number;
  matTopThicknessCm: number;
  matMiddleThicknessCm: number;
  matBottomThicknessCm: number;
  matRevealCm: number;
  matRevealSecondCm: number;
  grooveEnabled: boolean;
  grooveOffsetCm: number;
  boxDepthCm: number;
  glazing: 'glass' | 'none';
}

export const MAX_GALLERY_WALL_ITEMS = 12;
export const DEFAULT_GALLERY_SPACING_CM = 5;
export const CUSTOM_GALLERY_LAYOUT_ID = 'custom-freeform';
export const CUSTOM_GALLERY_LAYOUT_CANVAS_WIDTH_CM = 140;
export const CUSTOM_GALLERY_LAYOUT_CANVAS_HEIGHT_CM = 100;
export const GALLERY_WALL_PRESETS_STORAGE_KEY = 'frame-configurator:gallery-wall-presets';

let galleryWallItemCounter = 0;

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function createAutoGridSlots(count: number): GalleryLayoutSlot[] {
  const normalizedCount = Math.max(1, Math.round(count));
  const columns = Math.max(1, Math.ceil(Math.sqrt(normalizedCount)));
  const rows = Math.max(1, Math.ceil(normalizedCount / columns));
  const usableWidth = 78;
  const usableHeight = 72;
  const startX = 11;
  const startY = 14;
  const gapX = columns > 1 ? 4 : 0;
  const gapY = rows > 1 ? 4 : 0;
  const slotWidth = (usableWidth - gapX * Math.max(0, columns - 1)) / columns;
  const slotHeight = (usableHeight - gapY * Math.max(0, rows - 1)) / rows;

  return Array.from({ length: normalizedCount }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      id: `auto-${index + 1}`,
      x: startX + column * (slotWidth + gapX) + slotWidth / 2,
      y: startY + row * (slotHeight + gapY) + slotHeight / 2,
      width: slotWidth,
      height: slotHeight,
      priority: 'secondary' as const,
    };
  });
}

function createAutoGridTemplate(count: number): GalleryLayoutTemplate {
  return {
    id: `auto-grid-${count}`,
    title: `${count}-Frame Grid`,
    description: `Auto-fit grid for ${count} framed pieces.`,
    family: 'simple-grid',
    symmetry: 'symmetric',
    recommendedCounts: [count],
    preferredOrientations: ['portrait', 'landscape', 'square'],
    preferredSizeBands: ['small', 'medium', 'large'],
    preferredRoomArchetypes: ['sofa-wall', 'bed-wall', 'desk-wall', 'accent-wall', 'hallway'],
    slots: createAutoGridSlots(count),
  };
}

function getLayoutTemplatesThatCanFit(count: number) {
  return GALLERY_LAYOUT_TEMPLATES.filter((template) => template.slots.length >= count);
}

function getSlotBounds(slot: GalleryLayoutSlot) {
  return {
    left: slot.x - slot.width / 2,
    right: slot.x + slot.width / 2,
    top: slot.y - slot.height / 2,
    bottom: slot.y + slot.height / 2,
    centerX: slot.x,
    centerY: slot.y,
  };
}

function getTemplateGapRequirements(
  slots: GalleryLayoutSlot[],
  spacingCm: number,
) {
  if (slots.length <= 1 || spacingCm <= 0) {
    return {
      widthCm: 0,
      heightCm: 0,
    };
  }

  const bounds = slots.map(getSlotBounds);
  let minHorizontalGapPct = Number.POSITIVE_INFINITY;
  let minVerticalGapPct = Number.POSITIVE_INFINITY;

  for (let i = 0; i < bounds.length; i += 1) {
    for (let j = i + 1; j < bounds.length; j += 1) {
      const a = bounds[i];
      const b = bounds[j];
      const rowTolerance = Math.max(slots[i].height, slots[j].height) * 0.45;
      const columnTolerance = Math.max(slots[i].width, slots[j].width) * 0.45;

      if (Math.abs(a.centerY - b.centerY) <= rowTolerance) {
        const horizontalGapPct =
          Math.max(a.left, b.left) - Math.min(a.right, b.right);
        if (horizontalGapPct > 0) {
          minHorizontalGapPct = Math.min(minHorizontalGapPct, horizontalGapPct);
        }
      }

      if (Math.abs(a.centerX - b.centerX) <= columnTolerance) {
        const verticalGapPct =
          Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom);
        if (verticalGapPct > 0) {
          minVerticalGapPct = Math.min(minVerticalGapPct, verticalGapPct);
        }
      }
    }
  }

  return {
    widthCm:
      Number.isFinite(minHorizontalGapPct) && minHorizontalGapPct > 0
        ? spacingCm / (minHorizontalGapPct / 100)
        : 0,
    heightCm:
      Number.isFinite(minVerticalGapPct) && minVerticalGapPct > 0
        ? spacingCm / (minVerticalGapPct / 100)
        : 0,
  };
}

function getTemplateGapUnits(slots: GalleryLayoutSlot[]) {
  if (slots.length <= 1) {
    return {
      horizontal: 0,
      vertical: 0,
    };
  }

  const bounds = slots.map(getSlotBounds);
  let minHorizontalGapUnits = Number.POSITIVE_INFINITY;
  let minVerticalGapUnits = Number.POSITIVE_INFINITY;

  for (let i = 0; i < bounds.length; i += 1) {
    for (let j = i + 1; j < bounds.length; j += 1) {
      const a = bounds[i];
      const b = bounds[j];
      const rowTolerance = Math.max(slots[i].height, slots[j].height) * 0.45;
      const columnTolerance = Math.max(slots[i].width, slots[j].width) * 0.45;

      if (Math.abs(a.centerY - b.centerY) <= rowTolerance) {
        const horizontalGapUnits =
          Math.max(a.left, b.left) - Math.min(a.right, b.right);
        if (horizontalGapUnits > 0) {
          minHorizontalGapUnits = Math.min(minHorizontalGapUnits, horizontalGapUnits);
        }
      }

      if (Math.abs(a.centerX - b.centerX) <= columnTolerance) {
        const verticalGapUnits =
          Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom);
        if (verticalGapUnits > 0) {
          minVerticalGapUnits = Math.min(minVerticalGapUnits, verticalGapUnits);
        }
      }
    }
  }

  return {
    horizontal:
      Number.isFinite(minHorizontalGapUnits) && minHorizontalGapUnits > 0
        ? minHorizontalGapUnits
        : 0,
    vertical:
      Number.isFinite(minVerticalGapUnits) && minVerticalGapUnits > 0
        ? minVerticalGapUnits
        : 0,
  };
}

function generateGalleryWallItemId() {
  galleryWallItemCounter += 1;
  return `gallery-item-${galleryWallItemCounter}`;
}

function getGalleryWallItemNumericId(id: string) {
  const match = /^gallery-item-(\d+)$/.exec(id);
  if (!match) {
    return null;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function syncGalleryWallItemCounter(items: Pick<GalleryWallItem, 'id'>[]) {
  const highestId = items.reduce((maxId, item) => {
    const numericId = getGalleryWallItemNumericId(item.id);
    return numericId !== null ? Math.max(maxId, numericId) : maxId;
  }, 0);

  galleryWallItemCounter = Math.max(galleryWallItemCounter, highestId);
}

function ensureUniqueGalleryWallItemIds<TItem extends GalleryWallItem>(items: TItem[]) {
  syncGalleryWallItemCounter(items);

  const seenIds = new Set<string>();

  return items.map((item) => {
    if (!item.id || seenIds.has(item.id)) {
      const nextId = generateGalleryWallItemId();
      seenIds.add(nextId);
      return {
        ...item,
        id: nextId,
      };
    }

    seenIds.add(item.id);
    return item;
  });
}

function getDefaultCustomLayoutPosition(index: number) {
  const column = index % 3;
  const row = Math.floor(index / 3);

  return {
    xCm: 16 + column * 38,
    yCm: 14 + row * 30,
  };
}

function normalizeItem(item: GalleryWallItem, index: number): GalleryWallItem {
  const fallbackPos = getDefaultCustomLayoutPosition(index);

  return {
    ...item,
    label: item.label || `Frame ${index + 1}`,
    artworkWidthCm: Math.max(1, safeNumber(item.artworkWidthCm, 30)),
    artworkHeightCm: Math.max(1, safeNumber(item.artworkHeightCm, 40)),
    uploadedArtworkCropX: safeNumber(item.uploadedArtworkCropX, 0.5),
    uploadedArtworkCropY: safeNumber(item.uploadedArtworkCropY, 0.5),
    uploadedArtworkCropScale: Math.max(0.1, safeNumber(item.uploadedArtworkCropScale, 1)),
    uploadedArtworkCropPresets: item.uploadedArtworkCropPresets ?? {},
    customLayoutXcm: item.customLayoutXcm ?? fallbackPos.xCm,
    customLayoutYcm: item.customLayoutYcm ?? fallbackPos.yCm,
  };
}

export function createGalleryWallItem(
  index: number,
  base: Partial<GalleryWallItem> & {
    artworkWidthCm?: number;
    artworkHeightCm?: number;
    artworkRatioMode?: 'detected' | 'standard' | 'custom';
  } = {},
): GalleryWallItem {
  const fallbackPos = getDefaultCustomLayoutPosition(index);

  return {
    id: generateGalleryWallItemId(),
    label: base.label ?? `Frame ${index + 1}`,
    artworkWidthCm: Math.max(1, safeNumber(base.artworkWidthCm, 30)),
    artworkHeightCm: Math.max(1, safeNumber(base.artworkHeightCm, 40)),
    artworkRatioMode: base.artworkRatioMode ?? 'detected',
    artworkRatioWidth: base.artworkRatioWidth ?? null,
    artworkRatioHeight: base.artworkRatioHeight ?? null,
    selectedArtworkRatioId: base.selectedArtworkRatioId ?? null,
    uploadedArtworkUrl: base.uploadedArtworkUrl ?? null,
    uploadedArtworkName: base.uploadedArtworkName ?? null,
    uploadedArtworkPixelWidth: base.uploadedArtworkPixelWidth ?? null,
    uploadedArtworkPixelHeight: base.uploadedArtworkPixelHeight ?? null,
    uploadedArtworkCropX: safeNumber(base.uploadedArtworkCropX, 0.5),
    uploadedArtworkCropY: safeNumber(base.uploadedArtworkCropY, 0.5),
    uploadedArtworkCropScale: Math.max(0.1, safeNumber(base.uploadedArtworkCropScale, 1)),
    uploadedArtworkCropPresets: base.uploadedArtworkCropPresets ?? {},
    customLayoutXcm: base.customLayoutXcm ?? fallbackPos.xCm,
    customLayoutYcm: base.customLayoutYcm ?? fallbackPos.yCm,
  };
}

export function getActiveGalleryWallItem(
  items: GalleryWallItem[],
  activeId: string | null,
) {
  if (!items.length) {
    return null;
  }

  const normalized = ensureUniqueGalleryWallItemIds(items).map(normalizeItem);
  const found = normalized.find((i) => i.id === activeId);
  return found ?? normalized[0];
}

export function updateGalleryWallItem<TItem extends GalleryWallItem>(
  items: TItem[],
  itemId: string,
  updates: Partial<TItem>,
): TItem[] {
  return ensureUniqueGalleryWallItemIds(items).map((item, index) =>
    item.id === itemId
      ? ({
          ...normalizeItem(item, index),
          ...updates,
          id: item.id,
          label: updates.label ?? item.label ?? `Frame ${index + 1}`,
        } as TItem)
      : (normalizeItem(item, index) as TItem),
  );
}

export function addGalleryWallItem(
  items: GalleryWallItem[],
  base: Partial<GalleryWallItem>,
): GalleryWallItem[] {
  if (items.length >= MAX_GALLERY_WALL_ITEMS) {
    return items;
  }

  const normalized = ensureUniqueGalleryWallItemIds(items).map(normalizeItem);
  const newItem = createGalleryWallItem(normalized.length, base);
  return [...normalized, newItem];
}

export function removeGalleryWallItem(items: GalleryWallItem[]) {
  const normalized = ensureUniqueGalleryWallItemIds(items).map(normalizeItem);
  if (normalized.length <= 2) {
    return normalized;
  }

  return normalized.slice(0, -1).map((item, index) => ({
    ...item,
    label: `Frame ${index + 1}`,
  }));
}

export function moveGalleryWallItem(
  items: GalleryWallItem[],
  id: string,
  direction: 'left' | 'right',
) {
  const normalized = ensureUniqueGalleryWallItemIds(items).map(normalizeItem);
  const index = normalized.findIndex((i) => i.id === id);
  if (index === -1) {
    return normalized;
  }

  const newIndex = direction === 'left' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= normalized.length) {
    return normalized;
  }

  const newItems = [...normalized];
  const temp = newItems[index];
  newItems[index] = newItems[newIndex];
  newItems[newIndex] = temp;

  return newItems.map((item, i) => ({
    ...item,
    label: `Frame ${i + 1}`,
  }));
}

export function swapGalleryWallItems(
  items: GalleryWallItem[],
  sourceItemId: string,
  targetItemId: string,
) {
  const normalized = ensureUniqueGalleryWallItemIds(items).map(normalizeItem);
  const sourceIndex = normalized.findIndex((item) => item.id === sourceItemId);
  const targetIndex = normalized.findIndex((item) => item.id === targetItemId);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return normalized;
  }

  const nextItems = [...normalized];
  const temp = nextItems[sourceIndex];
  nextItems[sourceIndex] = nextItems[targetIndex];
  nextItems[targetIndex] = temp;

  return nextItems.map((item, index) => ({
    ...item,
    label: `Frame ${index + 1}`,
  }));
}

export function duplicateGalleryWallItem(
  items: GalleryWallItem[],
  id: string,
) {
  const normalized = ensureUniqueGalleryWallItemIds(items).map(normalizeItem);
  const item = normalized.find((i) => i.id === id);
  if (!item || normalized.length >= MAX_GALLERY_WALL_ITEMS) {
    return normalized;
  }

  const duplicated: GalleryWallItem = {
    ...item,
    id: generateGalleryWallItemId(),
    label: `${item.label} Copy`,
    customLayoutXcm: safeNumber(item.customLayoutXcm, 0) + 6,
    customLayoutYcm: safeNumber(item.customLayoutYcm, 0) + 6,
  };

  const index = normalized.findIndex((i) => i.id === id);
  const newItems = [...normalized];
  newItems.splice(index + 1, 0, duplicated);

  return newItems.map((entry, i) => ({
    ...entry,
    label: `Frame ${i + 1}`,
  }));
}

export function syncGalleryWallItems(
  compositionMode: GalleryCompositionMode,
  items: GalleryWallItem[],
  seed: Partial<GalleryWallItem>,
): GalleryWallItem[] {
  let normalized = ensureUniqueGalleryWallItemIds(items).map(normalizeItem);

  if (normalized.length === 0) {
    normalized = [createGalleryWallItem(0, seed)];
  }

  if (compositionMode === 'gallery-wall' && normalized.length < 2) {
    normalized = addGalleryWallItem(normalized, normalized[0] ?? seed);
  }

  return normalized.map((item, index) => ({
    ...item,
    label: `Frame ${index + 1}`,
  }));
}

export const GALLERY_LAYOUT_TEMPLATES: GalleryLayoutTemplate[] = [
  {
    id: 'pair-horizontal',
    title: 'Perfect Pair',
    description: 'Two equal frames in a clean horizontal balance.',
    family: 'perfect-pair',
    symmetry: 'symmetric',
    recommendedCounts: [2],
    preferredOrientations: ['landscape', 'square'],
    preferredSizeBands: ['small', 'medium', 'large'],
    preferredRoomArchetypes: ['sofa-wall', 'desk-wall', 'accent-wall'],
    slots: [
      { id: 'a', x: 10, y: 24, width: 36, height: 52, priority: 'secondary' },
      { id: 'b', x: 54, y: 24, width: 36, height: 52, priority: 'secondary' },
    ],
  },
  {
    id: 'trio-row',
    title: 'Classic Trio',
    description: 'Three frames aligned in a calm horizontal row.',
    family: 'classic-trio',
    symmetry: 'symmetric',
    recommendedCounts: [3],
    preferredOrientations: ['landscape', 'square'],
    preferredSizeBands: ['small', 'medium'],
    preferredRoomArchetypes: ['sofa-wall', 'bed-wall', 'desk-wall'],
    slots: [
      { id: 'a', x: 6, y: 28, width: 26, height: 44, priority: 'secondary' },
      { id: 'b', x: 37, y: 20, width: 26, height: 52, priority: 'hero' },
      { id: 'c', x: 68, y: 28, width: 26, height: 44, priority: 'secondary' },
    ],
  },
  {
    id: 'grid-2x2',
    title: 'Simple Grid',
    description: 'A strong 2 by 2 layout for equal pieces.',
    family: 'simple-grid',
    symmetry: 'symmetric',
    recommendedCounts: [4],
    preferredOrientations: ['square', 'portrait', 'landscape'],
    preferredSizeBands: ['small', 'medium'],
    preferredRoomArchetypes: ['sofa-wall', 'bed-wall', 'desk-wall'],
    slots: [
      { id: 'a', x: 18, y: 12, width: 28, height: 34, priority: 'secondary' },
      { id: 'b', x: 54, y: 12, width: 28, height: 34, priority: 'secondary' },
      { id: 'c', x: 18, y: 54, width: 28, height: 34, priority: 'secondary' },
      { id: 'd', x: 54, y: 54, width: 28, height: 34, priority: 'secondary' },
    ],
  },
  {
    id: 'centered-hero-five',
    title: 'Centered Hero',
    description: 'One dominant frame with four supporting pieces around it.',
    family: 'centered-hero',
    symmetry: 'symmetric',
    recommendedCounts: [5],
    preferredOrientations: ['portrait', 'square'],
    preferredSizeBands: ['medium', 'large'],
    preferredRoomArchetypes: ['sofa-wall', 'bed-wall', 'desk-wall'],
    slots: [
      { id: 'a', x: 6, y: 18, width: 18, height: 24, priority: 'secondary' },
      { id: 'b', x: 6, y: 50, width: 18, height: 24, priority: 'secondary' },
      { id: 'c', x: 30, y: 14, width: 40, height: 60, priority: 'hero' },
      { id: 'd', x: 76, y: 18, width: 18, height: 24, priority: 'secondary' },
      { id: 'e', x: 76, y: 50, width: 18, height: 24, priority: 'secondary' },
    ],
  },
  {
    id: 'grid-3x2',
    title: 'The Grid',
    description: 'Six frames in a crisp two-row layout.',
    family: 'simple-grid',
    symmetry: 'symmetric',
    recommendedCounts: [6],
    preferredOrientations: ['square', 'portrait', 'landscape'],
    preferredSizeBands: ['small', 'medium'],
    preferredRoomArchetypes: ['sofa-wall', 'bed-wall', 'desk-wall'],
    slots: [
      { id: 'a', x: 6, y: 14, width: 24, height: 28, priority: 'secondary' },
      { id: 'b', x: 38, y: 14, width: 24, height: 28, priority: 'secondary' },
      { id: 'c', x: 70, y: 14, width: 24, height: 28, priority: 'secondary' },
      { id: 'd', x: 6, y: 54, width: 24, height: 28, priority: 'secondary' },
      { id: 'e', x: 38, y: 54, width: 24, height: 28, priority: 'secondary' },
      { id: 'f', x: 70, y: 54, width: 24, height: 28, priority: 'secondary' },
    ],
  },
  {
    id: 'grid-3x3',
    title: 'Gallery Grid',
    description: 'Nine pieces aligned into a clean museum-style matrix.',
    family: 'simple-grid',
    symmetry: 'symmetric',
    recommendedCounts: [9],
    preferredOrientations: ['portrait', 'landscape', 'square'],
    preferredSizeBands: ['small', 'medium'],
    preferredRoomArchetypes: ['sofa-wall', 'bed-wall', 'desk-wall', 'accent-wall'],
    slots: [
      { id: 'a', x: 16, y: 16, width: 18, height: 22, priority: 'secondary' },
      { id: 'b', x: 50, y: 16, width: 18, height: 22, priority: 'secondary' },
      { id: 'c', x: 84, y: 16, width: 18, height: 22, priority: 'secondary' },
      { id: 'd', x: 16, y: 50, width: 18, height: 22, priority: 'secondary' },
      { id: 'e', x: 50, y: 50, width: 18, height: 22, priority: 'secondary' },
      { id: 'f', x: 84, y: 50, width: 18, height: 22, priority: 'secondary' },
      { id: 'g', x: 16, y: 84, width: 18, height: 22, priority: 'secondary' },
      { id: 'h', x: 50, y: 84, width: 18, height: 22, priority: 'secondary' },
      { id: 'i', x: 84, y: 84, width: 18, height: 22, priority: 'secondary' },
    ],
  },
  {
    id: 'grid-5x2',
    title: 'Wide Ten Grid',
    description: 'Ten frames in a clean two-row mural layout.',
    family: 'simple-grid',
    symmetry: 'symmetric',
    recommendedCounts: [10],
    preferredOrientations: ['portrait', 'landscape', 'square'],
    preferredSizeBands: ['small', 'medium'],
    preferredRoomArchetypes: ['sofa-wall', 'bed-wall', 'accent-wall', 'desk-wall'],
    slots: [
      { id: 'a', x: 12, y: 28, width: 14, height: 24, priority: 'secondary' },
      { id: 'b', x: 31, y: 28, width: 14, height: 24, priority: 'secondary' },
      { id: 'c', x: 50, y: 28, width: 14, height: 24, priority: 'secondary' },
      { id: 'd', x: 69, y: 28, width: 14, height: 24, priority: 'secondary' },
      { id: 'e', x: 88, y: 28, width: 14, height: 24, priority: 'secondary' },
      { id: 'f', x: 12, y: 68, width: 14, height: 24, priority: 'secondary' },
      { id: 'g', x: 31, y: 68, width: 14, height: 24, priority: 'secondary' },
      { id: 'h', x: 50, y: 68, width: 14, height: 24, priority: 'secondary' },
      { id: 'i', x: 69, y: 68, width: 14, height: 24, priority: 'secondary' },
      { id: 'j', x: 88, y: 68, width: 14, height: 24, priority: 'secondary' },
    ],
  },
];

export function getGalleryLayoutTemplateById(layoutId: string | null) {
  if (!layoutId) {
    return null;
  }
  return GALLERY_LAYOUT_TEMPLATES.find((template) => template.id === layoutId) ?? null;
}

function getOrientation(widthCm: number, heightCm: number): GalleryOrientation {
  const ratio = widthCm / Math.max(heightCm, 0.1);
  if (ratio > 1.15) return 'landscape';
  if (ratio < 0.85) return 'portrait';
  return 'square';
}

function getSizeBand(widthCm: number, heightCm: number): GallerySizeBand {
  const dominantSide = Math.max(widthCm, heightCm);
  if (dominantSide <= 45) return 'small';
  if (dominantSide <= 85) return 'medium';
  return 'large';
}

function scoreLayoutTemplate(
  template: GalleryLayoutTemplate,
  items: GalleryWallItem[],
  roomArchetype?: RoomArchetype,
): number {
  const count = items.length;
  const orientations = items.map((item) => getOrientation(item.artworkWidthCm, item.artworkHeightCm));
  const sizeBands = items.map((item) => getSizeBand(item.artworkWidthCm, item.artworkHeightCm));

  let score = 0;

  if (template.slots.length < count) {
    return Number.NEGATIVE_INFINITY;
  }

  if (template.recommendedCounts.includes(count)) score += 50;
  else score -= Math.abs((template.recommendedCounts[0] ?? count) - count) * 10;

  orientations.forEach((orientation) => {
    if (template.preferredOrientations.includes(orientation)) score += 6;
  });

  sizeBands.forEach((sizeBand) => {
    if (template.preferredSizeBands.includes(sizeBand)) score += 4;
  });

  if (roomArchetype && template.preferredRoomArchetypes.includes(roomArchetype)) {
    score += 12;
  }

  return score;
}

export function getGalleryLayoutRecommendations(
  items: GalleryWallItem[],
  options?: { roomArchetype?: RoomArchetype },
): GalleryLayoutRecommendation[] {
  const normalized = ensureUniqueGalleryWallItemIds(items).map(normalizeItem);
  const exactEligible = GALLERY_LAYOUT_TEMPLATES.filter((template) =>
    template.slots.length >= normalized.length &&
    template.recommendedCounts.includes(normalized.length),
  );
  const capacityEligible = getLayoutTemplatesThatCanFit(normalized.length);
  const source = exactEligible.length
    ? exactEligible
    : capacityEligible.length
      ? capacityEligible
      : [createAutoGridTemplate(normalized.length)];

  return source
    .map((template, index) => {
      const score = scoreLayoutTemplate(template, normalized, options?.roomArchetype);
      const badge: GalleryLayoutRecommendation['badge'] =
        index === 0 ? 'Best match' : index === 1 ? 'Balanced' : 'Flexible';

      return {
        template,
        score,
        badge,
        reason:
          badge === 'Best match'
            ? 'Fits your current frame count and proportions well.'
            : badge === 'Balanced'
              ? 'A clean balanced option for this set.'
              : 'A flexible alternative if you want a different feel.',
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      badge: index === 0 ? 'Best match' : index === 1 ? 'Balanced' : 'Flexible',
    }));
}

export function assignGalleryWallItemToSlot(
  items: GalleryWallItem[],
  itemId: string,
  slotIndex: number,
) {
  const normalized = ensureUniqueGalleryWallItemIds(items).map(normalizeItem);
  const currentIndex = normalized.findIndex((item) => item.id === itemId);
  if (currentIndex === -1 || slotIndex < 0 || slotIndex >= normalized.length) {
    return normalized;
  }

  const nextItems = [...normalized];
  const [moved] = nextItems.splice(currentIndex, 1);
  nextItems.splice(slotIndex, 0, moved);

  return nextItems.map((item, index) => ({
    ...item,
    label: `Frame ${index + 1}`,
  }));
}

export function getGalleryWallCompositionLayout<TItem extends GalleryWallItem>(
  selectedLayoutId: string | null,
  items: TItem[],
  gallerySpacingCm: number,
  getItemSize: (item: TItem) => GalleryWallItemSize,
): GalleryWallCompositionLayout<TItem> | null {
  const normalized = ensureUniqueGalleryWallItemIds(items).map((item, index) =>
    normalizeItem(item, index),
  ) as TItem[];

  if (!normalized.length) {
    return null;
  }

  if (selectedLayoutId === CUSTOM_GALLERY_LAYOUT_ID) {
    const placedItems = normalized.map((item, index) => {
      const size = getItemSize(item);
      const fallbackPos = getDefaultCustomLayoutPosition(index);

      return {
        item,
        slot: {
          id: item.id,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          priority: 'secondary' as const,
        },
        xCm: item.customLayoutXcm ?? fallbackPos.xCm,
        yCm: item.customLayoutYcm ?? fallbackPos.yCm,
        widthCm: Math.max(1, safeNumber(size.widthCm, 30)),
        heightCm: Math.max(1, safeNumber(size.heightCm, 40)),
      };
    });

    const maxX = Math.max(...placedItems.map((item) => item.xCm + item.widthCm));
    const maxY = Math.max(...placedItems.map((item) => item.yCm + item.heightCm));

    return {
      widthCm: Math.max(1, maxX),
      heightCm: Math.max(1, maxY),
      items: placedItems,
    };
  }

  const selectedTemplate = getGalleryLayoutTemplateById(selectedLayoutId);
  const template =
    (selectedTemplate && selectedTemplate.slots.length >= normalized.length
      ? selectedTemplate
      : null) ??
    getGalleryLayoutRecommendations(normalized)[0]?.template ??
    createAutoGridTemplate(normalized.length);

  if (!template) {
    return null;
  }

  const activeSlots = template.slots.slice(0, normalized.length);
  if (activeSlots.length < normalized.length) {
    return null;
  }

  const measured = normalized.map((item) => {
    const size = getItemSize(item);
    return {
      item,
      widthCm: Math.max(1, safeNumber(size.widthCm, 30)),
      heightCm: Math.max(1, safeNumber(size.heightCm, 40)),
    };
  });

  const spacing = Math.max(0, safeNumber(gallerySpacingCm, DEFAULT_GALLERY_SPACING_CM));
  const slotBounds = activeSlots.map(getSlotBounds);
  const templateBounds = {
    left: Math.min(...slotBounds.map((slot) => slot.left)),
    right: Math.max(...slotBounds.map((slot) => slot.right)),
    top: Math.min(...slotBounds.map((slot) => slot.top)),
    bottom: Math.max(...slotBounds.map((slot) => slot.bottom)),
  };
  const gapUnits = getTemplateGapUnits(activeSlots);
  const unitScaleFromItems = Math.max(
    ...activeSlots.map((slot, index) =>
      Math.max(
        measured[index].widthCm / Math.max(slot.width, 0.01),
        measured[index].heightCm / Math.max(slot.height, 0.01),
      ),
    ),
  );
  const unitScaleFromSpacing = Math.max(
    gapUnits.horizontal > 0 ? spacing / gapUnits.horizontal : 0,
    gapUnits.vertical > 0 ? spacing / gapUnits.vertical : 0,
  );
  const unitScale = Math.max(unitScaleFromItems, unitScaleFromSpacing, 0.1);
  const boardWidth = Math.max(1, (templateBounds.right - templateBounds.left) * unitScale);
  const boardHeight = Math.max(1, (templateBounds.bottom - templateBounds.top) * unitScale);

  const itemsOut: GalleryWallCompositionSlot<TItem>[] = activeSlots.map((slot, index) => {
    const measuredItem = measured[index];
    const widthCm = measuredItem.widthCm;
    const heightCm = measuredItem.heightCm;
    const scaledSlotLeft = (slot.x - slot.width / 2 - templateBounds.left) * unitScale;
    const scaledSlotTop = (slot.y - slot.height / 2 - templateBounds.top) * unitScale;
    const scaledSlotWidth = slot.width * unitScale;
    const scaledSlotHeight = slot.height * unitScale;

    return {
      item: measuredItem.item,
      slot,
      widthCm,
      heightCm,
      xCm: scaledSlotLeft + Math.max(0, (scaledSlotWidth - widthCm) / 2),
      yCm: scaledSlotTop + Math.max(0, (scaledSlotHeight - heightCm) / 2),
    };
  });

  const minX = Math.min(...itemsOut.map((item) => item.xCm));
  const minY = Math.min(...itemsOut.map((item) => item.yCm));
  const maxX = Math.max(...itemsOut.map((item) => item.xCm + item.widthCm));
  const maxY = Math.max(...itemsOut.map((item) => item.yCm + item.heightCm));

  return {
    widthCm: Math.max(1, maxX - minX),
    heightCm: Math.max(1, maxY - minY),
    items: itemsOut.map((entry) => ({
      ...entry,
      xCm: entry.xCm - minX,
      yCm: entry.yCm - minY,
    })),
  };
}

export function getGalleryWallCustomCanvasLayout<TItem extends GalleryWallItem>(
  items: TItem[],
  getItemSize: (item: TItem) => GalleryWallItemSize,
): GalleryWallCompositionLayout<TItem> | null {
  const normalized = ensureUniqueGalleryWallItemIds(items).map((item, index) =>
    normalizeItem(item, index),
  ) as TItem[];

  if (!normalized.length) {
    return null;
  }

  const placed = normalized.map((item, index) => {
    const size = getItemSize(item);
    const fallbackPos = getDefaultCustomLayoutPosition(index);

    return {
      item,
      slot: {
        id: item.id,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        priority: 'secondary' as const,
      },
      xCm: item.customLayoutXcm ?? fallbackPos.xCm,
      yCm: item.customLayoutYcm ?? fallbackPos.yCm,
      widthCm: Math.max(1, safeNumber(size.widthCm, 30)),
      heightCm: Math.max(1, safeNumber(size.heightCm, 40)),
    };
  });

  return {
    widthCm: CUSTOM_GALLERY_LAYOUT_CANVAS_WIDTH_CM,
    heightCm: CUSTOM_GALLERY_LAYOUT_CANVAS_HEIGHT_CM,
    items: placed,
  };
}

export function getGalleryWallCustomBounds<TItem extends GalleryWallItem>(
  items: TItem[],
  getItemSize: (item: TItem) => GalleryWallItemSize,
) {
  const normalized = ensureUniqueGalleryWallItemIds(items).map((item, index) =>
    normalizeItem(item, index),
  ) as TItem[];

  if (!normalized.length) {
    return null;
  }

  const lefts: number[] = [];
  const tops: number[] = [];
  const rights: number[] = [];
  const bottoms: number[] = [];

  normalized.forEach((item, index) => {
    const size = getItemSize(item);
    const fallbackPos = getDefaultCustomLayoutPosition(index);
    const x = item.customLayoutXcm ?? fallbackPos.xCm;
    const y = item.customLayoutYcm ?? fallbackPos.yCm;
    const w = Math.max(1, safeNumber(size.widthCm, 30));
    const h = Math.max(1, safeNumber(size.heightCm, 40));

    lefts.push(x);
    tops.push(y);
    rights.push(x + w);
    bottoms.push(y + h);
  });

  return {
    minLeftCm: Math.min(...lefts),
    minTopCm: Math.min(...tops),
    maxRightCm: Math.max(...rights),
    maxBottomCm: Math.max(...bottoms),
    widthCm: Math.max(...rights) - Math.min(...lefts),
    heightCm: Math.max(...bottoms) - Math.min(...tops),
  };
}

function boxesOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function doesGalleryWallItemOverlap<TItem extends GalleryWallItem>(
  items: TItem[],
  movingItemId: string,
  nextXcm: number,
  nextYcm: number,
  getItemSize: (item: TItem) => GalleryWallItemSize,
) {
  const normalized = ensureUniqueGalleryWallItemIds(items).map((item, index) =>
    normalizeItem(item, index),
  ) as TItem[];

  const movingItem = normalized.find((item) => item.id === movingItemId);
  if (!movingItem) {
    return false;
  }

  const movingSize = getItemSize(movingItem);
  const movingWidth = Math.max(1, safeNumber(movingSize.widthCm, 30));
  const movingHeight = Math.max(1, safeNumber(movingSize.heightCm, 40));

  return normalized.some((item, index) => {
    if (item.id === movingItemId) {
      return false;
    }

    const size = getItemSize(item);
    const fallbackPos = getDefaultCustomLayoutPosition(index);
    const x = item.customLayoutXcm ?? fallbackPos.xCm;
    const y = item.customLayoutYcm ?? fallbackPos.yCm;
    const width = Math.max(1, safeNumber(size.widthCm, 30));
    const height = Math.max(1, safeNumber(size.heightCm, 40));

    return boxesOverlap(
      nextXcm,
      nextYcm,
      movingWidth,
      movingHeight,
      x,
      y,
      width,
      height,
    );
  });
}

export function updateGalleryWallItemCustomPosition<TItem extends GalleryWallItem>(
  items: TItem[],
  itemId: string,
  xCm: number,
  yCm: number,
) {
  return ensureUniqueGalleryWallItemIds(items).map((item, index) =>
    item.id === itemId
      ? {
          ...normalizeItem(item, index),
          customLayoutXcm: safeNumber(xCm, 0),
          customLayoutYcm: safeNumber(yCm, 0),
        }
      : normalizeItem(item, index),
  ) as TItem[];
}

export function updateGalleryWallItemCustomPositionWithoutOverlap<TItem extends GalleryWallItem>(
  items: TItem[],
  itemId: string,
  xCm: number,
  yCm: number,
  getItemSize: (item: TItem) => GalleryWallItemSize,
) {
  if (doesGalleryWallItemOverlap(items, itemId, xCm, yCm, getItemSize)) {
    return ensureUniqueGalleryWallItemIds(items).map((item, index) =>
      normalizeItem(item, index),
    ) as TItem[];
  }

  return updateGalleryWallItemCustomPosition(items, itemId, xCm, yCm);
}

export function offsetGalleryWallCustomPositions<TItem extends GalleryWallItem>(
  items: TItem[],
  deltaXcm: number,
  deltaYcm: number,
  getItemSize?: (item: TItem) => GalleryWallItemSize,
) {
  const normalized = ensureUniqueGalleryWallItemIds(items).map((item, index) =>
    normalizeItem(item, index),
  ) as TItem[];

  const shifted = normalized.map((item, index) => {
    const fallbackPos = getDefaultCustomLayoutPosition(index);
    return {
      ...item,
      customLayoutXcm: (item.customLayoutXcm ?? fallbackPos.xCm) + safeNumber(deltaXcm, 0),
      customLayoutYcm: (item.customLayoutYcm ?? fallbackPos.yCm) + safeNumber(deltaYcm, 0),
    };
  });

  if (!getItemSize) {
    return shifted;
  }

  const bounds = getGalleryWallCustomBounds(shifted, getItemSize);
  if (!bounds) {
    return shifted;
  }

  let correctionX = 0;
  let correctionY = 0;

  if (bounds.minLeftCm < 0) correctionX = -bounds.minLeftCm;
  if (bounds.minTopCm < 0) correctionY = -bounds.minTopCm;
  if (bounds.maxRightCm > CUSTOM_GALLERY_LAYOUT_CANVAS_WIDTH_CM) {
    correctionX = CUSTOM_GALLERY_LAYOUT_CANVAS_WIDTH_CM - bounds.maxRightCm;
  }
  if (bounds.maxBottomCm > CUSTOM_GALLERY_LAYOUT_CANVAS_HEIGHT_CM) {
    correctionY = CUSTOM_GALLERY_LAYOUT_CANVAS_HEIGHT_CM - bounds.maxBottomCm;
  }

  if (correctionX === 0 && correctionY === 0) {
    return shifted;
  }

  return shifted.map((item) => ({
    ...item,
    customLayoutXcm: safeNumber(item.customLayoutXcm, 0) + correctionX,
    customLayoutYcm: safeNumber(item.customLayoutYcm, 0) + correctionY,
  }));
}

export function convertGalleryWallItemsToCustomLayout<TItem extends GalleryWallItem>(
  items: TItem[],
  selectedLayoutId: string | null,
  gallerySpacingCm: number,
  getItemSize: (item: TItem) => GalleryWallItemSize,
) {
  const composition = getGalleryWallCompositionLayout(
    selectedLayoutId,
    items,
    gallerySpacingCm,
    getItemSize,
  );

  const normalized = ensureUniqueGalleryWallItemIds(items).map((item, index) =>
    normalizeItem(item, index),
  ) as TItem[];

  if (!composition) {
    return normalized;
  }

  const startX = 12;
  const startY = 10;

  return normalized.map((item) => {
    const match = composition.items.find((entry) => entry.item.id === item.id);
    if (!match) {
      return item;
    }

    return {
      ...item,
      customLayoutXcm: startX + match.xCm,
      customLayoutYcm: startY + match.yCm,
    };
  });
}

export function evenOutGalleryWallCustomSpacing<TItem extends GalleryWallItem>(
  items: TItem[],
  gallerySpacingCm: number,
  getItemSize: (item: TItem) => GalleryWallItemSize,
) {
  const normalized = ensureUniqueGalleryWallItemIds(items).map((item, index) =>
    normalizeItem(item, index),
  ) as TItem[];

  if (!normalized.length) {
    return normalized;
  }

  const spacing = Math.max(0, safeNumber(gallerySpacingCm, DEFAULT_GALLERY_SPACING_CM));
  const rowY = 14;
  let currentX = 16;

  return normalized.map((item) => {
    const size = getItemSize(item);
    const width = Math.max(1, safeNumber(size.widthCm, 30));

    const nextItem = {
      ...item,
      customLayoutXcm: currentX,
      customLayoutYcm: rowY,
    };

    currentX += width + spacing;
    return nextItem;
  });
}
