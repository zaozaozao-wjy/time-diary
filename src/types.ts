export type Screen = "cover" | "reader" | "editor" | "calendar";

export type ElementType =
  | "photo"
  | "text"
  | "sticker"
  | "tape"
  | "note"
  | "shape"
  | "tag"
  | "frame";

export type FrameStyle = "polaroid" | "rounded" | "film" | "torn";
export type WeatherType = "sunny" | "cloudy" | "rainy" | "snowy" | "rainbow";
export type MoodType = "happy" | "calm" | "moved" | "tired" | "sad" | "excited";
export type TextAlign = "left" | "center" | "right";
export type FontStyle = "clear" | "serif" | "hand";

export interface CanvasElement {
  id: string;
  type: ElementType;
  assetId?: string;
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontStyle?: FontStyle;
  color?: string;
  backgroundColor?: string;
  align?: TextAlign;
  frameStyle?: FrameStyle;
  cropX?: number;
  cropY?: number;
  cropScale?: number;
  weather?: WeatherType;
  mood?: MoodType;
}

export interface ThemePalette {
  paper: string;
  auxiliary: string;
  accent: string;
  decoration: string;
  text: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  colors: [string, string, string, string];
}

export interface SavedPalette {
  id: string;
  name: string;
  palette: ThemePalette;
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  body: string;
  weather?: WeatherType;
  mood?: MoodType;
  themeId: string;
  palette: ThemePalette;
  backgroundId?: string;
  elements: CanvasElement[];
  createdAt: number;
  updatedAt: number;
}

export type AssetKind = "sticker" | "tape" | "frame" | "note" | "background";
export type StickerTheme =
  | "watercolor"
  | "daily"
  | "vintage"
  | "food"
  | "stationery"
  | "nature"
  | "dreamy"
  | "basic";

export interface JournalAsset {
  id: string;
  name: string;
  kind: AssetKind;
  theme: StickerTheme;
  src: string;
  frameStyle?: FrameStyle;
  width: number;
  height: number;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  create: (date: string, palette: ThemePalette) => Partial<DiaryEntry>;
}

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";
