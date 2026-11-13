import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type Konva from "konva";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Hand,
  Library,
  Maximize,
  Menu,
  Minus,
  Plus,
  Redo2,
  Save,
  SlidersHorizontal,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import type { CanvasElement, JournalAsset } from "../types";
import { DiaryCanvas } from "./DiaryCanvas";
import { AssetLibrary } from "./AssetLibrary";
import { PropertiesPanel } from "./PropertiesPanel";
import { getActiveEntry, useJournalStore } from "../store/useJournalStore";
import { persistImageAsset, saveDiary } from "../lib/db";

function readFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem("little-moments-favorites") ?? "[]") as string[];
  } catch {
    return [];
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

function formatSavedTime(value: number | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EditorPage() {
  const state = useJournalStore();
  const entry = getActiveEntry(state);
  const [zoom, setZoom] = useState(1);
  const [panMode, setPanMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mobileDrawer, setMobileDrawer] = useState<"assets" | "properties" | null>(null);
  const [favorites, setFavorites] = useState<string[]>(readFavorites);
  const [toast, setToast] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) state.redo();
        else state.undo();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        state.redo();
      }
      if ((event.key === "Delete" || event.key === "Backspace") && state.selectedId) {
        event.preventDefault();
        state.deleteElement(state.selectedId);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d" && state.selectedId) {
        event.preventDefault();
        state.duplicateElement(state.selectedId);
      }
      if (event.key === "Escape") {
        setEditingId(null);
        state.selectElement(null);
        setPreviewOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state]);

  if (!entry) {
    return (
      <main className="missing-entry page-shell">
        <p>这一页暂时找不到了。</p>
        <button onClick={() => state.setScreen("reader")}>回到手帖</button>
      </main>
    );
  }

  const showToast = (message: string) => setToast(message);

  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("little-moments-favorites", JSON.stringify(next));
  };

  const addPhotoFromFile = async (file: File, replaceId?: string) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      const id = replaceId ?? crypto.randomUUID();
      await persistImageAsset(id, dataUrl);
      if (replaceId) {
        state.updateElement(replaceId, { src: dataUrl, type: "photo" }, { checkpoint: true });
      } else {
        const count = entry.elements.filter((element) => element.type === "photo").length;
        const element: CanvasElement = {
          id,
          type: "photo",
          src: dataUrl,
          x: 170 + (count % 3) * 26,
          y: 270 + (count % 4) * 24,
          width: 330,
          height: 330,
          rotation: count % 2 === 0 ? -3 : 3,
          opacity: 1,
          frameStyle: "polaroid",
          cropX: 0.5,
          cropY: 0.5,
          cropScale: 1,
        };
        state.addElement(element, count === 0);
      }
      showToast(replaceId ? "照片已经换好啦" : "照片已经轻轻放进手帖");
    } catch (error) {
      console.error(error);
      showToast("这张照片暂时没能放进来，请重试");
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (replaceTargetRef.current) {
      await addPhotoFromFile(images[0], replaceTargetRef.current);
      replaceTargetRef.current = null;
    } else {
      const hadPhotos = entry.elements.some((element) => element.type === "photo");
      if (hadPhotos && images.length > 0) state.checkpoint();
      for (let index = 0; index < images.length; index += 1) {
        if (hadPhotos || index > 0) {
          const dataUrl = await fileToDataUrl(images[index]);
          const id = crypto.randomUUID();
          await persistImageAsset(id, dataUrl);
          state.addElement(
            {
              id,
              type: "photo",
              src: dataUrl,
              x: 110 + index * 28,
              y: 270 + index * 26,
              width: 330,
              height: 330,
              rotation: index % 2 === 0 ? -3 : 3,
              opacity: 1,
              frameStyle: index % 2 === 0 ? "polaroid" : "rounded",
              cropX: 0.5,
              cropY: 0.5,
              cropScale: 1,
            },
            false,
          );
        } else {
          await addPhotoFromFile(images[index]);
        }
      }
      showToast(`${images.length} 张照片已经放进手帖`);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFilePicker = (replaceId?: string) => {
    replaceTargetRef.current = replaceId ?? null;
    window.setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const addAsset = (asset: JournalAsset) => {
    if (asset.kind === "background") {
      state.updateEntry({ backgroundId: asset.id }, true);
      return;
    }
    const selected = entry.elements.find((element) => element.id === state.selectedId);
    if (asset.kind === "frame" && selected && (selected.type === "photo" || selected.type === "frame")) {
      state.updateElement(
        selected.id,
        { frameStyle: asset.frameStyle, type: selected.type === "frame" ? "frame" : "photo" },
        { checkpoint: true },
      );
      showToast("相框样式已经换好啦");
      return;
    }
    const count = entry.elements.length;
    const element: CanvasElement = {
      id: crypto.randomUUID(),
      type: asset.kind === "frame" ? "frame" : asset.kind,
      assetId: asset.id,
      src: asset.src,
      x: 208 + (count % 4) * 22,
      y: 210 + (count % 5) * 26,
      width: asset.width,
      height: asset.height,
      rotation: count % 3 === 0 ? -3 : count % 3 === 1 ? 2 : 0,
      opacity: 1,
      frameStyle: asset.frameStyle,
      text: asset.kind === "note" ? "双击写下一张小纸条" : undefined,
      fontSize: asset.kind === "note" ? 18 : undefined,
      fontStyle: asset.kind === "note" ? "hand" : undefined,
      color: entry.palette.text,
      align: "left",
    };
    state.addElement(element);
  };

  const addText = () => {
    const element: CanvasElement = {
      id: crypto.randomUUID(),
      type: "text",
      x: 130,
      y: 280,
      width: 430,
      height: 130,
      rotation: -1,
      opacity: 1,
      text: "在这里写下此刻的心情…",
      fontSize: 25,
      fontStyle: "hand",
      color: entry.palette.text,
      align: "left",
    };
    state.addElement(element);
    window.setTimeout(() => {
      setEditingId(element.id);
    }, 0);
  };

  const addShape = () => {
    state.addElement({
      id: crypto.randomUUID(),
      type: "shape",
      x: 430,
      y: 330,
      width: 145,
      height: 145,
      rotation: 8,
      opacity: 1,
      backgroundColor: entry.palette.decoration,
      color: entry.palette.auxiliary,
    });
  };

  const startTextEditing = (id: string) => {
    state.checkpoint();
    setEditingId(id);
    state.selectElement(id);
  };

  const changeEditingText = (text: string) => {
    if (!editingId) return;
    state.updateElement(editingId, { text });
  };

  const exportPng = async () => {
    if (!stageRef.current) {
      showToast("画布还没有准备好，请稍再试");
      return;
    }
    const previousSelection = state.selectedId;
    setEditingId(null);
    state.selectElement(null);
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    try {
      const dataUrl = stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: "image/png",
      });
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = `时光日记_${entry.date}_${entry.title.replace(/[\\/:*?"<>|]/g, "_")}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      showToast("完整手帖图片已经导出");
    } catch (error) {
      console.error(error);
      showToast("图片导出失败，请重试");
    } finally {
      state.selectElement(previousSelection);
    }
  };

  const finishDiary = async () => {
    if (finishing) return;
    setFinishing(true);
    setEditingId(null);
    state.setSaveStatus("saving");
    try {
      const latest = getActiveEntry(useJournalStore.getState()) ?? entry;
      await saveDiary({ ...latest, updatedAt: Date.now() });
      state.markSaved();
      setShowComplete(true);
      window.setTimeout(() => {
        setShowComplete(false);
        state.closeEditor();
      }, 2400);
    } catch (error) {
      console.error(error);
      state.setSaveStatus("error");
      showToast("保存失败，今天的内容还没有被收好");
      setFinishing(false);
    }
  };

  return (
    <main className="editor-page page-shell">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={!replaceTargetRef.current}
        onChange={(event) => void handleFiles(event.target.files)}
        hidden
      />

      <header className="editor-toolbar">
        <div className="editor-toolbar-left">
          <button className="toolbar-round-button" onClick={state.closeEditor} title="返回阅读页">
            <ArrowLeft size={18} />
          </button>
          <div className="editor-page-title">
            <span>正在编辑</span>
            <strong>{entry.title || "未命名的小日子"}</strong>
          </div>
        </div>

        <div className="editor-history-controls">
          <button onClick={state.undo} disabled={state.past.length === 0} title="撤销 Ctrl+Z">
            <Undo2 size={17} />
            <span>撤销</span>
          </button>
          <button onClick={state.redo} disabled={state.future.length === 0} title="重做 Ctrl+Y">
            <Redo2 size={17} />
            <span>重做</span>
          </button>
        </div>

        <div className={`save-status save-status-${state.saveStatus}`}>
          <span className="save-status-dot" />
          <span>
            {state.saveStatus === "pending" && "正在记下…"}
            {state.saveStatus === "saving" && "正在保存…"}
            {state.saveStatus === "saved" && `已自动保存 ${formatSavedTime(state.lastSavedAt)}`}
            {state.saveStatus === "error" && "保存遇到问题"}
            {state.saveStatus === "idle" && "内容会随时保存"}
          </span>
        </div>

        <div className="editor-toolbar-actions">
          <button className="toolbar-soft-button" onClick={() => setPreviewOpen(true)}>
            <Eye size={17} />
            <span>预览</span>
          </button>
          <button className="toolbar-soft-button" onClick={() => void exportPng()}>
            <Download size={17} />
            <span>导出图片</span>
          </button>
          <button className="finish-diary-button" onClick={() => void finishDiary()} disabled={finishing}>
            <Sparkles size={17} />
            <span>{finishing ? "正在收好…" : "完成日记"}</span>
          </button>
        </div>
      </header>

      <div className="editor-mobile-topbar">
        <button onClick={state.closeEditor}><ArrowLeft size={17} />返回</button>
        <span className={`save-status-mobile save-status-${state.saveStatus}`}>
          <i />
          {state.saveStatus === "saved" ? "已保存" : "自动保存"}
        </span>
        <div className="mobile-topbar-actions">
          <button onClick={() => setPreviewOpen(true)} aria-label="预览"><Eye size={17} /></button>
          <button onClick={() => void exportPng()} aria-label="导出图片"><Download size={17} /></button>
        </div>
      </div>

      <div className="editor-workspace">
        <div className="editor-left-panel">
          <AssetLibrary
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onAddAsset={addAsset}
            onApplyBackground={(asset) => state.updateEntry({ backgroundId: asset.id }, true)}
            onAddText={addText}
            onUpload={() => openFilePicker()}
            onAddShape={addShape}
          />
        </div>

        <section className="editor-canvas-column">
          <div className="canvas-top-note">
            <span className="canvas-date">
              {new Intl.DateTimeFormat("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(`${entry.date}T00:00:00`))}
            </span>
            <span>双击文字可直接修改 · 拖动素材自由拼贴</span>
          </div>

          <div className="canvas-paper-workbench">
            <DiaryCanvas
              ref={stageRef}
              entry={entry}
              selectedId={state.selectedId}
              onSelect={state.selectElement}
              onUpdate={state.updateElement}
              onCheckpoint={state.checkpoint}
              onTextEdit={startTextEditing}
              onPhotoDoubleClick={(id) => openFilePicker(id)}
              editingId={editingId}
              onEditingText={changeEditingText}
              onFinishEditing={() => setEditingId(null)}
              zoom={zoom}
              panMode={panMode}
            />
          </div>

          <div className="canvas-bottom-toolbar">
            <div className="zoom-controls">
              <button onClick={() => setZoom((value) => Math.max(0.6, Math.round((value - 0.1) * 10) / 10))}>
                <Minus size={16} />
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((value) => Math.min(2, Math.round((value + 0.1) * 10) / 10))}>
                <Plus size={16} />
              </button>
              <button onClick={() => setZoom(1)} title="适配画布"><Maximize size={15} /></button>
            </div>
            <div className="bottom-toolbar-hint">
              <Hand size={14} /> 拖动右下角圆点旋转 · 拖动边框缩放
            </div>
            <button
              className={`pan-mode-button ${panMode ? "is-active" : ""}`}
              onClick={() => setPanMode((value) => !value)}
              title="拖动画布"
            >
              <Hand size={15} /> 画布拖动
            </button>
          </div>

          <div className="mobile-editor-toolbar">
            <button onClick={() => setMobileDrawer("assets")}><Library size={18} />素材</button>
            <button onClick={addText}><Plus size={18} />文字</button>
            <button onClick={() => openFilePicker()}><Plus size={18} />照片</button>
            <button onClick={() => setMobileDrawer("properties")}><SlidersHorizontal size={18} />设置</button>
            <button className="mobile-finish" onClick={() => void finishDiary()}><Check size={18} />完成</button>
          </div>
        </section>

        <div className="editor-right-panel">
          <PropertiesPanel onReplacePhoto={(id) => openFilePicker(id)} />
        </div>
      </div>

      {mobileDrawer && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileDrawer(null)}>
          <motion.div
            className={`mobile-drawer mobile-drawer-${mobileDrawer}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 290, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-drawer-handle" />
            {mobileDrawer === "assets" ? (
              <AssetLibrary
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onAddAsset={addAsset}
                onApplyBackground={(asset) => state.updateEntry({ backgroundId: asset.id }, true)}
                onAddText={addText}
                onUpload={() => openFilePicker()}
                onAddShape={addShape}
              />
            ) : (
              <PropertiesPanel
                onReplacePhoto={(id) => openFilePicker(id)}
                onCloseDrawer={() => setMobileDrawer(null)}
              />
            )}
          </motion.div>
        </div>
      )}

      {previewOpen && (
        <div className="canvas-preview-overlay">
          <div className="preview-topbar">
            <div>
              <span>阅读预览</span>
              <strong>{entry.title}</strong>
            </div>
            <button onClick={() => setPreviewOpen(false)}><X size={19} />关闭预览</button>
          </div>
          <div className="preview-canvas-area">
            <DiaryCanvas entry={entry} readOnly />
          </div>
          <div className="preview-pager">
            <ChevronLeft size={16} />
            <span>这一页的完整样子</span>
            <ChevronRight size={16} />
          </div>
        </div>
      )}

      {showComplete && (
        <div className="completion-overlay">
          <div className="completion-bloom">
            {Array.from({ length: 12 }, (_, index) => (
              <motion.span
                key={index}
                style={{
                  left: `${8 + ((index * 17) % 84)}%`,
                  top: `${10 + ((index * 23) % 68)}%`,
                }}
                initial={{ opacity: 0, scale: 0.2, rotate: -30 }}
                animate={{ opacity: [0, 1, 0.8], scale: [0.2, 1, 0.75], rotate: 35 }}
                transition={{ duration: 1.7, delay: index * 0.06, repeat: Infinity, repeatDelay: 1.5 }}
              >
                {index % 3 === 0 ? <Sparkles size={18} /> : <span className="petal-shape" />}
              </motion.span>
            ))}
            <motion.div
              className="completion-card"
              initial={{ opacity: 0, y: 22, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
            >
              <div className="completion-mark"><Save size={27} /></div>
              <span>LITTLE MOMENTS SAVED</span>
              <h2>今日份的小美好，<br />已经被好好收藏啦</h2>
              <p>正在轻轻合上手帖…</p>
            </motion.div>
          </div>
        </div>
      )}

      {toast && (
        <motion.div
          className="app-toast"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Check size={15} />
          {toast}
        </motion.div>
      )}
    </main>
  );
}
