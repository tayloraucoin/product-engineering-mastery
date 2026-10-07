/**
 * Where a pin sits (pins.md "Anchor", S17, D-LAB-13), pure. An anchor names
 * one element, by its marked region (`data-sandbox-region`, LAB-4), else its
 * id, else a structural path from the design's root, plus x and y as
 * fractions of that element's box. It is built and resolved only inside the
 * shown design's root (`data-sandbox-design`, LAB-11), so two designs that
 * share an id never reach each other's pins.
 *
 * Written against `AnchorElement`, the few members of a DOM Element it reads,
 * so `node --test` runs it on plain fakes and the page passes real elements.
 * Prior art, never copied: K `lib/review/anchor.ts:33-98`.
 */

/** The parts of a DOM Element the anchor reads. A real Element satisfies it. */
export type AnchorElement = {
  readonly tagName: string;
  readonly id: string;
  readonly parentElement: AnchorElement | null;
  readonly children: ArrayLike<AnchorElement>;
  readonly textContent: string | null;
  getAttribute(name: string): string | null;
  getBoundingClientRect(): {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

export const REGION_ATTRIBUTE = "data-sandbox-region";
export const REGION_NAME_ATTRIBUTE = "data-sandbox-name";
export const DESIGN_ATTRIBUTE = "data-sandbox-design";

/** As stored: one of `marked`, `id` or `path`, the fractions, and the place's name. */
export type Anchor = (
  | { marked: string; id?: never; path?: never }
  | { id: string; marked?: never; path?: never }
  | { path: string; marked?: never; id?: never }
) & { x: number; y: number; place?: string };

/** An anchor's JSON is at most this many bytes (data-contract.md). */
export const ANCHOR_BYTES_MAX = 2048;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function isInside(root: AnchorElement, element: AnchorElement): boolean {
  for (let at: AnchorElement | null = element; at; at = at.parentElement)
    if (at === root) return true;
  return false;
}

/** `section:nth-of-type(2)>p:nth-of-type(1)`, from just below the root down to the element; "" is the root. */
export function pathFrom(root: AnchorElement, element: AnchorElement): string {
  const steps: string[] = [];
  for (let at = element; at !== root;) {
    const parent = at.parentElement;
    if (!parent) return "";
    const tag = at.tagName.toLowerCase();
    let nth = 0;
    for (const sibling of Array.from(parent.children)) {
      if (sibling.tagName.toLowerCase() === tag) nth += 1;
      if (sibling === at) break;
    }
    steps.unshift(`${tag}:nth-of-type(${nth})`);
    at = parent;
  }
  return steps.join(">");
}

function byPath(root: AnchorElement, path: string): AnchorElement | null {
  if (path === "") return root;
  let at: AnchorElement = root;
  for (const step of path.split(">")) {
    const match = /^([a-z][a-z0-9-]*):nth-of-type\((\d+)\)$/.exec(step);
    if (!match) return null;
    const [, tag, n] = match;
    const same = Array.from(at.children).filter(
      (child) => child.tagName.toLowerCase() === tag,
    );
    const next = same[Number(n) - 1];
    if (!next) return null;
    at = next;
  }
  return at;
}

/** Depth-first, the root itself excluded. */
function find(
  root: AnchorElement,
  test: (element: AnchorElement) => boolean,
): AnchorElement | null {
  const stack = Array.from(root.children).reverse();
  while (stack.length) {
    const element = stack.pop()!;
    if (test(element)) return element;
    stack.push(...Array.from(element.children).reverse());
  }
  return null;
}

/** The element an anchor names, looked up inside this root only; null when it is not there. */
export function resolveAnchor(
  root: AnchorElement,
  anchor: Anchor,
): AnchorElement | null {
  if (typeof anchor.marked === "string")
    return find(
      root,
      (e) => e.getAttribute(REGION_ATTRIBUTE) === anchor.marked,
    );
  if (typeof anchor.id === "string")
    return find(root, (e) => e.id === anchor.id);
  if (typeof anchor.path === "string") return byPath(root, anchor.path);
  return null;
}

function fractionsAt(
  element: AnchorElement,
  point: { x: number; y: number },
): { x: number; y: number } {
  const box = element.getBoundingClientRect();
  return {
    x: box.width > 0 ? clamp01((point.x - box.left) / box.width) : 0,
    y: box.height > 0 ? clamp01((point.y - box.top) / box.height) : 0,
  };
}

function nearestMarked(
  root: AnchorElement,
  element: AnchorElement,
): AnchorElement | null {
  for (
    let at: AnchorElement | null = element;
    at && at !== root;
    at = at.parentElement
  )
    if (at.getAttribute(REGION_ATTRIBUTE)) return at;
  return null;
}

function fits(anchor: Anchor): boolean {
  return (
    new TextEncoder().encode(JSON.stringify(anchor)).length <= ANCHOR_BYTES_MAX
  );
}

/**
 * The anchor for a point on `target`, in viewport coordinates: the target's
 * own marked id, else its id, else its path from the root. A path too long
 * for 2 KB falls back to the nearest marked region, then to the root.
 * Null when the target is not inside the root.
 */
export function buildAnchor(
  root: AnchorElement,
  target: AnchorElement,
  point: { x: number; y: number },
  place?: string,
): Anchor | null {
  if (!isInside(root, target)) return null;
  const withPlace = <T extends object>(anchor: T) =>
    (place === undefined ? anchor : { ...anchor, place }) as unknown as Anchor;
  const marked = target === root ? null : target.getAttribute(REGION_ATTRIBUTE);
  if (marked) return withPlace({ marked, ...fractionsAt(target, point) });
  if (target !== root && target.id)
    return withPlace({ id: target.id, ...fractionsAt(target, point) });
  const byPathAnchor = withPlace({
    path: pathFrom(root, target),
    ...fractionsAt(target, point),
  });
  if (fits(byPathAnchor)) return byPathAnchor;
  const region = nearestMarked(root, target);
  if (region)
    return withPlace({
      marked: region.getAttribute(REGION_ATTRIBUTE)!,
      ...fractionsAt(region, point),
    });
  return withPlace({ path: "", ...fractionsAt(root, point) });
}

/** A Tab stop's placement: a marked region at its top-start corner, a design control at its centre. */
export function keyboardPoint(
  element: AnchorElement,
  kind: "region" | "control",
): { x: number; y: number } {
  const box = element.getBoundingClientRect();
  return kind === "region"
    ? { x: box.left, y: box.top }
    : { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

/**
 * Where a pin draws, relative to the root's top-left corner, or null when
 * its anchor does not resolve in this root (not drawn; listed as not found).
 */
export function pinOffset(
  root: AnchorElement,
  anchor: Anchor,
): { left: number; top: number } | null {
  const element = resolveAnchor(root, anchor);
  if (!element) return null;
  const box = element.getBoundingClientRect();
  const origin = root.getBoundingClientRect();
  return {
    left: box.left - origin.left + clamp01(anchor.x) * box.width,
    top: box.top - origin.top + clamp01(anchor.y) * box.height,
  };
}
