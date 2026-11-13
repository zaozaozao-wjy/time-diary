import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { DiaryEntry } from "../types";
import { DiaryCanvas } from "./DiaryCanvas";
import { MOOD_OPTIONS, WEATHER_OPTIONS } from "../data/themes";
import { useJournalStore } from "../store/useJournalStore";

function ReaderPaper({
  entry,
  side,
  onEdit,
  onDelete,
}: {
  entry: DiaryEntry;
  side: "left" | "right";
  onEdit: () => void;
  onDelete: () => void;
}) {
  const weather = WEATHER_OPTIONS.find((item) => item.id === entry.weather)?.label;
  const mood = MOOD_OPTIONS.find((item) => item.id === entry.mood)?.label;

  return (
    <motion.article
      className={`reader-page reader-page-${side}`}
      initial={{ opacity: 0, rotateY: side === "left" ? -7 : 7 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="reader-page-ribbon">
        <span>{entry.date.replaceAll("-", " / ")}</span>
        {(weather || mood) && <span>{[weather, mood].filter(Boolean).join(" · ")}</span>}
      </div>
      <div className="reader-page-canvas">
        <DiaryCanvas entry={entry} readOnly />
      </div>
      <div className="reader-page-actions">
        <button onClick={onEdit}><Edit3 size={14} /> 编辑</button>
        <button onClick={onDelete} className="danger"><Trash2 size={14} /> 删除</button>
      </div>
      <span className="page-number">{entry.date.slice(8).replace(/^0/, "")}</span>
    </motion.article>
  );
}

export function ReaderPage() {
  const entries = useJournalStore((state) => state.entries);
  const activeId = useJournalStore((state) => state.activeId);
  const setScreen = useJournalStore((state) => state.setScreen);
  const createNew = useJournalStore((state) => state.createNew);
  const openEntry = useJournalStore((state) => state.openEntry);
  const deleteEntry = useJournalStore((state) => state.deleteEntry);
  const [spread, setSpread] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<DiaryEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const ordered = useMemo(
    () =>
      [...entries].sort(
        (a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt,
      ),
    [entries],
  );
  const totalSpreads = Math.max(1, Math.ceil(ordered.length / 2));

  useEffect(() => {
    const activeIndex = ordered.findIndex((entry) => entry.id === activeId);
    if (activeIndex >= 0) setSpread(Math.floor(activeIndex / 2));
    else setSpread(0);
  }, [activeId, ordered.length]);

  useEffect(() => {
    if (spread > totalSpreads - 1) setSpread(Math.max(0, totalSpreads - 1));
  }, [spread, totalSpreads]);

  const left = ordered[spread * 2];
  const right = ordered[spread * 2 + 1];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEntry(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="reader-page-shell page-shell">
      <header className="reader-topbar">
        <button className="back-to-cover" onClick={() => setScreen("cover")}>
          <ArrowLeft size={17} />
          <span>合上手帖</span>
        </button>
        <div className="reader-brand">
          <span className="reader-brand-flower"><i /><i /><i /><i /><b /></span>
          <div>
            <strong>时光日记</strong>
            <small>Little Moments</small>
          </div>
        </div>
        <div className="reader-topbar-actions">
          <button onClick={() => setScreen("calendar")}><CalendarDays size={17} /><span>回忆日历</span></button>
          <button className="reader-new-button" onClick={() => createNew()}><Plus size={17} /><span>新建日记</span></button>
        </div>
      </header>

      <section className="reader-heading">
        <div>
          <span className="panel-kicker">MY LITTLE MOMENTS</span>
          <h1>翻一翻，最近收藏的光</h1>
        </div>
        <p>有些日子看起来普通，翻到这一页时，却还是会轻轻笑起来。</p>
      </section>

      <div className="journal-reader-wrap">
        <button
          className="reader-spread-arrow reader-spread-arrow-left"
          onClick={() => setSpread((value) => Math.min(totalSpreads - 1, value + 1))}
          disabled={spread >= totalSpreads - 1}
          aria-label="上一组更早的日记"
        >
          <ChevronLeft size={21} />
        </button>

        <div className="open-journal-shadow" />
        <div className="open-journal">
          <div className="journal-paper-stack journal-paper-stack-left" />
          <div className="journal-paper-stack journal-paper-stack-right" />
          <div className="journal-inside-cover journal-inside-cover-left" />
          <div className="journal-inside-cover journal-inside-cover-right" />
          <div className="journal-spread">
            {left ? (
              <ReaderPaper
                entry={left}
                side="left"
                onEdit={() => openEntry(left.id, "editor")}
                onDelete={() => setDeleteTarget(left)}
              />
            ) : (
              <div className="reader-page reader-page-left reader-empty-page">
                <BookOpen size={30} />
                <p>这一页还在等一段故事。</p>
              </div>
            )}
            {right ? (
              <ReaderPaper
                entry={right}
                side="right"
                onEdit={() => openEntry(right.id, "editor")}
                onDelete={() => setDeleteTarget(right)}
              />
            ) : (
              <div className="reader-page reader-page-right reader-empty-page">
                <span className="empty-page-flower"><i /><i /><i /><i /><b /></span>
                <h3>再收藏一个新的片刻吧</h3>
                <p>今天的光，也值得被留下。</p>
                <button onClick={() => createNew()}><Plus size={15} /> 新建日记</button>
              </div>
            )}
          </div>
          <div className="journal-spine" />
          <div className="journal-bookmark" />
          <div className="journal-paperclip" />
        </div>

        <button
          className="reader-spread-arrow reader-spread-arrow-right"
          onClick={() => setSpread((value) => Math.max(0, value - 1))}
          disabled={spread === 0}
          aria-label="下一组更新的日记"
        >
          <ChevronRight size={21} />
        </button>
      </div>

      <div className="reader-spread-indicator">
        <span>{String(spread + 1).padStart(2, "0")}</span>
        <i />
        <span>{String(totalSpreads).padStart(2, "0")}</span>
        <small>{ordered.length} 个被收藏的小日子</small>
      </div>

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <motion.div
            className="confirm-modal"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setDeleteTarget(null)}><X size={18} /></button>
            <span className="modal-kicker">TAKE A MOMENT</span>
            <h2>要轻轻撕下这一页吗？</h2>
            <p>「{deleteTarget.title}」会被从本地手帖中删除，这个操作无法撤销。</p>
            <div className="modal-action-row">
              <button onClick={() => setDeleteTarget(null)}>再想想</button>
              <button className="danger" onClick={() => void handleDelete()} disabled={deleting}>
                <Trash2 size={15} /> {deleting ? "正在删除…" : "确认删除"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
