import React, { useMemo } from "react";

/**
 * @param {number} ts
 * @returns {string}
 */
function formatUpdatedAt(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// PUBLIC_INTERFACE
export default function NotesList({
  notes,
  selectedId,
  onSelect,
  onDelete,
  listLabel = "Notes list",
}) {
  /** Renders a scrollable list of notes with selection state and delete affordance. */

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [notes]);

  return (
    <aside className="NotesList" aria-label={listLabel}>
      <div className="NotesList__header">
        <h2 className="NotesList__title">Your notes</h2>
        <span className="NotesList__count" aria-label={`${notes.length} notes`}>
          {notes.length}
        </span>
      </div>

      {sortedNotes.length === 0 ? (
        <div className="EmptyState" role="status" aria-live="polite">
          <div className="EmptyState__title">No notes yet</div>
          <div className="EmptyState__text">Click “Add Note” to create your first note.</div>
        </div>
      ) : (
        <ul className="NotesList__items" role="list">
          {sortedNotes.map((note) => {
            const isSelected = note.id === selectedId;
            const title = (note.title || "").trim() || "Untitled";
            const preview = (note.content || "").trim();
            const updated = formatUpdatedAt(note.updatedAt);

            return (
              <li key={note.id} className="NotesList__item">
                <button
                  type="button"
                  className={`NoteRow ${isSelected ? "NoteRow--selected" : ""}`}
                  onClick={() => onSelect(note.id)}
                  aria-current={isSelected ? "true" : "false"}
                >
                  <div className="NoteRow__top">
                    <div className="NoteRow__title" title={title}>
                      {title}
                    </div>

                    <button
                      type="button"
                      className="IconButton IconButton--danger"
                      aria-label={`Delete note: ${title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="NoteRow__meta">
                    <span className="NoteRow__updated" title={updated}>
                      {updated}
                    </span>
                  </div>

                  {preview ? <div className="NoteRow__preview">{preview}</div> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
