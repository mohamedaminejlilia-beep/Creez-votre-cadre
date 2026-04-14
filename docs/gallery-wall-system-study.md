# Gallery Wall System Study

## Goal

Design a multiple-frame layout system for the configurator that:

- lets the user add another framed piece when they want more than one frame
- understands good gallery-wall layout families
- suggests layouts automatically based on item count, orientation, and size mix
- stays visually believable in the existing room preview system

This is not the same thing as the current `matType: "multiple"` placeholder.

There are two different products:

1. `Multi-opening mat in one outer frame`
2. `Multiple separate frames arranged together on one wall`

The user request and reference images are clearly about **multiple separate frames on one wall**.

## What Exists Today

Current codebase findings:

- `FrameConfig` is built for **one framed object only**
- `matType: "multiple"` exists but is disabled in the UI
- pricing has a placeholder `multiple` branch in `workbook-pricing.ts`
- preview logic assumes one artwork opening, one outer frame, one room object
- room preview already supports good single-object scaling and dragging

Conclusion:

- we should **not** force gallery-wall logic into the existing single-frame mat model
- we should create a separate gallery composition layer

## Public Pattern Research

Useful public references:

- Framebridge gallery wall guidance emphasizes treating the arrangement as **one single piece** and keeping spacing consistent, with frames about `2-3 inches` apart
- Pottery Barn guidance treats multiple pieces as one unit, usually spaced about `2-5 inches` apart, with the grouping centered near eye level
- Artfully Walls uses the `2/3 rule`: the total width of the grouping should often be about `2/3` of the furniture below it
- Framebridge sells curated layout products such as floor-to-ceiling grids and even allows adding a single extra frame to an existing layout family

Source links:

- https://www.framebridge.com/blogs/how-tos/how-to-hang-a-personalized-one-of-a-kind-gallery-wall
- https://www.framebridge.com/products/the-floor-to-ceiling-grid
- https://www.framebridge.com/pages/gallery-wall-design-service
- https://www.potterybarn.com/m/pages/features/how-to-hang-artwork/
- https://www.artfullywalls.com/artful-insights/create-perfect-gallery-wall
- https://www.artfullywalls.com/artful-insights/what-is-2-3-rule-for-wall-art

## Core Design Principles

### 1. Treat the whole composition as one object

Even with 5, 9, or 15 frames, the user should see one grouped composition.

That means the system should always compute:

- total composition width
- total composition height
- center line
- anchor relative to furniture or room wall

### 2. Consistent spacing matters more than random creativity

The strongest gallery walls are usually built from:

- repeated spacing
- a clear alignment rule
- a dominant frame or repeated frame sizes

Recommendation:

- default spacing: `5 cm`
- allow small presets like `4 cm`, `5 cm`, `6 cm`, `8 cm`

### 3. Layout families are better than freeform generation at first

Instead of trying to invent infinite compositions from scratch, start with curated families.

This is how we get:

- better taste
- easier pricing
- easier preview
- easier room placement
- more predictable UX

## Recommended Layout Families

These are the families worth supporting first.

### Level 1: easiest and strongest

1. `Perfect Pair`
- 2 equal frames
- horizontal or vertical

2. `Classic Trio`
- 3 equal frames in one row

3. `Simple Grid 2x2`
- 4 equal frames

4. `Grid 3x3`
- 9 equal frames

5. `Centered Hero`
- 1 large center frame with 2 or 4 smaller side frames

### Level 2: more expressive but still structured

6. `Axis`
- one central line with balanced pieces around it

7. `Internal Axis`
- one dominant central frame with supporting pieces aligned to its edges

8. `Mondrian`
- mixed portrait/landscape rectangles in a rectangular envelope

9. `Staggered Row`
- several frames with top or bottom aligned but varied widths/heights

10. `Salon / Eclectic`
- many mixed sizes around one or two hero frames

### Level 3: decorative / optional later

11. `Spiral`
12. `Retro mixed shapes`
13. `Shelf / ledge arrangement`

Recommendation:

- build only Level 1 and Level 2 first
- leave spiral and decorative shape layouts for later

## System Understanding: How Layouts Actually Work

Every good gallery layout can be described with:

- `frame count`
- `slot rectangles`
- `alignment rule`
- `spacing rule`
- `hero frame rule`
- `composition envelope`

Example:

`Centered Hero (5)`

- one large central slot
- two smaller slots on left
- two smaller slots on right
- all slots vertically aligned to the hero frame center
- fixed gap between slots

So the layout system does **not** need to start by placing frames freely.
It needs to start by placing frames into **slots**.

## Proposed Data Model

