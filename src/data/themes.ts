import type {
  FontStyle,
  MoodType,
  ThemePalette,
  ThemePreset,
  WeatherType,
} from "../types";

export const THEMES: ThemePreset[] = [
  { id: "mint", name: "薄荷曼波", colors: ["#CFE4DD", "#F9F4EA", "#FCD3D5", "#8D6C63"] },
  { id: "walden", name: "瓦尔登湖", colors: ["#CAEBED", "#CCE7D9", "#63BAD9", "#427F98"] },
  { id: "retro-us", name: "美式复古", colors: ["#79BEDA", "#F18C89", "#F6DF8D", "#4965A8"] },
  { id: "imperial", name: "先帝最爱", colors: ["#F5C7C9", "#FEF4F4", "#F8819B", "#936A7B"] },
  { id: "guava", name: "青提芭乐", colors: ["#FED0D6", "#E4F6A9", "#FF82A2", "#738D58"] },
  { id: "island", name: "椰风海岛", colors: ["#95B4E0", "#CADEC3", "#225DAB", "#806B61"] },
  { id: "golden", name: "浮光跃金", colors: ["#C8D4C0", "#F1D996", "#799B84", "#586C59"] },
  { id: "soda", name: "橘子汽水", colors: ["#FE8F29", "#FAE593", "#849C4D", "#714D35"] },
  { id: "grape", name: "海盐葡萄", colors: ["#B6A9C8", "#EFE4D4", "#9078AC", "#302B58"] },
  { id: "confession", name: "甜蜜告白", colors: ["#B2634C", "#F5CA92", "#E9BDA7", "#512D1D"] },
  { id: "cupid", name: "见习爱神", colors: ["#F57848", "#F9D262", "#B43E16", "#80402D"] },
  { id: "snow", name: "一起白头", colors: ["#E89CCD", "#FAE4B5", "#D4CA82", "#896B66"] },
  { id: "palm", name: "捧在手心", colors: ["#C9D7EE", "#C8A0DF", "#5E5783", "#514A70"] },
  { id: "lavender", name: "紫雾轻岚", colors: ["#DCCDF2", "#F7F3ED", "#F2D6E2", "#827193"] },
  { id: "lime", name: "青柠微风", colors: ["#D3E8B7", "#CDE7FA", "#FFF4B6", "#7E9660"] },
  { id: "tea", name: "茶露青岚", colors: ["#B7C8A8", "#E8E3CC", "#CBBF9E", "#70624F"] },
];

export const DEFAULT_THEME = THEMES[0];

export function paletteFromTheme(theme: ThemePreset): ThemePalette {
  const luminance = (hex: string) => {
    const values = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
    return values.reduce((sum, value, index) => {
      const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      return sum + linear * [0.2126, 0.7152, 0.0722][index];
    }, 0);
  };
  const ordered = [...theme.colors].sort((a, b) => luminance(b) - luminance(a));
  const [lightest, lighterMiddle, deeperMiddle, darkest] = ordered;
  return {
    paper: mixHex(lightest, "#FFFDF7", 0.52),
    auxiliary: lighterMiddle,
    accent: deeperMiddle,
    decoration: mixHex(lighterMiddle, deeperMiddle, 0.42),
    text: darkest,
  };
}

export const DEFAULT_PALETTE = paletteFromTheme(DEFAULT_THEME);

export const WEATHER_OPTIONS: { id: WeatherType; label: string }[] = [
  { id: "sunny", label: "晴天" },
  { id: "cloudy", label: "多云" },
  { id: "rainy", label: "雨天" },
  { id: "snowy", label: "下雪" },
  { id: "rainbow", label: "彩虹" },
];

export const MOOD_OPTIONS: { id: MoodType; label: string }[] = [
  { id: "happy", label: "开心" },
  { id: "calm", label: "平静" },
  { id: "moved", label: "感动" },
  { id: "tired", label: "疲惫" },
  { id: "sad", label: "难过" },
  { id: "excited", label: "兴奋" },
];

export const FONT_OPTIONS: {
  id: FontStyle;
  name: string;
  family: string;
  sample: string;
}[] = [
  {
    id: "clear",
    name: "清晰正文",
    family: '"Microsoft YaHei", "PingFang SC", sans-serif',
    sample: "清清楚楚，记录当下",
  },
  {
    id: "serif",
    name: "复古衬线",
    family: '"Songti SC", "SimSun", serif',
    sample: "旧时光里的温柔",
  },
  {
    id: "hand",
    name: "温柔手写",
    family: '"STKaiti", "KaiTi", cursive',
    sample: "把日子写成小诗",
  },
];

export function fontFamilyFor(style: FontStyle | undefined): string {
  return FONT_OPTIONS.find((font) => font.id === style)?.family ?? FONT_OPTIONS[0].family;
}

export function readableInk(palette: ThemePalette): string {
  return palette.text;
}

export function mixHex(a: string, b: string, ratio = 0.5): string {
  const parse = (hex: string) => {
    const clean = hex.replace("#", "");
    return [
      Number.parseInt(clean.slice(0, 2), 16),
      Number.parseInt(clean.slice(2, 4), 16),
      Number.parseInt(clean.slice(4, 6), 16),
    ];
  };
  const first = parse(a);
  const second = parse(b);
  return `#${first
    .map((value, index) => Math.round(value * (1 - ratio) + second[index] * ratio))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}
