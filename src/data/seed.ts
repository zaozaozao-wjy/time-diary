import type { DiaryEntry, ThemePalette } from "../types";
import { ASSET_BY_ID } from "./assets";
import { createEntry } from "./templates";
import { paletteFromTheme, THEMES } from "./themes";

const scenicImage = (kind: "lake" | "window" | "flowers" | "tea") => {
  const scenes = {
    lake: `<rect width="520" height="420" fill="#CFE2DD"/><path d="M0 230c90-48 177-54 261-17 95 42 171 34 259-11v218H0Z" fill="#9ABCB0"/><path d="M0 294c106-38 208-24 303 17 78 34 145 29 217-4v113H0Z" fill="#769A8B"/><path d="m73 285 72-127 81 127Z" fill="#6E8679"/><path d="m147 289 87-162 102 162Z" fill="#526F65"/><circle cx="410" cy="86" r="38" fill="#F3DC9D"/><path d="M0 240c110 18 190 17 298-7" fill="none" stroke="#F7F1E5" stroke-opacity=".52" stroke-width="3"/>`,
    window: `<rect width="520" height="420" fill="#F1E5D0"/><rect x="44" y="34" width="432" height="324" fill="#C9DDD9"/><path d="M44 252c96-49 185-42 271 25 74 58 129 61 161 43v38H44Z" fill="#94B1A4"/><path d="M260 34v324M44 206h432" stroke="#FBF5E9" stroke-width="17"/><path d="M75 107c25-35 57-38 93-9-32 22-66 25-93 9Z" fill="#7B9B78"/><circle cx="386" cy="102" r="42" fill="#F2D38B"/><path d="M345 358h108v32H345Z" fill="#B79178"/>`,
    flowers: `<rect width="520" height="420" fill="#DCE6D4"/><circle cx="226" cy="205" r="153" fill="#F9F5E8"/><g><path d="M258 377c-4-97 12-173 68-254" fill="none" stroke="#617B61" stroke-width="8"/><ellipse cx="286" cy="255" rx="71" ry="31" fill="#809B75" transform="rotate(-32 286 255)"/><ellipse cx="306" cy="180" rx="54" ry="25" fill="#9DB28B" transform="rotate(42 306 180)"/><g fill="#E6A4AA"><circle cx="328" cy="113" r="47"/><circle cx="371" cy="134" r="34"/><circle cx="351" cy="177" r="37"/><circle cx="297" cy="160" r="38"/><circle cx="292" cy="107" r="35"/></g><circle cx="327" cy="141" r="19" fill="#E7C779"/><circle cx="441" cy="315" r="17" fill="#DCA4AA"/><circle cx="219" cy="89" r="12" fill="#DCA4AA"/></g>`,
    tea: `<rect width="520" height="420" fill="#E7D8C4"/><rect x="34" y="278" width="452" height="98" rx="8" fill="#B58F71"/><path d="M177 92h171v168c0 37-32 65-82 65s-89-28-89-65Z" fill="#FAF3E4"/><path d="M337 130c69-21 97 10 86 53-9 34-45 47-80 34" fill="none" stroke="#FAF3E4" stroke-width="34"/><ellipse cx="262" cy="94" rx="85" ry="19" fill="#DCC5A6"/><path d="M224 39c-19-23 13-39 0-65m60 65c-18-22 15-40 1-65m61 66c-17-20 12-38 0-61" fill="none" stroke="#FBF3E5" stroke-width="7" stroke-linecap="round" opacity=".72"/><path d="M62 307c52-20 92-18 129 4" fill="none" stroke="#7B9475" stroke-width="8"/>`,
  };
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="420" viewBox="0 0 520 420">${scenes[kind]}</svg>`,
  )}`;
};

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function hydrateSeedPhotos(entry: DiaryEntry, photos: string[]): DiaryEntry {
  let photoIndex = 0;
  entry.elements = entry.elements.map((element) => {
    if (element.type !== "photo") return element;
    const src = photos[photoIndex % photos.length];
    photoIndex += 1;
    return { ...element, src };
  });
  return entry;
}

export function createSeedEntries(): DiaryEntry[] {
  const mint = paletteFromTheme(THEMES[0]);
  const golden = paletteFromTheme(THEMES[6]);
  const retro = paletteFromTheme(THEMES[2]);

  const collage = hydrateSeedPhotos(
    createEntry(dateOffset(-1), mint, "collage", "mint"),
    [scenicImage("lake"), scenicImage("flowers"), scenicImage("tea"), scenicImage("window")],
  );
  collage.id = crypto.randomUUID();
  collage.title = "把春天夹进书页里";
  collage.body = "风很轻，花也开得刚刚好。";
  collage.weather = "sunny";
  collage.mood = "happy";
  collage.updatedAt = Date.now() - 1000 * 60 * 20;

  const mood = createEntry(dateOffset(-4), golden, "mood", "golden");
  mood.id = crypto.randomUUID();
  mood.title = "慢一点，也很好";
  mood.body = "给自己泡了一杯茶，窗边的光刚好落在桌面上。";
  mood.weather = "cloudy";
  mood.mood = "calm";
  mood.updatedAt = Date.now() - 1000 * 60 * 60 * 24 * 3;

  const today = createEntry(dateOffset(0), retro, "today", "retro-us");
  today.id = crypto.randomUUID();
  today.title = "夏天寄来的明信片";
  today.body = "午后的一场阵雨，把空气洗得清清凉凉。";
  today.weather = "rainbow";
  today.mood = "moved";
  today.updatedAt = Date.now() - 1000 * 60 * 5;
  today.elements = today.elements.map((element) =>
    element.type === "photo" ? { ...element, src: scenicImage("window") } : element,
  );
  today.elements.push({
    id: crypto.randomUUID(),
    type: "sticker",
    assetId: "wildflower",
    src: ASSET_BY_ID.get("wildflower")!.src,
    x: 87,
    y: 682,
    width: 98,
    height: 98,
    rotation: -8,
    opacity: 1,
  });

  return [mood, collage, today];
}

export function createCustomEntry(date: string, palette: ThemePalette) {
  const entry = createEntry(date, palette, "blank", "mint");
  entry.title = "未命名的小日子";
  entry.body = "";
  entry.elements = [];
  return entry;
}
