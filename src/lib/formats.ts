export interface SafeZone {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CanvasFormat {
  id: string;
  group: string;
  name: string;
  ratio: string;
  w: number;
  h: number;
  hint: string;
  safe?: SafeZone;
}

export const FORMAT_GROUPS = ["YouTube", "OBS / Stream", "Social", "Photo"] as const;

export const CANVAS_FORMATS: CanvasFormat[] = [
  {
    id: "yt-hd",
    group: "YouTube",
    name: "Video HD",
    ratio: "16:9",
    w: 1920,
    h: 1080,
    hint: "Standard upload, end screens, OBS canvas",
  },
  {
    id: "yt-qhd",
    group: "YouTube",
    name: "Video QHD",
    ratio: "16:9",
    w: 2560,
    h: 1440,
    hint: "1440p master",
  },
  {
    id: "yt-thumb",
    group: "YouTube",
    name: "Thumbnail",
    ratio: "16:9",
    w: 1280,
    h: 720,
    hint: "Clickable thumbnail — keep faces in the center",
  },
  {
    id: "yt-banner",
    group: "YouTube",
    name: "Channel art",
    ratio: "16:9",
    w: 2560,
    h: 1440,
    hint: "YouTube channel cover. Safe zone is the TV/desktop strip.",
    safe: { x: (2560 - 1546) / 2 / 2560, y: (1440 - 423) / 2 / 1440, w: 1546 / 2560, h: 423 / 1440 },
  },
  {
    id: "yt-strip",
    group: "YouTube",
    name: "Banner 16:4",
    ratio: "16:4",
    w: 1920,
    h: 480,
    hint: "Wide channel/header strip",
  },
  {
    id: "yt-bar",
    group: "YouTube",
    name: "Banner 12:4",
    ratio: "12:4",
    w: 1920,
    h: 640,
    hint: "3:1 lower-third / community banner",
  },
  {
    id: "yt-short",
    group: "YouTube",
    name: "Shorts",
    ratio: "9:16",
    w: 1080,
    h: 1920,
    hint: "YouTube Shorts, Reels, TikTok",
  },
  {
    id: "obs-full",
    group: "OBS / Stream",
    name: "OBS overlay",
    ratio: "16:9",
    w: 1920,
    h: 1080,
    hint: "Full-screen stream overlay",
  },
  {
    id: "obs-bar",
    group: "OBS / Stream",
    name: "Overlay 16:4",
    ratio: "16:4",
    w: 1920,
    h: 480,
    hint: "Top/bottom info bar, alerts strip",
  },
  {
    id: "obs-wide",
    group: "OBS / Stream",
    name: "Overlay 12:4",
    ratio: "12:4",
    w: 1920,
    h: 640,
    hint: "Webcam + cam frame / BRB panel",
  },
  {
    id: "obs-cam169",
    group: "OBS / Stream",
    name: "Webcam 16:9",
    ratio: "16:9",
    w: 1280,
    h: 720,
    hint: "Facecam source",
  },
  {
    id: "obs-cam43",
    group: "OBS / Stream",
    name: "Webcam 4:3",
    ratio: "4:3",
    w: 960,
    h: 720,
    hint: "Classic webcam",
  },
  {
    id: "obs-square",
    group: "OBS / Stream",
    name: "Cam 1:1",
    ratio: "1:1",
    w: 1080,
    h: 1080,
    hint: "Square cam / guest tile",
  },
  {
    id: "obs-small",
    group: "OBS / Stream",
    name: "Mini cam",
    ratio: "16:9",
    w: 640,
    h: 360,
    hint: "Corner webcam",
  },
  {
    id: "ig-post",
    group: "Social",
    name: "Instagram",
    ratio: "1:1",
    w: 1080,
    h: 1080,
    hint: "Feed post",
  },
  {
    id: "ig-portrait",
    group: "Social",
    name: "IG Portrait",
    ratio: "4:5",
    w: 1080,
    h: 1350,
    hint: "Feed 4:5",
  },
  {
    id: "story",
    group: "Social",
    name: "Story / Reel",
    ratio: "9:16",
    w: 1080,
    h: 1920,
    hint: "Stories, Reels, TikTok, Shorts",
  },
  {
    id: "x-header",
    group: "Social",
    name: "X header",
    ratio: "3:1",
    w: 1500,
    h: 500,
    hint: "Twitter / X banner",
  },
  {
    id: "li-banner",
    group: "Social",
    name: "LinkedIn",
    ratio: "4:1",
    w: 1584,
    h: 396,
    hint: "LinkedIn cover 4:1",
  },
  {
    id: "photo-32",
    group: "Photo",
    name: "Landscape 3:2",
    ratio: "3:2",
    w: 1800,
    h: 1200,
    hint: "Classic stills",
  },
  {
    id: "photo-45",
    group: "Photo",
    name: "Portrait 4:5",
    ratio: "4:5",
    w: 1200,
    h: 1500,
    hint: "Print / editorial",
  },
  {
    id: "photo-23",
    group: "Photo",
    name: "Portrait 2:3",
    ratio: "2:3",
    w: 1200,
    h: 1800,
    hint: "Full-frame portrait",
  },
];

export function formatById(id: string) {
  return CANVAS_FORMATS.find((f) => f.id === id) ?? null;
}

export function matchFormat(w: number, h: number) {
  const r = w / h;
  let best: CanvasFormat | null = null;
  let score = 99;
  for (const f of CANVAS_FORMATS) {
    const d = Math.abs(f.w / f.h - r) + (f.w === w && f.h === h ? -0.5 : 0);
    if (d < score) {
      score = d;
      best = f;
    }
  }
  return score < 0.08 ? best : null;
}
