import React, { useEffect, useMemo, useReducer, useRef } from "react";
import "./App.css";
import Header from "./components/Header";
import NotesList from "./components/NotesList";
import Editor from "./components/Editor";
import { useLocalStorage } from "./hooks/useLocalStorage";

/**
 * @typedef {{ id: string, title: string, content: string, updatedAt: number }} Note
 */

function createId() {
  // Use built-in crypto UUID when available; otherwise timestamp+random.
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptyNote() {
  const now = Date.now();
  return {
    id: createId(),
    title: "",
    content: "",
    updatedAt: now,
  };
}

function normalizeNotes(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((n) => n && typeof n === "object")
    .map((n) => ({
      id: typeof n.id === "string" ? n.id : createId(),
      title: typeof n.title === "string" ? n.title : "",
      content: typeof n.content === "string" ? n.content : "",
      updatedAt: typeof n.updatedAt === "number" ? n.updatedAt : Date.now(),
    }));
}

/**
 * @typedef {{
 *   notes: Note[],
 *   selectedId: string | null
 * }} AppState
 */

/**
 * @typedef {{
 *   type:
 *     | "INIT"
 *     | "ADD_NOTE"
 *     | "SELECT"
 *     | "UPSERT_NOTE"
 *     | "DELETE_NOTE"
 *   payload?: any
 * }} AppAction
 */

/**
 * @param {AppState} state
 * @param {AppAction} action
 * @returns {AppState}
 */
function reducer(state, action) {
  switch (action.type) {
    case "INIT": {
      const notes = normalizeNotes(action.payload?.notes);
      const selectedId =
        action.payload?.selectedId && notes.some((n) => n.id === action.payload.selectedId)
          ? action.payload.selectedId
          : notes[0]?.id || null;
      return { notes, selectedId };
    }

    case "ADD_NOTE": {
      const newNote = createEmptyNote();
      return { notes: [newNote, ...state.notes], selectedId: newNote.id };
    }

    case "SELECT": {
      const id = action.payload?.id ?? null;
      return { ...state, selectedId: id };
    }

    case "UPSERT_NOTE": {
      /** @type {Note} */
      const updated = action.payload?.note;
      if (!updated?.id) return state;

      const exists = state.notes.some((n) => n.id === updated.id);
      const nextNotes = exists
        ? state.notes.map((n) => (n.id === updated.id ? updated : n))
        : [updated, ...state.notes];

      return { ...state, notes: nextNotes, selectedId: updated.id };
    }

    case "DELETE_NOTE": {
      const id = action.payload?.id;
      if (!id) return state;

      const nextNotes = state.notes.filter((n) => n.id !== id);
      const nextSelected =
        state.selectedId === id ? (nextNotes[0]?.id || null) : state.selectedId;

      return { ...state, notes: nextNotes, selectedId: nextSelected };
    }

    default:
      return state;
  }
}

// PUBLIC_INTERFACE
function App() {
  /** Main Notes app: list + editor with localStorage persistence. */

  const [storedNotes, setStoredNotes] = useLocalStorage("notes", []);
  const didInitRef = useRef(false);

  const [state, dispatch] = useReducer(reducer, {
    notes: [],
    selectedId: null,
  });

  // Initialize from localStorage once
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    dispatch({
      type: "INIT",
      payload: { notes: storedNotes },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist notes to localStorage whenever they change after init
  useEffect(() => {
    if (!didInitRef.current) return;
    setStoredNotes(state.notes);
  }, [state.notes, setStoredNotes]);

  const selectedNote = useMemo(() => {
    return state.notes.find((n) => n.id === state.selectedId) || null;
  }, [state.notes, state.selectedId]);

  const handleAddNote = () => {
    dispatch({ type: "ADD_NOTE" });
  };

  const handleSelect = (id) => {
    dispatch({ type: "SELECT", payload: { id } });
  };

  const handleSave = (note) => {
    dispatch({ type: "UPSERT_NOTE", payload: { note } });
  };

  const handleDelete = (id) => {
    const note = state.notes.find((n) => n.id === id);
    const title = (note?.title || "").trim() || "Untitled";
    const ok = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;
    dispatch({ type: "DELETE_NOTE", payload: { id } });
  };

  return (
    <div className="AppShell">
      <Header onAddNote={handleAddNote} />

      <main className="Main" role="main">
        <NotesList
          notes={state.notes}
          selectedId={state.selectedId}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />

        <Editor
          note={selectedNote}
          onSave={handleSave}
          onCancel={() => {
            // no-op; Editor already reverts draft. Keep for future extension.
          }}
          onDelete={handleDelete}
          canDelete={!!selectedNote}
        />
      </main>
    </div>
  );
}

export default App;
