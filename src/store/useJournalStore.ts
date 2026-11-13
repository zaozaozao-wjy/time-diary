import { create } from "zustand";
import type {
  CanvasElement,
  DiaryEntry,
  SaveStatus,
  Screen,
  TemplateDefinition,
  ThemePalette,
} from "../types";
import { createCustomEntry, createSeedEntries } from "../data/seed";
import { TEMPLATES } from "../data/templates";
import { DEFAULT_PALETTE, paletteFromTheme, THEMES } from "../data/themes";
import { loadDiaries, removeDiary, saveDiaries } from "../lib/db";

interface JournalState {
  entries: DiaryEntry[];
  hydrated: boolean;
  screen: Screen;
  activeId: string | null;
  selectedId: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
  past: DiaryEntry[];
  future: DiaryEntry[];
  hydrate: () => Promise<void>;
  setScreen: (screen: Screen) => void;
  createNew: (date?: string) => DiaryEntry;
  openEntry: (id: string, screen?: Screen) => void;
  closeEditor: () => void;
  selectElement: (id: string | null) => void;
  updateEntry: (patch: Partial<DiaryEntry>, checkpoint?: boolean) => void;
  checkpoint: () => void;
  applyTemplate: (template: TemplateDefinition) => void;
  setTheme: (themeId: string, palette: ThemePalette) => void;
  updatePalette: (palette: ThemePalette) => void;
  addElement: (element: CanvasElement, checkpoint?: boolean) => void;
  updateElement: (
    id: string,
    patch: Partial<CanvasElement>,
    options?: { checkpoint?: boolean },
  ) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  undo: () => void;
  redo: () => void;
  setSaveStatus: (status: SaveStatus) => void;
  markSaved: () => void;
  deleteEntry: (id: string) => Promise<void>;
}

const cloneEntry = (entry: DiaryEntry): DiaryEntry => structuredClone(entry);

