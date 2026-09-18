export interface CollageCell {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CollageLayout {
  id: string;
  name: string;
  ratio: number;
  cells: CollageCell[];
}

function g(gap: number, cells: CollageCell[]): CollageCell[] {
  return cells.map((c) => ({
    x: c.x + gap,
    y: c.y + gap,
    w: Math.max(0.05, c.w - gap * 2),
    h: Math.max(0.05, c.h - gap * 2),
  }));
}

const G = 0.012;

/** Even grid that always matches photo count and canvas shape. */
export function autoCells(n: number, canvasRatio: number): CollageCell[] {
  const count = Math.max(1, Math.round(n));
  const landscape = canvasRatio >= 1.25;
  const portrait = canvasRatio <= 0.8;
  const ultrawide = canvasRatio >= 2.2;

  if (count === 1) return g(G, [{ x: 0, y: 0, w: 1, h: 1 }]);

  if (count === 2) {
    if (portrait) return g(G, [{ x: 0, y: 0, w: 1, h: 0.5 }, { x: 0, y: 0.5, w: 1, h: 0.5 }]);
    return g(G, [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }]);
  }

  if (count === 3) {
    if (ultrawide || landscape) {
      return g(G, [
        { x: 0, y: 0, w: 1 / 3, h: 1 },
        { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
        { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
      ]);
    }
    if (portrait) {
      return g(G, [
        { x: 0, y: 0, w: 1, h: 1 / 3 },
        { x: 0, y: 1 / 3, w: 1, h: 1 / 3 },
        { x: 0, y: 2 / 3, w: 1, h: 1 / 3 },
      ]);
    }
    return g(G, [
      { x: 0, y: 0, w: 1, h: 0.62 },
      { x: 0, y: 0.62, w: 0.5, h: 0.38 },
      { x: 0.5, y: 0.62, w: 0.5, h: 0.38 },
    ]);
  }

  if (count === 5 && !ultrawide) {
    return g(G, [
      { x: 0, y: 0, w: 0.6, h: 0.6 },
      { x: 0.6, y: 0, w: 0.4, h: 0.3 },
      { x: 0.6, y: 0.3, w: 0.4, h: 0.3 },
      { x: 0, y: 0.6, w: 0.3, h: 0.4 },
      { x: 0.3, y: 0.6, w: 0.7, h: 0.4 },
    ]);
  }

  let columns = 1;
  let rows = count;
  let best = 99;
  for (let cols = 1; cols <= count; cols++) {
    const r = Math.ceil(count / cols);
    const leftover = cols * r - count;
    const cellRatio = (canvasRatio * r) / cols;
    const score = Math.abs(Math.log(cellRatio)) + leftover * 0.12;
    if (score < best) {
      best = score;
      columns = cols;
      rows = r;
    }
  }
  const cells: CollageCell[] = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    const remaining = count - i;
    const colsInRow = r === rows - 1 ? remaining : columns;
    const cw = 1 / colsInRow;
    const ch = 1 / rows;
    for (let c = 0; c < colsInRow; c++) {
      cells.push({ x: c * cw, y: r * ch, w: cw, h: ch });
      i += 1;
    }
  }
  return g(G, cells);
}

export function layoutForCount(n: number, canvasRatio = 16 / 9): CollageLayout {
  const named = COLLAGES.find((c) => c.cells.length === n);
  if (named && Math.abs(named.ratio - canvasRatio) < 0.35) return named;
  return {
    id: "auto",
    name: `Auto ${n}`,
    ratio: canvasRatio,
    cells: autoCells(n, canvasRatio),
  };
}

export const COLLAGES: CollageLayout[] = [
  { id: "split-v", name: "Split V", ratio: 4 / 5, cells: g(G, [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }]) },
  { id: "split-h", name: "Split H", ratio: 16 / 9, cells: g(G, [{ x: 0, y: 0, w: 1, h: 0.5 }, { x: 0, y: 0.5, w: 1, h: 0.5 }]) },
  { id: "triptych", name: "Triptych", ratio: 16 / 9, cells: g(G, [{ x: 0, y: 0, w: 1 / 3, h: 1 }, { x: 1 / 3, y: 0, w: 1 / 3, h: 1 }, { x: 2 / 3, y: 0, w: 1 / 3, h: 1 }]) },
  { id: "rows3", name: "3 Rows", ratio: 3 / 4, cells: g(G, [{ x: 0, y: 0, w: 1, h: 1 / 3 }, { x: 0, y: 1 / 3, w: 1, h: 1 / 3 }, { x: 0, y: 2 / 3, w: 1, h: 1 / 3 }]) },
  { id: "grid4", name: "Grid 4", ratio: 1, cells: g(G, [{ x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 }, { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }]) },
  {
    id: "left-hero",
    name: "Left Hero",
    ratio: 16 / 10,
    cells: g(G, [
      { x: 0, y: 0, w: 0.62, h: 1 },
      { x: 0.62, y: 0, w: 0.38, h: 0.5 },
      { x: 0.62, y: 0.5, w: 0.38, h: 0.5 },
    ]),
  },
  {
    id: "right-hero",
    name: "Right Hero",
    ratio: 16 / 10,
    cells: g(G, [
      { x: 0, y: 0, w: 0.38, h: 0.5 },
      { x: 0, y: 0.5, w: 0.38, h: 0.5 },
      { x: 0.38, y: 0, w: 0.62, h: 1 },
    ]),
  },
  {
    id: "top-hero",
    name: "Top Hero",
    ratio: 4 / 5,
    cells: g(G, [
      { x: 0, y: 0, w: 1, h: 0.62 },
      { x: 0, y: 0.62, w: 0.5, h: 0.38 },
      { x: 0.5, y: 0.62, w: 0.5, h: 0.38 },
    ]),
  },
  {
    id: "magazine",
    name: "Magazine",
    ratio: 4 / 5,
    cells: g(G, [
      { x: 0, y: 0, w: 0.66, h: 0.66 },
      { x: 0.66, y: 0, w: 0.34, h: 0.33 },
      { x: 0.66, y: 0.33, w: 0.34, h: 0.33 },
      { x: 0, y: 0.66, w: 1, h: 0.34 },
    ]),
  },
  {
    id: "mosaic5",
    name: "Mosaic 5",
    ratio: 1,
    cells: g(G, [
      { x: 0, y: 0, w: 0.6, h: 0.6 },
      { x: 0.6, y: 0, w: 0.4, h: 0.3 },
      { x: 0.6, y: 0.3, w: 0.4, h: 0.3 },
      { x: 0, y: 0.6, w: 0.3, h: 0.4 },
      { x: 0.3, y: 0.6, w: 0.7, h: 0.4 },
    ]),
  },
  {
    id: "grid6",
    name: "Grid 6",
    ratio: 3 / 2,
    cells: g(G, [
      { x: 0, y: 0, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 0.5 },
      { x: 0, y: 0.5, w: 1 / 3, h: 0.5 },
      { x: 1 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
      { x: 2 / 3, y: 0.5, w: 1 / 3, h: 0.5 },
    ]),
  },
  {
    id: "story",
    name: "Story",
    ratio: 9 / 16,
    cells: g(G, [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 },
    ]),
  },
  {
    id: "strip",
    name: "Film Strip",
    ratio: 2.4,
    cells: g(G, [
      { x: 0, y: 0, w: 0.25, h: 1 },
      { x: 0.25, y: 0, w: 0.25, h: 1 },
      { x: 0.5, y: 0, w: 0.25, h: 1 },
      { x: 0.75, y: 0, w: 0.25, h: 1 },
    ]),
  },
  {
    id: "grid9",
    name: "Grid 9",
    ratio: 1,
    cells: g(G, [
      { x: 0, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 0, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 0, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
    ]),
  },
];
