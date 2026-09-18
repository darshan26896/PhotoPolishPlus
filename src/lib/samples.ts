export const SAMPLE_URLS = {
  portrait:
    "https://images.pexels.com/photos/11492620/pexels-photo-11492620.jpeg?auto=compress&cs=tinysrgb&w=1400",
  portraitSoft:
    "https://images.pexels.com/photos/4859722/pexels-photo-4859722.jpeg?auto=compress&cs=tinysrgb&w=1400",
  landscape:
    "https://images.pexels.com/photos/6335993/pexels-photo-6335993.jpeg?auto=compress&cs=tinysrgb&w=1800",
  forest:
    "https://images.pexels.com/photos/1259827/pexels-photo-1259827.jpeg?auto=compress&cs=tinysrgb&w=1800",
  bokeh:
    "https://images.pexels.com/photos/5577425/pexels-photo-5577425.jpeg?auto=compress&cs=tinysrgb&w=1600",
  prism:
    "https://images.pexels.com/photos/6063557/pexels-photo-6063557.jpeg?auto=compress&cs=tinysrgb&w=1600",
  leaves:
    "https://images.pexels.com/photos/28079387/pexels-photo-28079387.jpeg?auto=compress&cs=tinysrgb&w=1600",
  smoke:
    "https://images.pexels.com/photos/9694216/pexels-photo-9694216.jpeg?auto=compress&cs=tinysrgb&w=1600",
};

export const SAMPLE_PROJECTS = [
  {
    id: "golden",
    title: "Golden Hour",
    blurb: "Portrait cutout over alpine light, then a screen of bokeh.",
    cover: SAMPLE_URLS.landscape,
    accent: "#e2b66a",
  },
  {
    id: "botanical",
    title: "Botanical Shade",
    blurb: "Studio portrait with a multiply of palm shadows.",
    cover: SAMPLE_URLS.leaves,
    accent: "#9dba86",
  },
  {
    id: "nocturne",
    title: "Nocturne Leak",
    blurb: "Forest dusk, smoke screen, and a soft-light figure.",
    cover: SAMPLE_URLS.forest,
    accent: "#c48b6a",
  },
] as const;

export type SampleId = (typeof SAMPLE_PROJECTS)[number]["id"];