function replaceActive(
  entries: DiaryEntry[],
  activeId: string | null,
  updater: (entry: DiaryEntry) => DiaryEntry,
) {
  return entries.map((entry) => (entry.id === activeId ? updater(entry) : entry));
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  hydrated: false,
  screen: "cover",
  activeId: null,
  selectedId: null,
  saveStatus: "idle",
  lastSavedAt: null,
  past: [],
  future: [],

  hydrate: async () => {
    try {
      let entries = await loadDiaries();
      if (entries.length === 0) {
        entries = createSeedEntries();
        await saveDiaries(entries);
      } else {
        entries = entries.map((entry) => {
          const preset = THEMES.find((theme) => theme.id === entry.themeId);
          const normalizedElements = entry.elements.map((element) =>
            element.type === "tag"
              ? { ...element, width: 58, height: 58 }
              : element,
          );
          return {
            ...entry,
            palette: preset ? paletteFromTheme(preset) : entry.palette,
            elements: normalizedElements,
          };
        });
      }
      set({ entries, hydrated: true });
    } catch (error) {
      console.error(error);
      set({
        entries: createSeedEntries(),
        hydrated: true,
        saveStatus: "error",
      });
    }
  },

  setScreen: (screen) => set({ screen }),

  createNew: (date = new Date().toISOString().slice(0, 10)) => {
    const entry = createCustomEntry(date, DEFAULT_PALETTE);
    set((state) => ({
      entries: [...state.entries, entry],
      activeId: entry.id,
      screen: "editor",
      selectedId: null,
      past: [],
      future: [],
    }));
    return entry;
  },

  openEntry: (id, screen = "reader") =>
    set({ activeId: id, selectedId: null, screen, past: [], future: [] }),

  closeEditor: () => set({ screen: "reader", selectedId: null }),

  selectElement: (id) => set({ selectedId: id }),

  updateEntry: (patch, addCheckpoint = false) => {
    if (addCheckpoint) get().checkpoint();
    const { activeId } = get();
    set((state) => ({
      entries: replaceActive(state.entries, activeId, (entry) => ({
        ...entry,
        ...patch,
        updatedAt: Date.now(),
      })),
    }));
  },

  checkpoint: () => {
    const { entries, activeId, past } = get();
    const active = entries.find((entry) => entry.id === activeId);
    if (!active) return;
    set({
      past: [...past.slice(-49), cloneEntry(active)],
      future: [],
    });
  },

  applyTemplate: (template) => {
    get().checkpoint();
    const { activeId, entries } = get();
    const active = entries.find((entry) => entry.id === activeId);
    if (!active) return;
    const generated = template.create(active.date, active.palette);
    set((state) => ({
      entries: replaceActive(state.entries, activeId, (entry) => ({
        ...entry,
        ...generated,
        updatedAt: Date.now(),
      })),
      selectedId: null,
    }));
  },

  setTheme: (themeId, palette) => {
    get().checkpoint();
    const { activeId } = get();
    set((state) => ({
      entries: replaceActive(state.entries, activeId, (entry) => ({
        ...entry,
        themeId,
        palette,
        updatedAt: Date.now(),
        elements: entry.elements.map((element) =>
          element.type === "tag"
            ? {
                ...element,
                color: palette.text,
                backgroundColor: element.weather ? palette.accent : palette.auxiliary,
              }
            : element,
        ),
      })),
    }));
  },

  updatePalette: (palette) => {
    const { activeId } = get();
    set((state) => ({
      entries: replaceActive(state.entries, activeId, (entry) => ({
        ...entry,
        themeId: "custom",
        palette,
        updatedAt: Date.now(),
      })),
    }));
  },

  addElement: (element, addCheckpoint = true) => {
    if (addCheckpoint) get().checkpoint();
    const { activeId } = get();
    set((state) => ({
      entries: replaceActive(state.entries, activeId, (entry) => ({
        ...entry,
        elements: [...entry.elements, element],
        updatedAt: Date.now(),
      })),
      selectedId: element.id,
    }));
  },

  updateElement: (id, patch, options) => {
    if (options?.checkpoint) get().checkpoint();
    const { activeId } = get();
    set((state) => ({
      entries: replaceActive(state.entries, activeId, (entry) => ({
        ...entry,
        elements: entry.elements.map((element) =>
          element.id === id ? { ...element, ...patch } : element,
        ),
        updatedAt: Date.now(),
      })),
    }));
  },

  deleteElement: (id) => {
    get().checkpoint();
    const { activeId } = get();
    set((state) => ({
      entries: replaceActive(state.entries, activeId, (entry) => ({
        ...entry,
        elements: entry.elements.filter((element) => element.id !== id),
        updatedAt: Date.now(),
      })),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
  },

  duplicateElement: (id) => {
    const active = get().entries.find((entry) => entry.id === get().activeId);
    const source = active?.elements.find((element) => element.id === id);
    if (!source) return;
    get().checkpoint();
    const copy = {
      ...structuredClone(source),
      id: crypto.randomUUID(),
      x: source.x + 22,
      y: source.y + 22,
    };
    get().addElement(copy, false);
  },

  moveLayer: (id, direction) => {
    const { entries, activeId } = get();
    const active = entries.find((entry) => entry.id === activeId);
    if (!active) return;
    const index = active.elements.findIndex((element) => element.id === id);
    if (index === -1) return;
    const target = direction === "up" ? index + 1 : index - 1;
    if (target < 0 || target >= active.elements.length) return;
    get().checkpoint();
    const nextElements = [...active.elements];
    [nextElements[index], nextElements[target]] = [nextElements[target], nextElements[index]];
    set((state) => ({
      entries: replaceActive(state.entries, activeId, (entry) => ({
        ...entry,
        elements: nextElements,
        updatedAt: Date.now(),
      })),
    }));
  },

  undo: () => {
    const { past, future, entries, activeId } = get();
    const previous = past.at(-1);
    const active = entries.find((entry) => entry.id === activeId);
    if (!previous || !active) return;
    set({
      entries: entries.map((entry) => (entry.id === activeId ? cloneEntry(previous) : entry)),
      past: past.slice(0, -1),
      future: [cloneEntry(active), ...future].slice(0, 50),
      selectedId: null,
    });
  },

  redo: () => {
    const { past, future, entries, activeId } = get();
    const next = future[0];
    const active = entries.find((entry) => entry.id === activeId);
    if (!next || !active) return;
    set({
      entries: entries.map((entry) => (entry.id === activeId ? cloneEntry(next) : entry)),
      past: [...past, cloneEntry(active)].slice(-50),
      future: future.slice(1),
      selectedId: null,
    });
  },

  setSaveStatus: (saveStatus) => set({ saveStatus }),
  markSaved: () => set({ saveStatus: "saved", lastSavedAt: Date.now() }),

  deleteEntry: async (id) => {
    await removeDiary(id);
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
      activeId: state.activeId === id ? null : state.activeId,
      selectedId: null,
    }));
  },
}));

export function getActiveEntry(state: JournalState) {
  return state.entries.find((entry) => entry.id === state.activeId) ?? null;
}

export { TEMPLATES };
