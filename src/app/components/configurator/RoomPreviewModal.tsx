import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { ConfiguratorTranslations } from './configurator-translations';
import { GalleryWallRoomScene } from './GalleryWallRoomScene';
import {
  getGalleryWallCompositionGuidance,
  type GalleryWallGuidanceCode,
  type GalleryWallRoomPlacementMetrics,
} from './gallery-wall-guidance';
import {
  CUSTOM_GALLERY_LAYOUT_ID,
  getGalleryLayoutRecommendations,
  getGalleryLayoutTemplateById,
  getGalleryWallCompositionLayout,
  type GalleryCompositionMode,
  type GalleryWallItem,
} from './gallery-wall';
import { getRoomRecommendations } from './room-recommendations';
import { RoomScene } from './RoomScene';
import { DEFAULT_ROOM_TEMPLATE, ROOM_TEMPLATES } from './roomTemplates';

const ROOM_SELECTION_STORAGE_KEY = 'frame-configurator:selected-room-template';
const DEV_WALL_EDITOR_STORAGE_KEY = 'frame-configurator:dev-wall-editor-enabled';

interface RoomPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: ConfiguratorTranslations;
  compositionMode: GalleryCompositionMode;
  wallWidthCm: number;
  wallHeightCm: number;
  wallSpacingCm: number;
  desiredFrameCount?: number;
  onWallWidthCmChange: (value: number) => void;
  onWallHeightCmChange: (value: number) => void;
  onWallSpacingCmChange: (value: number) => void;
  onDesiredFrameCountChange: (value: number | undefined) => void;
  onGenerateWallLayout: (selectedRoomTemplateId?: string) => void;
  artworkWidthCm: number;
  artworkHeightCm: number;
  frameOuterWidthCm: number;
  frameOuterHeightCm: number;
  frameIntrinsicWidthPx: number;
  frameIntrinsicHeightPx: number;
  frameContent: ReactNode;
  galleryItems: GalleryWallItem[];
  activeGalleryItemId: string | null;
  selectedGalleryLayoutId: string | null;
  gallerySpacingCm: number;
  onGallerySpacingCmChange: (value: number) => void;
  onSelectedGalleryLayoutIdChange: (layoutId: string) => void;
  onActivateCustomGalleryLayout: () => void;
  onMoveGalleryWallItemCustomPosition: (itemId: string, xCm: number, yCm: number) => void;
  onEvenOutGalleryWallSpacing: () => void;
  getGalleryFrameOuterSizeCm: (item: GalleryWallItem) => {
    widthCm: number;
    heightCm: number;
  };
  getGalleryFrameIntrinsicSizePx: (item: GalleryWallItem) => {
    width: number;
    height: number;
  };
  renderGalleryFrameContent: (item: GalleryWallItem) => ReactNode;
  artworkRatioMode: 'detected' | 'standard' | 'custom';
  artworkRatioWidth: number | null;
  artworkRatioHeight: number | null;
  selectedArtworkRatioId: string | null;
  onArtworkWidthCommit: (value: number) => void;
  onArtworkHeightCommit: (value: number) => void;
}

function formatCmPair(width: number, height: number) {
  return `${Math.round(width * 10) / 10} x ${Math.round(height * 10) / 10} cm`;
}

function getGuidanceLabel(code: GalleryWallGuidanceCode) {
  switch (code) {
    case 'scale-strong':
      return 'Scale feels strong for this wall.';
    case 'too-narrow':
      return 'The composition reads a little too narrow.';
    case 'too-wide':
      return 'The composition is getting too wide for this zone.';
    case 'too-low':
      return 'Raise the composition a bit above the furniture line.';
    case 'too-high':
      return 'Bring the composition slightly lower.';
    case 'off-center':
      return 'The composition is drifting off the wall center.';
    case 'uniform-layout-mismatch':
      return 'A cleaner grid-like layout would suit equal-size frames better.';
    case 'mixed-layout-mismatch':
      return 'A more editorial mixed-size layout would suit this set better.';
    default:
      return 'Adjust the composition slightly for a cleaner result.';
  }
}

