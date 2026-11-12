/**
 * Mutable state shared between the DOM shell and the WebGL ribbon.
 * Lives in a ref so per-frame updates never re-render React.
 */
export type HeroCard = {
  slug: string;
  order: number;
  name: string;
  ribbonStat: string;
  cardImage: string;
  heroImage: string;
};

export type ScreenRect = { left: number; top: number; width: number; height: number };

export type RibbonStore = {
  offset: number;
  velocity: number;
  targetOffset: number | null;
  /** Pointer in normalised device coords, null when outside the hero. */
  pointer: { x: number; y: number } | null;
  dragging: boolean;
  hovered: number | null;
  focusIndex: number | null;
  /** Called every frame with ribbon progress 0..1. */
  onProgress?: (p: number) => void;
  /** Called every frame with the hovered card's chip anchor in CSS px (or null). */
  onChip?: (index: number | null, x: number, y: number) => void;
  /** Screen rect of a card's photo (for the shared-element transition). */
  getCardRect?: (index: number) => ScreenRect | null;
  onReady?: () => void;
};

export function createRibbonStore(): RibbonStore {
  return {
    offset: 0,
    velocity: 0,
    targetOffset: null,
    pointer: null,
    dragging: false,
    hovered: null,
    focusIndex: null,
  };
}
