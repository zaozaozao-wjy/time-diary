import type { CanvasElement, DiaryEntry, ThemePalette, TemplateDefinition } from "../types";
import { ASSET_BY_ID } from "./assets";

const id = () => crypto.randomUUID();

function baseElement(type: CanvasElement["type"], x: number, y: number, width: number, height: number) {
  return {
    id: id(),
    type,
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
  } as CanvasElement;
}

function textElement(
  text: string,
  x: number,
  y: number,
  width: number,
  palette: ThemePalette,
  fontSize = 24,
  height = 140,
) {
  return {
    ...baseElement("text", x, y, width, height),
    text,
    fontSize,
    fontStyle: "hand" as const,
    color: palette.text,
    align: "left" as const,
  };
}

function stickerElement(assetId: string, x: number, y: number, scale = 1) {
  const asset = ASSET_BY_ID.get(assetId)!;
  return {
    ...baseElement("sticker", x, y, asset.width * scale, asset.height * scale),
    assetId,
    src: asset.src,
  };
}

function photoElement(x: number, y: number, width: number, height: number) {
  return {
    ...baseElement("photo", x, y, width, height),
    frameStyle: "polaroid" as const,
    cropX: 0.5,
    cropY: 0.5,
    cropScale: 1,
  };
}

function noteElement(
  assetId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  palette: ThemePalette,
  rotation = 0,
) {
  return {
    ...baseElement("note", x, y, width, height),
    assetId,
    src: ASSET_BY_ID.get(assetId)?.src,
    text,
    fontSize: 18,
    fontStyle: "hand" as const,
    color: palette.text,
    align: "left" as const,
    rotation,
  };
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "today",
    name: "今日碎片",
    description: "一张大照片，记下今天的光",
    create: (_date, palette) => ({
      title: "今日碎片",
      body: "今天也有一点小小的心动，值得被收进手帖里。",
      elements: [
        photoElement(156, 166, 414, 410),
        stickerElement("tape-pink-stripe", 267, 137, 0.82),
        stickerElement("fern", 72, 624, 0.92),
        textElement("把今天的小确幸，轻轻放在这里。", 142, 655, 470, palette, 24, 116),
        stickerElement("star", 566, 186, 0.64),
      ],
    }),
  },
  {
    id: "collage",
    name: "照片拼贴",
    description: "照片、胶带与植物错落相拥",
    create: (_date, palette) => ({
      title: "这一周的小确幸",
      body: "把喜欢的片刻拼在一起，平凡的日子也会发光。",
      elements: [
        {
          ...photoElement(82, 153, 241, 267),
          rotation: -5,
        },
        {
          ...photoElement(363, 130, 260, 284),
          rotation: 4,
          frameStyle: "film" as const,
        },
        {
          ...photoElement(126, 438, 249, 277),
          rotation: 3,
          frameStyle: "rounded" as const,
        },
        {
          ...photoElement(396, 450, 239, 274),
          rotation: -4,
          frameStyle: "torn" as const,
        },
        {
          ...stickerElement("tape-mint-grid", 135, 131, 0.92),
          rotation: -7,
        },
        {
          ...stickerElement("tape-floral", 423, 111, 0.92),
          rotation: 6,
        },
        stickerElement("eucalyptus", 570, 301, 0.8),
        stickerElement("daisy", 60, 343, 0.72),
        textElement("our little moments", 223, 744, 329, palette, 22, 54),
        stickerElement("bow", 332, 782, 0.58),
      ],
    }),
  },
  {
    id: "mood",
    name: "心情日记",
    description: "给情绪留一张柔软的便签",
    create: (_date, palette) => ({
      title: "今天的心情",
      body: "有些感受不用急着解释，先把它好好写下来。",
      elements: [
        {
          ...baseElement("note", 127, 138, 466, 336),
          src: ASSET_BY_ID.get("note-cream")!.src,
          assetId: "note-cream",
          rotation: -2,
          backgroundColor: "#FFF4D9",
        },
        textElement("今天最想记住的是……", 170, 176, 383, palette, 24, 238),
        {
          ...baseElement("tag", 146, 509, 58, 58),
          weather: "sunny",
          backgroundColor: palette.accent,
          color: palette.text,
        },
        {
          ...baseElement("tag", 400, 509, 58, 58),
          mood: "calm",
          backgroundColor: palette.auxiliary,
          color: palette.text,
        },
        stickerElement("rose", 508, 597, 0.92),
        stickerElement("wildflower", 116, 661, 0.78),
        textElement("日子慢慢过，心事轻轻放。", 203, 752, 370, palette, 26, 76),
      ],
    }),
  },
  {
    id: "weekly",
    name: "周记清单",
    description: "两张照片与两张便签，整理一周心情",
    create: (_date, palette) => ({
      title: "这一周，慢慢长大",
      body: "把零散的小事收在一起，原来也走过这么远。",
      elements: [
        { ...photoElement(72, 151, 257, 251), rotation: -3 },
        { ...photoElement(80, 428, 242, 238), rotation: 3, frameStyle: "rounded" as const },
        noteElement(
          "note-blush",
          371,
          143,
          284,
          216,
          "本周的小收获：\n· 读完一本书\n· 去公园散步\n· 早睡了一次",
          palette,
          2,
        ),
        noteElement(
          "note-sage",
          387,
          387,
          263,
          207,
          "想留住的瞬间：\n窗边的一束光，和一杯温热的茶。",
          palette,
          -2,
        ),
        { ...stickerElement("tape-mint-grid", 181, 126, 0.82), rotation: -7 },
        stickerElement("sunflower", 574, 590, 0.74),
        stickerElement("star", 571, 173, 0.46),
        textElement("a gentle week", 203, 730, 320, palette, 23, 54),
      ],
    }),
  },
  {
    id: "travel",
    name: "旅行明信片",
    description: "三格旅行胶片与一张沿途便签",
    create: (_date, palette) => ({
      title: "去有风的地方",
      body: "沿着海岸线慢慢走，把远方写成一封明信片。",
      elements: [
        { ...photoElement(55, 158, 184, 220), rotation: -4 },
        {
          ...photoElement(270, 145, 184, 238),
          rotation: 1,
          frameStyle: "film" as const,
        },
        {
          ...photoElement(481, 158, 184, 220),
          rotation: 4,
          frameStyle: "torn" as const,
        },
        noteElement(
          "note-cream",
          108,
          411,
          502,
          249,
          "今日路线：\n从清晨的小站出发，沿海边散步，\n在落日以前找到一家安静的小店。",
          palette,
          -1,
        ),
        { ...stickerElement("tape-floral", 279, 124, 0.92), rotation: -3 },
        stickerElement("seashell", 63, 329, 0.73),
        stickerElement("acorn", 579, 353, 0.66),
        stickerElement("aurora", 519, 604, 0.68),
        textElement("postcards from nowhere", 192, 716, 360, palette, 22, 54),
      ],
    }),
  },
  {
    id: "goodnight",
    name: "晚安随记",
    description: "柔和月色、星星和写给自己的话",
    create: (_date, palette) => ({
      title: "晚安，今天辛苦啦",
      body: "把没有做完的事留给明天，今晚先好好休息。",
      elements: [
        {
          ...baseElement("shape", 44, 135, 632, 558),
          backgroundColor: palette.auxiliary,
          color: palette.decoration,
          opacity: 0.23,
        },
        noteElement(
          "note-lavender",
          123,
          214,
          471,
          316,
          "今天已经做得很好了。\n\n放下一点担心，也放下一点疲惫。\n愿明天醒来，心里轻轻的。",
          palette,
          -1,
        ),
        stickerElement("sleepyMoon", 502, 151, 0.9),
        stickerElement("cloudStar", 78, 160, 0.73),
        stickerElement("constellation", 510, 524, 0.82),
        {
          ...baseElement("tag", 119, 548, 58, 58),
          weather: "cloudy",
          backgroundColor: palette.auxiliary,
          color: palette.text,
        },
        {
          ...baseElement("tag", 197, 548, 58, 58),
          mood: "tired",
          backgroundColor: palette.auxiliary,
          color: palette.text,
        },
        textElement("good night, little star", 205, 719, 318, palette, 23, 58),
      ],
    }),
  },
  {
    id: "birthday",
    name: "生日纪念",
    description: "照片、蛋糕与彩纸组成小小庆祝页",
    create: (_date, palette) => ({
      title: "又长大了一岁",
      body: "愿新的一岁，仍然有花、有梦，也有好好生活的勇气。",
      elements: [
        {
          ...photoElement(135, 166, 450, 348),
          rotation: -2,
          frameStyle: "polaroid" as const,
        },
        { ...stickerElement("tape-pink-stripe", 267, 138, 0.86), rotation: -4 },
        stickerElement("cake", 68, 492, 0.88),
        stickerElement("bow", 540, 500, 0.72),
        stickerElement("star", 83, 651, 0.45),
        stickerElement("star", 573, 665, 0.54),
        noteElement(
          "note-cream",
          202,
          518,
          336,
          188,
          "生日快乐！\n谢谢你一直认真地生活。\n新的一岁，也要被温柔对待。",
          palette,
          2,
        ),
        textElement("make a wish ✦", 267, 751, 220, palette, 24, 54),
      ],
    }),
  },
  {
    id: "blank",
    name: "自由画布",
    description: "一张素纸，从空白开始自由拼贴",
    create: () => ({
      title: "一页自由时光",
      body: "",
      elements: [],
    }),
  },
];

export function createEntry(
  date: string,
  palette: ThemePalette,
  templateId = "collage",
  themeId = "mint",
): DiaryEntry {
  const template =
    TEMPLATES.find((item) => item.id === templateId) ??
    TEMPLATES.find((item) => item.id === "blank") ??
    TEMPLATES[0];
  const now = Date.now();
  return {
    id: id(),
    date,
    title: "未命名的小日子",
    body: "",
    themeId,
    palette,
    backgroundId: "bg-soft-paper",
    elements: [],
    createdAt: now,
    updatedAt: now,
    ...(template.create(date, palette) as Partial<DiaryEntry>),
  };
}
