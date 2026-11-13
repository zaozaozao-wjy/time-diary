import { useMemo, useState } from "react";
import {
  Heart,
  ImagePlus,
  Layers3,
  PackageOpen,
  Shapes,
  Sparkles,
  StickyNote,
  Type,
} from "lucide-react";
import type { AssetKind, JournalAsset, StickerTheme } from "../types";
import {
  ASSETS,
  STICKER_THEME_LABELS,
} from "../data/assets";

type FilterKind = "all" | AssetKind | "favorite";

interface AssetLibraryProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddAsset: (asset: JournalAsset) => void;
  onApplyBackground: (asset: JournalAsset) => void;
  onAddText: () => void;
  onUpload: () => void;
  onAddShape: () => void;
}

const typeFilters: { id: FilterKind; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "sticker", label: "贴纸" },
  { id: "tape", label: "胶带" },
  { id: "frame", label: "相框" },
  { id: "note", label: "便签" },
  { id: "background", label: "背景纸" },
  { id: "favorite", label: "我的收藏" },
];

export function AssetLibrary({
  favorites,
  onToggleFavorite,
  onAddAsset,
  onApplyBackground,
  onAddText,
  onUpload,
  onAddShape,
}: AssetLibraryProps) {
  const [kind, setKind] = useState<FilterKind>("all");
  const [theme, setTheme] = useState<"all" | StickerTheme>("all");

  const filteredAssets = useMemo(
    () =>
      ASSETS.filter((asset) => {
        if (kind === "favorite" && !favorites.includes(asset.id)) return false;
        if (kind !== "all" && kind !== "favorite" && asset.kind !== kind) return false;
        if (theme !== "all" && asset.theme !== theme) return false;
        return true;
      }),
    [favorites, kind, theme],
  );

  const handleAsset = (asset: JournalAsset) => {
    if (asset.kind === "background") onApplyBackground(asset);
    else onAddAsset(asset);
  };

  return (
    <aside className="asset-library">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">MATERIALS</span>
          <h2>素材小屋</h2>
        </div>
        <Sparkles size={18} />
      </div>

      <div className="quick-add-grid">
        <button onClick={onUpload}>
          <span className="quick-add-icon"><ImagePlus size={18} /></span>
          <span>照片</span>
        </button>
        <button onClick={onAddText}>
          <span className="quick-add-icon"><Type size={18} /></span>
          <span>文字</span>
        </button>
        <button onClick={() => onAddAsset(ASSETS.find((asset) => asset.id === "note-cream")!)}>
          <span className="quick-add-icon"><StickyNote size={18} /></span>
          <span>便签</span>
        </button>
        <button onClick={onAddShape}>
          <span className="quick-add-icon"><Shapes size={18} /></span>
          <span>装饰</span>
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-label-row">
          <span>按类型</span>
          <PackageOpen size={14} />
        </div>
        <div className="kind-filter-grid">
          {typeFilters.map((filter) => {
            const count =
              filter.id === "all"
                ? ASSETS.length
                : filter.id === "favorite"
                  ? favorites.length
                  : ASSETS.filter((asset) => asset.kind === filter.id).length;
            return (
              <button
                key={filter.id}
                className={kind === filter.id ? "is-active" : ""}
                onClick={() => setKind(filter.id)}
              >
                <span>{filter.label}</span>
                <small>{count}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="theme-filter-row">
        <span>按主题</span>
        <div className="select-wrap">
          <Layers3 size={14} />
          <select value={theme} onChange={(event) => setTheme(event.target.value as typeof theme)}>
            <option value="all">全部主题</option>
            <option value="watercolor">水彩植物</option>
            <option value="daily">软萌日常</option>
            <option value="vintage">复古纸片</option>
            <option value="food">甜点食物</option>
            <option value="stationery">文具手作</option>
            <option value="nature">四季草木</option>
            <option value="dreamy">梦幻星空</option>
            <option value="basic">手账基础</option>
          </select>
        </div>
      </div>

      <div className="asset-count-line">
        <span>{filteredAssets.length} 款素材</span>
        <span>点击即可添加到手帖</span>
      </div>

      <div className="asset-scroll">
        {filteredAssets.length > 0 ? (
          <div className={`asset-grid asset-grid-${kind}`}>
            {filteredAssets.map((asset) => (
              <article className={`asset-card asset-card-${asset.kind}`} key={asset.id}>
                <button className="asset-add-button" onClick={() => handleAsset(asset)} title={`添加${asset.name}`}>
                  <span className={`asset-thumb asset-thumb-${asset.kind}`}>
                    <img src={asset.src} alt={asset.name} draggable={false} />
                  </span>
                  <span className="asset-name">{asset.name}</span>
                  <span className="asset-kind-label">
                    {asset.kind === "sticker"
                      ? STICKER_THEME_LABELS[asset.theme]
                      : typeFilters.find((item) => item.id === asset.kind)?.label}
                  </span>
                </button>
                <button
                  className={`favorite-button ${favorites.includes(asset.id) ? "is-favorite" : ""}`}
                  onClick={() => onToggleFavorite(asset.id)}
                  aria-label={favorites.includes(asset.id) ? "取消收藏" : "收藏素材"}
                >
                  <Heart size={13} fill={favorites.includes(asset.id) ? "currentColor" : "none"} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="asset-empty">
            <Heart size={25} />
            <p>这里还没有素材</p>
            <span>点击素材右上角的心，把它收进收藏。</span>
          </div>
        )}
      </div>

      <div className="asset-library-tip">
        <span className="tip-tape" />
        这张小纸片，也许刚好适合今天。
      </div>
    </aside>
  );
}