```ts
type GalleryMode = 'single' | 'gallery-wall';

type GalleryItem = {
  id: string;
  artworkWidthCm: number;
  artworkHeightCm: number;
  uploadedArtworkUrl: string | null;
  uploadedArtworkName: string | null;
  frameStyle: string;
  matEnabled: boolean;
  matType: 'single' | 'double' | 'triple' | 'v_groove' | 'box';
  matColor: string;
  glazing: 'none' | 'glass';
};

type LayoutSlot = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  ratioPolicy: 'free' | 'square' | 'portrait' | 'landscape';
  priority: 'hero' | 'secondary';
};

type GalleryLayoutTemplate = {
  id: string;
  family:
    | 'perfect-pair'
    | 'classic-trio'
    | 'grid-2x2'
    | 'grid-3x3'
    | 'centered-hero'
    | 'axis'
    | 'internal-axis'
    | 'mondrian'
    | 'salon';
  minItems: number;
  maxItems: number;
  recommendedCounts: number[];
  symmetry: 'symmetric' | 'balanced' | 'asymmetric';
  defaultGapCm: number;
  slots: LayoutSlot[];
};

type GalleryComposition = {
  mode: 'gallery-wall';
  items: GalleryItem[];
  selectedLayoutId: string | null;
  spacingCm: number;
  outerWidthCm: number;
  outerHeightCm: number;
};
```

## Recommendation Engine

When the user adds another frame, we should not show all layouts equally.
We should rank the best ones.

### Inputs

- number of items
- aspect ratios of items
- whether sizes are equal or mixed
- whether one image is dominant
- wall/furniture context in room preview

### Rules

If:

- `2 items` -> prefer `Perfect Pair`
- `3 equal items` -> prefer `Classic Trio`
- `4 equal items` -> prefer `Grid 2x2`
- `9 equal items` -> prefer `Grid 3x3`
- `1 large + 4 small` -> prefer `Centered Hero`
- `mixed portrait/landscape` -> prefer `Mondrian`
- `many mixed items` -> prefer `Salon`

### Scoring

Each layout can be scored by:

- `count fit`
- `ratio fit`
- `symmetry fit`
- `hero fit`
- `wall coverage fit`
- `furniture anchoring fit`
- `crop penalty`

High-level scoring example:

```ts
score =
  countFit * 0.30 +
  ratioFit * 0.20 +
  sizeMixFit * 0.15 +
  heroFit * 0.10 +
  wallCoverageFit * 0.15 +
  furnitureFit * 0.10;
```

## UX Flow Recommendation

### Entry point

When the user wants more than one frame:

1. Click `Add another frame`
2. System switches from `single` mode to `gallery wall` mode
3. User now sees item cards:
   - `Frame 1`
   - `Frame 2`
   - `Frame 3`
4. As soon as item count is `>= 2`, system suggests layouts

### Suggested flow

1. User chooses item count by adding frames
2. User uploads art per frame or duplicates one image
3. System suggests `Top 3 layouts`
4. User picks one
5. User can:
   - swap frames between slots
   - duplicate frame settings
   - keep all frames the same style
   - optionally unlock per-frame style later

### Important simplification for first release

For V1:

- all frames should share the same frame style
- all frames should share the same glazing rule
- mats can stay shared too
- only artwork sizes and images vary by slot if needed

This keeps the system understandable and easier to price.

## Preview System Recommendation

We should support two preview levels:

### Product preview

A clean top-down layout board:

- white background
- true outer sizes
- exact spacing
- draggable swap between slots later

### Room preview

Treat the whole gallery wall as one grouped object:

- compute composition outer box
- scale composition as one object inside the room wall zone
- allow dragging the whole composition
- later optionally allow editing individual frame positions inside the composition editor

## Pricing Recommendation

Do **not** reuse the current placeholder `matType: "multiple"` pricing as-is.

That placeholder behaves more like a multi-opening mat estimate, not a real multiple-frame wall system.

For V1 gallery wall pricing:

- calculate each frame item individually
- sum all frame totals
- optionally add a layout service fee later if desired

So:

```ts
galleryTotal = sum(itemTotals)
```

This is much safer than trying to fake one multi-frame workbook formula too early.

## What We Should Build First

### Phase 1: foundation

1. Add `gallery wall mode`
2. Add `GalleryItem[]`
3. Add `Add another frame`
4. Create `GalleryLayoutTemplate[]`
5. Support 5 curated layout families:
   - perfect pair
   - classic trio
   - grid 2x2
   - centered hero
   - mondrian

### Phase 2: recommendation

6. Add layout scoring and top suggestions
7. Add labels like:
   - `Best match`
   - `Balanced`
   - `Good for mixed orientations`

### Phase 3: richer editing

