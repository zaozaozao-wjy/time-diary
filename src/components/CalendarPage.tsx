import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { MOOD_OPTIONS, WEATHER_OPTIONS } from "../data/themes";
import { useJournalStore } from "../store/useJournalStore";

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarPage() {
  const entries = useJournalStore((state) => state.entries);
  const setScreen = useJournalStore((state) => state.setScreen);
  const openEntry = useJournalStore((state) => state.openEntry);
  const createNew = useJournalStore((state) => state.createNew);
  const today = new Date();
  const [monthCursor, setMonthCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(today));

  const entryMap = useMemo(() => {
    const map = new Map<string, typeof entries>();
    entries.forEach((entry) => {
      map.set(entry.date, [...(map.get(entry.date) ?? []), entry]);
    });
    return map;
  }, [entries]);

  const selectedEntries = entryMap.get(selectedDate) ?? [];

  const days = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(year, month, index - offset + 1);
      const key = formatLocalDate(date);
      return {
        date,
        key,
        day: date.getDate(),
        inMonth: date.getMonth() === month,
        isToday: key === formatLocalDate(today),
        count: entryMap.get(key)?.length ?? 0,
      };
    });
  }, [entryMap, monthCursor]);

  const monthLabel = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
  }).format(monthCursor);

  const moveMonth = (delta: number) => {
    setMonthCursor(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  };

  return (
    <main className="calendar-page-shell page-shell">
      <header className="calendar-topbar">
        <button onClick={() => setScreen("reader")}><ArrowLeft size={17} /> 回到手帖</button>
        <div className="calendar-brand">
          <span><CalendarDays size={18} /></span>
          <div>
            <strong>回忆日历</strong>
            <small>每个有记号的日子，都曾发光</small>
          </div>
        </div>
        <button className="calendar-new-top" onClick={() => createNew(selectedDate)}>
          <Plus size={16} /> 从这天写起
        </button>
      </header>

      <section className="calendar-heading">
        <div>
          <span className="panel-kicker">MEMORIES BY DAY</span>
          <h1>把时间铺成一张纸</h1>
        </div>
        <p>点击一个有标记的日子，翻开那天留下的小事。</p>
      </section>

      <div className="calendar-layout">
        <motion.section
          className="calendar-paper"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="calendar-tape calendar-tape-left" />
          <span className="calendar-tape calendar-tape-right" />
          <div className="calendar-paper-header">
            <div>
              <span>{monthCursor.getFullYear()}</span>
              <h2>{monthCursor.getMonth() + 1} 月</h2>
            </div>
            <div className="month-switcher">
              <button onClick={() => moveMonth(-1)} aria-label="上个月"><ChevronLeft size={18} /></button>
              <span>{monthLabel}</span>
              <button onClick={() => moveMonth(1)} aria-label="下个月"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="weekday-row">
            {weekdays.map((day) => <span key={day}>周{day}</span>)}
          </div>
          <div className="calendar-day-grid">
            {days.map((day) => (
              <button
                key={day.key}
                className={[
                  "calendar-day",
                  !day.inMonth ? "is-outside" : "",
                  day.isToday ? "is-today" : "",
                  selectedDate === day.key ? "is-selected" : "",
                  day.count > 0 ? "has-entry" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setSelectedDate(day.key)}
              >
                <span className="calendar-day-number">{day.day}</span>
                {day.count > 0 && (
                  <span className="calendar-entry-marker">
                    <i />
                    <small>{day.count > 1 ? `${day.count} 篇` : "小日子"}</small>
                  </span>
                )}
                {day.isToday && <b>今天</b>}
              </button>
            ))}
          </div>
          <div className="calendar-paper-footer">
            <span><i /> 有被好好收藏的日子</span>
            <span>本月 {entries.filter((entry) => entry.date.startsWith(`${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`)).length} 篇记录</span>
          </div>
          <div className="calendar-doodle">
            <svg viewBox="0 0 170 90">
              <path d="M6 79c28-20 46-47 53-79M43 51c-19-8-27-24-22-48 18 6 27 22 25 44M52 35c19-14 36-13 52 3-16 18-33 19-53 2" />
            </svg>
          </div>
        </motion.section>

        <aside className="calendar-day-detail">
          <div className="day-detail-date">
            <span>{selectedDate.slice(0, 7).replace("-", " / ")}</span>
            <strong>{Number(selectedDate.slice(8, 10))}</strong>
            <p>
              {new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(
                new Date(`${selectedDate}T00:00:00`),
              )}
            </p>
          </div>
          <div className="day-detail-divider">
            <span />
            <Sparkles size={14} />
            <span />
          </div>
          {selectedEntries.length > 0 ? (
            <div className="day-entry-list">
              {selectedEntries.map((entry, index) => {
                const weather = WEATHER_OPTIONS.find((option) => option.id === entry.weather)?.label;
                const mood = MOOD_OPTIONS.find((option) => option.id === entry.mood)?.label;
                return (
                  <motion.article
                    key={entry.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="day-entry-card"
                  >
                    <span
                      className="day-entry-color"
                      style={{ background: entry.palette.paper }}
                    />
                    <div>
                      <span>{[weather, mood].filter(Boolean).join(" · ") || "普通又特别的一天"}</span>
                      <h3>{entry.title}</h3>
                      <p>{entry.body || "这一页的故事，只有翻开才知道。"}</p>
                    </div>
                    <button onClick={() => openEntry(entry.id, "reader")}>
                      <BookOpen size={15} /> 翻开
                    </button>
                    <button className="edit-day-entry" onClick={() => openEntry(entry.id, "editor")}>
                      <Edit3 size={14} />
                    </button>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="day-empty-state">
              <span className="empty-day-flower"><i /><i /><i /><i /><b /></span>
              <h3>这天还是一张素纸</h3>
              <p>也许只是一杯茶、一束光，也可以留在手帖里。</p>
              <button onClick={() => createNew(selectedDate)}><Plus size={15} /> 写下这一天</button>
            </div>
          )}
          <div className="day-detail-footer">
            <span>此刻的你，正在回望过去的光。</span>
            <i />
          </div>
        </aside>
      </div>
    </main>
  );
}
