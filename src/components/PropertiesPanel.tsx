import { useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  BookmarkPlus,
  Brush,
  Check,
  CloudRain,
  CloudSun,
  Copy,
  Crop,
  ImageUp,
  Layers3,
  Rainbow,
  RotateCcw,
  Save,
  Settings2,
  Snowflake,
  Sun,
  Trash2,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import type {
  CanvasElement,
  FrameStyle,
  MoodType,
  SavedPalette,
  TextAlign,
  ThemePalette,
  WeatherType,
} from "../types";
import { FONT_OPTIONS, MOOD_OPTIONS, paletteFromTheme, THEMES, WEATHER_OPTIONS } from "../data/themes";
import { TEMPLATES } from "../data/templates";
import { getActiveEntry, useJournalStore } from "../store/useJournalStore";
import { MoodFace } from "./MoodFace";

interface PropertiesPanelProps {
  onReplacePhoto: (id: string) => void;
  onCloseDrawer?: () => void;
}

const frameOptions: { id: FrameStyle; name: string }[] = [
  { id: "polaroid", name: "拍立得" },
  { id: "rounded", name: "圆角" },
  { id: "film", name: "胶片" },
  { id: "torn", name: "撕边" },
];

const paletteFields: { key: keyof ThemePalette; label: string }[] = [
  { key: "paper", label: "纸张" },
  { key: "auxiliary", label: "辅助色" },
  { key: "accent", label: "强调色" },
  { key: "decoration", label: "点缀色" },
  { key: "text", label: "文字色" },
];

const weatherVisuals: Record<WeatherType, { icon: LucideIcon; color: string }> = {
  sunny: { icon: Sun, color: "#D8A94E" },
  cloudy: { icon: CloudSun, color: "#7E9CA2" },
  rainy: { icon: CloudRain, color: "#6695AD" },
  snowy: { icon: Snowflake, color: "#72A5B9" },
  rainbow: { icon: Rainbow, color: "#C38691" },
};

function readSavedPalettes(): SavedPalette[] {
  try {
    const raw = localStorage.getItem("little-moments-palettes");
    return raw ? (JSON.parse(raw) as SavedPalette[]) : [];
  } catch {
    return [];
  }
}

export function PropertiesPanel({ onReplacePhoto, onCloseDrawer }: PropertiesPanelProps) {
  const state = useJournalStore();
  const entry = getActiveEntry(state);
  const selected = entry?.elements.find((element) => element.id === state.selectedId);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>(readSavedPalettes);
  const [paletteName, setPaletteName] = useState("");
  const [activeSection, setActiveSection] = useState<"design" | "element">("design");

  const selectedDefaultPalette = useMemo(() => {
    const theme = THEMES.find((item) => item.id === entry?.themeId);
    return theme ? paletteFromTheme(theme) : paletteFromTheme(THEMES[0]);
  }, [entry?.themeId]);

  if (!entry) return null;

  const setWeather = (weather: WeatherType | undefined) => {
    state.checkpoint();
    state.updateEntry({ weather });
    if (weather) {
      const tag = entry.elements.find((element) => element.type === "tag" && element.weather);
      if (tag) {
        state.updateElement(tag.id, {
          weather,
          backgroundColor: entry.palette.accent,
          color: entry.palette.text,
        });
      } else {
        state.addElement({
          id: crypto.randomUUID(),
          type: "tag",
          x: 52,
          y: 132,
          width: 58,
          height: 58,
          rotation: 0,
          opacity: 1,
          weather,
          backgroundColor: entry.palette.accent,
          color: entry.palette.text,
        }, false);
        state.selectElement(null);
      }
    }
  };

  const setMood = (mood: MoodType | undefined) => {
    state.checkpoint();
    state.updateEntry({ mood });
    if (mood) {
      const tag = entry.elements.find((element) => element.type === "tag" && element.mood);
      if (tag) {
        state.updateElement(tag.id, {
          mood,
          backgroundColor: entry.palette.auxiliary,
          color: entry.palette.text,
        });
      } else {
        state.addElement({
          id: crypto.randomUUID(),
          type: "tag",
          x: 52,
          y: 202,
          width: 58,
          height: 58,
          rotation: 0,
          opacity: 1,
          mood,
          backgroundColor: entry.palette.auxiliary,
          color: entry.palette.text,
        }, false);
        state.selectElement(null);
      }
    }
  };

  const savePalette = () => {
    const next: SavedPalette = {
      id: crypto.randomUUID(),
      name: paletteName.trim() || `我的配色 ${savedPalettes.length + 1}`,
      palette: entry.palette,
    };
    const values = [...savedPalettes, next];
    setSavedPalettes(values);
    localStorage.setItem("little-moments-palettes", JSON.stringify(values));
    setPaletteName("");
  };

  const updateCommon = (patch: Partial<CanvasElement>) => {
    if (!selected) return;
    state.updateElement(selected.id, patch);
  };

  const renderSelected = () => {
    if (!selected) {
      return (
        <div className="properties-empty">
          <span className="empty-flower"><i /><i /><i /><i /><b /></span>
          <h3>选中一件素材</h3>
          <p>在画布上轻点照片、贴纸或文字，就可以在这里慢慢调整它。</p>
        </div>
      );
    }

    return (
      <div className="element-properties">
        <div className="selected-type-row">
          <span className="selected-swatch" />
          <div>
            <strong>
              {selected.type === "photo" || selected.type === "frame"
                ? "照片"
                : selected.type === "text"
                  ? "文字"
                  : selected.type === "note"
                    ? "便签"
                    : selected.type === "tag"
                      ? "心情标签"
                      : selected.type === "tape"
                        ? "胶带"
                        : selected.type === "shape"
                          ? "装饰图形"
                          : "贴纸"}
            </strong>
            <span>已选中 · {Math.round(selected.width)} × {Math.round(selected.height)}</span>
          </div>
        </div>

        {(selected.type === "photo" || selected.type === "frame") && (
          <div className="property-group">
            <div className="property-title-row">
              <span>相框样式</span>
              <ImageUp size={14} />
            </div>
            <div className="frame-style-grid">
              {frameOptions.map((frame) => (
                <button
                  key={frame.id}
                  className={selected.frameStyle === frame.id ? "is-active" : ""}
                  onClick={() => {
                    state.checkpoint();
                    updateCommon({ frameStyle: frame.id });
                  }}
                >
                  <span className={`frame-mini frame-mini-${frame.id}`} />
                  {frame.name}
                </button>
              ))}
            </div>
            <button className="soft-action-button full-width" onClick={() => onReplacePhoto(selected.id)}>
              <ImageUp size={15} /> 替换照片
            </button>
            <div className="property-title-row crop-title">
              <span><Crop size={14} /> 裁剪位置</span>
            </div>
            <label className="range-field">
              <span>水平</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selected.cropX ?? 0.5}
                onPointerDown={state.checkpoint}
                onChange={(event) => updateCommon({ cropX: Number(event.target.value) })}
              />
            </label>
            <label className="range-field">
              <span>垂直</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selected.cropY ?? 0.5}
                onPointerDown={state.checkpoint}
                onChange={(event) => updateCommon({ cropY: Number(event.target.value) })}
              />
            </label>
            <label className="range-field">
              <span>照片缩放</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={selected.cropScale ?? 1}
                onPointerDown={state.checkpoint}
                onChange={(event) => updateCommon({ cropScale: Number(event.target.value) })}
              />
            </label>
          </div>
        )}

        {(selected.type === "text" || selected.type === "note") && (
          <>
            <div className="property-group">
              <div className="property-title-row">
                <span>文字风格</span>
                <Brush size={14} />
              </div>
              <div className="font-option-list">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.id}
                    className={selected.fontStyle === font.id ? "is-active" : ""}
                    style={{ fontFamily: font.family }}
                    onClick={() => {
                      state.checkpoint();
                      updateCommon({ fontStyle: font.id });
                    }}
                  >
                    <span>{font.name}</span>
                    <small>{font.sample}</small>
                  </button>
                ))}
              </div>
              <label className="range-field">
                <span>字号</span>
                <input
                  type="range"
                  min="12"
                  max="72"
                  step="1"
                  value={selected.fontSize ?? 24}
                  onPointerDown={state.checkpoint}
                  onChange={(event) => updateCommon({ fontSize: Number(event.target.value) })}
                />
                <b>{selected.fontSize ?? 24}</b>
              </label>
              <div className="inline-color-row">
                <span>文字颜色</span>
                <input
                  type="color"
                  value={selected.color ?? entry.palette.text}
                  onPointerDown={state.checkpoint}
                  onChange={(event) => updateCommon({ color: event.target.value })}
                />
                <span>便签底色</span>
                <input
                  type="color"
                  value={selected.backgroundColor ?? "#FFF4D9"}
                  onPointerDown={state.checkpoint}
                  onChange={(event) => updateCommon({ backgroundColor: event.target.value })}
                />
              </div>
              <div className="align-button-row">
                {([
                  ["left", AlignLeft],
                  ["center", AlignCenter],
                  ["right", AlignRight],
                ] as [TextAlign, typeof AlignLeft][]).map(([align, Icon]) => (
                  <button
                    key={align}
                    className={selected.align === align ? "is-active" : ""}
                    onClick={() => {
                      state.checkpoint();
                      updateCommon({ align });
                    }}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {selected.type === "tag" && (
          <div className="property-group">
            <div className="property-title-row"><span>标签内容</span></div>
            {selected.weather && (
              <select
                value={selected.weather}
                onChange={(event) => {
                  state.checkpoint();
                  updateCommon({ weather: event.target.value as WeatherType });
                }}
              >
                {WEATHER_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            )}
            {selected.mood && (
              <select
                value={selected.mood}
                onChange={(event) => {
                  state.checkpoint();
                  updateCommon({ mood: event.target.value as MoodType });
                }}
              >
                {MOOD_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            )}
            <div className="inline-color-row">
              <span>底色</span>
              <input
                type="color"
                value={selected.backgroundColor ?? entry.palette.accent}
                onPointerDown={state.checkpoint}
                onChange={(event) => updateCommon({ backgroundColor: event.target.value })}
              />
              <span>文字</span>
              <input
                type="color"
                value={selected.color ?? entry.palette.text}
                onPointerDown={state.checkpoint}
                onChange={(event) => updateCommon({ color: event.target.value })}
              />
            </div>
          </div>
        )}

        {selected.type === "shape" && (
          <div className="property-group">
            <div className="property-title-row"><span>图形配色</span></div>
            <div className="inline-color-row">
              <span>底色</span>
              <input
                type="color"
                value={selected.backgroundColor ?? entry.palette.decoration}
                onPointerDown={state.checkpoint}
                onChange={(event) => updateCommon({ backgroundColor: event.target.value })}
              />
              <span>星形</span>
              <input
                type="color"
                value={selected.color ?? entry.palette.auxiliary}
                onPointerDown={state.checkpoint}
                onChange={(event) => updateCommon({ color: event.target.value })}
              />
            </div>
          </div>
        )}

        <div className="property-group compact">
          <div className="property-title-row"><span>位置与尺寸</span></div>
          <div className="number-grid">
            {([
              ["X", "x"],
              ["Y", "y"],
              ["宽", "width"],
              ["高", "height"],
              ["旋转", "rotation"],
            ] as [string, keyof CanvasElement][]).map(([label, key]) => (
              <label key={key}>
                <span>{label}</span>
                <input
                  type="number"
                  value={Math.round(Number(selected[key] ?? 0))}
                  onFocus={state.checkpoint}
                  onChange={(event) => updateCommon({ [key]: Number(event.target.value) })}
                />
              </label>
            ))}
          </div>
          <label className="range-field">
            <span>透明度</span>
            <input
              type="range"
              min="0.15"
              max="1"
              step="0.05"
              value={selected.opacity}
              onPointerDown={state.checkpoint}
              onChange={(event) => updateCommon({ opacity: Number(event.target.value) })}
            />
          </label>
        </div>

        <div className="layer-action-grid">
          <button onClick={() => state.moveLayer(selected.id, "up")}>
            <ArrowUpToLine size={15} /> 上移一层
          </button>
          <button onClick={() => state.moveLayer(selected.id, "down")}>
            <ArrowDownToLine size={15} /> 下移一层
          </button>
          <button onClick={() => state.duplicateElement(selected.id)}>
            <Copy size={15} /> 复制
          </button>
          <button className="danger" onClick={() => state.deleteElement(selected.id)}>
            <Trash2 size={15} /> 删除
          </button>
        </div>
      </div>
    );
  };

  const renderDesign = () => (
    <div className="design-properties">
      <div className="property-group">
        <div className="property-title-row"><span>这一页的文字</span><Settings2 size={14} /></div>
        <label className="stacked-field">
          <span>日记标题</span>
          <input
            value={entry.title}
            onFocus={state.checkpoint}
            onChange={(event) => state.updateEntry({ title: event.target.value })}
          />
        </label>
        <label className="stacked-field">
          <span>正文记录</span>
          <textarea
            rows={3}
            value={entry.body}
            onFocus={state.checkpoint}
            onChange={(event) => state.updateEntry({ body: event.target.value })}
            placeholder="写下今天想留住的一句话…"
          />
        </label>
      </div>

      <div className="property-group">
        <div className="property-title-row"><span>天气</span></div>
        <div className="tag-option-grid">
          {WEATHER_OPTIONS.map((option) => {
            const visual = weatherVisuals[option.id];
            const Icon = visual.icon;
            return (
              <button
                key={option.id}
                className={entry.weather === option.id ? "is-active" : ""}
                onClick={() => setWeather(option.id)}
                aria-pressed={entry.weather === option.id}
              >
                <span className="tag-option-icon" style={{ color: visual.color }}>
                  <Icon size={16} strokeWidth={1.9} />
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        <div className="property-title-row mood-title"><span>心情</span></div>
        <div className="tag-option-grid">
          {MOOD_OPTIONS.map((option) => {
            return (
              <button
                key={option.id}
                className={entry.mood === option.id ? "is-active" : ""}
                onClick={() => setMood(option.id)}
                aria-pressed={entry.mood === option.id}
              >
                <span className="tag-option-icon mood-face-icon">
                  <MoodFace mood={option.id} size={19} />
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="property-group">
        <div className="property-title-row"><span>日记模板</span><WandSparkles size={14} /></div>
        <div className="template-grid">
          {TEMPLATES.map((template, index) => (
            <button
              key={template.id}
              onClick={() => {
                if (
                  entry.elements.length > 0 &&
                  !window.confirm("切换模板会替换画布中的现有内容。要继续吗？")
                ) {
                  return;
                }
                state.applyTemplate(template);
              }}
            >
              <span className={`template-preview template-preview-${index + 1}`}>
                <i /><i /><i />
              </span>
              <strong>{template.name}</strong>
              <small>{template.description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="property-group">
        <div className="property-title-row">
          <span>主题配色</span>
          <span className="theme-heading-meta">
            <span className="theme-count-badge">16 套</span>
            <span className="current-theme-name">
              {THEMES.find((theme) => theme.id === entry.themeId)?.name ?? "我的配色"}
            </span>
          </span>
        </div>
        <div className="theme-grid">
          {THEMES.map((theme) => {
            const themePalette = paletteFromTheme(theme);
            const swatches = [
              themePalette.paper,
              themePalette.auxiliary,
              themePalette.accent,
              themePalette.decoration,
              themePalette.text,
            ];
            return (
              <button
                key={theme.id}
                className={entry.themeId === theme.id ? "is-active" : ""}
                style={
                  entry.themeId === theme.id
                    ? {
                        background: `linear-gradient(145deg, ${themePalette.auxiliary}, ${themePalette.paper})`,
                        borderColor: themePalette.accent,
                      }
                    : undefined
                }
                onClick={() => state.setTheme(theme.id, themePalette)}
                title={`${theme.name}：${swatches.join(" · ")}`}
              >
                <span className="theme-swatches">
                  {swatches.map((color, index) => (
                    <i
                      key={`${theme.id}-${index}`}
                      style={{ background: color }}
                      title={["纸张", "辅助", "强调", "点缀", "文字"][index]}
                    />
                  ))}
                </span>
                <span>{theme.name}</span>
                {entry.themeId === theme.id && <Check size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="property-group">
        <div className="property-title-row">
          <span>自定义纸张与颜色</span>
          <button
            className="icon-text-button"
            onClick={() => {
              state.checkpoint();
              state.setTheme(entry.themeId !== "custom" ? entry.themeId : "mint", selectedDefaultPalette);
            }}
          >
            <RotateCcw size={12} /> 恢复默认
          </button>
        </div>
        <div className="palette-editor">
          {paletteFields.map((field) => (
            <label key={field.key}>
              <span>{field.label}</span>
              <span className="color-input-wrap" style={{ background: entry.palette[field.key] }}>
                <input
                  type="color"
                  value={entry.palette[field.key]}
                  onPointerDown={state.checkpoint}
                  onChange={(event) =>
                    state.updatePalette({ ...entry.palette, [field.key]: event.target.value })
                  }
                />
              </span>
              <small>{entry.palette[field.key].toUpperCase()}</small>
            </label>
          ))}
        </div>
        <div className="save-palette-row">
          <input
            value={paletteName}
            onChange={(event) => setPaletteName(event.target.value)}
            placeholder="给这套配色起个名字"
          />
          <button onClick={savePalette}><Save size={14} /> 保存</button>
        </div>
        {savedPalettes.length > 0 && (
          <div className="saved-palette-list">
            <span>我的配色</span>
            <div>
              {savedPalettes.map((saved) => (
                <button
                  key={saved.id}
                  onClick={() => state.setTheme("custom", saved.palette)}
                  title={saved.name}
                >
                  {(["paper", "auxiliary", "accent", "decoration", "text"] as const).map((key) => (
                    <i key={key} style={{ background: saved.palette[key] }} />
                  ))}
                  <small>{saved.name}</small>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <aside className="properties-panel">
      <div className="panel-heading properties-heading">
        <div>
          <span className="panel-kicker">PROPERTIES</span>
          <h2>细节布置</h2>
        </div>
        <Layers3 size={18} />
      </div>
      <div className="properties-tabs">
        <button
          className={activeSection === "design" ? "is-active" : ""}
          onClick={() => {
            setActiveSection("design");
            state.selectElement(null);
          }}
        >
          页面与主题
        </button>
        <button
          className={activeSection === "element" || selected ? "is-active" : ""}
          onClick={() => setActiveSection("element")}
        >
          选中元素
        </button>
      </div>
      <div className="properties-scroll">
        {selected || activeSection === "element" ? renderSelected() : renderDesign()}
      </div>
      {onCloseDrawer && (
        <button className="drawer-close-button" onClick={onCloseDrawer}>回到画布</button>
      )}
    </aside>
  );
}