8. Allow slot swapping
9. Allow per-frame artwork crop
10. Allow duplicate settings from one frame to all

### Phase 4: room preview integration

11. Render full composition in room scenes
12. Treat composition as one anchored wall object

## My Recommendation For This Project

We should **not** start with a freeform gallery-wall builder.

We should start with:

- curated layout templates
- same frame style across all pieces
- smart suggestions based on item count and ratio mix

That will feel premium much faster and will match the reference images better.

## Best First Layout Set

If we start implementation next, this should be the first set:

1. `Perfect Pair`
2. `Classic Trio`
3. `Simple Grid 2x2`
4. `Centered Hero (5)`
5. `Mondrian (6-8)`

That is enough to cover most real customer needs without making the UI overwhelming.

## Final Conclusion

The right system is:

- `single frame mode` for normal custom framing
- `gallery wall mode` for multiple framed pieces
- curated layout families
- smart layout suggestions
- item-by-item pricing
- room preview that treats the whole layout as one grouped object

This is the cleanest path to a strong V1.

## Reference Pack Synthesis (April 2026)

The user supplied a large reference pack of real wall compositions. These references are useful because they confirm that good gallery walls are not random. They cluster into a small number of repeatable composition families and room-context rules.

### Main composition families seen in the references

#### 1. Sofa-centered horizontal compositions

Seen in:

- symmetric rows above sofas
- center-hero arrangements above sofas
- balanced multi-frame sets above consoles and dining tables

Typical behavior:

- grouping is centered on the furniture below
- total composition width is usually about `55%` to `80%` of the furniture width
- bottom of the grouping usually sits about `18 cm` to `35 cm` above the furniture line
- spacing is visually consistent even when frame sizes differ

This should produce preset families such as:

- `Perfect Pair`
- `Classic Trio`
- `Centered Hero`
- `Wide Symmetric Hero`
- `Console Row`

#### 2. Grid and matrix compositions

Seen in:

- equal-size photo walls
- hallway grids
- 2 by 3, 3 by 2, and 3 by 3 image sets
- narrow vertical corridor layouts

Typical behavior:

- equal gaps
- strong column and row alignment
- identical frame sizes or near-identical optical sizes
- works best in clean architectural spaces

This should produce preset families such as:

- `Grid 2x2`
- `Grid 3x2`
- `Grid 3x3`
- `Vertical Strip`
- `Hallway Grid`

#### 3. Staircase / diagonal compositions

Seen in:

- family photo stairs
- mixed sizes rising with stair angle
- offset frames following the incline of the railing

Typical behavior:

- composition follows a guide line parallel to the stair rail
- frame centers are not random; they are stepped along a common slope
- top and bottom clearances matter more than perfect symmetry

This should become a dedicated family:

- `Staircase Flow`
- `Staircase Grid`
- `Stepped Portrait Chain`

It should also use its own rules instead of standard flat-wall rules.

#### 4. Asymmetrical salon / editorial walls

Seen in:

- colorful art salons
- mixed-size editorial walls
- decorative walls with one or two large anchors and many smaller support pieces

Typical behavior:

- asymmetry is allowed, but weight is still balanced
- one or two hero pieces control the composition
- spacing is often slightly looser than a grid, but still not random
- the envelope is usually rectangular even if the internal pattern is irregular

This should produce preset families such as:

- `Salon Five`
- `Eclectic Six`
- `Editorial Cluster`
- `Asymmetric Hero`

#### 5. Column and stack compositions

Seen in:

- narrow hallway stacks
- slim vertical photo strips
- one-over-one-over-one layouts in small wall niches

Typical behavior:

- same center line
- equal vertical spacing
- useful for corridors, narrow walls, and between-door spaces

This should produce preset families such as:

- `Vertical Pair`
- `Vertical Trio`
- `Tall Column`
- `Narrow Niche Stack`

#### 6. Shelf / ledge styling

Seen in:

- leaning frames on shelves
- layered frames on consoles and bedside areas
- decorative styling mixed with objects

Typical behavior:

- not actually “hung” by exact wall math
- front frame overlaps are intentional
- depth layering matters more than hanging spacing

This should be treated as a separate later product mode:

- `Shelf Styling`
- `Leaning Frames`

It should not share the same rules as a hung gallery wall.

#### 7. Single statement or triptych sets

Seen in:

- large single board over beds
- three equal modern posters over consoles
- two or three clean frames over furniture

Typical behavior:

- very strong symmetry
- generous breathing room
- larger margins than dense gallery walls

This should produce preset families such as:

- `Statement Single`
- `Statement Pair`
- `Classic Triptych`

## Hard rules confirmed by the references

### Furniture relationship rules

