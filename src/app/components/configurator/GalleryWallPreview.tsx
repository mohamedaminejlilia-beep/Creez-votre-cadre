import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CUSTOM_GALLERY_LAYOUT_ID,
  getGalleryLayoutTemplateById,
  getGalleryWallCustomCanvasLayout,
  type GalleryWallItem,
} from './gallery-wall';

interface GalleryWallPreviewProps {
  selectedLayoutId: string | null;
  items: GalleryWallItem[];
  activeItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onSwapItems: (sourceItemId: string, targetItemId: string) => void;
  onMoveCustomItem: (itemId: string, xCm: number, yCm: number) => void;
  onMoveAllCustomItems: (deltaXcm: number, deltaYcm: number) => void;
  getFrameOuterSize: (item: GalleryWallItem) => {
    widthCm: number;
    heightCm: number;
  };
  getFrameIntrinsicSize: (item: GalleryWallItem) => {
    width: number;
    height: number;
  };
  renderFrameContent: (item: GalleryWallItem) => ReactNode;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function GalleryWallPreview({
  selectedLayoutId,
  items,
  activeItemId,
  onSelectItem,
  onSwapItems,
  onMoveCustomItem,
  onMoveAllCustomItems,
  getFrameOuterSize,
  getFrameIntrinsicSize,
  renderFrameContent,
}: GalleryWallPreviewProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropTargetItemId, setDropTargetItemId] = useState<string | null>(null);
  const [customDragMode, setCustomDragMode] = useState<'item' | 'group'>('item');
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const boardRef = useRef<HTMLDivElement | null>(null);
  const customDragRef = useRef<{
    itemId: string;
    startX: number;
    startY: number;
    originXcm: number;
    originYcm: number;
    widthCm: number;
    heightCm: number;
  } | null>(null);
  const customGroupDragRef = useRef<{
    lastX: number;
    lastY: number;
  } | null>(null);
  const template = getGalleryLayoutTemplateById(selectedLayoutId);
  const isCustomLayout = selectedLayoutId === CUSTOM_GALLERY_LAYOUT_ID;
  const customCanvas = useMemo(
    () =>
      isCustomLayout ? getGalleryWallCustomCanvasLayout(items, getFrameOuterSize) : null,
    [getFrameOuterSize, isCustomLayout, items],
  );

  useEffect(() => {
    if (!boardRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? 0;
      const nextHeight = entries[0]?.contentRect.height ?? 0;
      setBoardSize({
        width: nextWidth,
        height: nextHeight,
      });
    });

    observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isCustomLayout || !customCanvas) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const boardRect = boardRef.current?.getBoundingClientRect();
      if (!boardRect || boardRect.width <= 0 || boardRect.height <= 0) {
        return;
      }

      const pixelsPerCmX = boardRect.width / customCanvas.widthCm;
      const pixelsPerCmY = boardRect.height / customCanvas.heightCm;
      const groupDrag = customGroupDragRef.current;

      if (groupDrag) {
        const deltaXcm = (event.clientX - groupDrag.lastX) / pixelsPerCmX;
        const deltaYcm = (event.clientY - groupDrag.lastY) / pixelsPerCmY;
        if (deltaXcm !== 0 || deltaYcm !== 0) {
          onMoveAllCustomItems(deltaXcm, deltaYcm);
          customGroupDragRef.current = {
            lastX: event.clientX,
            lastY: event.clientY,
          };
        }
        return;
      }

      const drag = customDragRef.current;
      if (!drag) {
        return;
      }
      const nextXcm = clamp(
        drag.originXcm + (event.clientX - drag.startX) / pixelsPerCmX,
        0,
        Number.POSITIVE_INFINITY,
      );
      const nextYcm = clamp(
        drag.originYcm + (event.clientY - drag.startY) / pixelsPerCmY,
        0,
        Number.POSITIVE_INFINITY,
      );

