import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flower2 } from "lucide-react";
import { CalendarPage } from "./components/CalendarPage";
import { CoverPage } from "./components/CoverPage";
import { EditorPage } from "./components/EditorPage";
import { ReaderPage } from "./components/ReaderPage";
import { saveDiary } from "./lib/db";
import { useJournalStore } from "./store/useJournalStore";

export default function App() {
  const hydrate = useJournalStore((state) => state.hydrate);
  const hydrated = useJournalStore((state) => state.hydrated);
  const screen = useJournalStore((state) => state.screen);
  const entries = useJournalStore((state) => state.entries);
  const activeId = useJournalStore((state) => state.activeId);
  const setScreen = useJournalStore((state) => state.setScreen);
  const setSaveStatus = useJournalStore((state) => state.setSaveStatus);
  const markSaved = useJournalStore((state) => state.markSaved);
  const hydrationStarted = useRef(false);

  useEffect(() => {
    if (hydrationStarted.current) return;
    hydrationStarted.current = true;
    void hydrate();
  }, [hydrate]);

  const activeEntry = entries.find((entry) => entry.id === activeId);
  const activeUpdatedAt = activeEntry?.updatedAt;

  useEffect(() => {
    if (!hydrated || !activeEntry || screen !== "editor") return;
    setSaveStatus("pending");
    const timer = window.setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveDiary(activeEntry);
        markSaved();
      } catch (error) {
        console.error(error);
        setSaveStatus("error");
      }
    }, 720);
    return () => window.clearTimeout(timer);
  }, [activeEntry, activeUpdatedAt, hydrated, markSaved, screen, setSaveStatus]);

  if (!hydrated) {
    return (
      <main className="app-loading page-shell">
        <div className="loading-flower"><i /><i /><i /><i /><b /></div>
        <span>LITTLE MOMENTS</span>
        <h1>正在轻轻翻开时光日记</h1>
        <p>纸张、旧照片和今天的风，马上就来。</p>
      </main>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        className="app-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.26 }}
      >
        {screen === "cover" && (
          <CoverPage diaryCount={entries.length} onOpen={() => setScreen("reader")} />
        )}
        {screen === "reader" && <ReaderPage />}
        {screen === "editor" && <EditorPage />}
        {screen === "calendar" && <CalendarPage />}
        <div className="global-paper-grain" aria-hidden="true" />
        {screen === "cover" && (
          <div className="cover-side-signature">
            <Flower2 size={14} />
            <span>made for ordinary days</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