These references strongly confirm that furniture is the anchor for most wall art.

- Over a sofa or bed, the composition should usually be centered relative to the furniture.
- Total grouping width should often be about `60%` to `80%` of the furniture width.
- If the grouping is much smaller than that, it often looks weak.
- If the grouping is wider than the furniture by too much, it looks unstable.
- Bottom clearance over furniture usually looks good in the `18 cm` to `35 cm` range.
- Dense gallery walls should still leave visible breathing room above the sofa or headboard.

### Wall coverage rules

- Compositions need a readable envelope, even when the inside is irregular.
- Small compositions work best when the wall zone is narrow or the furniture is narrow.
- Large open walls need either a wider grouping or fewer but larger hero pieces.
- Same-size small frames on a large blank wall often look underpowered unless grouped tightly.

### Spacing rules

- Consistent spacing is one of the strongest signals of a “finished” composition.
- Equal-size grids should use exactly equal gaps.
- Hero-based compositions can use equal local spacing even if overall silhouette is irregular.
- Stair walls should keep consistent perceived distance along the stair line.
- Dense salon walls can vary slightly, but should still stay within a controlled spacing band.

Practical product defaults:

- standard clean spacing: `4 cm` to `6 cm`
- relaxed spacing: `6 cm` to `8 cm`
- dense salon spacing: `3 cm` to `5 cm`

### Alignment rules

- Grids align on rows and columns.
- Symmetric sets align on a center line.
- Hero layouts align secondaries to hero edges or hero center.
- Stair walls align to a slope, not to a flat horizontal line.
- Corridor and niche walls align to a vertical spine.

### Visual weight rules

- Bigger frames need balancing pieces on the other side.
- One heavy corner with empty opposite space often looks accidental.
- Mixed-size walls still need a clear center of gravity.
- If all frames are the same size, grid and pair/trio systems usually outperform Mondrian systems.

## Product rules we should enforce

These are the rules the interface should understand and eventually score.

### General warnings

- `too low over furniture`
- `too high for the wall zone`
- `too narrow for the furniture`
- `too wide for the furniture`
- `spacing inconsistent`
- `visual weight too left-heavy`
- `visual weight too right-heavy`
- `layout family does not match size mix`

### Layout-family fit rules

- If all frames are equal size, prefer `grid`, `pair`, `trio`, or `triptych`.
- If there is one dominant large piece, prefer `centered hero` or `internal axis`.
- If wall is narrow and tall, prefer `vertical pair`, `vertical trio`, or `column`.
- If wall follows stairs, prefer `staircase flow`.
- If room style is decorative and pieces are mixed, allow `salon` or `editorial cluster`.
- Do not recommend `Mondrian` when all pieces are identical unless the user insists.

### Room archetype rules

We should classify room anchors like this:

- `sofa wall`
- `bed wall`
- `console / sideboard wall`
- `hallway niche`
- `staircase wall`
- `desk wall`
- `shelf styling`

Each archetype should constrain:

- composition width range
- composition height range
- clearance from furniture
- preferred layout families

## Layout library expansion we should build next

The current gallery-wall library is a good start, but these references show we need more named families.

### Add soon

- `Wide Symmetric Hero`
- `Triptych Clean`
- `Hallway Vertical Strip`
- `Tall Column`
- `Staircase Flow`
- `Desk Wall Cluster`
- `Console Cluster`
- `Balanced Salon Eight`

### Add later

- `Shelf Styling`
- `Ledge Mix`
- `Color Pop Salon`
- `Kids Room Balanced Grid`

## Rule-engine implication

These references confirm that the system needs two layers:

### 1. Template layer

The template gives:

- slot count
- slot geometry
- hero slots
- symmetry type
- default spacing
- preferred room archetypes

### 2. Composition scoring layer

The scoring layer decides whether the chosen layout is actually good for:

- frame count
- frame size mix
- wall width
- wall height
- furniture type
- furniture width
- room archetype

That means the next strong product milestone is not “more random layouts”.

It is:

- more named families
- room archetype tagging
- quality scoring
- warnings and auto-fixes

## Immediate design takeaway

From this reference pack, the strongest rules are:

- gallery walls look best when treated as one designed object
- furniture is usually the real anchor
- spacing consistency matters more than clever shapes
- not every wall should use the same family
- staircase walls and shelf styling need separate logic
- equal-size sets should be simpler and cleaner than mixed-size sets

## What this means for our implementation

The next implementation pass should focus on:

1. adding more curated layout families from these references
2. adding room archetype metadata for layouts
3. scoring layouts against furniture and wall zone
4. warning when a chosen layout is visually weak for the current room
5. adding staircase and hallway families as dedicated modes later