      onMoveCustomItem(drag.itemId, nextXcm, nextYcm);
    };

    const handlePointerUp = () => {
      customDragRef.current = null;
      customGroupDragRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [customCanvas, isCustomLayout, onMoveAllCustomItems, onMoveCustomItem]);

  if (isCustomLayout && customCanvas) {
    const pixelsPerCm =
      boardSize.width > 0
        ? boardSize.width / customCanvas.widthCm
        : 4.6;

    return (
      <div className="flex min-h-[620px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef0f3_48%,#e3e5e9_100%)] p-8">
        <div className="w-full max-w-[760px] rounded-[28px] border border-gray-200/80 bg-[linear-gradient(180deg,#fbfaf7,#f2efe9)] p-8 shadow-[0_28px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[rgba(27,76,143,0.12)] bg-[rgba(27,76,143,0.05)] px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">Custom gallery layout</div>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                {customDragMode === 'group'
                  ? 'Drag the whole arrangement together.'
                  : 'Drag each frame directly to build your own wall style.'}
              </p>
            </div>
            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setCustomDragMode('item')}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                  customDragMode === 'item'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--primary)]'
                }`}
              >
                Frames
              </button>
              <button
                type="button"
                onClick={() => setCustomDragMode('group')}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                  customDragMode === 'group'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--primary)]'
                }`}
              >
                Move all
              </button>
            </div>
          </div>

          <div
            ref={boardRef}
            className="relative aspect-[7/5] w-full rounded-[22px] border border-dashed border-gray-300/80 bg-white/75"
            onPointerDown={
              customDragMode === 'group'
                ? (event) => {
                    event.preventDefault();
                    customGroupDragRef.current = {
                      lastX: event.clientX,
                      lastY: event.clientY,
                    };
                  }
                : undefined
            }
          >
            {customCanvas.items.map((itemEntry) => {
              const item = itemEntry.item;
              const isActive = item.id === activeItemId;
              const intrinsicSize = getFrameIntrinsicSize(item);
              if (intrinsicSize.width <= 0 || intrinsicSize.height <= 0) {
                return null;
              }

              const targetWidthPx = itemEntry.widthCm * pixelsPerCm;
              const targetHeightPx = itemEntry.heightCm * pixelsPerCm;
              const scale = targetWidthPx / intrinsicSize.width;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectItem(item.id)}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    if (customDragMode === 'group') {
                      customGroupDragRef.current = {
                        lastX: event.clientX,
                        lastY: event.clientY,
                      };
                      return;
                    }

                    onSelectItem(item.id);
                    customDragRef.current = {
                      itemId: item.id,
                      startX: event.clientX,
                      startY: event.clientY,
                      originXcm: itemEntry.xCm,
                      originYcm: itemEntry.yCm,
                      widthCm: itemEntry.widthCm,
                      heightCm: itemEntry.heightCm,
                    };
                  }}
                  className={`absolute rounded-xl text-left outline-none transition-transform hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                    customDragMode === 'group'
                      ? 'cursor-grab active:cursor-grabbing'
                      : 'cursor-grab active:cursor-grabbing'
                  }`}
                  style={{
                    left: `${itemEntry.xCm * pixelsPerCm}px`,
                    top: `${itemEntry.yCm * pixelsPerCm}px`,
                    width: `${targetWidthPx}px`,
                    height: `${targetHeightPx}px`,
                  }}
                  aria-pressed={isActive}
                >
                  <div
                    className={`absolute inset-0 rounded-xl border ${
                      isActive
                        ? 'border-[var(--primary)] border-solid bg-[rgba(27,76,143,0.04)] shadow-[0_0_0_3px_rgba(27,76,143,0.12)]'
                        : 'border-dashed border-gray-200/70'
                    }`}
                  />

                  <div
                    className="pointer-events-none absolute left-0 top-0 origin-top-left"
                    style={{
                      width: `${intrinsicSize.width}px`,
                      height: `${intrinsicSize.height}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    {renderFrameContent(item)}
                  </div>

                  <div
                    className={`pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] shadow-sm ${
                      isActive
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-white/92 text-gray-500'
                    }`}
                  >
                    {item.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  const activeSlots = template.slots.slice(0, items.length);

  return (
    <div className="flex min-h-[620px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef0f3_48%,#e3e5e9_100%)] p-8">
      <div className="w-full max-w-[760px] rounded-[28px] border border-gray-200/80 bg-[linear-gradient(180deg,#fbfaf7,#f2efe9)] p-8 shadow-[0_28px_60px_rgba(15,23,42,0.08)]">
        <div className="relative aspect-[7/5] w-full rounded-[22px] border border-dashed border-gray-300/80 bg-white/75">
          {activeSlots.map((slot, index) => {
            const item = items[index];
            if (!item) {
              return null;
            }
            const isActive = item.id === activeItemId;
            const isDragTarget =
              draggedItemId !== null &&
              draggedItemId !== item.id &&
              dropTargetItemId === item.id;

            const { width: frameIntrinsicWidthPx, height: frameIntrinsicHeightPx } =
              getFrameIntrinsicSize(item);
            if (frameIntrinsicWidthPx <= 0 || frameIntrinsicHeightPx <= 0) {
              return null;
            }

            const targetWidthPx = 6 * slot.width;
            const targetHeightPx = 4.6 * slot.height;
            const scale = Math.min(
              targetWidthPx / frameIntrinsicWidthPx,
              targetHeightPx / frameIntrinsicHeightPx,
            );
            const scaledWidth = frameIntrinsicWidthPx * scale;
            const scaledHeight = frameIntrinsicHeightPx * scale;

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                draggable
                onDragStart={() => {
                  setDraggedItemId(item.id);
                  setDropTargetItemId(null);
                  onSelectItem(item.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  if (draggedItemId && draggedItemId !== item.id) {
                    setDropTargetItemId(item.id);
                  }
                }}
                onDragLeave={() => {
                  if (dropTargetItemId === item.id) {
                    setDropTargetItemId(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedItemId && draggedItemId !== item.id) {
                    onSwapItems(draggedItemId, item.id);
                    onSelectItem(draggedItemId);
                  }
                  setDraggedItemId(null);
                  setDropTargetItemId(null);
                }}
                onDragEnd={() => {
                  setDraggedItemId(null);
                  setDropTargetItemId(null);
                }}
                className="absolute cursor-pointer rounded-xl text-left outline-none transition-transform hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                aria-pressed={isActive}
              >
                <div
                  className={`absolute inset-0 rounded-xl border ${
                    isDragTarget
                      ? 'border-[var(--primary)] border-solid bg-[rgba(27,76,143,0.06)] shadow-[0_0_0_4px_rgba(27,76,143,0.16)]'
                      : isActive
                        ? 'border-[var(--primary)] border-solid bg-[rgba(27,76,143,0.04)] shadow-[0_0_0_3px_rgba(27,76,143,0.12)]'
                        : 'border-dashed border-gray-200/70'
                  }`}
                />
                <div
                  className="absolute left-1/2 top-1/2"
                  style={{
                    width: `${scaledWidth}px`,
                    height: `${scaledHeight}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    className="origin-top-left"
                    style={{
                      width: `${frameIntrinsicWidthPx}px`,
                      height: `${frameIntrinsicHeightPx}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    {renderFrameContent(item)}
                  </div>
                </div>

                <div
                  className={`pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] shadow-sm ${
                    isActive
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-white/92 text-gray-500'
                  }`}
                >
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
