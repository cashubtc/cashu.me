import type { FunctionalComponent, VNode } from "vue";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  Info,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  TriangleAlert,
  X,
} from "lucide-vue-next";

// Quasar draws its own icons (toasts, pagination, the expansion chevron, a field's clear and
// error marks) from an icon set of Material font names. This builds that set from Lucide
// instead, so every icon in the app is one line family and the Material font isn't needed.
// Quasar takes an SVG icon as "d@@style&&d@@style|viewBox", paths only, so each Lucide shape
// is converted to a path and given Lucide's stroke.

type IconNode = [string, Record<string, string | number>][];

const STROKE =
  "fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round";

const n = (v: string | number | undefined) => Number(v ?? 0);

function toPath(tag: string, a: Record<string, string | number>): string {
  switch (tag) {
    case "path":
      return String(a.d);
    case "line":
      return `M${a.x1} ${a.y1}L${a.x2} ${a.y2}`;
    case "polyline":
    case "polygon": {
      const xy = String(a.points)
        .trim()
        .split(/[\s,]+/);
      const pts = xy
        .filter((_, k) => k % 2 === 0)
        .map((x, k) => {
          return `${x} ${xy[2 * k + 1]}`;
        });
      return `M${pts.join("L")}${tag === "polygon" ? "Z" : ""}`;
    }
    case "circle":
    case "ellipse": {
      const rx = n(a.rx ?? a.r);
      const ry = n(a.ry ?? a.r);
      const cx = n(a.cx);
      const cy = n(a.cy);
      return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${
        2 * rx
      } 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
    }
    case "rect": {
      const x = n(a.x);
      const y = n(a.y);
      const w = n(a.width);
      const h = n(a.height);
      const r = Math.min(n(a.rx ?? a.ry), w / 2, h / 2);
      if (!r) return `M${x} ${y}h${w}v${h}h${-w}Z`;
      return (
        `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}` +
        `a${r} ${r} 0 0 1 ${-r} ${r}h${-(
          w -
          2 * r
        )}a${r} ${r} 0 0 1 ${-r} ${-r}` +
        `v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`
      );
    }
    default:
      throw new Error(`lucide-icons: unsupported shape <${tag}>`);
  }
}

/** A Lucide icon as a Quasar icon name, for `icon` props and Notify. */
export function lucideIcon(icon: FunctionalComponent): string {
  // A Lucide component is a functional wrapper that hands its shapes to the shared Icon.
  const vnode = icon({}, { slots: {} } as never) as VNode;
  const nodes = (vnode.props as { iconNode: IconNode }).iconNode;
  return (
    nodes.map(([tag, attrs]) => `${toPath(tag, attrs)}@@${STROKE}`).join("&&") +
    "|0 0 24 24"
  );
}

// Carousel and stepper dots stay solid, as in Material.
const DOT = "M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10z|0 0 24 24";

const i = lucideIcon;

/** Quasar's icon set, drawn with Lucide (installed in src/boot/global-components.js). The
 *  editor, colour picker, tree and uploader keys are left out: the app has none of them. */
export const lucideIconSet = {
  name: "lucide",
  type: {
    positive: i(CircleCheck),
    negative: i(CircleAlert),
    info: i(Info),
    warning: i(TriangleAlert),
  },
  arrow: {
    up: i(ArrowUp),
    right: i(ArrowRight),
    down: i(ArrowDown),
    left: i(ArrowLeft),
    dropdown: i(ChevronDown),
  },
  chevron: { left: i(ChevronLeft), right: i(ChevronRight) },
  pullToRefresh: { icon: i(RefreshCw) },
  carousel: {
    left: i(ChevronLeft),
    right: i(ChevronRight),
    up: i(ChevronUp),
    down: i(ChevronDown),
    navigationIcon: DOT,
  },
  chip: { remove: i(CircleX), selected: i(Check) },
  datetime: {
    arrowLeft: i(ChevronLeft),
    arrowRight: i(ChevronRight),
    now: i(Clock),
    today: i(CalendarDays),
  },
  expansionItem: { icon: i(ChevronDown), denseIcon: i(ChevronDown) },
  fab: { icon: i(Plus), activeIcon: i(X) },
  field: { clear: i(CircleX), error: i(CircleAlert) },
  pagination: {
    first: i(ChevronFirst),
    prev: i(ChevronLeft),
    next: i(ChevronRight),
    last: i(ChevronLast),
  },
  rating: { icon: i(Star) },
  stepper: { done: i(Check), active: i(Pencil), error: i(TriangleAlert) },
  tabs: {
    left: i(ChevronLeft),
    right: i(ChevronRight),
    up: i(ChevronUp),
    down: i(ChevronDown),
  },
  table: {
    arrowUp: i(ArrowUp),
    warning: i(TriangleAlert),
    firstPage: i(ChevronFirst),
    prevPage: i(ChevronLeft),
    nextPage: i(ChevronRight),
    lastPage: i(ChevronLast),
  },
};