export function RoomPreviewModal({
  isOpen,
  onClose,
  t,
  compositionMode,
  wallWidthCm,
  wallHeightCm,
  wallSpacingCm,
  desiredFrameCount,
  onWallWidthCmChange,
  onWallHeightCmChange,
  onWallSpacingCmChange,
  onDesiredFrameCountChange,
  onGenerateWallLayout,
  artworkWidthCm,
  artworkHeightCm,
  frameOuterWidthCm,
  frameOuterHeightCm,
  frameIntrinsicWidthPx,
  frameIntrinsicHeightPx,
  frameContent,
  galleryItems,
  activeGalleryItemId: _activeGalleryItemId,
  selectedGalleryLayoutId,
  gallerySpacingCm,
  onGallerySpacingCmChange,
  onSelectedGalleryLayoutIdChange,
  onActivateCustomGalleryLayout,
  onMoveGalleryWallItemCustomPosition,
  onEvenOutGalleryWallSpacing,
  getGalleryFrameOuterSizeCm,
  getGalleryFrameIntrinsicSizePx,
  renderGalleryFrameContent,
  artworkRatioMode: _artworkRatioMode,
  artworkRatioWidth: _artworkRatioWidth,
  artworkRatioHeight: _artworkRatioHeight,
  selectedArtworkRatioId: _selectedArtworkRatioId,
  onArtworkWidthCommit,
  onArtworkHeightCommit,
}: RoomPreviewModalProps) {
  const isGalleryWallMode = compositionMode === 'gallery-wall';
  const [selectedRoomId, setSelectedRoomId] = useState(DEFAULT_ROOM_TEMPLATE.id);
  const [placementMetrics, setPlacementMetrics] = useState<GalleryWallRoomPlacementMetrics | null>(
    null,
  );
  const [showDevWallEditor, setShowDevWallEditor] = useState(false);

  const galleryComposition = useMemo(
    () =>
      isGalleryWallMode
        ? getGalleryWallCompositionLayout(
            selectedGalleryLayoutId,
            galleryItems,
            gallerySpacingCm,
            getGalleryFrameOuterSizeCm,
          )
        : null,
    [
      galleryItems,
      gallerySpacingCm,
      getGalleryFrameOuterSizeCm,
      isGalleryWallMode,
      selectedGalleryLayoutId,
    ],
  );

  const roomRecommendations = useMemo(
    () =>
      getRoomRecommendations(
        ROOM_TEMPLATES,
        isGalleryWallMode
          ? Math.max(galleryComposition?.widthCm ?? frameOuterWidthCm, 1)
          : frameOuterWidthCm,
        isGalleryWallMode
          ? Math.max(galleryComposition?.heightCm ?? frameOuterHeightCm, 1)
          : frameOuterHeightCm,
      ),
    [
      frameOuterHeightCm,
      frameOuterWidthCm,
      galleryComposition?.heightCm,
      galleryComposition?.widthCm,
      isGalleryWallMode,
    ],
  );

  const selectedTemplate =
    roomRecommendations.find((entry) => entry.template.id === selectedRoomId)?.template ??
    roomRecommendations[0]?.template ??
    DEFAULT_ROOM_TEMPLATE;

  const selectedGalleryLayout = getGalleryLayoutTemplateById(selectedGalleryLayoutId);

  const galleryLayoutRecommendations = useMemo(
    () =>
      isGalleryWallMode
        ? getGalleryLayoutRecommendations(galleryItems, {
            roomArchetype: selectedTemplate.roomArchetype,
          }).slice(0, 5)
        : [],
    [galleryItems, isGalleryWallMode, selectedTemplate.roomArchetype],
  );

  const compositionGuidance = useMemo(
    () =>
      isGalleryWallMode
        ? getGalleryWallCompositionGuidance(
            selectedTemplate,
            galleryItems,
            Math.max(galleryComposition?.widthCm ?? 0, 0),
            Math.max(galleryComposition?.heightCm ?? 0, 0),
            selectedGalleryLayoutId,
            selectedGalleryLayout,
            placementMetrics,
            getGalleryFrameOuterSizeCm,
          )
        : null,
    [
      galleryComposition?.heightCm,
      galleryComposition?.widthCm,
      galleryItems,
      getGalleryFrameOuterSizeCm,
      isGalleryWallMode,
      placementMetrics,
      selectedGalleryLayout,
      selectedGalleryLayoutId,
      selectedTemplate,
    ],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return;
    }

    const savedRoomId = window.localStorage.getItem(ROOM_SELECTION_STORAGE_KEY);
    if (savedRoomId && ROOM_TEMPLATES.some((template) => template.id === savedRoomId)) {
      setSelectedRoomId(savedRoomId);
    } else {
      setSelectedRoomId(roomRecommendations[0]?.template.id ?? DEFAULT_ROOM_TEMPLATE.id);
    }

    const savedDevToggle = window.localStorage.getItem(DEV_WALL_EDITOR_STORAGE_KEY);
    setShowDevWallEditor(savedDevToggle === 'true');
  }, [isOpen, roomRecommendations]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(ROOM_SELECTION_STORAGE_KEY, selectedRoomId);
  }, [isOpen, selectedRoomId]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(DEV_WALL_EDITOR_STORAGE_KEY, String(showDevWallEditor));
  }, [isOpen, showDevWallEditor]);

  useEffect(() => {
    if (!isGalleryWallMode) {
      setPlacementMetrics(null);
    }
  }, [isGalleryWallMode, selectedRoomId, selectedGalleryLayoutId]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-40 bg-[rgba(15,23,42,0.68)] backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative h-[calc(100vh-2rem)] w-full max-w-[1480px] overflow-hidden rounded-[32px] bg-[#fcfbf8] shadow-[0_42px_140px_rgba(15,23,42,0.24)]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white/94 text-gray-700 shadow-sm transition hover:bg-white"
            aria-label="Close room preview"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid h-full lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex items-center justify-center bg-[#ede5dc] p-6 lg:p-8">
              {isGalleryWallMode ? (
                <GalleryWallRoomScene
                  template={selectedTemplate}
                  selectedLayoutId={selectedGalleryLayoutId}
                  items={galleryItems}
                  gallerySpacingCm={gallerySpacingCm}
                  onMoveCustomItem={onMoveGalleryWallItemCustomPosition}
                  getFrameOuterSizeCm={getGalleryFrameOuterSizeCm}
                  getFrameIntrinsicSizePx={getGalleryFrameIntrinsicSizePx}
                  renderFrameContent={renderGalleryFrameContent}
                  onPlacementMetricsChange={setPlacementMetrics}
                  showDevWallEditor={showDevWallEditor}
                />
              ) : (
                <RoomScene
                  template={selectedTemplate}
                  frameOuterWidthCm={frameOuterWidthCm}
                  frameOuterHeightCm={frameOuterHeightCm}
                  frameIntrinsicWidthPx={frameIntrinsicWidthPx}
                  frameIntrinsicHeightPx={frameIntrinsicHeightPx}
                  frameContent={frameContent}
                  showDevWallEditor={showDevWallEditor}
                />
              )}
            </div>

            <div className="h-full overflow-y-auto border-l border-gray-200 bg-[#f8f5ef] p-6">
              <div className="space-y-5 pr-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    {t.preview.roomView}
                  </div>
                  <h4 className="mt-2 text-2xl font-semibold text-gray-900">
                    {selectedTemplate.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {selectedTemplate.description}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">Developer tools</div>
                      <p className="mt-1 text-gray-600">
                        Turn on the wall/furniture corner editor only when calibrating a room.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDevWallEditor((current) => !current)}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
                        showDevWallEditor
                          ? 'bg-[var(--primary)] text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {showDevWallEditor ? 'Dev editor ON' : 'Dev editor OFF'}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                    {roomRecommendations[0]?.template.id === selectedTemplate.id ? 'Best match' : 'Room fit'}
                  </div>
                  <p className="mt-2">
                    {roomRecommendations.find((entry) => entry.template.id === selectedTemplate.id)?.reason ?? 'Balanced room fit.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="font-medium text-gray-900">Composition</div>
                  <p className="mt-2">
                    {isGalleryWallMode ? `${galleryItems.length} framed pieces` : 'Single framed piece'}
                  </p>
                  <p className="mt-1 text-gray-600">
                    {isGalleryWallMode
                      ? selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID
                        ? 'Custom Layout'
                        : (selectedGalleryLayout?.title ?? 'Selected layout')
                      : formatCmPair(artworkWidthCm, artworkHeightCm)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="font-medium text-gray-900">Overall composition size</div>
                  <p className="mt-2">
                    {isGalleryWallMode
                      ? formatCmPair(galleryComposition?.widthCm ?? 0, galleryComposition?.heightCm ?? 0)
                      : formatCmPair(frameOuterWidthCm, frameOuterHeightCm)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900">Wall surface</div>
                      <p className="mt-1 text-gray-600">
                        Define the real wall surface to plan frame sizes that can actually fit.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onGenerateWallLayout(selectedTemplate.id)}
                      className="shrink-0 rounded-xl border border-[var(--primary)] bg-[rgba(27,76,143,0.06)] px-3 py-2 text-sm font-medium text-[var(--primary)] transition hover:bg-[rgba(27,76,143,0.1)]"
                    >
                      Generate mural
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Wall width
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={Math.round(wallWidthCm)}
                        onChange={(event) => onWallWidthCmChange(Number(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Wall height
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={Math.round(wallHeightCm)}
                        onChange={(event) => onWallHeightCmChange(Number(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Frame gap
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={wallSpacingCm}
                        onChange={(event) => onWallSpacingCmChange(Number(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Frames
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={desiredFrameCount ?? ''}
                        onChange={(event) =>
                          onDesiredFrameCountChange(
                            event.target.value ? Number(event.target.value) : undefined,
                          )
                        }
                        placeholder="Auto"
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {isGalleryWallMode ? (
                  <>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                      <div className="font-medium text-gray-900">Mural planner</div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#f8f5ef] px-3 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                            Planned wall
                          </div>
                          <div className="mt-1 font-medium text-gray-900">
                            {formatCmPair(wallWidthCm, wallHeightCm)}
                          </div>
                        </div>
                        <div className="rounded-xl bg-[#f8f5ef] px-3 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                            Target count
                          </div>
                          <div className="mt-1 font-medium text-gray-900">
                            {desiredFrameCount ?? galleryItems.length}
                          </div>
                        </div>
                        <div className="rounded-xl bg-[#f8f5ef] px-3 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                            Current layout
                          </div>
                          <div className="mt-1 font-medium text-gray-900">
                            {selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID
                              ? 'Custom Layout'
                              : (selectedGalleryLayout?.title ?? 'Suggested')}
                          </div>
                        </div>
                        <div className="rounded-xl bg-[#f8f5ef] px-3 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                            Current gap
                          </div>
                          <div className="mt-1 font-medium text-gray-900">
                            {Math.round(wallSpacingCm * 10) / 10} cm
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-gray-900">Layout styles</div>
                          <p className="mt-1 text-gray-600">Choose a preset or switch to custom.</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <button
                          type="button"
                          onClick={onActivateCustomGalleryLayout}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID
                              ? 'border-[var(--primary)] bg-[rgba(27,76,143,0.06)]'
                              : 'border-gray-200 bg-[#fcfbf8] hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium text-gray-900">Custom Layout</div>
                            <span className="rounded-full bg-[rgba(27,76,143,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                              Freeform
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">Move frames freely.</p>
                        </button>

                        {galleryLayoutRecommendations.map((entry) => (
                          <button
                            key={entry.template.id}
                            type="button"
                            onClick={() => onSelectedGalleryLayoutIdChange(entry.template.id)}
                            className={`w-full rounded-2xl border p-4 text-left transition ${
                              selectedGalleryLayoutId === entry.template.id
                                ? 'border-[var(--primary)] bg-[rgba(27,76,143,0.06)]'
                                : 'border-gray-200 bg-[#fcfbf8] hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-24 shrink-0">
                                <div className="relative aspect-[1.25/0.78] overflow-hidden rounded-xl border border-gray-200 bg-[linear-gradient(180deg,#faf8f3,#f1ede6)]">
                                  {entry.template.slots.map((slot) => (
                                    <div
                                      key={slot.id}
                                      className={`absolute rounded-[5px] border-2 ${
                                        slot.priority === 'hero'
                                          ? 'border-[var(--primary)] bg-[rgba(27,76,143,0.06)]'
                                          : 'border-gray-500/70 bg-white/85'
                                      }`}
                                      style={{
                                        left: `${slot.x}%`,
                                        top: `${slot.y}%`,
                                        width: `${slot.width}%`,
                                        height: `${slot.height}%`,
                                        transform: 'translate(-50%, -50%)',
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="font-medium text-gray-900">{entry.template.title}</div>
                                  <span className="rounded-full bg-[rgba(27,76,143,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                                    {entry.badge}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">{entry.template.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedGalleryLayoutId === CUSTOM_GALLERY_LAYOUT_ID ? (
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium text-gray-900">Placement</div>
                          <button
                            type="button"
                            onClick={onEvenOutGalleryWallSpacing}
                            className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
                          >
                            Even spacing
                          </button>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-800">
                            Target spacing
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="15"
                            step="0.5"
                            value={gallerySpacingCm}
                            onChange={(event) => onGallerySpacingCmChange(Number(event.target.value))}
                            className="mt-3 w-full accent-[var(--primary)]"
                          />
                          <div className="mt-2 text-sm text-gray-600">
                            {Math.round(gallerySpacingCm * 10) / 10} cm
                          </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-600">
                          Drag frames in <span className="font-medium text-gray-900">Custom Layout</span>, then use
                          <span className="font-medium text-gray-900"> Even spacing</span> to clean up the gaps.
                        </p>
                      </div>
                    ) : null}

                    {compositionGuidance ? (
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                        <div className="font-medium text-gray-900">Guidance</div>
                        <div className="mt-3 space-y-2">
                          {compositionGuidance.items.map((item) => (
                            <div
                              key={item.code}
                              className={`rounded-xl px-3 py-2 ${
                                item.tone === 'good'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {getGuidanceLabel(item.code)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <div className="font-medium text-gray-900">Artwork size</div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                          Width (cm)
                        </label>
                        <input
                          type="number"
                          value={Math.round(artworkWidthCm * 10) / 10}
                          onChange={(event) => onArtworkWidthCommit(Number(event.target.value))}
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          value={Math.round(artworkHeightCm * 10) / 10}
                          onChange={(event) => onArtworkHeightCommit(Number(event.target.value))}
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  <div className="font-medium text-gray-900">Room styles</div>
                  <div className="mt-4 space-y-3">
                    {roomRecommendations.map((entry) => (
                      <button
                        key={entry.template.id}
                        type="button"
                        onClick={() => setSelectedRoomId(entry.template.id)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          entry.template.id === selectedTemplate.id
                            ? 'border-[var(--primary)] bg-[rgba(27,76,143,0.06)]'
                            : 'border-gray-200 bg-[#fcfbf8] hover:border-gray-300'
                        }`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={entry.template.imageSrc}
                            alt={entry.template.title}
                            className="h-16 w-20 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-medium text-gray-900">{entry.template.title}</div>
                              <span className="rounded-full bg-[rgba(27,76,143,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                                {entry.badge}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{entry.reason}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
