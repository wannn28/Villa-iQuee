export type StopId = "eksterior" | "ruang-tamu" | "kamar" | "dek";

export type Vec3 = [number, number, number];

export type TourStop = {
  id: StopId;
  label: string;
  title: string;
  caption: string;
  /** Camera world position (meters) */
  position: Vec3;
  /** Camera look-at target (meters) */
  lookAt: Vec3;
  still: string;
  /** Forward hotspot; dek has none */
  hotspot?: {
    label: string;
    target: StopId;
    /** Percent from top-left of viewport */
    x: number;
    y: number;
  };
};

export const STOPS: TourStop[] = [
  {
    id: "eksterior",
    label: "Eksterior",
    title: "Fasad tenang",
    caption: "Volume plester hangat dan atap datar menghadap halaman masuk.",
    position: [1.6, 2.0, -10.2],
    lookAt: [0.5, 1.5, -1.0],
    still: "/stills/eksterior.png",
    hotspot: { label: "Ruang tamu", target: "ruang-tamu", x: 50, y: 62 },
  },
  {
    id: "ruang-tamu",
    label: "Ruang tamu",
    title: "Ruang berkumpul",
    caption: "Lantai kayu, sofa linen, dan cahaya lembut dari depan.",
    position: [-1.6, 1.55, -2.8],
    lookAt: [-3.0, 1.0, 1.0],
    still: "/stills/ruang-tamu.png",
    hotspot: { label: "Kamar", target: "kamar", x: 70, y: 48 },
  },
  {
    id: "kamar",
    label: "Kamar",
    title: "Kamar tenang",
    caption: "Ranjang rendah menghadap dinding plester yang tenang.",
    position: [2.4, 1.45, -1.2],
    lookAt: [4.4, 0.95, 1.5],
    still: "/stills/kamar.png",
    hotspot: { label: "Dek", target: "dek", x: 30, y: 55 },
  },
  {
    id: "dek",
    label: "Dek",
    title: "Dek sore",
    caption: "Terrace kayu menghadap air dangkal dan hijau halaman belakang.",
    position: [0.2, 1.6, 3.0],
    lookAt: [1.5, 0.85, 6.6],
    still: "/stills/dek.png",
  },
];

export const STOP_INDEX: Record<StopId, number> = {
  eksterior: 0,
  "ruang-tamu": 1,
  kamar: 2,
  dek: 3,
};

/** Horizontal rail spans 32%–68% width; vertical at 88% from top. */
export const RAIL = {
  left: 32,
  right: 68,
  top: 88,
} as const;

export const CAMERA_TRAVEL_SECONDS = 2.4;
